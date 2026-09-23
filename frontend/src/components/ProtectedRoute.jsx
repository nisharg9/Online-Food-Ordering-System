// components/ProtectedRoute.jsx
// Route guards for customer and admin routes
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './LoadingSpinner';

// Customer route: redirect to /auth if not logged in
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

// Admin route: redirect to home if not admin
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7]">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-[#333333] mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">
            You need admin privileges to access this area.
          </p>
          <a href="/" className="btn-primary inline-block">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
