/* ============================================
   frontend/context/AuthContext.js
   Purpose: Global auth state — login, logout,
            user profile, JWT token management
   ============================================ */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

const COOKIE_OPTS = { expires: 30, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' };
const STORAGE_TOKEN_KEY = 'stl_token';
const STORAGE_USER_KEY  = 'stl_user';

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [token,   setToken]   = useState(null);

  // Load user from storage/cookie on mount
  useEffect(() => {
    const storedToken = Cookies.get('stl_token') || (typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_TOKEN_KEY) : null);
    const storedUser  = Cookies.get('stl_user')  || (typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_USER_KEY) : null);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        clearAuth();
      }
    }
    setLoading(false);
  }, []);

  const saveAuth = (token, user) => {
    Cookies.set('stl_token', token, COOKIE_OPTS);
    Cookies.set('stl_user',  JSON.stringify(user), COOKIE_OPTS);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_TOKEN_KEY, token);
      window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    }
    setToken(token);
    setUser(user);
  };

  const clearAuth = () => {
    Cookies.remove('stl_token');
    Cookies.remove('stl_user');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_TOKEN_KEY);
      window.localStorage.removeItem(STORAGE_USER_KEY);
    }
    setToken(null);
    setUser(null);
  };

  // Register
  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    saveAuth(res.data.token, res.data.user);
    toast.success(`Welcome, ${res.data.user.name}! 🎉`);
    return res.data;
  }, []);

  // Login
  const login = useCallback(async (data) => {
    const res = await authAPI.login(data);
    saveAuth(res.data.token, res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}! ⚡`);
    return res.data;
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearAuth();
    toast.success('Logged out successfully');
    window.location.href = '/';
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      const updated = res.data.user;
      setUser(updated);
      Cookies.set('stl_user', JSON.stringify(updated), COOKIE_OPTS);
      if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
      return updated;
    } catch { clearAuth(); }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data) => {
    const res = await authAPI.updateProfile(data);
    const updated = res.data.user;
    setUser(updated);
    Cookies.set('stl_user', JSON.stringify(updated), COOKIE_OPTS);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
    toast.success('Profile updated!');
    return updated;
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback(async (productId) => {
    if (!user) { toast.error('Please login first'); return; }
    const res = await authAPI.toggleWishlist(productId);
    const updatedUser = { ...user, wishlist: res.data.wishlist };
    setUser(updatedUser);
    Cookies.set('stl_user', JSON.stringify(updatedUser), COOKIE_OPTS);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
    toast.success(res.data.action === 'added' ? 'Added to wishlist ❤️' : 'Removed from wishlist');
    return res.data;
  }, [user]);

  const isInWishlist = (productId) => {
    if (!user?.wishlist) return false;
    return user.wishlist.some(id => id === productId || id?._id === productId);
  };

  const isAdmin    = user?.role === 'admin';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAdmin, isLoggedIn,
      register, login, logout, refreshUser, updateProfile, toggleWishlist, isInWishlist,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
