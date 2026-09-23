// App.jsx
// Main application layout with route configuration and route guards
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';

// Customer Protected Pages
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';

// Admin Protected Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminOrdersPage from './pages/AdminOrdersPage';

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
      <div className="card p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="text-3xl font-black text-[#333333] mb-2">404</h1>
        <h2 className="text-lg font-bold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">
          The page or dish you're looking for doesn't exist or has moved.
        </p>
        <Link to="/" className="btn-primary inline-block">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F7] text-[#333333] selection:bg-pink-200">
      {/* Navigation bar */}
      <Navbar />

      {/* Main page view */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Customer Routes (Protected) */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:id"
            element={
              <ProtectedRoute>
                <OrderConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track/:id"
            element={
              <ProtectedRoute>
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes (Admin Only) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <AdminRoute>
                <AdminMenuPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrdersPage />
              </AdminRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
