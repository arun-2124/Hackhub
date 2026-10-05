import api from './api';

export const registrationService = {
  // Register for a hackathon
  register: async (hackathon_id) => {
    return await api.post('/registrations', { hackathon_id });
  },
  registerForHackathon: async (hackathon_id) => {
    return await api.post('/registrations', { hackathon_id });
  },

  // Get logged-in participant registrations
  getMyRegistrations: async () => {
    return await api.get('/registrations/my');
  },

  // Get all registrations for a hackathon (Organizer/Admin)
  getHackathonRegistrations: async (hackathonId) => {
    return await api.get(`/registrations/hackathon/${hackathonId}`);
  },

  // Cancel registration
  cancel: async (registrationId) => {
    return await api.delete(`/registrations/${registrationId}`);
  },
  cancelRegistration: async (registrationId) => {
    return await api.delete(`/registrations/${registrationId}`);
  }
};
