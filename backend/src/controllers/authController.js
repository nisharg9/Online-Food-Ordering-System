// controllers/authController.js
// Handles signup, login, get current user, and profile updates
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { getDb } = require('../config/database');

/**
 * Generate a signed JWT token for a user
 */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * POST /api/auth/signup
 * Register a new customer account
 */
const signup = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password, phone, address } = req.body;
    const db = getDb();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash the password with bcrypt (12 salt rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    const id = uuidv4();
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, phone, address, role)
      VALUES (?, ?, ?, ?, ?, ?, 'customer')
    `).run(id, name.trim(), email.toLowerCase().trim(), passwordHash, phone || null, address || null);

    const token = signToken(id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to BlushBites 🎉',
      token,
      user: { id, name: name.trim(), email: email.toLowerCase(), phone, address, role: 'customer' },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return JWT token
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user.id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! 🍕`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile
 */
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/profile
 * Update authenticated user's profile (name, phone, address)
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, phone, address } = req.body;
    const db = getDb();

    db.prepare(`
      UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?
    `).run(
      name ? name.trim() : req.user.name,
      phone || req.user.phone,
      address || req.user.address,
      req.user.id,
    );

    const updated = db.prepare('SELECT id, name, email, phone, address, role FROM users WHERE id = ?').get(req.user.id);

    res.json({ success: true, message: 'Profile updated successfully!', user: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/change-password
 * Change user's password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Current password required and new password must be at least 6 characters.',
      });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe, updateProfile, changePassword };
