import api from './api';

export const ideaService = {
  // Get public project ideas
  getPublic: async (params = {}) => {
    return await api.get('/ideas/public', { params });
  },

  // Get project idea by ID
  getById: async (id) => {
    return await api.get(`/ideas/${id}`);
  },

  // Submit project idea
  submit: async (ideaData) => {
    return await api.post('/ideas', ideaData);
  },

  // Upload PPT/PDF attachment
  uploadFile: async (ideaId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post(`/ideas/${ideaId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Download file URL generator or helper
  getDownloadUrl: (fileId) => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    return `${base}/ideas/files/${fileId}/download`;
  },

  // Update idea details
  update: async (id, ideaData) => {
    return await api.put(`/ideas/${id}`, ideaData);
  },

  // Update submission status (Organizer/Admin)
  updateStatus: async (id, submission_status) => {
    return await api.put(`/ideas/${id}/status`, { submission_status });
  },

  // Get submissions for a hackathon (Organizer/Admin)
  getHackathonSubmissions: async (hackathonId) => {
    return await api.get(`/ideas/hackathon/${hackathonId}`);
  }
};
