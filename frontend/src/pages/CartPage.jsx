// pages/CartPage.jsx
// Shopping cart with items list, quantity controls, pricing breakdown, and free delivery progress
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, Leaf, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { EmptyCart } from '../components/EmptyState';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&q=80';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, tax, deliveryFee, total,
          amountToFreeDelivery, FREE_DELIVERY_THRESHOLD } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12 animate-fade-in">
        <div className="section-container">
          <h1 className="text-3xl font-extrabold text-[#333333] mb-8">🛒 Your Cart</h1>
          <div className="card p-8">
            <EmptyCart onBrowse={() => navigate('/menu')} />
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <div className="min-h-screen py-6 animate-fade-in">
      <div className="section-container">
        <h1 className="text-3xl font-extrabold text-[#333333] mb-6">🛒 Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Delivery Progress */}
            {amountToFreeDelivery > 0 ? (
              <div className="bg-white rounded-2xl p-4 border border-pink-100 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#333333]">🚚 Free Delivery Progress</span>
                  <span className="text-sm text-blush-500 font-bold">${amountToFreeDelivery.toFixed(2)} away!</span>
                </div>
                <div className="w-full h-2.5 bg-pink-100 rounded-full overflow-hidden">
                  <div className="delivery-progress h-full" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Add ${amountToFreeDelivery.toFixed(2)} more for free delivery (orders over ${FREE_DELIVERY_THRESHOLD})
                </p>
              </div>
            ) : (
              <div className="bg-[#F0FAF4] border border-[#A8D5BA] rounded-2xl p-4 text-center">
                <p className="text-green-700 font-semibold text-sm">🎉 You've unlocked free delivery!</p>
              </div>
            )}

            {/* Cart Item Cards */}
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}

            <button
              onClick={() => navigate('/menu')}
              className="w-full py-3 text-blush-500 font-semibold text-sm hover:text-blush-600 hover:bg-blush-50
                         rounded-xl transition-colors flex items-center justify-center gap-2 border border-pink-100"
            >
              + Add More Items
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-20">
              <h2 className="text-lg font-bold text-[#333333] mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <SummaryRow
                  label="Delivery Fee"
                  value={deliveryFee === 0 ? 'FREE 🎉' : `$${deliveryFee.toFixed(2)}`}
                  valueClass={deliveryFee === 0 ? 'text-green-600 font-bold' : ''}
                />
                <SummaryRow label="Tax (8%)" value={`$${tax.toFixed(2)}`} />
                <div className="border-t border-pink-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#333333] text-base">Total</span>
                    <span className="text-xl font-extrabold text-gradient-pink">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                id="cart-checkout-btn"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/auth?redirect=/checkout');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Proceed to Checkout
                <ChevronRight size={16} />
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  You'll be asked to sign in before checkout
                </p>
              )}

              {/* Promo / Info */}
              <div className="mt-4 bg-blush-50 rounded-xl p-3 text-xs text-gray-500 leading-relaxed">
                🔒 Secure checkout • Stock verified before order confirmation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItemCard({ item, onUpdateQuantity, onRemove }) {
  const [imageError, setImageError] = useState(false);
  const itemTotal = (item.price * item.quantity).toFixed(2);

  return (
    <div className="card p-4 flex gap-4">
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
        <img
          src={imageError ? FALLBACK_IMAGE : item.image_url || FALLBACK_IMAGE}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              {item.is_veg ? (
                <Leaf size={11} className="text-green-500" />
              ) : (
                <Flame size={11} className="text-red-400" />
              )}
              <h3 className="font-bold text-sm text-[#333333] line-clamp-1">{item.name}</h3>
            </div>
            <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
          </div>
          <button
            id={`cart-remove-${item.id}`}
            onClick={() => onRemove(item.id)}
            className="text-gray-300 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Quantity + Total */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              id={`cart-dec-${item.id}`}
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 rounded-lg border border-pink-200 flex items-center justify-center
                         hover:border-blush-400 hover:bg-blush-50 transition-all"
            >
              <Minus size={12} className="text-blush-500" />
            </button>
            <span className="font-bold text-sm text-[#333333] min-w-[1.5ch] text-center">{item.quantity}</span>
            <button
              id={`cart-inc-${item.id}`}
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 rounded-lg bg-blush-500 flex items-center justify-center hover:bg-blush-600 transition-all"
            >
              <Plus size={12} className="text-white" />
            </button>
          </div>
          <span className="font-extrabold text-gradient-pink">${itemTotal}</span>
        </div>
      </div>
    </div>
  );
function SummaryRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex justify-between items-center text-gray-600">
      <span>{label}</span>
      <span className={`font-semibold text-[#333333] ${valueClass}`}>{value}</span>
    </div>
  );
}
