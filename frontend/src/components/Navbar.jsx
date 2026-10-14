import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
      navigate("/login");
    } catch (error) {
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/products" className="navbar-brand">
          <h2>ShopKart</h2>
        </Link>

        <div className="navbar-links">
          <Link
            to="/products"
            className={`nav-link ${isActive("/products") ? "active" : ""}`}
          >
            Products
          </Link>
          <Link
            to="/wishlist"
            className={`nav-link ${isActive("/wishlist") ? "active" : ""}`}
          >
            Wishlist
          </Link>
          <Link
            to="/cart"
            className={`nav-link ${isActive("/cart") ? "active" : ""}`}
          >
            Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <Link
            to="/orders"
            className={`nav-link ${isActive("/orders") ? "active" : ""}`}
          >
            Orders
          </Link>
          <Link
            to="/home"
            className={`nav-link ${isActive("/home") ? "active" : ""}`}
          >
            Profile
          </Link>
        </div>

        <button onClick={handleLogout} className="btn btn-outline nav-logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;