// controllers/menuController.js
// Handles fetching, creating, updating and deleting menu items and categories
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { getDb } = require('../config/database');

/**
 * GET /api/menu/categories
 * Get all categories
 */
const getCategories = (req, res, next) => {
  try {
    const db = getDb();
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/menu/items
 * Get all menu items with optional filters
 * Query params: category, isVeg, search, sortBy, inStock
 */
const getMenuItems = (req, res, next) => {
  try {
    const { category, isVeg, search, sortBy, inStock } = req.query;
    const db = getDb();

    let query = `
      SELECT mi.*, c.name as category_name, c.slug as category_slug
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (isVeg === 'true') {
      query += ' AND mi.is_veg = 1';
    } else if (isVeg === 'false') {
      query += ' AND mi.is_veg = 0';
    }

    if (search) {
      query += ' AND (mi.name LIKE ? OR mi.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (inStock === 'true') {
      query += ' AND mi.in_stock = 1';
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        query += ' ORDER BY mi.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY mi.price DESC';
        break;
      case 'rating':
        query += ' ORDER BY mi.rating DESC';
        break;
      default:
        query += ' ORDER BY mi.created_at DESC';
    }

    const items = db.prepare(query).all(...params);

    // Convert SQLite integers to booleans for the frontend
    const formatted = items.map((item) => ({
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
 * GET /api/menu/items/:id
 * Get a single menu item by ID
 */
const getMenuItemById = (req, res, next) => {
  try {
    const db = getDb();
    const item = db
      .prepare(
        `SELECT mi.*, c.name as category_name, c.slug as category_slug
       FROM menu_items mi
       JOIN categories c ON mi.category_id = c.id
       WHERE mi.id = ?`,
      )
      .get(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    res.json({
      success: true,
      data: { ...item, is_veg: item.is_veg === 1, in_stock: item.in_stock === 1 },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/menu/items (Admin only)
 * Create a new menu item
 */
const createMenuItem = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, description, price, category_id, image_url, is_veg, in_stock, rating, calories } = req.body;
    const db = getDb();

    // Verify category exists
    const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!cat) {
      return res.status(400).json({ success: false, message: 'Category not found.' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO menu_items (id, name, description, price, category_id, image_url, is_veg, in_stock, rating, calories)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      description || '',
      parseFloat(price),
      category_id,
      image_url || null,
      is_veg ? 1 : 0,
      in_stock !== false ? 1 : 0,
      parseFloat(rating) || 4.0,
      parseInt(calories) || 0,
    );

    const newItem = db.prepare(`
      SELECT mi.*, c.name as category_name, c.slug as category_slug
      FROM menu_items mi JOIN categories c ON mi.category_id = c.id
      WHERE mi.id = ?
    `).get(id);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully!',
      data: { ...newItem, is_veg: newItem.is_veg === 1, in_stock: newItem.in_stock === 1 },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/menu/items/:id (Admin only)
 * Update an existing menu item
 */
const updateMenuItem = (req, res, next) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const { name, description, price, category_id, image_url, is_veg, in_stock, rating, calories } = req.body;

    if (category_id) {
      const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
      if (!cat) {
        return res.status(400).json({ success: false, message: 'Category not found.' });
      }
    }

    db.prepare(`
      UPDATE menu_items
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          category_id = COALESCE(?, category_id),
          image_url = COALESCE(?, image_url),
          is_veg = CASE WHEN ? IS NOT NULL THEN ? ELSE is_veg END,
          in_stock = CASE WHEN ? IS NOT NULL THEN ? ELSE in_stock END,
          rating = COALESCE(?, rating),
          calories = COALESCE(?, calories)
      WHERE id = ?
    `).run(
      name?.trim() || null,
      description || null,
      price ? parseFloat(price) : null,
      category_id || null,
      image_url || null,
      is_veg !== undefined ? 1 : null,
      is_veg !== undefined ? (is_veg ? 1 : 0) : null,
      in_stock !== undefined ? 1 : null,
      in_stock !== undefined ? (in_stock ? 1 : 0) : null,
      rating ? parseFloat(rating) : null,
      calories ? parseInt(calories) : null,
      req.params.id,
    );

    const updated = db.prepare(`
      SELECT mi.*, c.name as category_name, c.slug as category_slug
      FROM menu_items mi JOIN categories c ON mi.category_id = c.id
      WHERE mi.id = ?
    `).get(req.params.id);

    res.json({
      success: true,
      message: 'Item updated!',
      data: { ...updated, is_veg: updated.is_veg === 1, in_stock: updated.in_stock === 1 },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/menu/items/:id/stock (Admin only)
 * Toggle item stock availability
 */
const toggleStock = (req, res, next) => {
  try {
    const db = getDb();
    const item = db.prepare('SELECT id, in_stock, name FROM menu_items WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const newStock = item.in_stock === 1 ? 0 : 1;
    db.prepare('UPDATE menu_items SET in_stock = ? WHERE id = ?').run(newStock, req.params.id);

    res.json({
      success: true,
      message: `${item.name} is now ${newStock ? 'In Stock' : 'Out of Stock'}.`,
      data: { id: item.id, in_stock: newStock === 1 },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/menu/items/:id (Admin only)
 * Delete a menu item
 */
const deleteMenuItem = (req, res, next) => {
  try {
    const db = getDb();
    const item = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/menu/featured
 * Get 6 featured/highly rated items for home page
 */
const getFeaturedItems = (req, res, next) => {
  try {
    const db = getDb();
    const items = db
      .prepare(
        `SELECT mi.*, c.name as category_name, c.slug as category_slug
       FROM menu_items mi
       JOIN categories c ON mi.category_id = c.id
       WHERE mi.in_stock = 1
       ORDER BY mi.rating DESC, mi.created_at DESC
       LIMIT 6`,
      )
      .all();

    const formatted = items.map((item) => ({
      ...item,
      is_veg: item.is_veg === 1,
      in_stock: item.in_stock === 1,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleStock,
  deleteMenuItem,
  getFeaturedItems,
};
