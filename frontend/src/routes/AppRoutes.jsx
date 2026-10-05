import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Home from '../pages/Home';
import Hackathons from '../pages/Hackathons';
import HackathonDetail from '../pages/HackathonDetail';
import PublicIdeas from '../pages/PublicIdeas';
import IdeaDetail from '../pages/IdeaDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Participant Pages
import ParticipantDashboard from '../pages/ParticipantDashboard';
import MyRegistrations from '../pages/MyRegistrations';
import TeamWorkspace from '../pages/TeamWorkspace';
import SubmitIdea from '../pages/SubmitIdea';
import Profile from '../pages/Profile';

// Organizer Pages
import OrganizerDashboard from '../pages/OrganizerDashboard';
import CreateHackathon from '../pages/CreateHackathon';
import EditHackathon from '../pages/EditHackathon';
import ManageHackathon from '../pages/ManageHackathon';
import EvaluateSubmissions from '../pages/EvaluateSubmissions';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/hackathons" element={<Hackathons />} />
      <Route path="/hackathons/:id" element={<HackathonDetail />} />
      <Route path="/ideas" element={<PublicIdeas />} />
      <Route path="/ideas/:id" element={<IdeaDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Any Authenticated User */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Participant Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ADMIN']} />}>
        <Route path="/dashboard" element={<ParticipantDashboard />} />
        <Route path="/my-registrations" element={<MyRegistrations />} />
        <Route path="/hackathons/:hackathonId/team" element={<TeamWorkspace />} />
        <Route path="/hackathons/:hackathonId/submit" element={<SubmitIdea />} />
      </Route>

      {/* Organizer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} />}>
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/hackathons/create" element={<CreateHackathon />} />
        <Route path="/organizer/hackathons/:id/edit" element={<EditHackathon />} />
        <Route path="/organizer/hackathons/:id/manage" element={<ManageHackathon />} />
        <Route path="/organizer/hackathons/:id/evaluate" element={<EvaluateSubmissions />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
