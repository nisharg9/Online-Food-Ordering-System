// pages/AdminOrdersPage.jsx
// Admin order management: view all orders, filter by status, update order statuses in real-time
import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  RotateCw,
  CheckCircle,
  Eye,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_OPTIONS = ['All', 'Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  const toast = useToast();

  const fetchOrders = async (status = selectedStatus) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'All') params.set('status', status);
      const res = await api.get(`/admin/orders?${params}`);
      setOrders(res.data.data);
    } catch {
      toast.error('Failed to load incoming orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(selectedStatus);
  }, [selectedStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (viewingOrder?.id === orderId) {
        setViewingOrder((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Order #${orderId.slice(0, 8)} updated to "${newStatus}"! ✅`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.delivery_address?.toLowerCase().includes(q)
    );
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-600';
      case 'Out for Delivery':
        return 'bg-blush-100 text-blush-700 animate-pulse';
      case 'Preparing':
        return 'bg-amber-100 text-amber-700 animate-pulse';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="section-container max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blush-500 transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-[#333333]">📋 Incoming Orders</h1>
            <p className="text-xs text-gray-400 mt-1">
              Live kitchen order management and fulfillment status tracker
            </p>
          </div>

          <button
            onClick={() => fetchOrders(selectedStatus)}
            className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCw size={13} /> Refresh Orders
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="card p-4 mb-6 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-blush-500 text-white shadow-pink'
                    : 'bg-pink-50 text-gray-600 hover:bg-blush-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, order ID, or address..."
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="py-20 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-3" />
            <p className="text-sm font-semibold text-blush-500">Retrieving customer orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30 text-blush-500" />
            <p className="font-bold text-base text-[#333333]">No orders found</p>
            <p className="text-xs mt-1">There are no orders matching this filter or search.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-pink-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-pink-50/40">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50 text-sm">
                  {filteredOrders.map((order) => {
                    const isUpdating = updatingId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-blush-50/20 transition-colors">
                        {/* ID & Date */}
                        <td className="py-3.5 px-4">
                          <p className="font-mono font-bold text-blush-600 text-xs">
                            #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                            {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                        </td>

                        {/* Customer Info */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#333333] text-xs">
                            {order.customer_name || 'Guest User'}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {order.customer_phone || order.customer_email || 'No phone'}
                          </p>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            {order.items?.slice(0, 2).map((item) => (
                              <span key={item.id} className="text-xs text-gray-700">
                                <strong>{item.quantity}×</strong> {item.name}
                              </span>
                            ))}
                            {order.items?.length > 2 && (
                              <span className="text-[10px] text-blush-500 font-semibold">
                                +{order.items.length - 2} more item(s)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4 font-extrabold text-blush-600 text-sm">
                          ${order.total_amount?.toFixed(2)}
                        </td>

                        {/* Status Select */}
                        <td className="py-3.5 px-4">
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-full border border-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-blush-300 ${getStatusClass(
                                order.status
                              )}`}
                            >
                              <option value="Placed">📦 Placed</option>
                              <option value="Preparing">🍳 Preparing</option>
                              <option value="Out for Delivery">🚚 Out for Delivery</option>
                              <option value="Delivered">✓ Delivered</option>
                              <option value="Cancelled">✕ Cancelled</option>
                            </select>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blush-600 hover:bg-blush-50 transition-colors"
                            title="Inspect Order Details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inspect Order Modal */}
        {viewingOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#333333]">
                    Order #{viewingOrder.id.slice(0, 8)}
                  </h3>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusClass(viewingOrder.status)}`}>
                    {viewingOrder.status}
                  </span>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Customer and Delivery info */}
              <div className="space-y-3 mb-5 p-3.5 bg-blush-50/50 rounded-2xl text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={14} className="text-blush-500" />
                  <span><strong>Customer:</strong> {viewingOrder.customer_name} ({viewingOrder.customer_email})</span>
                </div>
                {viewingOrder.customer_phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={14} className="text-blush-500" />
                    <span><strong>Phone:</strong> {viewingOrder.customer_phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin size={14} className="text-blush-500 shrink-0 mt-0.5" />
                  <span><strong>Address:</strong> {viewingOrder.delivery_address}</span>
                </div>
                {viewingOrder.delivery_notes && (
                  <p className="text-blush-600 font-medium pl-6">
                    Note: "{viewingOrder.delivery_notes}"
                  </p>
                )}
              </div>

              {/* Items List */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Order Items ({viewingOrder.items?.length})
              </h4>
              <div className="divide-y divide-pink-50 mb-5">
                {viewingOrder.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blush-600">{item.quantity}×</span>
                      <span className="font-semibold text-gray-800">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1.5 pt-3 border-t border-pink-100 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${viewingOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>${viewingOrder.delivery_fee?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${viewingOrder.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#333333] pt-2 border-t border-pink-50">
                  <span>Total:</span>
                  <span className="text-blush-500">${viewingOrder.total_amount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Quick Status Update Buttons */}
              <div className="mt-6 pt-4 border-t border-pink-100">
                <p className="text-xs font-bold text-gray-500 mb-2">Update Order Status:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      disabled={viewingOrder.status === st || updatingId === viewingOrder.id}
                      onClick={() => handleStatusChange(viewingOrder.id, st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        viewingOrder.status === st
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blush-50 text-blush-600 hover:bg-blush-500 hover:text-white'
                      }`}
                    >
                      Mark as {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
