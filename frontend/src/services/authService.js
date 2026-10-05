import api from './api';

export const authService = {
  // Register new account (PARTICIPANT or ORGANIZER)
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // Login with email and password
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  // Get authenticated user profile
  getMe: async () => {
    return await api.get('/auth/me');
  },

  // Update profile
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  }
};
