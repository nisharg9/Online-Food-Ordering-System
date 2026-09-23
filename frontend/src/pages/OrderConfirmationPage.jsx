// pages/OrderConfirmationPage.jsx
// Order confirmation screen with celebration banner, order summary, ETA, and live tracking button
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ShoppingBag, 
  Receipt,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not find order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm font-semibold text-blush-500">Retrieving your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-16">
        <div className="section-container max-w-md text-center">
          <div className="card p-8">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-[#333333] mb-2">Order Not Found</h2>
            <p className="text-sm text-gray-500 mb-6">{error || 'This order does not exist or has been archived.'}</p>
            <Link to="/orders" className="btn-primary inline-block">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const estimatedMinutes = order.estimated_delivery 
    ? Math.max(10, Math.round((new Date(order.estimated_delivery) - new Date()) / 60000))
    : 35;

  return (
    <div className="min-h-screen py-10 animate-fade-in">
      <div className="section-container max-w-3xl">
        {/* Celebration Banner Card */}
        <div className="bg-gradient-pink rounded-3xl p-8 sm:p-10 text-white text-center shadow-pink-lg relative overflow-hidden mb-8">
          <div className="absolute top-4 left-4 text-4xl opacity-20">🎉</div>
          <div className="absolute top-6 right-6 text-4xl opacity-20">🌸</div>
          <div className="absolute bottom-4 left-8 text-4xl opacity-20">🍰</div>
          <div className="absolute bottom-6 right-8 text-4xl opacity-20">🍔</div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
              <CheckCircle2 size={36} className="text-white" />
            </div>

            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              <Sparkles size={12} /> Order Confirmed
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
              Thank You For Your Order!
            </h1>
            <p className="text-white/90 text-sm sm:text-base max-w-lg mb-6">
              The kitchen has received your order and our chefs are already preparing your meal fresh with love.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                id="confirmation-track-btn"
                onClick={() => navigate(`/track/${order.id}`)}
                className="bg-white text-blush-600 font-bold px-6 py-3 rounded-xl hover:bg-cream-50 transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <span>Track Order Live</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate('/menu')}
                className="bg-white/20 backdrop-blur-md text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/30 transition-all"
              >
                Browse Menu
              </button>
            </div>
          </div>
        </div>

        {/* Order Info & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Key Details Cards */}
          <div className="md:col-span-1 space-y-4">
            {/* ETA */}
            <div className="card p-5 border-l-4 border-l-blush-500">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-blush-500" size={20} />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Estimated Delivery</span>
              </div>
              <p className="text-2xl font-extrabold text-[#333333]">
                ~{estimatedMinutes} mins
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Arriving around {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '30-45 mins'}
              </p>
            </div>

            {/* Delivery Address */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-blush-500" size={20} />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Delivery Address</span>
              </div>
              <p className="text-sm font-semibold text-[#333333] leading-relaxed">
                {order.delivery_address}
              </p>
              {order.delivery_notes && (
                <p className="text-xs text-blush-500 mt-2 bg-blush-50 p-2 rounded-lg">
                  Note: {order.delivery_notes}
                </p>
              )}
            </div>

            {/* Help / Contact */}
            <div className="card p-5 bg-pink-50/50">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-1">
                <PhoneCall size={14} className="text-blush-500" />
                Need assistance?
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Contact our 24/7 customer delight team with Order ID: <span className="font-mono text-blush-600 font-bold">{order.id.slice(0, 8)}</span>
              </p>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="md:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-blush-500" />
                  <h3 className="font-bold text-[#333333]">Receipt Summary</h3>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  ID: #{order.id.slice(0, 8)}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-pink-50 mb-6">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blush-50 text-blush-500 flex items-center justify-center font-bold text-xs">
                        {item.quantity}×
                      </div>
                      <span className="font-semibold text-sm text-[#333333]">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-2 border-t border-pink-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#333333]">${order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className={order.delivery_fee === 0 ? 'text-green-600 font-bold' : 'font-semibold text-[#333333]'}>
                    {order.delivery_fee === 0 ? 'FREE' : `$${order.delivery_fee?.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-[#333333]">${order.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method</span>
                  <span className="font-semibold text-blush-600">{order.payment_method || 'Online'}</span>
                </div>
                <div className="border-t border-pink-100 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-extrabold text-[#333333] text-base">Total Paid</span>
                  <span className="text-2xl font-extrabold text-gradient-pink">
                    ${order.total_amount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
