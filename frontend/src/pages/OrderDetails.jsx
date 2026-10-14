import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content container loading-container">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content container">
          <div className="alert alert-error">
            <h3>Order Not Found</h3>
            <p>{error || "The requested order could not be retrieved."}</p>
            <Link to="/orders" className="btn btn-primary mt-3">
              Back to Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content container">
        <div className="breadcrumb">
          <Link to="/orders">← Back to My Orders</Link>
        </div>

        <div className="order-details-header-card">
          <div>
            <h1>Order #{order._id}</h1>
            <p className="order-date-text">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="order-status-block">
            <span className="badge badge-in-stock">{order.status}</span>
          </div>
        </div>

        <div className="order-details-grid">
          <div className="order-items-card">
            <h3>Items in this Order</h3>
            <div className="order-items-table">
              {order.items.map((item, index) => (
                <div key={index} className="order-table-row">
                  <img src={item.imageUrl} alt={item.name} className="order-item-img" />
                  <div className="order-item-info">
                    <h4>{item.name}</h4>
                    <p className="item-unit-price">₹{item.price.toFixed(2)} per unit</p>
                  </div>
                  <div className="order-item-qty-col">
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <div className="order-item-subtotal-col">
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="order-total-summary">
              <div className="summary-row total-row">
                <span>Total Amount Paid</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="order-meta-sidebar">
            <div className="meta-card">
              <h4>Shipping Information</h4>
              <p className="meta-name">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="meta-card">
              <h4>Payment Information</h4>
              <p>Method: {order.paymentMethod}</p>
              <p>
                Status:{" "}
                <span className={`badge ${order.paymentStatus === "Paid" ? "badge-in-stock" : "badge-out-of-stock"}`}>
                  {order.paymentStatus || (order.paymentMethod === "COD" ? "Pending (COD)" : "Paid")}
                </span>
              </p>
              {order.razorpayPaymentId && (
                <p style={{ marginTop: "8px", fontSize: "0.85rem", wordBreak: "break-all" }}>
                  <strong>Payment ID:</strong> {order.razorpayPaymentId}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;
