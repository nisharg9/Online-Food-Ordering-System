// pages/OrderHistoryPage.jsx
// User's order history with status pills, order details, live tracking, and one-click re-order
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  RotateCcw, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { EmptyOrders } from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState(null);
  const { addItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load past orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleReorder = async (order) => {
    setReorderingId(order.id);
    try {
      // Add all items from this order into the cart
      for (const item of order.items) {
        addItem(
          {
            id: item.item_id || item.id,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
          },
          item.quantity
        );
      }
      toast.success(`Items from #${order.id.slice(0, 8)} added to your cart! 🛒`);
      navigate('/cart');
    } catch {
      toast.error('Could not re-order these items.');
    } finally {
      setReorderingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-green-100 text-green-700 font-bold text-xs px-3 py-1 rounded-full">✓ Delivered</span>;
      case 'Cancelled':
        return <span className="bg-red-100 text-red-600 font-bold text-xs px-3 py-1 rounded-full">✕ Cancelled</span>;
      case 'Out for Delivery':
        return <span className="bg-blush-100 text-blush-700 font-bold text-xs px-3 py-1 rounded-full animate-pulse">🚚 Out for Delivery</span>;
      case 'Preparing':
        return <span className="bg-amber-100 text-amber-700 font-bold text-xs px-3 py-1 rounded-full animate-pulse">🍳 Preparing</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1 rounded-full">📦 Placed</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="section-container max-w-4xl text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm font-semibold text-blush-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen py-12 animate-fade-in">
        <div className="section-container max-w-2xl">
          <h1 className="text-3xl font-extrabold text-[#333333] mb-6">📦 My Orders</h1>
          <div className="card p-8">
            <EmptyOrders onBrowse={() => navigate('/menu')} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="section-container max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#333333]">📦 My Orders</h1>
            <p className="text-sm text-gray-400 mt-1">
              You have placed {orders.length} {orders.length === 1 ? 'order' : 'orders'} with BlushBites
            </p>
          </div>
          <Link to="/menu" className="btn-outline text-xs sm:text-sm py-2 px-4 self-start sm:self-auto flex items-center gap-1.5">
            <ShoppingBag size={15} /> Order Something New
          </Link>
        </div>

        {/* Order Cards List */}
        <div className="space-y-5">
          {orders.map((order) => {
            const isActive = ['Placed', 'Preparing', 'Out for Delivery'].includes(order.status);

            return (
              <div key={order.id} className="card p-5 sm:p-6 transition-all hover:border-blush-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pink-50 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-blush-600">
                        #{order.id.slice(0, 8)}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="text-right sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                    <span className="text-xs text-gray-400">Total Amount</span>
                    <span className="text-xl font-extrabold text-gradient-pink">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items preview list */}
                <div className="py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                    Items Ordered:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5 text-xs bg-blush-50/70 border border-pink-100 text-gray-700 px-3 py-1.5 rounded-xl font-medium"
                      >
                        <span className="font-bold text-blush-600">{item.quantity}×</span>
                        <span>{item.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-pink-50 gap-3">
                  <div className="text-xs text-gray-500">
                    Delivered to: <span className="font-medium text-gray-700">{order.delivery_address.slice(0, 45)}...</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live Track CTA for in-progress orders */}
                    {isActive && (
                      <Link
                        to={`/track/${order.id}`}
                        className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                      >
                        <Clock size={14} />
                        <span>Track Live</span>
                      </Link>
                    )}

                    {/* View Details / Receipt */}
                    <Link
                      to={`/order-confirmation/${order.id}`}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-blush-600 hover:bg-blush-50 transition-colors"
                    >
                      Receipt
                    </Link>

                    {/* Re-order button */}
                    <button
                      id={`reorder-btn-${order.id.slice(0, 8)}`}
                      onClick={() => handleReorder(order)}
                      disabled={reorderingId === order.id}
                      className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5"
                    >
                      {reorderingId === order.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <RotateCcw size={13} />
                      )}
                      <span>Re-order</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
