// context/CartContext.jsx
// Cart state management with localStorage persistence and backend sync on login
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const CART_KEY = 'blushbites_cart';
const TAX_RATE = 0.08;
const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 30;

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  // ─── Load cart from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  // ─── Persist cart to localStorage on every change ──────────────────────────
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // ─── Sync cart to backend when user logs in ─────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      api
        .post('/cart/sync', {
          items: items.map((i) => ({ itemId: i.id, quantity: i.quantity })),
        })
        .catch(() => {}); // Silent sync — cart already in localStorage
    }
  }, [isAuthenticated]);

  // ─── Add item to cart ───────────────────────────────────────────────────────
  const addItem = useCallback((item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  // ─── Update item quantity ───────────────────────────────────────────────────
  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  }, []);

  // ─── Remove item from cart ──────────────────────────────────────────────────
  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  // ─── Clear entire cart ──────────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
    if (isAuthenticated) {
      api.delete('/cart').catch(() => {});
    }
  }, [isAuthenticated]);

  // ─── Derived totals ─────────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : items.length > 0 ? DELIVERY_FEE : 0;
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax + deliveryFee).toFixed(2));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        deliveryFee,
        tax,
        total,
        itemCount,
        amountToFreeDelivery,
        FREE_DELIVERY_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
