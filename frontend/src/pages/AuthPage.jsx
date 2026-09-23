// pages/AuthPage.jsx
// Login and Signup page with tabbed form, validation, and redirect after auth
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuthPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, signup, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const sessionExpired = searchParams.get('session') === 'expired';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate(redirect, { replace: true });
  }, [isAuthenticated]);

  useEffect(() => {
    if (sessionExpired) toast.warning('Your session expired. Please log in again.');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ─── Client-side Validation ───────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (tab === 'signup' && !formData.name.trim()) newErrors.name = 'Name is required.';
    if (tab === 'signup' && formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters.';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Please enter a valid email.';
    if (!formData.password) newErrors.password = 'Password is required.';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (tab === 'signup' && formData.phone && !formData.phone.match(/^[+]?[\d\s\-()]{7,}$/)) {
      newErrors.phone = 'Please enter a valid phone number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (tab === 'login') {
        const data = await login(formData.email, formData.password);
        toast.success(data.message || 'Welcome back! 🎉');
      } else {
        const data = await signup(formData);
        toast.success(data.message || 'Account created! 🎉');
      }
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const fieldErrors = {};
        apiErrors.forEach((e) => { fieldErrors[e.path] = e.msg; });
        setErrors(fieldErrors);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setErrors({});
    setFormData({ name: '', email: '', password: '', phone: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-2xl">
            <span className="text-3xl">🍔</span>
            <span className="text-gradient-pink">BlushBites</span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">
            {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to start ordering.'}
          </p>
          {redirect !== '/' && redirect !== '' && (
            <p className="text-xs text-blush-400 mt-1">You'll be redirected after signing in.</p>
          )}
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex bg-blush-50 rounded-xl p-1 mb-6">
            {[['login', '🔐 Login'], ['signup', '✨ Sign Up']].map(([t, label]) => (
              <button
                key={t}
                id={`auth-tab-${t}`}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? 'bg-blush-500 text-white shadow-pink' : 'text-gray-500 hover:text-blush-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name (signup only) */}
            {tab === 'signup' && (
              <FormField
                id="auth-name"
                name="name"
                type="text"
                label="Full Name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={<User size={16} />}
              />
            )}

            {/* Email */}
            <FormField
              id="auth-email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail size={16} />}
            />

            {/* Password */}
            <div>
              <label htmlFor="auth-password" className="block text-sm font-semibold text-[#333333] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Phone (signup only) */}
            {tab === 'signup' && (
              <FormField
                id="auth-phone"
                name="phone"
                type="tel"
                label="Phone Number (optional)"
                placeholder="+1 (555) 0100"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={<Phone size={16} />}
              />
            )}

            {/* Submit */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                tab === 'login' ? '🔑 Sign In' : '✨ Create Account'
              )}
            </button>

            {tab === 'login' && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Demo: <code>admin@blushbites.com / admin123</code> or{' '}
                <code>jane@example.com / customer123</code>
              </p>
            )}
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            {tab === 'login' ? (
              <>Don't have an account? <button onClick={() => switchTab('signup')} className="text-blush-500 font-semibold hover:underline">Sign up free</button></>
            ) : (
              <>Already have an account? <button onClick={() => switchTab('login')} className="text-blush-500 font-semibold hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function FormField({ id, name, type, label, placeholder, value, onChange, error, icon }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#333333] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input-field pl-10 ${error ? 'input-error' : ''}`}
          autoComplete={type === 'email' ? 'email' : undefined}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
