import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const ProductCard = ({ product, isWishlistedInitial = false, onWishlistToggle }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(isWishlistedInitial);
  const [adding, setAdding] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post("/wishlist/toggle", { productId: product._id });
      if (res.data.success) {
        setIsWishlisted(res.data.isWishlisted);
        if (onWishlistToggle) {
          onWishlistToggle(product._id, res.data.isWishlisted);
        }
      }
    } catch (err) {
      console.error("Wishlist toggle error", err);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    setAdding(true);
    const result = await addToCart(product._id, 1);
    setAdding(false);
    if (result.success) {
      setFeedbackMsg("Added to Cart!");
      setTimeout(() => setFeedbackMsg(""), 2000);
    } else {
      setFeedbackMsg(result.message);
      setTimeout(() => setFeedbackMsg(""), 3000);
    }
  };

  const stockBadgeClass =
    product.stock > 10
      ? "badge badge-in-stock"
      : product.stock > 0
      ? "badge badge-low-stock"
      : "badge badge-out-stock";

  const stockText =
    product.stock > 10
      ? "In Stock"
      : product.stock > 0
      ? `Only ${product.stock} left`
      : "Out of Stock";

  return (
    <div className="product-card">
      <div className="product-card-image-container">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-card-image"
        />
        <button
          onClick={handleWishlist}
          className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">
          {product.description.length > 70
            ? product.description.substring(0, 70) + "..."
            : product.description}
        </p>

        <div className="product-card-footer">
          <div className="product-price-container">
            <span className="product-price">₹{product.price.toFixed(2)}</span>
            <span className={stockBadgeClass}>{stockText}</span>
          </div>

          {feedbackMsg && <div className="card-feedback">{feedbackMsg}</div>}

          <div className="product-card-actions">
            <Link to={`/products/${product._id}`} className="btn btn-secondary">
              Details
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || adding}
              className="btn btn-primary"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
