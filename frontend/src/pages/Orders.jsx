import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders");
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content container">
        <header className="page-header">
          <h1>My Orders</h1>
          <p>Track your past and active order history.</p>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <p>{error}</p>
            <button onClick={fetchOrders} className="btn btn-secondary mt-2">
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>You haven't placed any orders. Start browsing our collection!</p>
            <Link to="/products" className="btn btn-primary mt-3">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-label">Order #</span>
                    <span className="order-id">{order._id}</span>
                  </div>
                  <div>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-preview-items">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="order-preview-item">
                        <img src={item.imageUrl} alt={item.name} />
                        <div>
                          <p className="order-item-name">{item.name}</p>
                          <p className="order-item-qty">
                            Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="more-items-text">
                        + {order.items.length - 3} more item(s)
                      </p>
                    )}
                  </div>

                  <div className="order-summary-block">
                    <div className="order-status-badge">
                      <span className="badge badge-in-stock">{order.status}</span>
                    </div>
                    <div className="order-total-price">
                      <span>Total</span>
                      <strong>₹{order.totalAmount.toFixed(2)}</strong>
                    </div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn btn-secondary btn-sm mt-2"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
