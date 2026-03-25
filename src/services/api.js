import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/school',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('school_token');
    const portalToken = localStorage.getItem('portal_token');
    const token = portalToken || adminToken;
    
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error response indicates invalid token
    if (error.response?.status === 401 && error.response?.data?.clearToken) {
      // Clear all tokens
      localStorage.removeItem('school_token');
      localStorage.removeItem('school_user');
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_user');
      
      // Redirect based on current path
      if (window.location.pathname.startsWith('/portal')) {
        window.location.href = '/portal/login';
      } else if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;