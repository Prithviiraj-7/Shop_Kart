import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, subtotal, loading, clearCartState } = useCart();

  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 5.0;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + shipping + tax;

  if (loading && cart.length === 0) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content container loading-container">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content container">
        <header className="page-header">
          <h1>Shopping Cart</h1>
          <p>Review items in your cart before checking out.</p>
        </header>

        {cart.length === 0 ? (
          <div className="empty-state">
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn btn-primary mt-3">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items-section">
              <div className="cart-header-row">
                <span>{cart.length} Item(s) in Cart</span>
                <button
                  onClick={clearCartState}
                  className="btn btn-sm btn-outline-danger"
                >
                  Clear Cart
                </button>
              </div>

              <div className="cart-list">
                {cart.map((item) => (
                  <CartItem key={item.product?._id || item._id} item={item} />
                ))}
              </div>
            </div>

            <div className="cart-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="btn btn-primary btn-full mt-4"
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="btn btn-link btn-full text-center mt-2">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
