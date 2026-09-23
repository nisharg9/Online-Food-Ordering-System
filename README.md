# 🌸 BlushBites — Online Food Ordering System

> A full-stack, production-quality Online Food Ordering System designed with an appetizing, soft "pink & cream" aesthetic (`#FFF5F7` background, `#FF6B9D` primary accents, `#333333` typography, and rounded glassmorphism cards).

Built with **React.js + Tailwind CSS** on the frontend, **Node.js + Express.js** on the backend, and **SQLite (better-sqlite3)** for ultra-fast, zero-configuration local database persistence.

---

## 🌟 Key Highlights & Glitch-Free Architecture

- **Appetizing Theme**: Curated soft blush palette with warm pink tones, micro-animations, loading skeletons, and rounded components (16px border-radius).
- **Zero Blank Screens**: Empty states with friendly illustrations for empty cart, empty orders, no search results, and 404 pages.
- **Loading Spinners Everywhere**: Every button and submission displays an immediate spinner and disables itself to prevent duplicate orders or double clicks.
- **Real-time Stock Guarding**: Before creating an order, the server verifies item availability inside a database transaction. If an item went out of stock while in the user's cart, the checkout halts and informs the user.
- **Cart Persistence & Sync**: Cart persists in `localStorage` across page reloads and automatically syncs with the server when the user logs in.
- **Toast Notifications**: Every user interaction (add to cart, update quantity, login, order placed, stock toggle, status update) produces a feedback snackbar.
- **Role-Based Access Control (RBAC)**: Protected routes for logged-in customers and strict admin guards for dashboard, menu editor, and live orders.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Lucide Icons, React Router v6 |
| **State Management** | React Context API (`AuthContext`, `CartContext`, `ToastContext`) |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite via `better-sqlite3` (WAL mode enabled) |
| **Authentication** | JWT (JSON Web Tokens) + `bcryptjs` password hashing |
| **Validation** | Express-Validator (backend) + interactive client-side checks |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v8 or higher)

---

### Step 1: Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd ../frontend
npm install
```

---

### Step 2: Configure Environment Variables

The backend already includes a pre-configured `.env` file:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=blushbites_super_secret_jwt_key_2024_secure
JWT_EXPIRES_IN=7d
DB_PATH=./database.sqlite
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Seed the Database

Populate initial categories (Burgers, Pizza, Asian Bowls, Desserts, Beverages), 14 signature dishes, and default test accounts:

```bash
cd backend
npm run seed
```

Output:
```
🌱 Seeding database...
✅ Database schema initialized
✅ Seeded 5 categories
✅ Seeded 14 menu items
✅ Seeded admin user: admin@blushbites.com
✅ Seeded customer user: jane@example.com
🎉 Database seeded successfully!
```

---

### Step 4: Run the Application

#### Start the Backend API (Port 5000):
```bash
cd backend
npm run dev
# or: npm start
```

#### Start the Frontend Client (Port 5173):
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🔑 Demo Accounts

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Admin** | `admin@blushbites.com` | `admin123` | Full access to Admin Dashboard, Menu Editor, and Order Management |
| **Customer** | `jane@example.com` | `customer123` | Browsing, Cart, Checkout, Order Tracking, Profile |
| **New User** | *Any email via Sign Up* | *Min 6 chars* | Instant registration and checkout |

---

## 🗺️ Complete Page Flow & Architecture

1. **Home Page (`/`)**:
   - Hero banner with appetizing call-to-action & direct search bar.
   - Category chip scroller.
   - Chef's top-rated picks with quick "+ Add" buttons.
2. **Menu Page (`/menu`)**:
   - Real-time search with debouncing.
   - Category filtering & dietary toggles (🌱 Pure Veg vs 🥩 Non-Veg).
   - Sorting by Price (Low/High) and Customer Rating.
3. **Item Details Modal**:
   - Detailed dish photo, dietary tags, calorie counts, customer ratings.
   - Quantity selector with stock availability check.
4. **Cart Page (`/cart`)**:
   - Itemized list with increment/decrement/remove controls.
   - Free delivery progress meter ($30 threshold).
   - Real-time tax (8%) and subtotal calculations.
5. **Login / Signup Page (`/auth`)**:
   - Tabbed interface with client + server-side validation.
   - Remembers previous destination and redirects seamlessly to `/checkout`.
6. **Checkout Page (`/checkout`)**:
   - Delivery address input with validation.
   - Delivery notes / instructions.
   - Mock payment methods: Credit/Debit Card, UPI ID, or Cash on Delivery.
   - Real-time stock validation check with immediate button disabling to prevent duplicate orders.
7. **Order Confirmation Page (`/order-confirmation/:id`)**:
   - Order receipt, ETA calculation, celebratory confetti aesthetic.
   - Direct button to Live Order Tracking.
8. **Order Tracking Page (`/track/:id`)**:
   - 4-stage visual stepper: `Placed` → `Preparing` → `Out for Delivery` → `Delivered`.
   - Auto-polling every 12 seconds to reflect status changes in real-time.
9. **Order History Page (`/orders`)**:
   - Chronological list of past customer orders.
   - Live status badges.
   - One-click **"Re-order"** button that re-populates the cart.
10. **Profile Page (`/profile`)**:
    - Update name, phone number, and default delivery address.
    - Change password securely with bcrypt verification.
11. **Admin Dashboard (`/admin`)**:
    - Today's orders, today's revenue, lifetime sales, active orders, and average order value.
    - 7-day revenue trend bar chart.
    - Top 5 best-selling menu items.
12. **Admin Menu Management (`/admin/menu`)**:
    - Complete catalog table with search & category filters.
    - Real-time **"In Stock / Out of Stock"** toggle switch.
    - Add new dish modal & Edit dish modal with image URL, price, and dietary tags.
    - Delete dish with safe confirmation.
13. **Admin Order Management (`/admin/orders`)**:
    - Live order list filterable by status (`Placed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`).
    - Quick status change dropdown with instantaneous server updates.
    - Inspect order modal displaying customer contact info and delivery notes.

---

## 🧪 Automated Testing

An automated integration test suite verifies the end-to-end flow:

```bash
cd backend
npm test
```

### Test Suite Covers:
- `GET /api/health`
- `GET /api/menu/categories` & `GET /api/menu/items`
- `POST /api/auth/login` (Admin & Customer)
- `POST /api/auth/signup`
- `POST /api/cart/sync`
- `POST /api/orders` (Stock validation & order creation)
- Rejection of out-of-stock items
- `GET /api/orders` (Customer order history)
- `PATCH /api/orders/:id/status` (Admin status updates)
- Customer status reflection in `/api/orders/:id`
- Admin route guarding (403 Forbidden for regular users)
- `GET /api/admin/dashboard` analytics validation

---

## 📁 Repository Directory Structure

```
food-ordering-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # SQLite connection & schema initialization
│   │   ├── controllers/
│   │   │   ├── adminController.js   # Dashboard analytics & admin order views
│   │   │   ├── authController.js    # JWT signup, login, profile updates
│   │   │   ├── cartController.js    # Server-side cart persistence & sync
│   │   │   ├── menuController.js    # Item CRUD, category list, stock toggle
│   │   │   └── orderController.js   # Order placement with stock checks & tracking
│   │   ├── middleware/
│   │   │   ├── adminMiddleware.js   # Admin role verification guard
│   │   │   ├── authMiddleware.js    # JWT token verification
│   │   │   └── errorHandler.js      # Centralized error handler
│   │   ├── routes/                  # Express route declarations
│   │   ├── seed/
│   │   │   └── seedData.js          # Database seeder with sample menu & users
│   │   └── server.js                # App entry point & middleware wiring
│   ├── tests/
│   │   └── api.test.js              # Integration test suite
│   ├── database.sqlite              # SQLite database file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmptyState.jsx       # Friendly illustrations for empty states
│   │   │   ├── Footer.jsx           # App footer with links & newsletter
│   │   │   ├── ItemModal.jsx        # Dish detail modal with quantity selector
│   │   │   ├── LoadingSpinner.jsx   # Button & full-page spinners
│   │   │   ├── Navbar.jsx           # Brand header with cart badge & user menu
│   │   │   ├── ProtectedRoute.jsx   # Customer & Admin route guards
│   │   │   └── SkeletonCard.jsx     # Loading shimmer skeletons
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # JWT & user state management
│   │   │   ├── CartContext.jsx      # Cart items, totals, local storage sync
│   │   │   └── ToastContext.jsx     # Global toast notifications
│   │   ├── pages/                   # All 13 core pages
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AdminMenuPage.jsx
│   │   │   ├── AdminOrdersPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── MenuPage.jsx
│   │   │   ├── OrderConfirmationPage.jsx
│   │   │   ├── OrderHistoryPage.jsx
│   │   │   ├── OrderTrackingPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with JWT interceptor
│   │   ├── App.jsx                  # Route definitions
│   │   ├── index.css                # BlushBites design tokens & custom animations
│   │   └── main.jsx                 # React root mount
│   ├── tailwind.config.js           # Custom pink & cream theme extensions
│   ├── vite.config.js
│   └── package.json
└── README.md
```
