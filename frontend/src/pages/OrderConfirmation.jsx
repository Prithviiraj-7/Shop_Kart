import { useLocation, Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content container">
        <div className="confirmation-card">
          <div className="confirmation-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="confirmation-sub">
            Thank you for your purchase. Your order reference ID is:
          </p>
          <span className="order-id-badge">{order._id}</span>

          <div className="confirmation-details">
            <div className="confirmation-block">
              <h4>Shipping Details</h4>
              <p><strong>{order.shippingAddress.fullName}</strong></p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="confirmation-block">
              <h4>Payment & Status</h4>
              <p>Method: {order.paymentMethod}</p>
              <p>Status: <span className="badge badge-in-stock">{order.status}</span></p>
              <p>Total Paid: <strong>₹{order.totalAmount.toFixed(2)}</strong></p>
            </div>
          </div>

          <div className="confirmation-items">
            <h4>Ordered Items</h4>
            {order.items.map((item, index) => (
              <div key={index} className="confirmation-item">
                <img src={item.imageUrl} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <p>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                </div>
                <span>₹{(item.quantity * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="confirmation-actions">
            <Link to="/orders" className="btn btn-primary">
              View Order History
            </Link>
            <Link to="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;
