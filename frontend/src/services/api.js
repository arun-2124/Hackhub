import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer Token & Support FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hackhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If request payload is FormData, remove manual Content-Type header so browser sets multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration, Normalization & Errors
api.interceptors.response.use(
  (response) => {
    const resBody = response.data;
    if (resBody && typeof resBody === 'object' && resBody.data !== undefined) {
      if (Array.isArray(resBody.data)) {
        resBody.hackathons = resBody.data;
        resBody.tags = resBody.data;
        resBody.ideas = resBody.data;
        resBody.submissions = resBody.data;
        resBody.registrations = resBody.data;
        resBody.announcements = resBody.data;
        resBody.participants = resBody.data;
        try {
          resBody.data.hackathons = resBody.data;
          resBody.data.tags = resBody.data;
          resBody.data.ideas = resBody.data;
          resBody.data.submissions = resBody.data;
          resBody.data.registrations = resBody.data;
          resBody.data.announcements = resBody.data;
          resBody.data.participants = resBody.data;
        } catch (_) {}
      } else if (resBody.data && typeof resBody.data === 'object') {
        try {
          if (!resBody.data.hackathon) resBody.data.hackathon = resBody.data;
          if (!resBody.data.idea) resBody.data.idea = resBody.data;
          if (!resBody.data.team) resBody.data.team = resBody.data;
          if (!resBody.data.user) resBody.data.user = resBody.data;
        } catch (_) {}
      }
    }
    return resBody;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // If 401 Unauthorized occurs on an authenticated route, clear expired token
    if (status === 401 && localStorage.getItem('hackhub_token')) {
      console.warn('[API Auth] Session expired or invalid token. Redirecting to login.');
      localStorage.removeItem('hackhub_token');
      localStorage.removeItem('hackhub_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }

    const err = new Error(message);
    err.response = error.response;
    return Promise.reject(err);
  }
);

export default api;
