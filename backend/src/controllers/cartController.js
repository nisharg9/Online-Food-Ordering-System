// controllers/cartController.js
// Server-side cart sync (for persisting cart when user logs in)
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');

/**
 * GET /api/cart
 * Get the authenticated user's server-side cart
 */
const getCart = (req, res, next) => {
  try {
    const db = getDb();
    const cartItems = db.prepare(`
      SELECT ci.id as cart_id, ci.quantity, ci.updated_at,
             mi.id as item_id, mi.name, mi.price, mi.image_url, mi.is_veg, mi.in_stock, mi.description
      FROM cart_items ci
      JOIN menu_items mi ON ci.item_id = mi.id
      WHERE ci.user_id = ?
      ORDER BY ci.updated_at DESC
    `).all(req.user.id);

    const formatted = cartItems.map((item) => ({
      ...item,
      is_veg: item.is_veg === 1,
      in_stock: item.in_stock === 1,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cart/sync
 * Sync a localStorage cart array to the server (called on login)
 * Merges client cart with any existing server cart
 */
const syncCart = (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid cart data.' });
    }

    const db = getDb();

    // Merge strategy: upsert each item (add or increment quantity)
    const upsert = db.prepare(`
      INSERT INTO cart_items (id, user_id, item_id, quantity, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, item_id) DO UPDATE SET
        quantity = quantity + excluded.quantity,
        updated_at = excluded.updated_at
    `);

    const syncAll = db.transaction((items) => {
      for (const item of items) {
        // Only add if item still exists and is valid
        const dbItem = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(item.itemId);
        if (dbItem) {
          upsert.run(uuidv4(), req.user.id, item.itemId, Math.max(1, item.quantity || 1));
        }
      }
    });

    syncAll(items);

    // Return the merged cart
    const cartItems = db.prepare(`
      SELECT ci.quantity, mi.id as item_id, mi.name, mi.price, mi.image_url, mi.is_veg, mi.in_stock
      FROM cart_items ci
      JOIN menu_items mi ON ci.item_id = mi.id
      WHERE ci.user_id = ?
      ORDER BY ci.updated_at DESC
    `).all(req.user.id);

    res.json({
      success: true,
      message: 'Cart synced!',
      data: cartItems.map((i) => ({ ...i, is_veg: i.is_veg === 1, in_stock: i.in_stock === 1 })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart
 * Clear the user's server-side cart
 */
const clearCart = (req, res, next) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, syncCart, clearCart };
