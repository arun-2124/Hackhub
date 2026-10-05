import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { hackathonService } from '../services/hackathonService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import {
  Users,
  Copy,
  Check,
  UserPlus,
  Crown,
  LogOut,
  Trash2,
  Send,
  Calendar,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';

export default function TeamWorkspace() {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hackathon, setHackathons] = useState(null);
  const [team, setTeam] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [createTeamName, setCreateTeamName] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // UI state
  const [copied, setCopied] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Check hackathon info
      const hRes = await hackathonService.getHackathonById(hackathonId);
      setHackathons(hRes.data?.hackathon || null);

      // 2. Check registration
      const regRes = await registrationService.getMyRegistrations();
      const reg = regRes.data?.registrations?.some(
        (r) => Number(r.hackathon_id) === Number(hackathonId)
      );
      setIsRegistered(reg);

      if (reg) {
        // 3. Check if user already has a team
        try {
          const teamRes = await teamService.getMyTeam(hackathonId);
          setTeam(teamRes.data?.team || null);
        } catch (e) {
          // 404 means no team yet, which is expected
          setTeam(null);
        }
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load team workspace data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hackathonId) {
      fetchData();
    }
  }, [hackathonId]);

  const handleCopyCode = () => {
    if (team?.invite_code) {
      navigator.clipboard.writeText(team.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!createTeamName.trim()) return;

    setFormLoading(true);
    setAlert({ type: '', message: '' });
    try {
      const res = await teamService.createTeam({
        hackathon_id: Number(hackathonId),
        team_name: createTeamName.trim(),
      });
      setAlert({ type: 'success', message: 'Team created successfully!' });
      setCreateTeamName('');
      await fetchData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create team. Ensure team name is unique.',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinInviteCode.trim()) return;

    setFormLoading(true);
    setAlert({ type: '', message: '' });
    try {
      await teamService.joinTeam({
        invite_code: joinInviteCode.trim().toUpperCase(),
      });
      setAlert({ type: 'success', message: 'Joined team successfully!' });
      setJoinInviteCode('');
      await fetchData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to join team. Invalid code or team is full.',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;

    setFormLoading(true);
    try {
      await teamService.leaveTeam(team.team_id);
      setAlert({ type: 'success', message: 'You have left the team.' });
      await fetchData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to leave team.',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveMember = async (memberUserId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;

    setFormLoading(true);
    try {
      await teamService.removeTeamMember(team.team_id, memberUserId);
      setAlert({ type: 'success', message: `${memberName} has been removed from the team.` });
      await fetchData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to remove member.',
      });
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading workspace..." fullScreen />;
  }

  const isLeader = team && Number(team.leader_id) === Number(user?.user_id);

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to={`/hackathons/${hackathonId}`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Hackathon Details
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Team Collaboration Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {hackathon?.title}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Allowed Team Size: {hackathon?.min_team_size} to {hackathon?.max_team_size} members
          </p>
        </div>

        {isRegistered && (
          <Link
            to={`/hackathons/${hackathonId}/submit`}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Send className="w-4 h-4 mr-2" /> Submit Idea / Pitch Deck
          </Link>
        )}
      </div>

      {/* Check if not registered */}
      {!isRegistered ? (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-8 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-amber-900">Registration Required</h2>
          <p className="text-sm text-amber-700 max-w-md mx-auto">
            Under DBMS integrity rules, you must be registered for this hackathon before creating or joining a team.
          </p>
          <Link
            to={`/hackathons/${hackathonId}`}
            className="inline-flex items-center px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-xs"
          >
            Register for Hackathon
          </Link>
        </div>
      ) : team ? (
        /* Team Workspace View */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-400">Team Name</p>
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center mt-0.5">
                  <Users className="w-6 h-6 mr-2 text-indigo-600" />
                  {team.team_name}
                </h2>
              </div>

              {/* Invite Code Box */}
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Invite Code
                  </span>
                  <span className="text-base font-mono font-bold tracking-wider text-slate-900">
                    {team.invite_code}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Copy Invite Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Members Roster Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Team Members ({team.members?.length || 1} / {hackathon?.max_team_size})
                </h3>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">College</th>
                      <th className="py-3 px-4">Role in Team</th>
                      <th className="py-3 px-4">Joined</th>
                      {isLeader && <th className="py-3 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                    {team.members?.map((m) => (
                      <tr key={m.user_id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {m.full_name} {m.user_id === user?.user_id && '(You)'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{m.college_name || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {m.role_in_team === 'LEADER' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Crown className="w-3 h-3 mr-1 text-amber-600" /> Leader
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                              Member
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(m.joined_at).toLocaleDateString()}
                        </td>
                        {isLeader && (
                          <td className="py-3 px-4 text-right">
                            {m.role_in_team !== 'LEADER' && (
                              <button
                                onClick={() => handleRemoveMember(m.user_id, m.full_name)}
                                className="text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                                title="Remove Member"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leave Team Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleLeaveTeam}
                disabled={formLoading}
                className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" /> Leave Team
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* No Team Yet: Create or Join */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Team Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Create a New Team</h3>
                <p className="text-xs text-slate-500">You will be designated as the Team Leader</p>
              </div>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={createTeamName}
                  onChange={(e) => setCreateTeamName(e.target.value)}
                  placeholder="e.g. Code Ninjas, CyberVanguard"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || !createTeamName.trim()}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {formLoading ? 'Creating...' : 'Create Team'}
              </button>
            </form>
          </div>

          {/* Join Team Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Join an Existing Team</h3>
                <p className="text-xs text-slate-500">Enter the 8-character code from your team leader</p>
              </div>
            </div>

            <form onSubmit={handleJoinTeam} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invite Code *
                </label>
                <input
                  type="text"
                  required
                  value={joinInviteCode}
                  onChange={(e) => setJoinInviteCode(e.target.value)}
                  placeholder="e.g. A1B2C3D4"
                  maxLength={16}
                  className="w-full px-3.5 py-2 font-mono uppercase tracking-wider border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || !joinInviteCode.trim()}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {formLoading ? 'Joining...' : 'Join Team'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
