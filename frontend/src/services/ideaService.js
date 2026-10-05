import api from './api';

export const ideaService = {
  // Get public project ideas
  getPublic: async (params = {}) => {
    return await api.get('/ideas/public', { params });
  },
  getPublicIdeas: async (params = {}) => {
    return await api.get('/ideas/public', { params });
  },

  // Get project idea by ID
  getById: async (id) => {
    return await api.get(`/ideas/${id}`);
  },
  getIdeaById: async (id) => {
    return await api.get(`/ideas/${id}`);
  },

  // Get current user's submitted ideas
  getMyIdeas: async () => {
    return await api.get('/ideas/public');
  },

  // Submit project idea (handles both JSON and FormData with file)
  submit: async (ideaData) => {
    if (ideaData instanceof FormData) {
      // Extract file if present
      const file = ideaData.get('file');
      const payload = {
        hackathon_id: ideaData.get('hackathon_id'),
        team_id: ideaData.get('team_id') || undefined,
        title: ideaData.get('title'),
        abstract: ideaData.get('abstract'),
        domain_track: ideaData.get('track'),
        tech_stack: ideaData.get('tech_stack'),
        repository_url: ideaData.get('repository_url'),
        demo_url: ideaData.get('demo_url'),
        is_public: ideaData.get('is_public') === 'true'
      };

      const res = await api.post('/ideas', payload);
      const ideaId = res.data?.data?.idea_id || res.data?.idea_id || res.data?.data?.idea?.idea_id;

      if (file && ideaId) {
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        await api.post(`/ideas/${ideaId}/upload`, uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      return res;
    }
    return await api.post('/ideas', ideaData);
  },
  submitIdea: async (ideaData) => {
    return await ideaService.submit(ideaData);
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
  downloadFile: async (fileId, fileName) => {
    const url = ideaService.getDownloadUrl(fileId);
    window.open(url, '_blank');
  },

  // Update idea details
  update: async (id, ideaData) => {
    return await api.put(`/ideas/${id}`, ideaData);
  },

  // Update submission status (Organizer/Admin)
  updateStatus: async (id, submission_status) => {
    const statusVal = typeof submission_status === 'object' ? submission_status.status || submission_status.submission_status : submission_status;
    return await api.put(`/ideas/${id}/status`, { submission_status: statusVal });
  },
  updateIdeaStatus: async (id, status) => {
    return await ideaService.updateStatus(id, status);
  },

  // Get submissions for a hackathon (Organizer/Admin)
  getHackathonSubmissions: async (hackathonId) => {
    return await api.get(`/ideas/hackathon/${hackathonId}`);
  }
};
