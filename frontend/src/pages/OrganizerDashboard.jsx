import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { hackathonService } from '../services/hackathonService';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Calendar,
  Users,
  Lightbulb,
  PlusCircle,
  Settings,
  ClipboardCheck,
  Edit,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function OrganizerDashboard() {
  const [stats, setStats] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, hRes] = await Promise.all([
          dashboardService.getOrganizerStats(),
          hackathonService.getMyHostedHackathons(),
        ]);
        setStats(statsRes.data?.stats || statsRes.data || null);
        const hackList = Array.isArray(hRes.data) ? hRes.data : (hRes.data?.hackathons || hRes.hackathons || []);
        setHackathons(hackList);
      } catch (err) {
        console.error('Failed to load organizer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading organizer portal..." fullScreen />;
  }

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Host & Judging Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Create competitions, broadcast live announcements, and evaluate student proposals.
          </p>
        </div>

        <Link
          to="/organizer/hackathons/create"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Host New Hackathon
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Hosted Hackathons',
            val: stats?.hosted_hackathons ?? hackathons.length,
            icon: Calendar,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            label: 'Total Participants',
            val: stats?.total_registrations ?? 0,
            icon: Users,
            color: 'text-sky-600 bg-sky-50',
          },
          {
            label: 'Ideas Received',
            val: stats?.total_submissions ?? 0,
            icon: Lightbulb,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            label: 'Pending Evaluation',
            val: stats?.pending_evaluations ?? 0,
            icon: ClipboardCheck,
            color: 'text-rose-600 bg-rose-50',
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

      {/* Hosted Hackathons List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Hackathons</h2>
            <p className="text-xs text-slate-500">Manage live events, rosters, and evaluation queues</p>
          </div>
        </div>

        {hackathons.length === 0 ? (
          <EmptyState
            title="No Hackathons Hosted Yet"
            description="You haven't created any hackathons yet. Launch your first event now!"
            actionLabel="Create Hackathon"
            actionLink="/organizer/hackathons/create"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {hackathons.map((h) => (
              <div
                key={h.hackathon_id}
                className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={h.status} size="sm" />
                    <span className="text-xs text-slate-400">
                      {new Date(h.start_date).toLocaleDateString()} -{' '}
                      {new Date(h.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/hackathons/${h.hackathon_id}`}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                  >
                    {h.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>
                      Registrations: <strong className="text-slate-700">{h.registrations_count || 0}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Teams: <strong className="text-slate-700">{h.teams_count || 0}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Submissions: <strong className="text-slate-700">{h.submissions_count || 0}</strong>
                    </span>
                  </div>
                </div>

                {/* Organizer Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    to={`/organizer/hackathons/${h.hackathon_id}/manage`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" /> Manage & Broadcast
                  </Link>

                  <Link
                    to={`/organizer/hackathons/${h.hackathon_id}/evaluate`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" /> Evaluate ({h.submissions_count || 0})
                  </Link>

                  <Link
                    to={`/organizer/hackathons/${h.hackathon_id}/edit`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Edit Hackathon Details"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
