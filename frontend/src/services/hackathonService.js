import api from './api';

export const hackathonService = {
  // Get all hackathons with optional search, status, tag, and pagination
  getAll: async (params = {}) => {
    return await api.get('/hackathons', { params });
  },
  getHackathons: async (params = {}) => {
    return await api.get('/hackathons', { params });
  },

  // Get hackathon details by ID
  getById: async (id) => {
    return await api.get(`/hackathons/${id}`);
  },
  getHackathonById: async (id) => {
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
  createHackathon: async (hackathonData) => {
    return await api.post('/hackathons', hackathonData);
  },

  // Update hackathon (Organizer or Admin)
  update: async (id, hackathonData) => {
    return await api.put(`/hackathons/${id}`, hackathonData);
  },
  updateHackathon: async (id, hackathonData) => {
    return await api.put(`/hackathons/${id}`, hackathonData);
  },

  // Delete hackathon (Organizer or Admin)
  delete: async (id) => {
    return await api.delete(`/hackathons/${id}`);
  },
  deleteHackathon: async (id) => {
    return await api.delete(`/hackathons/${id}`);
  },

  // Tracks
  getTracks: async (hackathonId) => {
    return await api.get(`/hackathons/${hackathonId}/tracks`);
  },
  addTrack: async (hackathonId, trackData) => {
    return await api.post(`/hackathons/${hackathonId}/tracks`, trackData);
  },
  deleteTrack: async (hackathonId, trackId) => {
    return await api.delete(`/hackathons/${hackathonId}/tracks/${trackId}`);
  },

  // Schedule & Meetings
  getSchedule: async (hackathonId) => {
    return await api.get(`/hackathons/${hackathonId}/schedule`);
  },
  addScheduleEvent: async (hackathonId, eventData) => {
    return await api.post(`/hackathons/${hackathonId}/schedule`, eventData);
  },
  updateScheduleEvent: async (hackathonId, scheduleId, eventData) => {
    return await api.put(`/hackathons/${hackathonId}/schedule/${scheduleId}`, eventData);
  },
  deleteScheduleEvent: async (hackathonId, scheduleId) => {
    return await api.delete(`/hackathons/${hackathonId}/schedule/${scheduleId}`);
  },

  // Get hosted hackathons for current organizer
  getMyHostedHackathons: async () => {
    return await api.get('/hackathons');
  },

  // Get participants for a hackathon
  getHackathonParticipants: async (hackathonId) => {
    return await api.get(`/registrations/hackathon/${hackathonId}`);
  }
};
