import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ideaService } from '../services/ideaService';
import { hackathonService } from '../services/hackathonService';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import {
  ClipboardCheck,
  Download,
  FileText,
  Code2,
  Video,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export default function EvaluateSubmissions() {
  const { id } = useParams();

  const [hackathon, setHackathons] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Formal Evaluation Modal State
  const [evaluatingSub, setEvaluatingSub] = useState(null);
  const [evalScore, setEvalScore] = useState('');
  const [evalComments, setEvalComments] = useState('');
  const [evalDecision, setEvalDecision] = useState('ACCEPTED');
  const [submittingEval, setSubmittingEval] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, sRes] = await Promise.all([
        hackathonService.getHackathonById(id),
        ideaService.getHackathonSubmissions(id),
      ]);
      setHackathons(hRes.data?.hackathon || hRes.data || null);
      setSubmissions(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.submissions || []));
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load submissions for evaluation.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleOpenEvalModal = (sub) => {
    setEvaluatingSub(sub);
    setEvalScore(sub.score || '');
    setEvalComments('');
    setEvalDecision(sub.submission_status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED');
  };

  const handleFormalEvaluate = async (e) => {
    e.preventDefault();
    if (!evaluatingSub) return;

    setSubmittingEval(true);
    try {
      await ideaService.evaluate(evaluatingSub.idea_id, {
        score: evalScore ? parseFloat(evalScore) : null,
        comments: evalComments.trim() || null,
        decision: evalDecision
      });

      setAlert({
        type: 'success',
        message: `Evaluation submitted for '${evaluatingSub.title}' (${evalDecision}).`
      });
      setEvaluatingSub(null);
      fetchData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to record evaluation.'
      });
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleStatusChange = async (ideaId, newStatus) => {
    setUpdatingId(ideaId);
    setAlert({ type: '', message: '' });
    try {
      await ideaService.updateIdeaStatus(ideaId, newStatus);
      setSubmissions((prev) =>
        prev.map((sub) => (sub.idea_id === ideaId ? { ...sub, status: newStatus, submission_status: newStatus } : sub))
      );
      setAlert({ type: 'success', message: `Submission status updated to ${newStatus}.` });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownload = async (file) => {
    setDownloadingId(file.file_id);
    try {
      await ideaService.downloadFile(file.file_id, file.file_original_name);
    } catch (err) {
      alert('Failed to download presentation file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredSubmissions =
    filterStatus === 'ALL'
      ? submissions
      : submissions.filter((s) => s.status === filterStatus);

  if (loading) {
    return <LoadingSpinner text="Loading submissions for judging..." fullScreen />;
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <Link
          to={`/organizer/hackathons/${id}/manage`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Hackathon Management
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
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Evaluation & Judging Queue
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {hackathon?.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review proposed solutions, download pitch decks, and grade submission outcomes.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="ALL">All ({submissions.length})</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <EmptyState
          title="No Submissions Found"
          description="There are currently no proposals matching this evaluation filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub.idea_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={sub.status} />
                    {sub.track && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {sub.track}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Submitted by: <strong className="text-slate-700">{sub.team_name || sub.leader_name || 'Solo'}</strong>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{sub.title}</h3>
                </div>

                {/* Status & Grade Action */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenEvalModal(sub)}
                    className="py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors cursor-pointer flex items-center"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Grade & Review
                  </button>
                  <select
                    value={sub.submission_status || sub.status}
                    disabled={updatingId === sub.idea_id}
                    onChange={(e) => handleStatusChange(sub.idea_id, e.target.value)}
                    className="py-1.5 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              {/* Abstract */}
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                {sub.abstract}
              </p>

              {/* Links & Files */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-3">
                  {sub.repository_url && (
                    <a
                      href={sub.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-indigo-600"
                    >
                      <Code2 className="w-3.5 h-3.5 mr-1" /> Repository
                      <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-60" />
                    </a>
                  )}

                  {sub.demo_url && (
                    <a
                      href={sub.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-sky-600 hover:text-sky-700"
                    >
                      <Video className="w-3.5 h-3.5 mr-1" /> Demo Video
                      <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-60" />
                    </a>
                  )}
                </div>

                {/* Attached Files & Version Info */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/ideas/${sub.idea_id}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    View Versions & Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formal Evaluation Modal */}
      {evaluatingSub && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Grade Submission: {evaluatingSub.title}
              </h3>
              <button
                onClick={() => setEvaluatingSub(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormalEvaluate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numerical Score (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={evalScore}
                  onChange={(e) => setEvalScore(e.target.value)}
                  placeholder="e.g. 92.5"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Decision Outcome *
                </label>
                <select
                  value={evalDecision}
                  onChange={(e) => setEvalDecision(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="ACCEPTED">ACCEPTED (Winner / Shortlist)</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jury Feedback & Comments
                </label>
                <textarea
                  rows={3}
                  value={evalComments}
                  onChange={(e) => setEvalComments(e.target.value)}
                  placeholder="Constructive feedback on technical execution, innovation, and presentation..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEvaluatingSub(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEval}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submittingEval ? 'Submitting...' : 'Save Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
