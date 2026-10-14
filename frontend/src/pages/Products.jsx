import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import api from "../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/products/categories");
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      if (res.data.success) {
        setWishlistIds((res.data.wishlist || []).map((item) => item._id));
      }
    } catch (err) {
      // User might not be logged in or session expired
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category && category !== "All") params.category = category;
      if (sort) params.sort = sort;

      const res = await api.get("/products", { params });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, sort]);

  useEffect(() => {
    fetchCategories();
    fetchWishlist();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleReset = () => {
    setSearchTerm("");
    setCategory("All");
    setSort("newest");
  };

  const handleWishlistToggle = (productId, isWishlisted) => {
    if (isWishlisted) {
      setWishlistIds((prev) => [...prev, productId]);
    } else {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content container">
        <header className="page-header">
          <h1>Product Catalog</h1>
          <p>Explore high-quality products curated for your daily needs.</p>
        </header>

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          category={category}
          setCategory={setCategory}
          categories={categories}
          sort={sort}
          setSort={setSort}
          onReset={handleReset}
        />

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <p>{error}</p>
            <button onClick={fetchProducts} className="btn btn-secondary mt-2">
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try clearing filters or searching for something else.</p>
            <button onClick={handleReset} className="btn btn-primary mt-3">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isWishlistedInitial={wishlistIds.includes(product._id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
