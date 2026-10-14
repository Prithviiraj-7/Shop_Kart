import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, fetchCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    paymentMethod: "Razorpay",
  });

  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill profile info if available
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/customers/me");
        if (res.data.success) {
          const cust = res.data.customer;
          setFormData((prev) => ({
            ...prev,
            fullName: cust.fullName || "",
            phone: cust.phone || "",
          }));
          setCustomerEmail(cust.email || "");
        }
      } catch (err) {
        // User not fetched
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler for Razorpay popup checkout flow
  const handleRazorpayPayment = async (order, razorpayOrder) => {
    if (!window.Razorpay) {
      setError("Razorpay SDK failed to load. Please check your internet connection.");
      setSubmitting(false);
      return;
    }

    const options = {
      key: razorpayOrder.key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "ShopKart",
      description: `Payment for Order #${order._id.slice(-6)}`,
      order_id: razorpayOrder.id,
      prefill: {
        name: formData.fullName,
        email: customerEmail,
        contact: formData.phone,
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: function () {
          setSubmitting(false);
          setError("Payment was cancelled. You can retry checkout anytime.");
        },
      },
      handler: async function (response) {
        try {
          // Verify payment signature on backend
          const verifyRes = await api.post("/orders/verify-payment", {
            orderId: order._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verifyRes.data.success) {
            await fetchCart();
            navigate("/order-confirmation", {
              state: { order: verifyRes.data.order },
            });
          }
        } catch (verifyErr) {
          setError(
            verifyErr.response?.data?.message ||
              "Payment verification failed. Please contact support."
          );
        } finally {
          setSubmitting(false);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      setError(
        response.error.description || "Payment failed. Please try again with another method."
      );
      setSubmitting(false);
    });

    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
      };

      const res = await api.post("/orders", payload);

      if (res.data.success) {
        if (formData.paymentMethod === "COD") {
          // COD Flow: direct confirmation
          await fetchCart();
          navigate("/order-confirmation", { state: { order: res.data.order } });
        } else {
          // Razorpay Flow: launch checkout modal
          await handleRazorpayPayment(res.data.order, res.data.razorpayOrder);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content container">
          <div className="empty-state">
            <h3>No items to checkout</h3>
            <p>Please add items to your cart before proceeding to checkout.</p>
            <Link to="/products" className="btn btn-primary mt-3">
              Browse Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content container">
        <header className="page-header">
          <h1>Checkout</h1>
          <p>Provide shipping information to complete your order.</p>
        </header>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <div className="checkout-grid">
          <form onSubmit={handleSubmit} className="checkout-form-card">
            <h3>1. Shipping Address</h3>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, Apt 4B"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Chennai"
                />
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="600001"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>

            <h3 className="mt-4">2. Payment Method</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={formData.paymentMethod === "Razorpay"}
                  onChange={handleChange}
                />
                <div>
                  <strong>Razorpay Online Payment (UPI, Cards, NetBanking)</strong>
                  <p>Pay securely with Razorpay Test Gateway.</p>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === "COD"}
                  onChange={handleChange}
                />
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p>Pay with cash upon delivery.</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-full mt-4"
            >
              {submitting
                ? "Processing..."
                : formData.paymentMethod === "Razorpay"
                ? `Pay with Razorpay (₹${subtotal.toFixed(2)})`
                : `Place Order COD (₹${subtotal.toFixed(2)})`}
            </button>
          </form>

          <div className="checkout-summary-card">
            <h3>Order Items</h3>
            <div className="checkout-item-list">
              {cart.map((item) => (
                <div key={item.product?._id || item._id} className="checkout-item">
                  <img
                    src={item.product?.imageUrl}
                    alt={item.product?.name}
                    className="checkout-item-img"
                  />
                  <div className="checkout-item-details">
                    <span className="checkout-item-name">{item.product?.name}</span>
                    <span className="checkout-item-qty">
                      {item.quantity} x ₹{item.product?.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="checkout-item-price">
                    ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Items Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Grand Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
