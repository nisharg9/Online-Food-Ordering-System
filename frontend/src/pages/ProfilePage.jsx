// pages/ProfilePage.jsx
// User profile management: edit name, phone, address, and change password
import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), address: address.trim() });
      toast.success('Profile updated successfully! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success(res.data.message || 'Password changed successfully! 🔐');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen py-8 animate-fade-in">
      <div className="section-container max-w-2xl">
        <h1 className="text-3xl font-extrabold text-[#333333] mb-6">👤 My Profile</h1>

        {/* User Quick Info Banner */}
        <div className="card p-6 mb-6 flex items-center gap-4 bg-gradient-to-r from-white via-white to-pink-50">
          <div className="w-16 h-16 rounded-2xl bg-gradient-pink flex items-center justify-center text-white text-2xl font-black shadow-pink shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#333333] truncate">{user?.name}</h2>
              {user?.role === 'admin' && (
                <span className="bg-blush-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-blush-50 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'info'
                ? 'bg-blush-500 text-white shadow-pink'
                : 'text-gray-500 hover:text-blush-500'
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'password'
                ? 'bg-blush-500 text-white shadow-pink'
                : 'text-gray-500 hover:text-blush-500'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Personal Details Tab */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateProfile} className="card p-6 space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-semibold text-[#333333] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field pl-10 bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Email address is tied to your account login and cannot be altered.</p>
            </div>

            <div>
              <label htmlFor="profile-phone" className="block text-sm font-semibold text-[#333333] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-address" className="block text-sm font-semibold text-[#333333] mb-1.5">
                Default Delivery Address
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <textarea
                  id="profile-address"
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Building, Flat / Unit, City"
                  className="input-field pl-10 resize-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">This will automatically pre-fill your future checkout forms.</p>
            </div>

            <button
              id="profile-save-btn"
              type="submit"
              disabled={savingProfile}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4"
            >
              {savingProfile ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Saving Changes...</span>
                </span>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="card p-6 space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
                {passwordError}
              </div>
            )}

            <div>
              <label htmlFor="current-password" className="block text-sm font-semibold text-[#333333] mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-semibold text-[#333333] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#333333] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <button
              id="change-password-btn"
              type="submit"
              disabled={changingPassword}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4"
            >
              {changingPassword ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Updating Password...</span>
                </span>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
