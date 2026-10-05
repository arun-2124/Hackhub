import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { hackathonService } from '../services/hackathonService';
import { registrationService } from '../services/registrationService';
import { announcementService } from '../services/announcementService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import {
  Calendar,
  Users,
  Award,
  Clock,
  Building,
  Bell,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Share2,
  ExternalLink,
  BookOpen,
  Send,
  UserCheck,
} from 'lucide-react';

export default function HackathonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [hackathon, setHackathons] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [hackRes, annRes] = await Promise.all([
          hackathonService.getHackathonById(id),
          announcementService.getHackathonAnnouncements(id),
        ]);
        setHackathons(hackRes.data?.hackathon || null);
        setAnnouncements(annRes.data?.announcements || []);

        // Check if participant is registered
        if (isAuthenticated && user?.role === 'PARTICIPANT') {
          try {
            const regRes = await registrationService.getMyRegistrations();
            const registered = regRes.data?.registrations?.some(
              (r) => Number(r.hackathon_id) === Number(id)
            );
            setIsRegistered(registered);
          } catch (e) {
            console.error('Error fetching registrations:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching hackathon detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isAuthenticated, user]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await registrationService.registerForHackathon(id);
      setIsRegistered(true);
      setMessage({ type: 'success', text: 'Successfully registered for this hackathon!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Registration failed. Please check the deadline.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading hackathon details..." fullScreen />;
  }

  if (!hackathon) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-800">Hackathon Not Found</h2>
        <p className="text-slate-500 mt-2">The hackathon you requested does not exist or has been removed.</p>
        <Link to="/hackathons" className="mt-4 inline-flex items-center text-indigo-600 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Hackathons
        </Link>
      </div>
    );
  }

  const isOrganizerOwner =
    user?.role === 'ORGANIZER' && Number(user?.user_id) === Number(hackathon.organizer_id);

  return (
    <div className="space-y-8 py-6">
      {/* Back button */}
      <div>
        <Link
          to="/hackathons"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to all hackathons
        </Link>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Hero Banner Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={hackathon.status} />
              {hackathon.theme && (
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                  {hackathon.theme}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {hackathon.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
              <span className="flex items-center">
                <Building className="w-4 h-4 mr-1 text-slate-400" />
                Organized by: <strong className="ml-1 text-slate-700">{hackathon.organizer_name || 'Organizer'}</strong>
                {hackathon.organizer_college && ` (${hackathon.organizer_college})`}
              </span>
            </div>

            {/* Tags */}
            {hackathon.tags && hackathon.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {hackathon.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Button Box */}
          <div className="lg:w-72 bg-slate-50 p-5 rounded-2xl border border-slate-200/70 flex flex-col justify-center space-y-3">
            {isOrganizerOwner ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium text-center">You are hosting this hackathon</p>
                <Link
                  to={`/organizer/hackathons/${id}/manage`}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center shadow-sm cursor-pointer"
                >
                  Manage Hackathon
                </Link>
              </div>
            ) : isRegistered ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-center space-x-1.5 text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">You are Registered</span>
                </div>
                <Link
                  to={`/hackathons/${id}/team`}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center shadow-sm text-center"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" /> Team Workspace
                </Link>
                <Link
                  to={`/hackathons/${id}/submit`}
                  className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center shadow-xs text-center"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Submit Idea / Deck
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleRegister}
                  disabled={actionLoading || hackathon.status === 'COMPLETED'}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center justify-center shadow-md cursor-pointer transition-all"
                >
                  {actionLoading
                    ? 'Registering...'
                    : hackathon.status === 'COMPLETED'
                    ? 'Hackathon Closed'
                    : 'Register for Free'}
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Registration closes {formatDate(hackathon.registration_deadline)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Logistics Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Rules, Announcements */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-600" /> About This Hackathon
            </h2>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {hackathon.description || 'No description provided.'}
            </div>
          </div>

          {/* Rules */}
          {hackathon.rules && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" /> Rules & Guidelines
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                {hackathon.rules}
              </div>
            </div>
          )}

          {/* Announcements Section */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-sky-600" /> Live Announcements
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {announcements.length}
              </span>
            </div>

            {announcements.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No announcements have been broadcasted yet.
              </p>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.announcement_id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ann.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Key Logistics Details */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Key Event Details
            </h3>

            {/* Dates */}
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Event Duration</p>
                  <p className="font-semibold text-slate-800">
                    {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Registration Deadline</p>
                  <p className="font-semibold text-slate-800">
                    {formatDate(hackathon.registration_deadline)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Team Size Allowed</p>
                  <p className="font-semibold text-slate-800">
                    {hackathon.min_team_size} - {hackathon.max_team_size} Members
                  </p>
                </div>
              </div>

              {hackathon.prize_pool && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Prizes & Bounties</p>
                    <p className="font-semibold text-slate-800">{hackathon.prize_pool}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
