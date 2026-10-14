import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate("cart.product");
    res.status(200).json({ success: true, cart: customer.cart || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);

    if (!productId || qty <= 0) {
      return res.status(400).json({ success: false, message: "Valid Product ID and quantity required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: "Product is out of stock" });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer.cart) customer.cart = [];
    const existingIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const newQty = customer.cart[existingIndex].quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock} items)`,
        });
      }
      customer.cart[existingIndex].quantity = newQty;
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }
      customer.cart.push({ product: productId, quantity: qty });
    }

    await customer.save();
    const updatedCustomer = await Customer.findById(req.user._id).populate("cart.product");

    res.status(200).json({
      success: true,
      message: "Added to cart",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);

    if (!productId || isNaN(qty)) {
      return res.status(400).json({ success: false, message: "Product ID and valid quantity required" });
    }

    const customer = await Customer.findById(req.user._id);
    const existingIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    if (qty <= 0) {
      customer.cart.splice(existingIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }
      customer.cart[existingIndex].quantity = qty;
    }

    await customer.save();
    const updatedCustomer = await Customer.findById(req.user._id).populate("cart.product");

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const customer = await Customer.findById(req.user._id);

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await customer.save();
    const updatedCustomer = await Customer.findById(req.user._id).populate("cart.product");

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();
    res.status(200).json({ success: true, message: "Cart cleared", cart: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
