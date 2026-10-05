import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { registrationService } from '../services/registrationService';
import { ideaService } from '../services/ideaService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Calendar,
  Users,
  Lightbulb,
  Bell,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, regRes, ideasRes] = await Promise.all([
          dashboardService.getParticipantStats(),
          registrationService.getMyRegistrations(),
          ideaService.getMyIdeas(),
        ]);
        setStats(statsRes.data?.stats || statsRes.data || null);
        const regList = Array.isArray(regRes.data) ? regRes.data : (regRes.data?.registrations || regRes.registrations || []);
        const ideaList = Array.isArray(ideasRes.data) ? ideasRes.data : (ideasRes.data?.ideas || ideasRes.ideas || []);
        setRegistrations(regList);
        setIdeas(ideaList);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." fullScreen />;
  }

  return (
    <div className="space-y-8 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-900/10">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Participant Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-sm text-indigo-100 font-normal">
            Track your registrations, manage your project teams, and submit your innovations for judging.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Registered Events',
            val: stats?.total_registrations ?? registrations.length,
            icon: Calendar,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            label: 'Active Teams',
            val: stats?.active_teams ?? 0,
            icon: Users,
            color: 'text-sky-600 bg-sky-50',
          },
          {
            label: 'Submitted Ideas',
            val: stats?.submitted_ideas ?? ideas.length,
            icon: Lightbulb,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            label: 'Accepted Ideas',
            val: stats?.accepted_ideas ?? ideas.filter((i) => i.status === 'ACCEPTED').length,
            icon: Sparkles,
            color: 'text-emerald-600 bg-emerald-50',
          },
        ].map((m, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4"
          >
            <div className={`p-3 rounded-xl ${m.color}`}>
              <m.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{m.val}</p>
              <p className="text-xs text-slate-500 font-medium">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Registered Hackathons & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Registered Hackathons */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" /> My Hackathons
            </h2>
            <Link
              to="/my-registrations"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All ({registrations.length})
            </Link>
          </div>

          {registrations.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500 mb-3">You haven't registered for any hackathons yet.</p>
              <Link
                to="/hackathons"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
              >
                Browse Hackathons <ArrowRight className="ml-1 w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.slice(0, 4).map((reg) => (
                <div
                  key={reg.registration_id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <Link
                      to={`/hackathons/${reg.hackathon_id}`}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {reg.hackathon_title}
                    </Link>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <StatusBadge status={reg.hackathon_status} size="sm" />
                      <span>• Registered on {new Date(reg.registration_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/hackathons/${reg.hackathon_id}/team`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                      Team
                    </Link>
                    <Link
                      to={`/hackathons/${reg.hackathon_id}/submit`}
                      className="p-1.5 text-slate-500 hover:text-indigo-600"
                      title="Submit Idea"
                    >
                      <Send className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Submitted Project Ideas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-amber-500" /> My Submissions
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {ideas.length}
            </span>
          </div>

          {ideas.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500 mb-3">No project ideas submitted yet.</p>
              <p className="text-xs text-slate-400">
                Join a hackathon team and submit your proposal deck.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ideas.slice(0, 4).map((idea) => (
                <div
                  key={idea.idea_id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <Link
                      to={`/ideas/${idea.idea_id}`}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {idea.title}
                    </Link>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>{idea.hackathon_title}</span>
                      <span>•</span>
                      <StatusBadge status={idea.status} size="sm" />
                    </div>
                  </div>

                  <Link
                    to={`/ideas/${idea.idea_id}`}
                    className="p-1.5 text-slate-400 hover:text-indigo-600"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
