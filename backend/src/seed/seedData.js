// seed/seedData.js
// Seeds the database with categories, menu items, and default admin/customer accounts
require('dotenv').config();
const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const db = getDb();
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  db.exec(`
    DELETE FROM cart_items;
    DELETE FROM payments;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM menu_items;
    DELETE FROM categories;
    DELETE FROM users;
  `);
  console.log('🗑️  Cleared existing data');

  // =====================
  // Categories
  // =====================
  const categories = [
    { id: uuidv4(), name: 'Burgers', slug: 'burgers', icon: '🍔' },
    { id: uuidv4(), name: 'Pizzas', slug: 'pizzas', icon: '🍕' },
    { id: uuidv4(), name: 'Asian Bowls', slug: 'asian-bowls', icon: '🍜' },
    { id: uuidv4(), name: 'Bakery & Desserts', slug: 'bakery-desserts', icon: '🍰' },
    { id: uuidv4(), name: 'Drinks', slug: 'drinks', icon: '🥤' },
    { id: uuidv4(), name: 'Salads', slug: 'salads', icon: '🥗' },
  ];

  const insertCat = db.prepare('INSERT INTO categories (id, name, slug, icon) VALUES (?, ?, ?, ?)');
  categories.forEach((cat) => insertCat.run(cat.id, cat.name, cat.slug, cat.icon));
  console.log(`✅ Seeded ${categories.length} categories`);

  // Helper to find category ID by slug
  const catId = (slug) => categories.find((c) => c.slug === slug)?.id;

  // =====================
  // Menu Items
  // =====================
  const menuItems = [
    // Burgers
    {
      id: uuidv4(), name: 'Classic Smash Burger', description: 'Double smash patty with cheddar, caramelized onions, pickles, and our signature pink sauce on a brioche bun.', 
      price: 12.99, category_id: catId('burgers'), is_veg: 0, in_stock: 1, rating: 4.8, calories: 650,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Garden Bliss Burger', description: 'Crispy plant-based patty with avocado, tomato, mixed greens, and lemon aioli on a whole wheat bun.', 
      price: 11.99, category_id: catId('burgers'), is_veg: 1, in_stock: 1, rating: 4.6, calories: 480,
      image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'BBQ Bacon Stack', description: 'Triple stacked beef with crispy bacon, BBQ sauce, jalapeños, and melted gouda on a toasted sesame bun.', 
      price: 15.99, category_id: catId('burgers'), is_veg: 0, in_stock: 1, rating: 4.9, calories: 850,
      image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80',
    },
    // Pizzas
    {
      id: uuidv4(), name: 'Margherita Royale', description: 'San Marzano tomato base with fresh buffalo mozzarella, basil leaves, and a drizzle of extra virgin olive oil.', 
      price: 13.99, category_id: catId('pizzas'), is_veg: 1, in_stock: 1, rating: 4.7, calories: 580,
      image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Truffle Mushroom Pizza', description: 'Creamy truffle béchamel, mixed forest mushrooms, caramelized shallots, fontina cheese, and fresh thyme.', 
      price: 16.99, category_id: catId('pizzas'), is_veg: 1, in_stock: 1, rating: 4.8, calories: 640,
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Spicy Pepperoni Feast', description: 'Double pepperoni with mozzarella, red chili flakes, honey, and fresh basil on a crispy thin crust.', 
      price: 15.49, category_id: catId('pizzas'), is_veg: 0, in_stock: 1, rating: 4.9, calories: 720,
      image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
    },
    // Asian Bowls
    {
      id: uuidv4(), name: 'Thai Basil Chicken Bowl', description: 'Wok-tossed chicken with holy basil, snap peas, jasmine rice, and a savory oyster-fish sauce glaze.', 
      price: 13.49, category_id: catId('asian-bowls'), is_veg: 0, in_stock: 1, rating: 4.7, calories: 520,
      image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Miso Glazed Salmon Bowl', description: 'Pan-seared salmon with white miso glaze, edamame, pickled cucumber, avocado, and sushi rice.', 
      price: 17.99, category_id: catId('asian-bowls'), is_veg: 0, in_stock: 1, rating: 4.8, calories: 590,
      image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Buddha Veggie Bowl', description: 'Roasted chickpeas, quinoa, roasted sweet potato, kale, tahini dressing, and pomegranate seeds.', 
      price: 12.99, category_id: catId('asian-bowls'), is_veg: 1, in_stock: 1, rating: 4.6, calories: 460,
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
    },
    // Bakery & Desserts
    {
      id: uuidv4(), name: 'Strawberry Blush Cake', description: 'Three-layer vanilla sponge with fresh strawberry compote, whipped mascarpone frosting, and rose petals.', 
      price: 7.99, category_id: catId('bakery-desserts'), is_veg: 1, in_stock: 1, rating: 4.9, calories: 380,
      image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Dark Chocolate Lava Cake', description: 'Warm chocolate fondant with a molten Valrhona center, served with vanilla bean ice cream and berry coulis.', 
      price: 8.99, category_id: catId('bakery-desserts'), is_veg: 1, in_stock: 1, rating: 4.9, calories: 420,
      image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Cinnamon Roll Bun', description: 'Freshly baked pull-apart rolls with brown butter cinnamon swirl and cream cheese glaze. Served warm.', 
      price: 5.99, category_id: catId('bakery-desserts'), is_veg: 1, in_stock: 1, rating: 4.7, calories: 310,
      image_url: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=500&q=80',
    },
    // Drinks
    {
      id: uuidv4(), name: 'Rose Lychee Cooler', description: 'House-made rose syrup with fresh lychee juice, lime, mint, and sparkling water. Utterly refreshing.', 
      price: 4.99, category_id: catId('drinks'), is_veg: 1, in_stock: 1, rating: 4.8, calories: 120,
      image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Matcha Oat Latte', description: 'Ceremonial grade matcha with oat milk, a hint of vanilla, and honey. Served hot or iced.', 
      price: 5.49, category_id: catId('drinks'), is_veg: 1, in_stock: 1, rating: 4.7, calories: 150,
      image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Classic Strawberry Shake', description: 'Thick and creamy shake blended with fresh strawberries, vanilla ice cream, and a touch of rosewater.', 
      price: 6.49, category_id: catId('drinks'), is_veg: 1, in_stock: 1, rating: 4.9, calories: 350,
      image_url: 'https://images.unsplash.com/photo-1568901839119-631418a3910d?w=500&q=80',
    },
    // Salads
    {
      id: uuidv4(), name: 'Grilled Halloumi Salad', description: 'Pan-grilled halloumi with watermelon, arugula, cucumber ribbons, mint, and sumac dressing.', 
      price: 11.99, category_id: catId('salads'), is_veg: 1, in_stock: 1, rating: 4.6, calories: 320,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Caesar Supreme', description: 'Crisp romaine, house-made caesar dressing, parmesan shavings, anchovy fillets, and garlic croutons.', 
      price: 10.99, category_id: catId('salads'), is_veg: 0, in_stock: 1, rating: 4.7, calories: 380,
      image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80',
    },
    {
      id: uuidv4(), name: 'Quinoa Berry Detox Bowl', description: 'Tri-color quinoa with blueberries, pomegranate, avocado, walnuts, baby spinach and chia vinaigrette.', 
      price: 12.49, category_id: catId('salads'), is_veg: 1, in_stock: 1, rating: 4.5, calories: 290,
      image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80',
    },
  ];

  const insertItem = db.prepare(`
    INSERT INTO menu_items (id, name, description, price, category_id, image_url, is_veg, in_stock, rating, calories)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  menuItems.forEach((item) => {
    insertItem.run(
      item.id, item.name, item.description, item.price, item.category_id,
      item.image_url, item.is_veg, item.in_stock, item.rating, item.calories,
    );
  });
  console.log(`✅ Seeded ${menuItems.length} menu items`);

  // =====================
  // Users
  // =====================
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const customerPasswordHash = await bcrypt.hash('customer123', 12);

  const adminId = uuidv4();
  const customerId = uuidv4();

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, phone, address, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, 'Admin User', 'admin@blushbites.com', adminPasswordHash, '+1-555-0100', '123 Admin Lane, Foodville, CA 90001', 'admin');

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, phone, address, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(customerId, 'Jane Doe', 'jane@example.com', customerPasswordHash, '+1-555-0199', '456 Blossom Street, Pink City, CA 90210', 'customer');

  console.log(`✅ Seeded 2 users (1 admin, 1 customer)`);

  // =====================
  // Sample Orders (for dashboard stats)
  // =====================
  const sampleOrderItems = [
    { itemId: menuItems[0].id, name: menuItems[0].name, price: menuItems[0].price, quantity: 2 },
    { itemId: menuItems[3].id, name: menuItems[3].name, price: menuItems[3].price, quantity: 1 },
  ];

  const subtotal = sampleOrderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const deliveryFee = subtotal >= 30 ? 0 : 3.99;
  const totalAmount = parseFloat((subtotal + tax + deliveryFee).toFixed(2));
  const sampleOrderId = uuidv4();

  db.prepare(`
    INSERT INTO orders (id, user_id, subtotal, tax, delivery_fee, total_amount, status, delivery_address, payment_method, estimated_delivery)
    VALUES (?, ?, ?, ?, ?, ?, 'Delivered', '456 Blossom Street, Pink City, CA 90210', 'Card', datetime('now'))
  `).run(sampleOrderId, customerId, subtotal, tax, deliveryFee, totalAmount);

  sampleOrderItems.forEach((item) => {
    db.prepare('INSERT INTO order_items (id, order_id, item_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)')
      .run(uuidv4(), sampleOrderId, item.itemId, item.name, item.price, item.quantity);
  });

  db.prepare('INSERT INTO payments (id, order_id, method, status, transaction_id) VALUES (?, ?, ?, ?, ?)')
    .run(uuidv4(), sampleOrderId, 'Card', 'Success', `TXN_${Date.now()}`);

  console.log('✅ Seeded 1 sample order\n');

  console.log('🎉 Database seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Admin:    admin@blushbites.com / admin123');
  console.log('📧 Customer: jane@example.com    / customer123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
