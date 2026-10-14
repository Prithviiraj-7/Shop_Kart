import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");

  const fetchProductAndWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);
      }

      // Check wishlist status
      const wishRes = await api.get("/wishlist");
      if (wishRes.data.success) {
        const inWishlist = (wishRes.data.wishlist || []).some(
          (item) => item._id === id
        );
        setIsWishlisted(inWishlist);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Product not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndWishlist();
  }, [id]);

  const handleWishlistToggle = async () => {
    try {
      const res = await api.post("/wishlist/toggle", { productId: id });
      if (res.data.success) {
        setIsWishlisted(res.data.isWishlisted);
      }
    } catch (err) {
      console.error("Wishlist error", err);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    setAdding(true);
    const result = await addToCart(product._id, quantity);
    setAdding(false);

    if (result.success) {
      setFeedback("Successfully added to cart!");
      setTimeout(() => setFeedback(""), 2500);
    } else {
      setFeedback(result.message);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content container loading-container">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content container">
          <div className="alert alert-error">
            <h3>Product Not Found</h3>
            <p>{error || "The requested product could not be located."}</p>
            <button onClick={() => navigate("/products")} className="btn btn-primary mt-3">
              Back to Products
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content container">
        <div className="breadcrumb">
          <Link to="/products">← Back to Products</Link>
        </div>

        <div className="product-details-grid">
          <div className="product-details-image-wrapper">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-details-image"
            />
          </div>

          <div className="product-details-info">
            <span className="product-category-large">{product.category}</span>
            <h1 className="product-details-title">{product.name}</h1>
            <div className="product-details-price-row">
              <span className="product-details-price">₹{product.price.toFixed(2)}</span>
              <span
                className={
                  product.stock > 10
                    ? "badge badge-in-stock"
                    : product.stock > 0
                    ? "badge badge-low-stock"
                    : "badge badge-out-stock"
                }
              >
                {product.stock > 10
                  ? "In Stock"
                  : product.stock > 0
                  ? `Low Stock: ${product.stock} remaining`
                  : "Out of Stock"}
              </span>
            </div>

            <div className="product-details-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {feedback && (
              <div
                className={`alert ${
                  feedback.includes("Successfully")
                    ? "alert-success"
                    : "alert-error"
                }`}
              >
                {feedback}
              </div>
            )}

            {product.stock > 0 && (
              <div className="product-details-qty-row">
                <label>Quantity:</label>
                <div className="qty-picker">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="product-details-actions">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || adding}
                className="btn btn-primary btn-large"
              >
                {adding ? "Adding to Cart..." : "Add to Cart"}
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`btn ${
                  isWishlisted ? "btn-secondary active" : "btn-outline"
                } btn-large`}
              >
                {isWishlisted ? "♥ Wishlisted" : "♡ Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
