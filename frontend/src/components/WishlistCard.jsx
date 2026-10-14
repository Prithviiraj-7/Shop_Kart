import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const WishlistCard = ({ product, onRemove }) => {
  const { addToCart } = useCart();
  const [moving, setMoving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleMoveToCart = async () => {
    if (product.stock <= 0) return;
    setMoving(true);
    const result = await addToCart(product._id, 1);
    setMoving(false);
    if (result.success) {
      setMsg("Moved to Cart!");
      setTimeout(() => {
        onRemove(product._id);
      }, 500);
    } else {
      setMsg(result.message);
    }
  };

  return (
    <div className="wishlist-card">
      <img src={product.imageUrl} alt={product.name} className="wishlist-image" />
      <div className="wishlist-info">
        <span className="product-category">{product.category}</span>
        <h3 className="wishlist-title">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>
        <p className="product-price">₹{product.price.toFixed(2)}</p>
        <span
          className={
            product.stock > 0 ? "badge badge-in-stock" : "badge badge-out-stock"
          }
        >
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </span>
        {msg && <p className="card-feedback">{msg}</p>}
      </div>

      <div className="wishlist-actions">
        <button
          onClick={handleMoveToCart}
          disabled={product.stock <= 0 || moving}
          className="btn btn-primary"
        >
          {moving ? "Moving..." : "Move to Cart"}
        </button>
        <button
          onClick={() => onRemove(product._id)}
          className="btn btn-danger-outline"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default WishlistCard;
