import api from './api';

export const teamService = {
  // Create a new team
  create: async (teamData) => {
    return await api.post('/teams', teamData);
  },

  // Join a team via invite code
  join: async (team_code) => {
    return await api.post('/teams/join', { team_code });
  },

  // Get team details by ID
  getById: async (id) => {
    return await api.get(`/teams/${id}`);
  },

  // Get user's active team for a specific hackathon
  getMyTeamForHackathon: async (hackathonId) => {
    return await api.get(`/teams/hackathon/${hackathonId}/my-team`);
  },

  // Remove member or leave team
  removeMember: async (teamId, userId) => {
    return await api.delete(`/teams/${teamId}/members/${userId}`);
  }
};
