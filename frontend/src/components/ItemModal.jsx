// components/ItemModal.jsx
// Full item detail modal with image, description, dietary info, quantity selector, and Add to Cart
import { useState, useEffect } from 'react';
import { X, Plus, Minus, Star, Flame, Leaf } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

// Fallback image if item image fails to load
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500&q=80';

export default function ItemModal({ item, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const { addItem, items } = useCart();
  const toast = useToast();

  // Get current quantity in cart
  const cartItem = items.find((i) => i.id === item.id);
  const cartQty = cartItem?.quantity || 0;

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAddToCart = () => {
    if (!item.in_stock) {
      toast.error(`${item.name} is currently out of stock.`);
      return;
    }
    addItem({ ...item }, quantity);
    toast.success(`${item.name} × ${quantity} added to cart! 🛒`);
    onClose();
  };

  const totalPrice = (item.price * quantity).toFixed(2);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Modal */}
        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
          {/* Item Image */}
          <div className="relative h-56 shrink-0">
            <img
              src={imageError ? FALLBACK_IMAGE : item.image_url || FALLBACK_IMAGE}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {/* Close button */}
            <button
              id="item-modal-close"
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center
                         hover:bg-white transition-colors shadow-md"
            >
              <X size={16} className="text-gray-700" />
            </button>
            {/* Stock badge */}
            {!item.in_stock && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Out of Stock
              </div>
            )}
            {/* Veg/NonVeg badge */}
            <div className="absolute bottom-3 left-3">
              {item.is_veg ? (
                <span className="badge-veg bg-white/90"><Leaf size={10} /> Pure Veg</span>
              ) : (
                <span className="badge-nonveg bg-white/90"><Flame size={10} /> Non-Veg</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-5 flex-1">
            {/* Category chip */}
            <span className="text-xs text-blush-500 font-semibold uppercase tracking-wider">
              {item.category_name}
            </span>

            <h2 className="text-xl font-bold text-[#333333] mt-1 mb-2">{item.name}</h2>

            {/* Rating & Calories */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-[#333333]">{item.rating?.toFixed(1)}</span>
              </div>
              {item.calories > 0 && (
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Flame size={13} />
                  <span>{item.calories} kcal</span>
                </div>
              )}
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-5">{item.description}</p>

            {/* Quantity Selector */}
            {item.in_stock && (
              <div className="flex items-center justify-between mb-5">
                <span className="font-semibold text-gray-700">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    id="item-modal-decrease"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-full border-2 border-blush-200 flex items-center justify-center
                               hover:border-blush-500 hover:bg-blush-50 transition-all disabled:opacity-40"
                  >
                    <Minus size={14} className="text-blush-500" />
                  </button>
                  <span className="text-lg font-bold text-[#333333] min-w-[2ch] text-center">{quantity}</span>
                  <button
                    id="item-modal-increase"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-full bg-blush-500 flex items-center justify-center
                               hover:bg-blush-600 transition-all shadow-pink"
                  >
                    <Plus size={14} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {cartQty > 0 && (
              <p className="text-xs text-blush-400 font-medium mb-3 text-center">
                ✓ You already have {cartQty} in your cart
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-pink-50 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gradient-pink">${totalPrice}</p>
            </div>
            <button
              id="item-modal-add-to-cart"
              onClick={handleAddToCart}
              disabled={!item.in_stock}
              className="btn-primary flex-1 max-w-[200px]"
            >
              {item.in_stock ? `Add ${quantity} to Cart` : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
