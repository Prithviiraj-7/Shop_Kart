import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const product = item.product;
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!product) {
    return null;
  }

  const handleQtyChange = async (newQty) => {
    if (newQty < 1) return;
    if (newQty > product.stock) {
      setErrorMsg(`Max stock is ${product.stock}`);
      setTimeout(() => setErrorMsg(""), 2500);
      return;
    }

    setUpdating(true);
    const res = await updateQuantity(product._id, newQty);
    setUpdating(false);

    if (!res.success) {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(""), 2500);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    await removeFromCart(product._id);
    setUpdating(false);
  };

  const itemTotal = (product.price * item.quantity).toFixed(2);

  return (
    <div className="cart-item">
      <img src={product.imageUrl} alt={product.name} className="cart-item-image" />

      <div className="cart-item-details">
        <h4 className="cart-item-title">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h4>
        <p className="cart-item-price">₹{product.price.toFixed(2)} each</p>
        {errorMsg && <p className="card-feedback error">{errorMsg}</p>}
      </div>

      <div className="cart-item-qty">
        <button
          onClick={() => handleQtyChange(item.quantity - 1)}
          disabled={updating || item.quantity <= 1}
          className="qty-btn"
        >
          -
        </button>
        <span className="qty-value">{item.quantity}</span>
        <button
          onClick={() => handleQtyChange(item.quantity + 1)}
          disabled={updating || item.quantity >= product.stock}
          className="qty-btn"
        >
          +
        </button>
      </div>

      <div className="cart-item-total">
        <span>₹{itemTotal}</span>
      </div>

      <div className="cart-item-remove">
        <button
          onClick={handleRemove}
          disabled={updating}
          className="btn-icon-danger"
          title="Remove item"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CartItem;
