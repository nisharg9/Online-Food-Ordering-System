// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getCart, syncCart, clearCart } = require('../controllers/cartController');

router.get('/', authMiddleware, getCart);
router.post('/sync', authMiddleware, syncCart);
router.delete('/', authMiddleware, clearCart);

module.exports = router;
