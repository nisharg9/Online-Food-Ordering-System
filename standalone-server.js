// standalone-server.js
// Zero-dependency local server for BlushBites food ordering system
// Runs instantly with native Node.js without requiring internet or npm install
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5173;

// Initial menu items
const INITIAL_MENU = [
  {
    id: "item-1",
    name: "Classic Smash Cheeseburger",
    description: "Double smashed Angus beef patty, melted cheddar, pickles, house pink sauce on a toasted brioche bun.",
    price: 11.99,
    category: "burgers",
    category_name: "Burgers",
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    is_veg: false,
    in_stock: true,
    rating: 4.8,
    calories: 680
  },
  {
    id: "item-2",
    name: "Truffle Mushroom Burger",
    description: "Grilled portobello mushroom, sautéed shiitake, Swiss cheese, truffle garlic aioli, arugula.",
    price: 13.99,
    category: "burgers",
    category_name: "Burgers",
    image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
    is_veg: true,
    in_stock: true,
    rating: 4.9,
    calories: 590
  },
  {
    id: "item-3",
    name: "Crispy Buttermilk Chicken Burger",
    description: "Crispy fried chicken breast, pickled slaw, honey mustard drizzle, brioche bun.",
    price: 12.49,
    category: "burgers",
    category_name: "Burgers",
    image_url: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80",
    is_veg: false,
    in_stock: true,
    rating: 4.7,
    calories: 720
  },
  {
    id: "item-4",
    name: "Blush Margherita Pizza",
    description: "San Marzano tomatoes, creamy buffalo mozzarella, fresh basil, extra virgin olive oil drizzle.",
    price: 14.99,
    category: "pizza",
    category_name: "Artisan Pizza",
    image_url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80",
    is_veg: true,
    in_stock: true,
    rating: 4.9,
    calories: 780
  },
  {
    id: "item-5",
    name: "Truffle Prosciutto Pizza",
    description: "White sauce base, fior di latte, aged prosciutto di Parma, wild arugula, white truffle oil.",
    price: 17.99,
    category: "pizza",
    category_name: "Artisan Pizza",
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    is_veg: false,
    in_stock: true,
    rating: 4.8,
    calories: 840
  },
  {
    id: "item-6",
    name: "Teriyaki Salmon Rice Bowl",
    description: "Pan-seared Atlantic salmon, glazed in house teriyaki sauce, jasmine rice, edamame, pickled ginger.",
    price: 16.49,
    category: "asian",
    category_name: "Asian Bowls",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
    is_veg: false,
    in_stock: true,
    rating: 4.8,
    calories: 620
  },
  {
    id: "item-7",
    name: "Korean Crispy Tofu Bowl",
    description: "Crispy gochujang glazed organic tofu, steamed brown rice, kimchi, cucumbers, toasted sesame seeds.",
    price: 13.99,
    category: "asian",
    category_name: "Asian Bowls",
    image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80",
    is_veg: true,
    in_stock: true,
    rating: 4.6,
    calories: 510
  },
  {
    id: "item-8",
    name: "Strawberry Rose Velvet Cake",
    description: "Layers of delicate pink sponge, fresh strawberries, rose water mascarpone frosting.",
    price: 7.99,
    category: "desserts",
    category_name: "Dreamy Desserts",
    image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
    is_veg: true,
    in_stock: true,
    rating: 5.0,
    calories: 420
  },
  {
    id: "item-9",
    name: "Warm Molten Lava Cake",
    description: "Rich Belgian chocolate cake with a warm flowing center, served with vanilla bean cream.",
    price: 8.49,
    category: "desserts",
    category_name: "Dreamy Desserts",
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
    is_veg: true,
    in_stock: true,
    rating: 4.9,
    calories: 520
  },
  {
    id: "item-10",
    name: "Pink Blossom Boba Tea",
    description: "Jasmine green tea with strawberry puree, oat milk, and chewy brown sugar boba pearls.",
    price: 5.99,
    category: "beverages",
    category_name: "Beverages",
    image_url: "https://images.unsplash.com/photo-1558857563-b37cf5a9d8f3?w=500&q=80",
    is_veg: true,
    in_stock: true,
    rating: 4.7,
    calories: 280
  }
];

const CATEGORIES = [
  { slug: "all", name: "All Dishes", icon: "🍽️" },
  { slug: "burgers", name: "Burgers", icon: "🍔" },
  { slug: "pizza", name: "Artisan Pizza", icon: "🍕" },
  { slug: "asian", name: "Asian Bowls", icon: "🍜" },
  { slug: "desserts", name: "Dreamy Desserts", icon: "🍰" },
  { slug: "beverages", name: "Beverages", icon: "🧋" }
];

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlushBites — Fresh Food, Fast Delivery</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #FFF5F7;
      --primary: #FF6B9D;
      --primary-hover: #E5578A;
      --accent: #FFC1CC;
      --text: #333333;
      --success: #A8D5BA;
      --error: #FF6B6B;
      --card-shadow: 0 4px 20px rgba(255, 107, 157, 0.12);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; }
    a, button { cursor: pointer; transition: all 0.2s ease; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    
    /* Header / Navbar */
    header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border-bottom: 1px solid #FFE4EB; position: sticky; top: 0; z-index: 50; }
    .nav-inner { display: flex; justify-content: space-between; align-items: center; height: 70px; }
    .logo { font-size: 22px; font-weight: 800; color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 8px; }
    .nav-links { display: flex; gap: 15px; align-items: center; }
    .nav-btn { background: none; border: none; font-size: 14px; font-weight: 600; color: #555; padding: 8px 14px; border-radius: 12px; }
    .nav-btn:hover, .nav-btn.active { color: var(--primary); background: #FFF0F4; }
    
    /* Primary buttons */
    .btn-primary { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 14px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3); display: inline-flex; align-items: center; gap: 6px; }
    .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
    .btn-outline { background: white; color: var(--primary); border: 2px solid var(--primary); padding: 8px 16px; border-radius: 14px; font-weight: 700; font-size: 13px; }
    .btn-outline:hover { background: #FFF0F4; }
    
    /* Badges */
    .badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 99px; }
    .badge-veg { background: #E8F7EE; color: #2E7D32; }
    .badge-nonveg { background: #FDECEA; color: #D32F2F; }
    .badge-stock { background: #E3F2FD; color: #1976D2; }
    
    /* Hero Banner */
    .hero { background: linear-gradient(135deg, #FF6B9D 0%, #FF9AB3 100%); color: white; padding: 50px 20px; border-radius: 28px; margin: 25px 0; text-align: center; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(255, 107, 157, 0.25); }
    .hero h1 { font-size: 38px; font-weight: 800; margin-bottom: 12px; }
    .hero p { font-size: 16px; opacity: 0.95; max-width: 550px; margin: 0 auto 25px; line-height: 1.5; }
    .search-box { display: flex; max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 6px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
    .search-box input { flex: 1; border: none; outline: none; padding: 10px 16px; font-size: 14px; color: #333; }
    
    /* Categories */
    .category-scroll { display: flex; gap: 12px; overflow-x: auto; padding: 10px 0 20px; scrollbar-width: none; }
    .cat-card { background: white; border: 2px solid #FFE4EB; border-radius: 18px; padding: 12px 20px; display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: #444; white-space: nowrap; }
    .cat-card:hover, .cat-card.active { border-color: var(--primary); background: #FFF0F4; color: var(--primary); }
    
    /* Cards Grid */
    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .card { background: white; border-radius: 20px; overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid #FFE4EB; display: flex; flex-direction: column; transition: all 0.25s ease; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(255, 107, 157, 0.2); }
    .card-img-wrap { position: relative; height: 180px; width: 100%; overflow: hidden; background: #FFE8EE; }
    .card-img { width: 100%; height: 100%; object-fit: cover; }
    .card-body { padding: 16px; display: flex; flex-direction: column; flex: 1; }
    .card-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; color: #222; }
    .card-desc { font-size: 12px; color: #777; margin-bottom: 15px; line-height: 1.5; flex: 1; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #FFF0F4; }
    .price-tag { font-size: 18px; font-weight: 800; color: var(--primary); }
    
    /* Toast Alert */
    #toast { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
    .toast-msg { background: white; padding: 14px 20px; border-radius: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); border-left: 5px solid var(--primary); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; animation: slideIn 0.3s forwards; pointer-events: auto; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-card { background: white; border-radius: 24px; width: 100%; max-width: 500px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; position: relative; }
    .modal-close { position: absolute; top: 18px; right: 18px; border: none; background: #FFF0F4; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; color: var(--primary); }
    
    /* Cart Drawer / View */
    .cart-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #FFE4EB; }
    .qty-btn { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #FFE4EB; background: white; font-weight: 700; color: var(--primary); }
    .qty-btn:hover { background: #FFF0F4; }
    
    /* Stepper */
    .stepper { display: flex; justify-content: space-between; position: relative; margin: 30px 0; }
    .stepper::before { content: ''; position: absolute; top: 16px; left: 15%; right: 15%; height: 3px; background: #FFE4EB; z-index: 1; }
    .step-item { position: relative; z-index: 2; text-align: center; }
    .step-icon { width: 36px; height: 36px; border-radius: 50%; background: white; border: 3px solid #FFE4EB; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-weight: bold; font-size: 13px; color: #888; }
    .step-item.active .step-icon { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 0 0 4px #FFE4EB; }
    .step-label { font-size: 11px; font-weight: 700; color: #555; }
    
    /* Table */
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #888; border-bottom: 2px solid #FFE4EB; }
    td { padding: 12px; font-size: 13px; border-bottom: 1px solid #FFF0F4; vertical-align: middle; }
    
    /* Responsive */
    @media (max-width: 600px) {
      .hero h1 { font-size: 28px; }
      .food-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- Toast Notification Center -->
  <div id="toast"></div>

  <!-- Header -->
  <header>
    <div class="container nav-inner">
      <a href="#" onclick="showPage('home')" class="logo">
        <span>🍔</span> BlushBites
      </a>
      <div class="nav-links">
        <button class="nav-btn active" id="nav-home" onclick="showPage('home')">Home</button>
        <button class="nav-btn" id="nav-menu" onclick="showPage('menu')">Menu</button>
        <button class="nav-btn" id="nav-orders" onclick="showPage('orders')">My Orders</button>
        <button class="nav-btn" id="nav-profile" onclick="showPage('profile')">Profile</button>
        <button class="nav-btn" id="nav-admin" onclick="showPage('admin')" style="color: var(--primary);">⚙️ Admin</button>
        <button class="btn-primary" onclick="showPage('cart')">
          🛒 Cart (<span id="cart-count">0</span>)
        </button>
      </div>
    </div>
  </header>

  <!-- Main View Container -->
  <main class="container" style="flex: 1; padding-bottom: 60px;">

    <!-- 1. HOME VIEW -->
    <div id="view-home">
      <div class="hero">
        <span class="badge" style="background: rgba(255,255,255,0.25); color: white; margin-bottom: 12px; display: inline-block;">🌸 Artisan Food Delivered in 30 Mins</span>
        <h1>Satisfy Your Sweet & Savory Cravings</h1>
        <p>Fresh handcrafted smash burgers, artisan pizza, authentic Asian bowls, and dreamy desserts.</p>
        <div class="search-box">
          <input type="text" id="home-search-input" placeholder="Search for burgers, pizza, desserts..." onkeyup="if(event.key==='Enter') executeHomeSearch()">
          <button class="btn-primary" onclick="executeHomeSearch()">Search</button>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin: 30px 0 15px;">
        <h2 style="font-size: 22px; font-weight: 800;">Browse by Category</h2>
        <button class="btn-outline" onclick="showPage('menu')">View All Dishes &rarr;</button>
      </div>
      <div class="category-scroll" id="home-categories"></div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin: 30px 0 15px;">
        <div>
          <h2 style="font-size: 22px; font-weight: 800;">✨ Chef's Top Picks</h2>
          <p style="font-size: 13px; color: #888;">Loved by over 10,000 foodies</p>
        </div>
      </div>
      <div class="food-grid" id="home-featured-grid"></div>
    </div>

    <!-- 2. MENU VIEW -->
    <div id="view-menu" style="display: none; padding-top: 25px;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">🍽️ Our Full Menu</h1>
      <p style="font-size: 14px; color: #777; margin-bottom: 20px;">Handcrafted dishes prepared fresh upon your order</p>

      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;">
        <div class="search-box" style="flex: 1; max-width: 400px; margin: 0;">
          <input type="text" id="menu-search-input" placeholder="Search menu..." oninput="renderMenu()">
        </div>
        <select id="menu-diet-filter" onchange="renderMenu()" style="padding: 10px 16px; border-radius: 14px; border: 1px solid #FFE4EB; font-weight: 600; outline: none;">
          <option value="all">🌱 All Diets</option>
          <option value="veg">🌱 Pure Veg Only</option>
          <option value="nonveg">🥩 Non-Veg Only</option>
        </select>
        <select id="menu-sort" onchange="renderMenu()" style="padding: 10px 16px; border-radius: 14px; border: 1px solid #FFE4EB; font-weight: 600; outline: none;">
          <option value="default">⭐ Top Rated</option>
          <option value="price_asc">💰 Price: Low to High</option>
          <option value="price_desc">💸 Price: High to Low</option>
        </select>
      </div>

      <div class="category-scroll" id="menu-categories" style="margin-bottom: 25px;"></div>
      <div class="food-grid" id="menu-grid"></div>
    </div>

    <!-- 3. CART VIEW -->
    <div id="view-cart" style="display: none; padding-top: 25px;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 20px;">🛒 Your Cart</h1>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;" id="cart-content-wrapper">
        <div style="background: white; border-radius: 20px; padding: 20px; border: 1px solid #FFE4EB;">
          <div id="cart-items-list"></div>
          <button class="btn-outline" style="margin-top: 15px; width: 100%;" onclick="showPage('menu')">+ Add More Items</button>
        </div>
        <div style="background: white; border-radius: 20px; padding: 22px; border: 1px solid #FFE4EB; height: fit-content;">
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">Order Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #666;">
            <span>Subtotal</span> <strong id="cart-subtotal">$0.00</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #666;">
            <span>Delivery Fee</span> <strong id="cart-delivery" style="color: #2E7D32;">FREE</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px; color: #666;">
            <span>Estimated Tax (8%)</span> <strong id="cart-tax">$0.00</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 14px; border-top: 2px dashed #FFE4EB; margin-bottom: 20px; font-size: 18px;">
            <strong>Total</strong> <strong id="cart-total" style="color: var(--primary); font-size: 22px;">$0.00</strong>
          </div>
          <button class="btn-primary" style="width: 100%; justify-content: center; padding: 14px;" onclick="goToCheckout()">Proceed to Checkout &rarr;</button>
        </div>
      </div>
      <div id="cart-empty-view" style="display: none; text-align: center; padding: 60px 20px; background: white; border-radius: 24px; border: 1px solid #FFE4EB;">
        <div style="font-size: 60px; margin-bottom: 15px;">🛒</div>
        <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">Your cart is empty!</h2>
        <p style="color: #777; margin-bottom: 20px;">Explore our delicious dishes and add some to your order.</p>
        <button class="btn-primary" onclick="showPage('menu')">Browse Menu</button>
      </div>
    </div>

    <!-- 4. CHECKOUT VIEW -->
    <div id="view-checkout" style="display: none; padding-top: 25px;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 20px;">🛍️ Order Checkout</h1>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
        <div style="background: white; border-radius: 20px; padding: 24px; border: 1px solid #FFE4EB;">
          <h3 style="font-size: 17px; font-weight: 800; margin-bottom: 12px;">1. Delivery Address</h3>
          <textarea id="checkout-address" rows="3" placeholder="Enter full delivery address with apartment & street..." style="width: 100%; border: 2px solid #FFE4EB; border-radius: 14px; padding: 12px; font-size: 14px; outline: none; margin-bottom: 15px;"></textarea>
          
          <h3 style="font-size: 17px; font-weight: 800; margin-bottom: 12px;">2. Payment Method</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <button class="cat-card active" id="pay-card" onclick="selectPayment('Card')">💳 Card</button>
            <button class="cat-card" id="pay-upi" onclick="selectPayment('UPI')">📱 UPI</button>
            <button class="cat-card" id="pay-cod" onclick="selectPayment('COD')">💵 COD</button>
          </div>
          <div id="payment-details-box" style="background: #FFF5F7; border: 1px solid #FFE4EB; border-radius: 14px; padding: 14px; font-size: 13px; color: #555;">
            🔒 Mock card checkout simulated. No real charges.
          </div>
        </div>
        <div style="background: white; border-radius: 20px; padding: 22px; border: 1px solid #FFE4EB; height: fit-content;">
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">Payable Amount</h3>
          <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: 800; color: var(--primary); margin-bottom: 20px;">
            <span>Total:</span> <span id="checkout-total-display">$0.00</span>
          </div>
          <button class="btn-primary" id="btn-place-order" style="width: 100%; justify-content: center; padding: 14px;" onclick="placeOrder()">Place Order & Pay</button>
        </div>
      </div>
    </div>

    <!-- 5. TRACKING VIEW -->
    <div id="view-tracking" style="display: none; padding-top: 25px;">
      <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 24px; padding: 30px; border: 1px solid #FFE4EB; box-shadow: var(--card-shadow);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #FFE4EB; padding-bottom: 15px; margin-bottom: 25px;">
          <div>
            <span class="badge" style="background: #FFF0F4; color: var(--primary);">Live Tracking</span>
            <h2 style="font-size: 22px; font-weight: 800; margin-top: 4px;" id="track-order-id">Order #12345</h2>
          </div>
          <span class="badge badge-stock" id="track-status-pill" style="font-size: 13px; padding: 6px 14px;">Preparing</span>
        </div>

        <div class="stepper">
          <div class="step-item" id="step-placed">
            <div class="step-icon">1</div>
            <div class="step-label">Placed</div>
          </div>
          <div class="step-item" id="step-preparing">
            <div class="step-icon">2</div>
            <div class="step-label">Preparing</div>
          </div>
          <div class="step-item" id="step-out">
            <div class="step-icon">3</div>
            <div class="step-label">Out for Delivery</div>
          </div>
          <div class="step-item" id="step-delivered">
            <div class="step-icon">4</div>
            <div class="step-label">Delivered</div>
          </div>
        </div>

        <div style="background: #FFF5F7; border-radius: 16px; padding: 16px; margin: 25px 0;">
          <p style="font-size: 13px; font-weight: 700; color: #444; margin-bottom: 4px;">🚚 Delivering To:</p>
          <p style="font-size: 13px; color: #666;" id="track-address">123 Street</p>
          <p style="font-size: 12px; color: var(--primary); font-weight: 700; margin-top: 6px;">⏱️ Estimated arrival: in 25-35 minutes</p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn-primary" style="flex: 1; justify-content: center;" onclick="advanceDemoStatus()">Advance Status (Demo)</button>
          <button class="btn-outline" onclick="showPage('orders')">View Orders History</button>
        </div>
      </div>
    </div>

    <!-- 6. ORDERS HISTORY VIEW -->
    <div id="view-orders" style="display: none; padding-top: 25px;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 20px;">📦 Past Orders</h1>
      <div id="orders-list-container" style="display: flex; flex-direction: column; gap: 16px;"></div>
    </div>

    <!-- 7. PROFILE VIEW -->
    <div id="view-profile" style="display: none; padding-top: 25px; max-width: 600px; margin: 0 auto;">
      <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 20px;">👤 Customer Profile</h1>
      <div style="background: white; border-radius: 20px; padding: 24px; border: 1px solid #FFE4EB;">
        <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Full Name</label>
        <input type="text" id="prof-name" value="Jane Doe" style="width: 100%; border: 2px solid #FFE4EB; border-radius: 12px; padding: 10px; margin-bottom: 15px;">

        <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Email Address</label>
        <input type="email" id="prof-email" value="jane@example.com" disabled style="width: 100%; border: 2px solid #EEE; background: #F9F9F9; border-radius: 12px; padding: 10px; margin-bottom: 15px; color: #888;">

        <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Phone Number</label>
        <input type="text" id="prof-phone" value="+1 (555) 234-5678" style="width: 100%; border: 2px solid #FFE4EB; border-radius: 12px; padding: 10px; margin-bottom: 15px;">

        <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">Default Delivery Address</label>
        <textarea id="prof-address" rows="3" style="width: 100%; border: 2px solid #FFE4EB; border-radius: 12px; padding: 10px; margin-bottom: 20px;">104 Blossom Heights, Cherry Lane, Downtown Apt 4B</textarea>

        <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="saveProfile()">Save Profile Details</button>
      </div>
    </div>

    <!-- 8. ADMIN DASHBOARD & MENU & ORDERS VIEW -->
    <div id="view-admin" style="display: none; padding-top: 25px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: 800;">⚙️ Admin Operations Dashboard</h1>
        <div style="display: flex; gap: 8px;">
          <button class="btn-outline" onclick="showAdminTab('stats')">Analytics</button>
          <button class="btn-outline" onclick="showAdminTab('menu')">Menu Items</button>
          <button class="btn-outline" onclick="showAdminTab('orders')">Live Orders</button>
        </div>
      </div>

      <!-- Admin Stats Tab -->
      <div id="admin-tab-stats">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 25px;">
          <div style="background: white; border-radius: 18px; padding: 20px; border-left: 5px solid var(--primary); border: 1px solid #FFE4EB;">
            <p style="font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase;">Today's Revenue</p>
            <h3 style="font-size: 26px; font-weight: 800; color: #222;" id="admin-today-rev">$284.50</h3>
          </div>
          <div style="background: white; border-radius: 18px; padding: 20px; border-left: 5px solid #FFA000; border: 1px solid #FFE4EB;">
            <p style="font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase;">Active Orders</p>
            <h3 style="font-size: 26px; font-weight: 800; color: #222;" id="admin-active-orders">3</h3>
          </div>
          <div style="background: white; border-radius: 18px; padding: 20px; border-left: 5px solid #4CAF50; border: 1px solid #FFE4EB;">
            <p style="font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase;">Total Dishes</p>
            <h3 style="font-size: 26px; font-weight: 800; color: #222;" id="admin-total-dishes">10</h3>
          </div>
        </div>
      </div>

      <!-- Admin Menu Tab -->
      <div id="admin-tab-menu" style="display: none; background: white; border-radius: 20px; padding: 20px; border: 1px solid #FFE4EB;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="font-size: 18px; font-weight: 800;">Menu Stock Control</h3>
          <button class="btn-primary" onclick="alert('Add dish modal ready! Click Stock toggle on any dish below.')">+ Add New Dish</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Dish Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Status</th>
              <th>Toggle Availability</th>
            </tr>
          </thead>
          <tbody id="admin-menu-tbody"></tbody>
        </table>
      </div>

      <!-- Admin Orders Tab -->
      <div id="admin-tab-orders" style="display: none; background: white; border-radius: 20px; padding: 20px; border: 1px solid #FFE4EB;">
        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 15px;">Manage Incoming Orders</h3>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Current Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody id="admin-orders-tbody"></tbody>
        </table>
      </div>
    </div>

  </main>

  <!-- Dish Details Modal -->
  <div id="modal-dish" class="modal-overlay" style="display: none;">
    <div class="modal-card">
      <button class="modal-close" onclick="closeDishModal()">&times;</button>
      <img id="modal-img" src="" style="width: 100%; height: 220px; object-fit: cover; border-radius: 16px; margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h2 id="modal-title" style="font-size: 20px; font-weight: 800;"></h2>
        <span class="price-tag" id="modal-price"></span>
      </div>
      <p id="modal-desc" style="font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 20px;"></p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="qty-btn" onclick="adjustModalQty(-1)">&minus;</button>
          <strong id="modal-qty" style="font-size: 16px;">1</strong>
          <button class="qty-btn" onclick="adjustModalQty(1)">&plus;</button>
        </div>
        <button class="btn-primary" id="modal-add-btn" onclick="addModalItemToCart()">Add to Cart</button>
      </div>
    </div>
  </div>

  <footer style="background: white; border-top: 1px solid #FFE4EB; padding: 30px 0; text-align: center; font-size: 13px; color: #888;">
    <div class="container">
      <p style="font-weight: 700; color: var(--primary); font-size: 16px; margin-bottom: 6px;">🍔 BlushBites Online Food Ordering System</p>
      <p>Soft & Appetizing Pink & Cream Aesthetic • Built with Node.js & React</p>
    </div>
  </footer>

  <script>
    // State
    let menuItems = JSON.parse(localStorage.getItem('bb_menu') || JSON.stringify(${JSON.stringify(INITIAL_MENU)}));
    let cart = JSON.parse(localStorage.getItem('bb_cart') || '[]');
    let orders = JSON.parse(localStorage.getItem('bb_orders') || '[]');
    let activeCategory = 'all';
    let currentModalItem = null;
    let modalQuantity = 1;
    let currentTrackingOrder = null;
    let selectedPaymentMethod = 'Card';

    // Toast helper
    function toast(msg) {
      const container = document.getElementById('toast');
      const el = document.createElement('div');
      el.className = 'toast-msg';
      el.innerHTML = '<span>🌸</span> ' + msg;
      container.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }

    // View Navigation
    function showPage(pageId) {
      ['home', 'menu', 'cart', 'checkout', 'tracking', 'orders', 'profile', 'admin'].forEach(p => {
        const view = document.getElementById('view-' + p);
        if (view) view.style.display = (p === pageId) ? 'block' : 'none';
        const nav = document.getElementById('nav-' + p);
        if (nav) nav.classList.toggle('active', p === pageId);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (pageId === 'cart') renderCart();
      if (pageId === 'orders') renderOrders();
      if (pageId === 'menu') renderMenu();
      if (pageId === 'admin') renderAdmin();
    }

    // Render Categories
    function renderCategories() {
      const cats = ${JSON.stringify(CATEGORIES)};
      ['home-categories', 'menu-categories'].forEach(id => {
        const wrap = document.getElementById(id);
        if (!wrap) return;
        wrap.innerHTML = cats.map(c => 
          \`<button class="cat-card \${activeCategory === c.slug ? 'active' : ''}" onclick="setCategory('\${c.slug}')">
            <span>\${c.icon}</span> \${c.name}
          </button>\`
        ).join('');
      });
    }

    function setCategory(slug) {
      activeCategory = slug;
      renderCategories();
      renderMenu();
      if (document.getElementById('view-home').style.display !== 'none') {
        showPage('menu');
      }
    }

    function executeHomeSearch() {
      const q = document.getElementById('home-search-input').value.trim();
      document.getElementById('menu-search-input').value = q;
      showPage('menu');
      renderMenu();
    }

    // Render Food Card HTML
    function getFoodCardHtml(item) {
      return \`
        <div class="card" onclick="openDishModal('\${item.id}')">
          <div class="card-img-wrap">
            <img src="\${item.image_url}" class="card-img" alt="\${item.name}" onerror="this.src='https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500&q=80'">
            <div style="position: absolute; top: 10px; left: 10px; display: flex; gap: 6px;">
              <span class="badge \${item.is_veg ? 'badge-veg' : 'badge-nonveg'}">\${item.is_veg ? '🌱 Veg' : '🥩 Non-Veg'}</span>
              \${!item.in_stock ? '<span class="badge" style="background:#333;color:white;">Out of Stock</span>' : ''}
            </div>
            <div style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700;">
              ⭐ \${item.rating}
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">\${item.name}</h3>
            <p class="card-desc">\${item.description}</p>
            <div class="card-footer">
              <span class="price-tag">$\${item.price.toFixed(2)}</span>
              <button class="btn-primary" style="padding: 6px 14px; font-size: 12px;" onclick="event.stopPropagation(); quickAdd('\${item.id}')" \${!item.in_stock ? 'disabled style="opacity:0.5"' : ''}>
                + Add
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    // Render Home Top Picks
    function renderHome() {
      const featured = menuItems.slice(0, 6);
      document.getElementById('home-featured-grid').innerHTML = featured.map(getFoodCardHtml).join('');
    }

    // Render Menu Items
    function renderMenu() {
      const search = (document.getElementById('menu-search-input')?.value || '').toLowerCase();
      const diet = document.getElementById('menu-diet-filter')?.value || 'all';
      const sort = document.getElementById('menu-sort')?.value || 'default';

      let list = menuItems.filter(item => {
        const matchCat = activeCategory === 'all' || item.category === activeCategory;
        const matchSearch = item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
        const matchDiet = (diet === 'all') || (diet === 'veg' && item.is_veg) || (diet === 'nonveg' && !item.is_veg);
        return matchCat && matchSearch && matchDiet;
      });

      if (sort === 'price_asc') list.sort((a,b) => a.price - b.price);
      if (sort === 'price_desc') list.sort((a,b) => b.price - a.price);

      const grid = document.getElementById('menu-grid');
      if (list.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">No dishes found matching your filter criteria.</div>';
      } else {
        grid.innerHTML = list.map(getFoodCardHtml).join('');
      }
    }

    // Dish Modal
    function openDishModal(id) {
      currentModalItem = menuItems.find(i => i.id === id);
      if (!currentModalItem) return;
      modalQuantity = 1;
      document.getElementById('modal-img').src = currentModalItem.image_url;
      document.getElementById('modal-title').innerText = currentModalItem.name;
      document.getElementById('modal-price').innerText = '$' + currentModalItem.price.toFixed(2);
      document.getElementById('modal-desc').innerText = currentModalItem.description;
      document.getElementById('modal-qty').innerText = '1';
      document.getElementById('modal-dish').style.display = 'flex';
    }

    function closeDishModal() {
      document.getElementById('modal-dish').style.display = 'none';
    }

    function adjustModalQty(delta) {
      modalQuantity = Math.max(1, modalQuantity + delta);
      document.getElementById('modal-qty').innerText = modalQuantity;
    }

    function addModalItemToCart() {
      if (currentModalItem) {
        addToCart(currentModalItem, modalQuantity);
        closeDishModal();
      }
    }

    function quickAdd(id) {
      const item = menuItems.find(i => i.id === id);
      if (item) addToCart(item, 1);
    }

    // Cart logic
    function addToCart(item, qty) {
      if (!item.in_stock) {
        toast('Sorry, ' + item.name + ' is currently out of stock.');
        return;
      }
      const existing = cart.find(i => i.id === item.id);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({ ...item, qty });
      }
      saveCart();
      toast(item.name + ' added to cart! 🛒');
    }

    function updateCartQty(id, delta) {
      const item = cart.find(i => i.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
      saveCart();
      renderCart();
    }

    function saveCart() {
      localStorage.setItem('bb_cart', JSON.stringify(cart));
      const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
      document.getElementById('cart-count').innerText = totalCount;
    }

    function renderCart() {
      const wrapper = document.getElementById('cart-content-wrapper');
      const emptyView = document.getElementById('cart-empty-view');
      const list = document.getElementById('cart-items-list');

      if (cart.length === 0) {
        wrapper.style.display = 'none';
        emptyView.style.display = 'block';
        return;
      }

      wrapper.style.display = 'grid';
      emptyView.style.display = 'none';

      list.innerHTML = cart.map(item => \`
        <div class="cart-item">
          <img src="\${item.image_url}" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;">
          <div style="flex: 1;">
            <p style="font-weight: 700; font-size: 14px;">\${item.name}</p>
            <p style="font-size: 12px; color: #777;">$\${item.price.toFixed(2)} each</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="qty-btn" onclick="updateCartQty('\${item.id}', -1)">&minus;</button>
            <strong style="font-size: 14px;">\${item.qty}</strong>
            <button class="qty-btn" onclick="updateCartQty('\${item.id}', 1)">&plus;</button>
          </div>
          <span style="font-weight: 800; font-size: 15px; color: var(--primary); min-width: 65px; text-align: right;">
            $\${(item.price * item.qty).toFixed(2)}
          </span>
        </div>
      \`).join('');

      const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      const delivery = subtotal >= 30 ? 0 : 3.99;
      const tax = subtotal * 0.08;
      const total = subtotal + delivery + tax;

      document.getElementById('cart-subtotal').innerText = '$' + subtotal.toFixed(2);
      document.getElementById('cart-delivery').innerText = delivery === 0 ? 'FREE 🎉' : '$' + delivery.toFixed(2);
      document.getElementById('cart-tax').innerText = '$' + tax.toFixed(2);
      document.getElementById('cart-total').innerText = '$' + total.toFixed(2);
    }

    // Checkout
    function goToCheckout() {
      if (cart.length === 0) return;
      const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      const delivery = subtotal >= 30 ? 0 : 3.99;
      const tax = subtotal * 0.08;
      const total = subtotal + delivery + tax;

      document.getElementById('checkout-total-display').innerText = '$' + total.toFixed(2);
      const savedAddr = localStorage.getItem('bb_address') || '104 Blossom Heights, Cherry Lane, Downtown Apt 4B';
      document.getElementById('checkout-address').value = savedAddr;
      showPage('checkout');
    }

    function selectPayment(method) {
      selectedPaymentMethod = method;
      ['Card', 'UPI', 'COD'].forEach(m => {
        document.getElementById('pay-' + m.toLowerCase()).classList.toggle('active', m === method);
      });
      document.getElementById('payment-details-box').innerHTML = 
        method === 'Card' ? '🔒 Card mock verified. Instant confirmation.' :
        method === 'UPI' ? '📱 UPI simulation ready.' :
        '💵 Cash on Delivery verified. Pay on arrival.';
    }

    function placeOrder() {
      const address = document.getElementById('checkout-address').value.trim();
      if (!address) {
        toast('Please enter your delivery address.');
        return;
      }

      // Check real-time stock
      for (const item of cart) {
        const found = menuItems.find(m => m.id === item.id);
        if (found && !found.in_stock) {
          toast('Sorry, ' + found.name + ' went out of stock! Please remove it from cart.');
          showPage('cart');
          return;
        }
      }

      const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      const total = subtotal + (subtotal >= 30 ? 0 : 3.99) + (subtotal * 0.08);

      const newOrder = {
        id: 'BB-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        items: [...cart],
        total: total,
        address: address,
        status: 'Placed'
      };

      orders.unshift(newOrder);
      localStorage.setItem('bb_orders', JSON.stringify(orders));
      localStorage.setItem('bb_address', address);

      cart = [];
      saveCart();

      toast('Order #' + newOrder.id + ' confirmed! 🎉');
      openTracking(newOrder);
    }

    // Tracking
    function openTracking(order) {
      currentTrackingOrder = order;
      document.getElementById('track-order-id').innerText = 'Order #' + order.id;
      document.getElementById('track-status-pill').innerText = order.status;
      document.getElementById('track-address').innerText = order.address;

      updateStepper(order.status);
      showPage('tracking');
    }

    function updateStepper(status) {
      const steps = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
      const currentIdx = steps.indexOf(status);

      ['placed', 'preparing', 'out', 'delivered'].forEach((id, idx) => {
        const el = document.getElementById('step-' + id);
        if (el) el.classList.toggle('active', idx <= currentIdx);
      });
      document.getElementById('track-status-pill').innerText = status;
    }

    function advanceDemoStatus() {
      if (!currentTrackingOrder) return;
      const steps = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
      const nextIdx = (steps.indexOf(currentTrackingOrder.status) + 1) % steps.length;
      currentTrackingOrder.status = steps[nextIdx];

      // Update in orders
      const o = orders.find(i => i.id === currentTrackingOrder.id);
      if (o) o.status = currentTrackingOrder.status;
      localStorage.setItem('bb_orders', JSON.stringify(orders));

      updateStepper(currentTrackingOrder.status);
      toast('Status updated to ' + currentTrackingOrder.status + ' 🚀');
    }

    // Orders History
    function renderOrders() {
      const container = document.getElementById('orders-list-container');
      if (orders.length === 0) {
        container.innerHTML = '<div style="background:white;padding:40px;border-radius:20px;text-align:center;color:#888;">No past orders yet. Make your first order!</div>';
        return;
      }
      container.innerHTML = orders.map(o => \`
        <div style="background:white; border-radius:18px; padding:18px; border:1px solid #FFE4EB; box-shadow:var(--card-shadow); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <strong style="font-size:15px; color:var(--primary);">#\${o.id}</strong>
              <span class="badge badge-stock">\${o.status}</span>
            </div>
            <p style="font-size:12px; color:#888; margin-top:4px;">\${o.date} • \${o.items.length} items</p>
            <p style="font-size:12px; color:#444; margin-top:2px;">\${o.items.map(i => i.qty + 'x ' + i.name).join(', ').slice(0, 60)}...</p>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <strong style="font-size:18px; color:var(--primary);">$\${o.total.toFixed(2)}</strong>
            <button class="btn-primary" style="padding:6px 14px; font-size:12px;" onclick='openTracking(\${JSON.stringify(o)})'>Track</button>
            <button class="btn-outline" style="padding:6px 14px; font-size:12px;" onclick='reorder(\${JSON.stringify(o)})'>Re-order</button>
          </div>
        </div>
      \`).join('');
    }

    function reorder(order) {
      order.items.forEach(i => {
        const found = menuItems.find(m => m.id === i.id);
        if (found) addToCart(found, i.qty);
      });
      showPage('cart');
    }

    // Profile
    function saveProfile() {
      const name = document.getElementById('prof-name').value;
      const address = document.getElementById('prof-address').value;
      localStorage.setItem('bb_address', address);
      toast('Profile details updated successfully! ✨');
    }

    // Admin
    function showAdminTab(tab) {
      ['stats', 'menu', 'orders'].forEach(t => {
        document.getElementById('admin-tab-' + t).style.display = (t === tab) ? 'block' : 'none';
      });
      renderAdmin();
    }

    function renderAdmin() {
      // Menu list
      document.getElementById('admin-menu-tbody').innerHTML = menuItems.map(item => \`
        <tr>
          <td><strong>\${item.name}</strong></td>
          <td>\${item.category_name}</td>
          <td>$\${item.price.toFixed(2)}</td>
          <td>
            <span class="badge \${item.in_stock ? 'badge-veg' : 'badge-nonveg'}">
              \${item.in_stock ? 'In Stock 🟢' : 'Out of Stock 🔴'}
            </span>
          </td>
          <td>
            <button class="btn-outline" style="padding:4px 10px; font-size:11px;" onclick="toggleAdminStock('\${item.id}')">
              Toggle Stock
            </button>
          </td>
        </tr>
      \`).join('');

      // Orders list
      document.getElementById('admin-orders-tbody').innerHTML = orders.map(o => \`
        <tr>
          <td><strong>#\${o.id}</strong></td>
          <td>Jane Doe</td>
          <td><strong>$\${o.total.toFixed(2)}</strong></td>
          <td><span class="badge badge-stock">\${o.status}</span></td>
          <td>
            <select onchange="updateOrderStatusAdmin('\${o.id}', this.value)" style="padding:4px 8px; border-radius:8px; border:1px solid #FFE4EB; font-size:12px;">
              \${['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => \`
                <option value="\${s}" \${s === o.status ? 'selected' : ''}>\${s}</option>
              \`).join('')}
            </select>
          </td>
        </tr>
      \`).join('');

      document.getElementById('admin-active-orders').innerText = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
      document.getElementById('admin-total-dishes').innerText = menuItems.length;
    }

    function toggleAdminStock(id) {
      const item = menuItems.find(i => i.id === id);
      if (item) {
        item.in_stock = !item.in_stock;
        localStorage.setItem('bb_menu', JSON.stringify(menuItems));
        renderAdmin();
        renderMenu();
        renderHome();
        toast(item.name + ' is now ' + (item.in_stock ? 'In Stock 🟢' : 'Out of Stock 🔴'));
      }
    }

    function updateOrderStatusAdmin(orderId, newStatus) {
      const o = orders.find(i => i.id === orderId);
      if (o) {
        o.status = newStatus;
        localStorage.setItem('bb_orders', JSON.stringify(orders));
        renderAdmin();
        toast('Order #' + orderId + ' status set to ' + newStatus);
      }
    }

    // Init on load
    window.onload = function() {
      saveCart();
      renderCategories();
      renderHome();
      renderMenu();
    };
  </script>
</body>
</html>`;

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health API
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'BlushBites API is running!', timestamp: new Date().toISOString() }));
    return;
  }

  // Categories API
  if (req.url === '/api/menu/categories') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: CATEGORIES }));
    return;
  }

  // Menu items API
  if (req.url.startsWith('/api/menu/items')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: INITIAL_MENU }));
    return;
  }

  // Default: serve the complete BlushBites application
  res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
  res.end(HTML_CONTENT);
});

server.listen(PORT, () => {
  console.log('\n======================================================');
  console.log('  🌸 BlushBites Food Ordering System is RUNNING!');
  console.log('  👉 Open in your browser: http://localhost:' + PORT);
  console.log('======================================================\n');
});
