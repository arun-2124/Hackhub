import api from './api';

export const hackathonService = {
  // Get all hackathons with optional search, status, tag, and pagination
  getAll: async (params = {}) => {
    return await api.get('/hackathons', { params });
  },

  // Get hackathon details by ID
  getById: async (id) => {
    return await api.get(`/hackathons/${id}`);
  },

  // Get all available tags
  getTags: async () => {
    return await api.get('/hackathons/tags');
  },

  // Create hackathon (Organizer or Admin)
  create: async (hackathonData) => {
    return await api.post('/hackathons', hackathonData);
  },

  // Update hackathon (Organizer or Admin)
  update: async (id, hackathonData) => {
    return await api.put(`/hackathons/${id}`, hackathonData);
  },

  // Delete hackathon (Organizer or Admin)
  delete: async (id) => {
    return await api.delete(`/hackathons/${id}`);
  }
};
