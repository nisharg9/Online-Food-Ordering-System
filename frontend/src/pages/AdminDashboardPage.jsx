// pages/AdminDashboardPage.jsx
// Admin analytics dashboard: metrics, revenue charts, top sellers, order statuses
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  TrendingUp, 
  UtensilsCrossed, 
  ClipboardList, 
  ArrowUpRight,
  Flame,
  Award
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-3" />
          <p className="text-sm font-semibold text-blush-500">Loading live business analytics...</p>
        </div>
      </div>
    );
  }

  const {
    todayOrders = 0,
    todayRevenue = 0,
    totalRevenue = 0,
    totalOrders = 0,
    activeOrders = 0,
    avgOrderValue = 0,
    topItems = [],
    ordersByStatus = [],
    revenueByDay = [],
  } = stats || {};

  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 100);

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="section-container max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blush-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Admin Panel
              </span>
              <span className="text-xs text-gray-400">Live Operations</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#333333] mt-1">📊 Store Analytics</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/menu"
              className="btn-outline text-xs sm:text-sm py-2.5 px-4 flex items-center gap-1.5"
            >
              <UtensilsCrossed size={16} />
              <span>Manage Menu</span>
            </Link>
            <Link
              to="/admin/orders"
              className="btn-primary text-xs sm:text-sm py-2.5 px-4 flex items-center gap-1.5"
            >
              <ClipboardList size={16} />
              <span>Live Orders ({activeOrders})</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Today's Revenue */}
          <div className="card p-5 border-l-4 border-l-blush-500">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-blush-50 text-blush-500 flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#333333]">${todayRevenue.toFixed(2)}</p>
            <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> {todayOrders} orders placed today
            </p>
          </div>

          {/* Active Orders */}
          <div className="card p-5 border-l-4 border-l-amber-400">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Orders</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#333333]">{activeOrders}</p>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              In kitchen or on the road
            </p>
          </div>

          {/* Total Revenue */}
          <div className="card p-5 border-l-4 border-l-green-400">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
              <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#333333]">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">
              Across {totalOrders} lifetime orders
            </p>
          </div>

          {/* Average Order Value */}
          <div className="card p-5 border-l-4 border-l-purple-400">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Order Value</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#333333]">${avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">Per completed order</p>
          </div>
        </div>

        {/* Charts and Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Last 7 Days (Visual Bar Chart) */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-[#333333]">Daily Revenue (Last 7 Days)</h3>
                <p className="text-xs text-gray-400">Daily transaction volume and performance</p>
              </div>
              <span className="text-xs font-semibold text-blush-500 bg-blush-50 px-2.5 py-1 rounded-lg">
                Revenue Growth
              </span>
            </div>

            {revenueByDay.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No orders recorded in the last 7 days.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end gap-3 h-48 pt-6 border-b border-pink-100">
                  {revenueByDay.map((day) => {
                    const heightPct = Math.max(12, (day.revenue / maxRevenue) * 100);

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-blush-500 transition-colors mb-1">
                          ${day.revenue.toFixed(0)}
                        </span>
                        <div
                          className="w-full bg-gradient-pink rounded-t-lg transition-all duration-300 hover:brightness-105 group-hover:shadow-pink"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                  {revenueByDay.map((day) => (
                    <span key={day.date} className="flex-1 text-center truncate px-1">
                      {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Status Distribution */}
          <div className="lg:col-span-1 card p-6">
            <h3 className="font-bold text-lg text-[#333333] mb-1">Orders Breakdown</h3>
            <p className="text-xs text-gray-400 mb-5">Current status across all orders</p>

            <div className="space-y-3">
              {ordersByStatus.map((s) => {
                const pct = totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0;
                
                let colorClass = 'bg-blue-400';
                if (s.status === 'Delivered') colorClass = 'bg-green-500';
                if (s.status === 'Preparing') colorClass = 'bg-amber-400';
                if (s.status === 'Out for Delivery') colorClass = 'bg-blush-500';
                if (s.status === 'Cancelled') colorClass = 'bg-red-400';

                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700">{s.status}</span>
                      <span className="text-gray-500">{s.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-pink-50 rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-pink-50 text-center">
              <Link
                to="/admin/orders"
                className="text-xs font-bold text-blush-500 hover:text-blush-600 flex items-center justify-center gap-1"
              >
                <span>View All Orders List</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Top Selling Items Table */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award className="text-amber-500" size={20} />
              <h3 className="font-bold text-lg text-[#333333]">Top 5 Most Popular Dishes</h3>
            </div>
            <Link to="/admin/menu" className="text-xs font-bold text-blush-500 hover:underline">
              Manage All Menu Items &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pink-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Units Sold</th>
                  <th className="py-3 px-4">Total Revenue</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 text-sm">
                {topItems.map((item, idx) => (
                  <tr key={item.item_id || idx} className="hover:bg-blush-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#333333] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blush-100 text-blush-600 font-extrabold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-700">
                      {item.total_sold} units
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blush-500">
                      ${item.revenue.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                        <Flame size={10} /> Best Seller
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
