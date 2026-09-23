// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getDashboardStats, getAllOrders } = require('../controllers/adminController');

router.use(authMiddleware, adminMiddleware); // All admin routes require auth + admin role

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);

module.exports = router;
