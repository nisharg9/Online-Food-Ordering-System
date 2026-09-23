// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { createOrder, getUserOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');

// All order routes require authentication
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getUserOrders);
router.get('/:id', authMiddleware, getOrderById);

// Admin only
router.patch('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
