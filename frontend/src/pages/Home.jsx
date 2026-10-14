import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data.customer);
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="home-page">
        <section className="welcome-section">
          <div>
            <p className="welcome-label">SHOPKART</p>

            <h1>Welcome back, {customer.fullName}</h1>

            <p className="welcome-text">
             Hello
            </p>
          </div>
        </section>

        <section className="profile-section">
          <div className="section-heading">
            <p>Account</p>
            <h2>Your Information</h2>
          </div>

          <div className="profile-grid">
            <div className="info-card">
              <span>Full Name</span>
              <strong>{customer.fullName}</strong>
            </div>

            <div className="info-card">
              <span>Email</span>
              <strong>{customer.email}</strong>
            </div>

            <div className="info-card">
              <span>Phone Number</span>
              <strong>{customer.phone}</strong>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;