// pages/OrderTrackingPage.jsx
// Live order tracking with status stepper: Placed → Preparing → Out for Delivery → Delivered
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Truck, 
  Home, 
  AlertTriangle, 
  RotateCw, 
  MapPin, 
  ArrowLeft,
  Receipt
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const STEPS = [
  { key: 'Placed', label: 'Order Placed', desc: 'Received & acknowledged by kitchen', icon: Clock },
  { key: 'Preparing', label: 'Preparing', desc: 'Chefs are crafting your dishes fresh', icon: ChefHat },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider is on the way to your door', icon: Truck },
  { key: 'Delivered', label: 'Delivered', desc: 'Enjoy your delicious meal! 🌸', icon: Home },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order tracking details.');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Auto-poll every 12 seconds if order is active
    const interval = setInterval(() => {
      if (order && !['Delivered', 'Cancelled'].includes(order.status)) {
        fetchOrder();
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [id, order?.status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-3" />
          <p className="text-sm font-semibold text-blush-500">Connecting to tracking service...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-16">
        <div className="section-container max-w-md text-center">
          <div className="card p-8">
            <div className="text-5xl mb-4">📍</div>
            <h2 className="text-xl font-bold text-[#333333] mb-2">Tracking Unavailable</h2>
            <p className="text-sm text-gray-500 mb-6">{error || 'Order tracking not found.'}</p>
            <Link to="/orders" className="btn-primary inline-block">
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'Cancelled';
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="section-container max-w-3xl">
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-blush-500 transition-colors">
            <ArrowLeft size={16} /> My Orders
          </Link>
          <button
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-semibold text-gray-600 hover:border-blush-400 hover:text-blush-500 transition-all active:scale-95"
          >
            <RotateCw size={13} className={refreshing ? 'animate-spin text-blush-500' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>
        </div>

        {/* Status Header Card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Tracking</span>
                <span className="text-xs font-mono bg-blush-50 text-blush-600 px-2 py-0.5 rounded-md font-bold">
                  #{order.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#333333]">
                {isCancelled ? '❌ Order Cancelled' : `Order is ${order.status}`}
              </h1>
            </div>

            {/* Status badge */}
            <div className="shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                isCancelled
                  ? 'bg-red-100 text-red-700'
                  : order.status === 'Delivered'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blush-50 text-blush-600 animate-pulse'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Stepper Progress */}
          {!isCancelled ? (
            <div className="pt-8 pb-4">
              <div className="relative">
                {/* Horizontal Progress Bar Background */}
                <div className="hidden sm:block absolute top-5 left-10 right-10 h-1 bg-pink-100 -z-0" />
                
                {/* Active progress fill */}
                <div 
                  className="hidden sm:block absolute top-5 left-10 h-1 bg-blush-500 transition-all duration-500 -z-0"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (STEPS.length - 1)) * 100 * 0.82)}%`,
                  }}
                />

                {/* Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = currentStepIndex > idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                        {/* Step Bubble */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                            isCompleted
                              ? 'bg-blush-500 text-white shadow-pink'
                              : isCurrent
                              ? 'bg-blush-500 text-white step-active ring-4 ring-blush-200'
                              : 'bg-white border-2 border-pink-100 text-gray-300'
                          }`}
                        >
                          {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                        </div>

                        {/* Step Labels */}
                        <div>
                          <p className={`text-sm font-bold ${
                            isCurrent ? 'text-blush-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-red-500 bg-red-50 rounded-2xl mt-4">
              <AlertTriangle className="mx-auto mb-2" size={28} />
              <p className="font-bold text-sm">This order was cancelled.</p>
              <p className="text-xs text-red-400 mt-1">If you have any questions, please contact our support team.</p>
            </div>
          )}
        </div>

        {/* Order Details & Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destination */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="text-blush-500" size={18} />
              <h3 className="font-bold text-sm text-[#333333]">Delivery Details</h3>
            </div>
            <p className="text-sm font-medium text-gray-700 leading-relaxed">
              {order.delivery_address}
            </p>
            {order.delivery_notes && (
              <p className="text-xs text-blush-500 mt-2 bg-blush-50 p-2.5 rounded-xl">
                <strong>Instructions:</strong> {order.delivery_notes}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-pink-50">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          {/* Items Summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="text-blush-500" size={18} />
                <h3 className="font-bold text-sm text-[#333333]">Order Items</h3>
              </div>
              <span className="font-extrabold text-blush-500 text-sm">
                ${order.total_amount?.toFixed(2)}
              </span>
            </div>

            <div className="divide-y divide-pink-50 max-h-48 overflow-y-auto pr-1">
              {order.items?.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-500">{item.quantity}×</span>
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-pink-50 flex items-center justify-between text-xs text-gray-500">
              <span>Payment: <strong className="text-gray-700">{order.payment_method}</strong></span>
              <span className="text-green-600 font-semibold">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
