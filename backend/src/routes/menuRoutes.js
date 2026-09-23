// routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getCategories,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleStock,
  deleteMenuItem,
  getFeaturedItems,
} = require('../controllers/menuController');

const menuItemRules = [
  body('name').trim().notEmpty().withMessage('Item name is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('category_id').notEmpty().withMessage('Category is required.'),
];

// Public routes
router.get('/categories', getCategories);
router.get('/featured', getFeaturedItems);
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItemById);

// Admin-only routes
router.post('/items', authMiddleware, adminMiddleware, menuItemRules, createMenuItem);
router.put('/items/:id', authMiddleware, adminMiddleware, updateMenuItem);
router.patch('/items/:id/stock', authMiddleware, adminMiddleware, toggleStock);
router.delete('/items/:id', authMiddleware, adminMiddleware, deleteMenuItem);

module.exports = router;
