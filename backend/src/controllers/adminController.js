// controllers/adminController.js
// Admin dashboard analytics and order management
const { getDb } = require('../config/database');

/**
 * GET /api/admin/dashboard
 * Returns dashboard statistics
 */
const getDashboardStats = (req, res, next) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const todayOrders = db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?
    `).get(today);

    const todayRevenue = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM orders 
      WHERE DATE(created_at) = ? AND status != 'Cancelled'
    `).get(today);

    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'Cancelled'
    `).get();

    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();

    const activeOrders = db.prepare(`
      SELECT COUNT(*) as count FROM orders 
      WHERE status IN ('Placed', 'Preparing', 'Out for Delivery')
    `).get();

    const avgOrderValue = db.prepare(`
      SELECT COALESCE(AVG(total_amount), 0) as avg FROM orders WHERE status != 'Cancelled'
    `).get();

    // Top 5 selling items
    const topItems = db.prepare(`
      SELECT oi.item_id, oi.name, SUM(oi.quantity) as total_sold, 
             SUM(oi.price * oi.quantity) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'Cancelled'
      GROUP BY oi.item_id, oi.name
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();

    // Orders by status (for pie chart)
    const ordersByStatus = db.prepare(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `).all();

    // Revenue for last 7 days
    const revenueByDay = db.prepare(`
      SELECT DATE(created_at) as date, 
             COUNT(*) as orders,
             COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at >= datetime('now', '-7 days')
        AND status != 'Cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();

    res.json({
      success: true,
      data: {
        todayOrders: todayOrders.count,
        todayRevenue: todayRevenue.total,
        totalRevenue: totalRevenue.total,
        totalOrders: totalOrders.count,
        activeOrders: activeOrders.count,
        avgOrderValue: parseFloat(avgOrderValue.avg.toFixed(2)),
        topItems,
        ordersByStatus,
        revenueByDay,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/orders
 * Get all orders with optional status filter (for admin)
 */
const getAllOrders = (req, res, next) => {
  try {
    const db = getDb();
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const orders = db.prepare(query).all(...params);

    // Attach items to each order
    const ordersWithItems = orders.map((order) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];
    if (status && status !== 'All') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: ordersWithItems,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, getAllOrders };
