import api from './api';

export const announcementService = {
  // Get announcements for a hackathon
  getByHackathon: async (hackathonId) => {
    return await api.get(`/announcements/hackathon/${hackathonId}`);
  },

  // Post announcement (Organizer/Admin)
  create: async (hackathonId, announcementData) => {
    return await api.post(`/announcements/hackathon/${hackathonId}`, announcementData);
  },

  // Delete announcement (Organizer/Admin)
  delete: async (id) => {
    return await api.delete(`/announcements/${id}`);
  }
};
