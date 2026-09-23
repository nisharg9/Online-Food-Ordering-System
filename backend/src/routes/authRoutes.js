// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Signup validation rules
const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number.'),
];

// Login validation rules
const loginRules = [
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const profileUpdateRules = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number.'),
];

router.post('/signup', signupRules, signup);
router.post('/login', loginRules, login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, profileUpdateRules, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
