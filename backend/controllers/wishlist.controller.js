import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate("wishlist");
    res.status(200).json({ success: true, wishlist: customer.wishlist || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer.wishlist) customer.wishlist = [];
    const index = customer.wishlist.indexOf(productId);

    let isWishlisted = false;
    if (index > -1) {
      customer.wishlist.splice(index, 1);
      isWishlisted = false;
    } else {
      customer.wishlist.push(productId);
      isWishlisted = true;
    }

    await customer.save();
    const updatedCustomer = await Customer.findById(req.user._id).populate("wishlist");

    res.status(200).json({
      success: true,
      message: isWishlisted ? "Added to wishlist" : "Removed from wishlist",
      isWishlisted,
      wishlist: updatedCustomer.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const customer = await Customer.findById(req.user._id);

    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await customer.save();
    const updatedCustomer = await Customer.findById(req.user._id).populate("wishlist");

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist: updatedCustomer.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
