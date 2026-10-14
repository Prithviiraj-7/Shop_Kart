import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../utils/razorpay.js";

// Helper to validate and calculate order items from customer cart
const prepareOrderItems = async (cart) => {
  let totalAmount = 0;
  const orderItems = [];
  const productsToUpdate = [];

  for (const item of cart) {
    if (!item || !item.product) continue;
    const productId = item.product._id || item.product;
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error(`Product is no longer available`);
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`
      );
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
    });

    productsToUpdate.push({ product, quantity: item.quantity });
  }

  return { totalAmount, orderItems, productsToUpdate };
};

// 1. Create Order (COD or initiate Razorpay)
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "COD" } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    const customer = await Customer.findById(req.user._id).populate("cart.product");

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const { totalAmount, orderItems, productsToUpdate } = await prepareOrderItems(customer.cart);

    // If Cash on Delivery (COD)
    if (paymentMethod === "COD") {
      // Deduct stock immediately
      for (const item of productsToUpdate) {
        item.product.stock -= item.quantity;
        await item.product.save();
      }

      const order = await Order.create({
        customer: req.user._id,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        status: "Processing",
      });

      // Clear customer cart
      customer.cart = [];
      await customer.save();

      return res.status(201).json({
        success: true,
        message: "Order placed successfully with Cash on Delivery",
        order,
      });
    }

    // If Online Payment (Razorpay)
    if (paymentMethod === "Razorpay" || paymentMethod === "Online" || paymentMethod === "CARD") {
      // 1. Create pending order in DB
      const order = await Order.create({
        customer: req.user._id,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod: "Razorpay",
        paymentStatus: "Pending",
        status: "Processing",
      });

      // 2. Create Razorpay Order
      try {
        const rzpOrder = await createRazorpayOrder(totalAmount, order._id);
        order.razorpayOrderId = rzpOrder.id;
        await order.save();

        return res.status(201).json({
          success: true,
          message: "Razorpay order initiated",
          order,
          razorpayOrder: {
            id: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            key: process.env.RAZORPAY_KEY_ID || "rzp_test_Tno9qvo5RETdPo",
          },
        });
      } catch (rzpError) {
        // Rollback pending DB order if Razorpay creation fails
        await Order.findByIdAndDelete(order._id);
        return res.status(500).json({
          success: false,
          message: `Razorpay order creation failed: ${rzpError.message}`,
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: "Unsupported payment method",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Verify Razorpay Payment Signature
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "All payment verification fields are required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify cryptographic signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      order.paymentStatus = "Failed";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }

    // Payment Verified Successfully:
    order.paymentStatus = "Paid";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = "Processing";

    // Deduct stock for each item now that payment is confirmed
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    await order.save();

    // Clear user's cart
    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully! Order confirmed.",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Razorpay Public Key (Clean API for frontend)
export const getRazorpayKey = async (req, res) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID || "rzp_test_Tno9qvo5RETdPo",
  });
};

// 4. Get Current User's Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get Order By ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
