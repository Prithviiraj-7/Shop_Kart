import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import api from "../services/api";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/wishlist");
      if (res.data.success) {
        setWishlist(res.data.wishlist || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        setWishlist(res.data.wishlist || []);
      }
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content container">
        <header className="page-header">
          <h1>My Wishlist</h1>
          <p>Saved products you want to buy later.</p>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your wishlist...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <p>{error}</p>
            <button onClick={fetchWishlist} className="btn btn-secondary mt-2">
              Try Again
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="empty-state">
            <h3>Your wishlist is empty</h3>
            <p>You haven't saved any items yet. Explore our products and save your favorites!</p>
            <Link to="/products" className="btn btn-primary mt-3">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-list">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
