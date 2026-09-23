// pages/CheckoutPage.jsx
// Order checkout: delivery address, payment method selection, order summary, real-time stock check
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card' | 'UPI' | 'COD'
  
  // Mock payment details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [upiId, setUpiId] = useState('blushuser@okaxis');

  const [submitting, setSubmitting] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [stockError, setStockError] = useState('');

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items, navigate]);

  // Update address if user profile updates
  useEffect(() => {
    if (user?.address && !address) {
      setAddress(user.address);
    }
  }, [user]);

  const validate = () => {
    setAddressError('');
    setStockError('');
    if (!address.trim()) {
      setAddressError('Delivery address is required.');
      return false;
    }
    if (address.trim().length < 10) {
      setAddressError('Please enter a complete address with street & area (min. 10 characters).');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission
    if (!validate()) return;

    setSubmitting(true);
    setStockError('');

    try {
      const orderPayload = {
        items: items.map((item) => ({
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryAddress: address.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod,
      };

      const res = await api.post('/orders', orderPayload);
      const data = res.data;

      if (data.success && data.data?.orderId) {
        toast.success(data.message || 'Order placed successfully! 🎉');
        clearCart();
        navigate(`/order-confirmation/${data.data.orderId}`, {
          state: { orderDetails: data.data, deliveryAddress: address },
          replace: true,
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(errorMsg);
      
      // Check if it was a real-time stock issue
      if (errorMsg.toLowerCase().includes('stock') || errorMsg.toLowerCase().includes('no longer exists')) {
        setStockError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="section-container">
        {/* Back link */}
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-blush-500 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold text-[#333333] mb-8 flex items-center gap-3">
          <span>🛍️ Checkout</span>
        </h1>

        {stockError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 animate-slide-up">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-bold text-red-800 text-sm">Stock Availability Alert</h4>
              <p className="text-red-700 text-sm mt-0.5">{stockError}</p>
              <Link to="/cart" className="text-blush-600 font-semibold text-xs mt-2 inline-block hover:underline">
                Return to cart to update items &rarr;
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="card p-6 border-l-4 border-l-blush-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blush-50 flex items-center justify-center text-blush-500">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#333333]">1. Delivery Details</h2>
                  <p className="text-xs text-gray-400">Where should we deliver your hot food?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="checkout-address" className="block text-sm font-semibold text-[#333333] mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="checkout-address"
                    rows="3"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (addressError) setAddressError('');
                    }}
                    placeholder="e.g. 104 Blossom Heights, Cherry Lane, Downtown Apt 4B"
                    className={`input-field resize-none ${addressError ? 'input-error' : ''}`}
                  />
                  {addressError && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{addressError}</p>
                  )}
                  {user && (
                    <p className="text-xs text-gray-400 mt-1">
                      Delivering to: <strong className="text-gray-600">{user.name}</strong> ({user.phone || user.email})
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="checkout-notes" className="block text-sm font-semibold text-[#333333] mb-1.5">
                    Delivery Instructions (optional)
                  </label>
                  <input
                    id="checkout-notes"
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Ring the bell twice, leave at door, call on arrival"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="card p-6 border-l-4 border-l-blush-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blush-50 flex items-center justify-center text-blush-500">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#333333]">2. Payment Method</h2>
                  <p className="text-xs text-gray-400">Select how you'd like to pay (Mock Payment)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { id: 'Card', label: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
                  { id: 'UPI', label: 'Instant UPI', icon: <Smartphone size={18} /> },
                  { id: 'COD', label: 'Cash on Delivery', icon: <Banknote size={18} /> },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    id={`payment-method-${opt.id.toLowerCase()}`}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center ${
                      paymentMethod === opt.id
                        ? 'border-blush-500 bg-blush-50 text-blush-600 font-bold shadow-pink'
                        : 'border-pink-100 bg-white text-gray-600 hover:border-blush-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mb-1.5 ${paymentMethod === opt.id ? 'text-blush-500' : 'text-gray-400'}`}>
                      {opt.icon}
                    </div>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Conditional Mock Payment Inputs */}
              {paymentMethod === 'Card' && (
                <div className="p-4 rounded-2xl bg-blush-50/60 border border-pink-100 space-y-3 animate-fade-in">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-green-600" />
                    Mock Payment Demo — No actual charges will be made
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="input-field text-sm font-mono py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="input-field text-sm font-mono py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        className="input-field text-sm font-mono py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-2xl bg-blush-50/60 border border-pink-100 space-y-3 animate-fade-in">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blush-500" />
                    UPI Direct Pay Simulation
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="input-field text-sm font-mono py-2"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200 text-xs text-amber-800 animate-fade-in flex items-start gap-2">
                  <Banknote size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Pay with exact cash or mobile scan upon delivery. Please ensure someone is available at the address.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-[#333333] mb-4 pb-3 border-b border-pink-100 flex items-center justify-between">
                <span>Items in Order</span>
                <span className="text-xs bg-blush-50 text-blush-500 font-bold px-2 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </h3>

              {/* Items preview list */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-5 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-md bg-blush-100 text-blush-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {item.quantity}
                      </span>
                      <span className="text-gray-700 truncate text-xs font-medium">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 text-xs shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-pink-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#333333]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-bold' : 'font-medium text-[#333333]'}>
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-medium text-[#333333]">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-pink-100 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#333333] text-base">Grand Total</span>
                    <span className="text-2xl font-extrabold text-gradient-pink">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                id="place-order-btn"
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="btn-primary w-full mt-6 py-3.5 flex items-center justify-center gap-2 text-base font-bold"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Verifying & Placing...</span>
                  </span>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Place Order • ${total.toFixed(2)}</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
                By placing this order you agree to BlushBites terms and real-time food preparation policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
