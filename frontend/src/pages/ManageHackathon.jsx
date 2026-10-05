import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hackathonService } from '../services/hackathonService';
import { announcementService } from '../services/announcementService';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import {
  Users,
  Bell,
  Send,
  Trash2,
  ClipboardCheck,
  Edit,
  ArrowLeft,
  Mail,
  School,
  Phone,
  Calendar,
} from 'lucide-react';

export default function ManageHackathon() {
  const { id } = useParams();

  const [hackathon, setHackathons] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'participants'
  const [loading, setLoading] = useState(true);

  // New announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [postingAnn, setPostingAnn] = useState(false);

  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, pRes, aRes] = await Promise.all([
        hackathonService.getHackathonById(id),
        hackathonService.getHackathonParticipants(id),
        announcementService.getHackathonAnnouncements(id),
      ]);
      setHackathons(hRes.data?.hackathon || hRes.data || null);
      setParticipants(Array.isArray(pRes.data) ? pRes.data : (pRes.data?.participants || []));
      setAnnouncements(Array.isArray(aRes.data) ? aRes.data : (aRes.data?.announcements || []));
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load hackathon management data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    setPostingAnn(true);
    setAlert({ type: '', message: '' });
    try {
      await announcementService.createAnnouncement({
        hackathon_id: Number(id),
        title: annTitle.trim(),
        content: annContent.trim(),
      });
      setAlert({ type: 'success', message: 'Announcement broadcasted successfully!' });
      setAnnTitle('');
      setAnnContent('');
      // Refresh announcements
      const aRes = await announcementService.getHackathonAnnouncements(id);
      setAnnouncements(Array.isArray(aRes.data) ? aRes.data : (aRes.data?.announcements || []));
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to post announcement.',
      });
    } finally {
      setPostingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm('Delete this announcement?')) return;

    try {
      await announcementService.deleteAnnouncement(annId);
      setAlert({ type: 'success', message: 'Announcement removed.' });
      setAnnouncements((prev) => prev.filter((a) => a.announcement_id !== annId));
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete announcement.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading hackathon management console..." fullScreen />;
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <Link
          to="/organizer/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Organizer Dashboard
        </Link>
      </div>

      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <StatusBadge status={hackathon?.status} size="sm" />
            <span className="text-xs text-slate-400">
              {new Date(hackathon?.start_date).toLocaleDateString()} -{' '}
              {new Date(hackathon?.end_date).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {hackathon?.title}
          </h1>
          <p className="text-xs text-slate-500">
            Theme: <strong className="text-slate-700">{hackathon?.theme || 'General'}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to={`/organizer/hackathons/${id}/evaluate`}
            className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <ClipboardCheck className="w-4 h-4 mr-1.5" /> Evaluate Submissions
          </Link>

          <Link
            to={`/organizer/hackathons/${id}/edit`}
            className="inline-flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`py-3 px-5 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'announcements'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Broadcast Announcements ({announcements.length})
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`py-3 px-5 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'participants'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Registered Participants ({participants.length})
        </button>
      </div>

      {/* Tab Content 1: Announcements */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Send className="w-4 h-4 mr-2 text-indigo-600" /> New Broadcast
            </h3>

            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Mentor Hours Updated / Room Allocations"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Announcement Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Write clear instructions, deadlines, or meeting links..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={postingAnn}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {postingAnn ? 'Broadcasting...' : 'Publish Announcement'}
              </button>
            </form>
          </div>

          {/* Past Announcements Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Live Announcements Feed ({announcements.length})
            </h3>

            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No announcements broadcasted yet. Send an update to all registered students!
              </p>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.announcement_id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-400">
                          {new Date(ann.created_at).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.announcement_id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity cursor-pointer"
                          title="Delete Announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: Participants */}
      {activeTab === 'participants' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Registered Participants ({participants.length})
            </h3>
          </div>

          {participants.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No participants have registered for this hackathon yet.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {participants.map((p) => (
                    <tr key={p.registration_id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.full_name}</td>
                      <td className="py-3 px-4 text-slate-600">{p.email}</td>
                      <td className="py-3 px-4 text-slate-500">{p.college_name || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-500">{p.phone_number || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(p.registration_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
