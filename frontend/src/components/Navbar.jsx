// components/Navbar.jsx
// Top navigation with brand, links, search, cart badge, user menu
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, LayoutDashboard, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully. See you soon! 👋');
    navigate('/');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    ...(isAuthenticated ? [{ label: 'My Orders', path: '/orders' }] : []),
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
            <span className="text-2xl">🍔</span>
            <span className="text-gradient-pink">BlushBites</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-blush-50 text-blush-500'
                    : 'text-gray-600 hover:text-blush-500 hover:bg-blush-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: Cart + User */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <Link
              to="/cart"
              id="navbar-cart-btn"
              className="relative p-2 rounded-xl hover:bg-blush-50 transition-colors text-gray-600 hover:text-blush-500"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blush-500 text-white text-[10px] font-bold
                                 w-5 h-5 rounded-full flex items-center justify-center animate-bounce-soft">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  id="navbar-user-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blush-50
                             transition-colors text-gray-600 hover:text-blush-500"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-pink flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#333333] max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-pink-50 z-20 overflow-hidden animate-slide-up">
                      <div className="px-4 py-3 border-b border-pink-50">
                        <p className="font-semibold text-sm text-[#333333] truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blush-50 transition-colors">
                          <User size={15} /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blush-50 transition-colors">
                          <Package size={15} /> My Orders
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-blush-500 font-medium hover:bg-blush-50 transition-colors">
                            <LayoutDashboard size={15} /> Admin Dashboard
                          </Link>
                        )}
                        <div className="border-t border-pink-50 mt-1">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut size={15} /> Log Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/auth" id="navbar-login-btn" className="btn-primary py-2 text-sm hidden sm:flex">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="navbar-mobile-menu"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-blush-50 transition-colors text-gray-600"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white animate-slide-up">
          <div className="section-container py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive(link.path)
                    ? 'bg-blush-50 text-blush-500'
                    : 'text-gray-600 hover:bg-blush-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link to="/auth" onClick={() => setMobileOpen(false)}
                className="block btn-primary text-center mt-2">
                Sign In
              </Link>
            )}
            {isAuthenticated && isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl font-medium text-sm text-blush-500 hover:bg-blush-50">
                🛠️ Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
