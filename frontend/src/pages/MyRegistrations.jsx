import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationService } from '../services/registrationService';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Alert from '../components/common/Alert';
import { Calendar, Users, Send, Trash2, ArrowRight } from 'lucide-react';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await registrationService.getMyRegistrations();
      const regList = Array.isArray(res.data) ? res.data : (res.data?.registrations || res.registrations || []);
      setRegistrations(regList);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load registrations.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelRegistration = async (hackathonId, title) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${title}"?`)) {
      return;
    }

    setActionLoadingId(hackathonId);
    try {
      await registrationService.cancelRegistration(hackathonId);
      setAlert({ type: 'success', message: `Registration for "${title}" cancelled successfully.` });
      setRegistrations((prev) => prev.filter((r) => r.hackathon_id !== hackathonId));
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Could not cancel registration. Check team memberships.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Registered Hackathons
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your registrations, team assignments, and idea submissions.
        </p>
      </div>

      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />
      )}

      {loading ? (
        <LoadingSpinner text="Loading registrations..." />
      ) : registrations.length === 0 ? (
        <EmptyState
          title="No Active Registrations"
          description="You haven't registered for any hackathons yet. Find a hackathon to get started!"
          actionLabel="Explore Hackathons"
          actionLink="/hackathons"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => (
            <div
              key={reg.registration_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={reg.hackathon_status} size="sm" />
                  <span className="text-xs text-slate-400">
                    Registered: {new Date(reg.registration_date).toLocaleDateString()}
                  </span>
                </div>

                <Link
                  to={`/hackathons/${reg.hackathon_id}`}
                  className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                >
                  {reg.hackathon_title}
                </Link>

                <p className="text-xs text-slate-500">
                  Theme: <span className="font-medium text-slate-700">{reg.theme || 'General'}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/hackathons/${reg.hackathon_id}/team`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Team Workspace
                  </Link>

                  <Link
                    to={`/hackathons/${reg.hackathon_id}/submit`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Idea
                  </Link>
                </div>

                <button
                  onClick={() => handleCancelRegistration(reg.hackathon_id, reg.hackathon_title)}
                  disabled={actionLoadingId === reg.hackathon_id}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Cancel Registration"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
