import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/cart");
      if (res.data.success) {
        setCart(res.data.cart || []);
        setError("");
      }
    } catch (err) {
      // If unauthorized (user logged out), clear cart state silently
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await api.post("/cart/add", { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add to cart";
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put("/cart/update", { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update cart";
      return { success: false, message: msg };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove item";
      return { success: false, message: msg };
    }
  };

  const clearCartState = async () => {
    try {
      await api.delete("/cart/clear");
      setCart([]);
    } catch (err) {
      setCart([]);
    }
  };

  // Derived state
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const subtotal = cart.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
