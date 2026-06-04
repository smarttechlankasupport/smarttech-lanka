/* ============================================
   frontend/lib/api.js
   Purpose: Axios instance + all API call functions
   ============================================ */
import axios from 'axios';
import Cookies from 'js-cookie';

// Base URL: use explicit env var if set, otherwise production API
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smarttech-lanka.onrender.com/api';

// ── Axios instance ────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// allow sending cookies if backend uses them for auth
api.defaults.withCredentials = true;

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  let token = Cookies.get('stl_token');
  if (!token && typeof window !== 'undefined') {
    token = window.localStorage.getItem('stl_token');
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (process.env.NODE_ENV === 'development') {
    try {
      console.debug('[api] request baseURL ->', config.baseURL);
      console.debug('[api] Authorization header ->', config.headers.Authorization);
      console.debug('[api] token source ->', token ? 'cookie/localStorage' : 'none');
    } catch (_) {}
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('stl_token');
      Cookies.remove('stl_user');
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('stl_token');
        window.localStorage.removeItem('stl_user');
        window.location.href = '/auth/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// ── Helper ──────────────────────────────────
const handleErr = (err) => {
  if (!err.response) {
    throw new Error('Network Error. Ensure the backend is reachable at https://smarttech-lanka.onrender.com/api');
  }

  const apiMessage = err.response?.data?.message || err.response?.statusText;
  const statusCode = err.response?.status;
  const debugMessage = apiMessage || err.message || 'Something went wrong';

  const error = new Error(debugMessage);
  error.statusCode = statusCode;
  error.apiMessage = apiMessage;
  error.response = err.response;
  throw error;
};

// ── AUTH ─────────────────────────────────────
export const authAPI = {
  register:       (data)   => api.post('/auth/register',        data).catch(handleErr),
  login:          (data)   => api.post('/auth/login',           data).catch(handleErr),
  getMe:          ()       => api.get('/auth/me').catch(handleErr),
  updateProfile:  (data)   => api.put('/auth/update-profile',   data).catch(handleErr),
  changePassword: (data)   => api.put('/auth/change-password',  data).catch(handleErr),
  forgotPassword: (data)   => api.post('/auth/forgot-password', data).catch(handleErr),
  resetPassword:  (data)   => api.post('/auth/reset-password',  data).catch(handleErr),
  addAddress:     (data)   => api.post('/auth/add-address',     data).catch(handleErr),
  deleteAddress:  (id)     => api.delete(`/auth/address/${id}`).catch(handleErr),
  toggleWishlist: (pid)    => api.post(`/auth/wishlist/${pid}`).catch(handleErr),
};

// ── PRODUCTS ──────────────────────────────────
export const productAPI = {
  getAll:     (params)  => api.get('/products',            { params }).catch(handleErr),
  getById:    (id)      => api.get(`/products/${id}`).catch(handleErr),
  getBySlug:  (slug)    => api.get(`/products/slug/${slug}`).catch(handleErr),
  // For multipart FormData requests, do NOT set the Content-Type header manually.
  // Let the browser/axios set the proper boundary automatically.
  create:     (data)    => api.post('/products',           data).catch(handleErr),
  update:     (id, d)   => api.put(`/products/${id}`,      d).catch(handleErr),
  delete:     (id)      => api.delete(`/products/${id}`).catch(handleErr),
  addImage:   (id, d)   => api.post(`/products/${id}/add-image`, d).catch(handleErr),
};

// ── CATEGORIES ───────────────────────────────
export const categoryAPI = {
  getAll:   ()        => api.get('/categories').catch(handleErr),
  getById:  (id)      => api.get(`/categories/${id}`).catch(handleErr),
  // Let axios set multipart/form-data boundary automatically for FormData payloads
  create:   (data)    => api.post('/categories', data).catch(handleErr),
  update:   (id, d)   => api.put(`/categories/${id}`, d).catch(handleErr),
  delete:   (id)      => api.delete(`/categories/${id}`).catch(handleErr),
};

// ── SERVICES ──────────────────────────────
export const serviceAPI = {
  getAll:   ()        => api.get('/services').catch(handleErr),
  getById:  (id)      => api.get(`/services/${id}`).catch(handleErr),
  create:   (data)    => api.post('/services', data).catch(handleErr),
  update:   (id, d)   => api.put(`/services/${id}`, d).catch(handleErr),
  delete:   (id)      => api.delete(`/services/${id}`).catch(handleErr),
};

// ── ORDERS ───────────────────────────────────
export const orderAPI = {
  create:       (data)       => api.post('/orders',              data).catch(handleErr),
  getMyOrders:  ()           => api.get('/orders/my').catch(handleErr),
  getById:      (id)         => api.get(`/orders/${id}`).catch(handleErr),
  getAll:       (params)     => api.get('/orders',               { params }).catch(handleErr),
  updateStatus: (id, data)   => api.put(`/orders/${id}/status`,  data).catch(handleErr),
};

// ── BOOKINGS ─────────────────────────────────
export const bookingAPI = {
  create:       (data)      => api.post('/bookings',            data).catch(handleErr),
  getMyBookings:()          => api.get('/bookings/my').catch(handleErr),
  getById:      (id)        => api.get(`/bookings/${id}`).catch(handleErr),
  getAll:       (params)    => api.get('/bookings',             { params }).catch(handleErr),
  update:       (id, data)  => api.put(`/bookings/${id}`,       data).catch(handleErr),
};

// ── REVIEWS ──────────────────────────────────
export const reviewAPI = {
  getByProduct: (pid)    => api.get(`/reviews/${pid}`).catch(handleErr),
  create:       (pid, d) => api.post(`/reviews/${pid}`, d).catch(handleErr),
  delete:       (id)     => api.delete(`/reviews/${id}`).catch(handleErr),
};

// ── COUPONS ──────────────────────────────────
export const couponAPI = {
  validate: (data)      => api.post('/coupons/validate',   data).catch(handleErr),
  getAll:   ()          => api.get('/coupons').catch(handleErr),
  create:   (data)      => api.post('/coupons',            data).catch(handleErr),
  update:   (id, data)  => api.put(`/coupons/${id}`,       data).catch(handleErr),
  delete:   (id)        => api.delete(`/coupons/${id}`).catch(handleErr),
};

// ── USERS (admin) ────────────────────────────
export const userAPI = {
  getAll:   (params)     => api.get('/users',           { params }).catch(handleErr),
  getById:  (id)         => api.get(`/users/${id}`).catch(handleErr),
  update:   (id, data)   => api.put(`/users/${id}`,     data).catch(handleErr),
  delete:   (id)         => api.delete(`/users/${id}`).catch(handleErr),
};

// ── ADMIN STATS ───────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats').catch(handleErr),
};

export default api;
