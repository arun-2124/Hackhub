import api from './api';

export const dashboardService = {
  // Participant dashboard analytics
  getParticipantMetrics: async () => {
    return await api.get('/dashboard/participant');
  },
  getParticipantStats: async () => {
    return await api.get('/dashboard/participant');
  },

  // Organizer dashboard analytics
  getOrganizerMetrics: async () => {
    return await api.get('/dashboard/organizer');
  },
  getOrganizerStats: async () => {
    return await api.get('/dashboard/organizer');
  },

  // Admin dashboard analytics
  getAdminMetrics: async () => {
    return await api.get('/dashboard/admin');
  },
  getAdminStats: async () => {
    return await api.get('/dashboard/admin');
  }
};
