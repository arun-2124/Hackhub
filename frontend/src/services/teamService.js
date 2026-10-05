import api from './api';

export const teamService = {
  // Create a new team
  create: async (teamData) => {
    return await api.post('/teams', teamData);
  },
  createTeam: async (teamData) => {
    return await api.post('/teams', teamData);
  },

  // Join a team via invite code
  join: async (team_code) => {
    return await api.post('/teams/join', typeof team_code === 'object' ? team_code : { team_code });
  },
  joinTeam: async (team_code) => {
    return await api.post('/teams/join', typeof team_code === 'object' ? team_code : { team_code });
  },

  // Get team details by ID
  getById: async (id) => {
    return await api.get(`/teams/${id}`);
  },
  getTeamById: async (id) => {
    return await api.get(`/teams/${id}`);
  },

  // Get user's active team for a specific hackathon
  getMyTeam: async (hackathonId) => {
    return await api.get(`/teams/hackathon/${hackathonId}/my-team`);
  },
  getMyTeamForHackathon: async (hackathonId) => {
    return await api.get(`/teams/hackathon/${hackathonId}/my-team`);
  },

  // Remove member
  removeMember: async (teamId, userId) => {
    return await api.delete(`/teams/${teamId}/members/${userId}`);
  },
  removeTeamMember: async (teamId, userId) => {
    return await api.delete(`/teams/${teamId}/members/${userId}`);
  },

  // Leave team
  leaveTeam: async (teamId) => {
    return await api.delete(`/teams/${teamId}/members/me`);
  }
};
