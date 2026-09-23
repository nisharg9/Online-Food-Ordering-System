// controllers/orderController.js
// Handles order creation (with real-time stock check), order retrieval, and status updates
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');

const TAX_RATE = 0.08; // 8% tax
const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 30;

/**
 * POST /api/orders
 * Create a new order — CRITICAL: checks stock before confirming
 */
const createOrder = (req, res, next) => {
  const db = getDb();

  // Use a transaction to ensure atomicity
  const placeOrder = db.transaction((userId, items, deliveryAddress, deliveryNotes, paymentMethod) => {
    // ✅ GLITCH-FREE: Real-time stock check for ALL items before writing anything
    for (const item of items) {
      const dbItem = db.prepare('SELECT id, name, in_stock, price FROM menu_items WHERE id = ?').get(item.itemId);

      if (!dbItem) {
        throw { statusCode: 400, message: `Item "${item.name}" no longer exists in our menu.` };
      }
      if (dbItem.in_stock !== 1) {
        throw { statusCode: 400, message: `Sorry, "${dbItem.name}" is currently out of stock. Please remove it from your cart.` };
      }
      // Validate price hasn't been tampered client-side
      if (Math.abs(dbItem.price - item.price) > 0.01) {
        throw { statusCode: 400, message: `Price mismatch for "${dbItem.name}". Please refresh and try again.` };
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const totalAmount = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    // Estimate delivery: 30-45 minutes from now
    const estimatedMinutes = Math.floor(Math.random() * 15) + 30;
    const estimatedDelivery = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString();

    const orderId = uuidv4();

    // Create the order
    db.prepare(`
      INSERT INTO orders (id, user_id, subtotal, tax, delivery_fee, total_amount, delivery_address, delivery_notes, payment_method, estimated_delivery)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, userId, subtotal, tax, deliveryFee, totalAmount, deliveryAddress, deliveryNotes || null, paymentMethod, estimatedDelivery);

    // Insert each order item
    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, item_id, name, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const item of items) {
      insertItem.run(uuidv4(), orderId, item.itemId, item.name, item.price, item.quantity);
    }

    // Create payment record
    db.prepare(`
      INSERT INTO payments (id, order_id, method, status, transaction_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      orderId,
      paymentMethod,
      paymentMethod === 'COD' ? 'Pending' : 'Success',
      paymentMethod !== 'COD' ? `TXN_${Date.now()}` : null,
    );

    // Clear user's server-side cart
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

    return { orderId, totalAmount, estimatedDelivery, deliveryFee, tax, subtotal };
  });

  try {
    const { items, deliveryAddress, deliveryNotes, paymentMethod } = req.body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }
    if (!deliveryAddress || deliveryAddress.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid delivery address.' });
    }
    if (!['Card', 'UPI', 'COD'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method.' });
    }

    const result = placeOrder(req.user.id, items, deliveryAddress.trim(), deliveryNotes, paymentMethod);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! 🎉',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders
 * Get all orders for the authenticated user (newest first)
 */
const getUserOrders = (req, res, next) => {
  try {
    const db = getDb();
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    // Attach order items to each order
    const ordersWithItems = orders.map((order) => {
      const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items: orderItems };
    });

    res.json({ success: true, data: ordersWithItems });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id
 * Get a specific order by ID (must belong to user or be an admin)
 */
const getOrderById = (req, res, next) => {
  try {
    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Security: customers can only see their own orders
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this order.' });
    }

    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(order.id);
    const user = db.prepare('SELECT name, email, phone FROM users WHERE id = ?').get(order.user_id);

    res.json({ success: true, data: { ...order, items: orderItems, payment, customer: user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/orders/:id/status (Admin only)
 * Update order status
 */
const updateOrderStatus = (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const db = getDb();
    const order = db.prepare('SELECT id, status FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);

    res.json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: { id: order.id, status },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, updateOrderStatus };
