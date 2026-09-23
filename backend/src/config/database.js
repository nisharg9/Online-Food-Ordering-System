// config/database.js
// SQLite database connection and schema initialization
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './database.sqlite';
const dbPath = path.resolve(process.cwd(), DB_PATH);

let db;

/**
 * Get the singleton database instance
 */
function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // WAL mode for better concurrency
    db.pragma('foreign_keys = ON'); // Enforce foreign key constraints
    initializeSchema();
  }
  return db;
}

/**
 * Initialize the database schema — creates all tables if they don't exist
 */
function initializeSchema() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT DEFAULT '🍽️'
    );

    -- Menu items table
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL CHECK(price >= 0),
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      image_url TEXT,
      is_veg INTEGER NOT NULL DEFAULT 0 CHECK(is_veg IN (0, 1)),
      in_stock INTEGER NOT NULL DEFAULT 1 CHECK(in_stock IN (0, 1)),
      rating REAL DEFAULT 4.0 CHECK(rating >= 0 AND rating <= 5),
      calories INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      delivery_fee REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Placed' CHECK(status IN ('Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
      delivery_address TEXT NOT NULL,
      delivery_notes TEXT,
      payment_method TEXT NOT NULL DEFAULT 'COD' CHECK(payment_method IN ('Card', 'UPI', 'COD')),
      estimated_delivery TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Order items table (individual line items of an order)
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0)
    );

    -- Payments table
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
      method TEXT NOT NULL CHECK(method IN ('Card', 'UPI', 'COD')),
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Success', 'Pending', 'Failed')),
      transaction_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Cart items table (server-side cart storage, synced on login)
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, item_id)
    );
  `);

  console.log('✅ Database schema initialized');
}

module.exports = { getDb };
