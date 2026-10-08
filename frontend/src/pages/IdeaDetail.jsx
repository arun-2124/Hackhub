import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ideaService } from '../services/ideaService';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import {
  Lightbulb,
  FileText,
  Download,
  Code2,
  Video,
  Layers,
  Users,
  Calendar,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function IdeaDetail() {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIdea = async () => {
      setLoading(true);
      try {
        const res = await ideaService.getIdeaById(id);
        setIdea(res.data?.idea || res.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load idea details.');
      } finally {
        setLoading(false);
      }
    };
    fetchIdea();
  }, [id]);

  const handleDownload = async (file) => {
    setDownloadingId(file.file_id);
    try {
      await ideaService.downloadFile(file.file_id, file.file_original_name);
    } catch (err) {
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return <LoadingSpinner text="Loading project details..." fullScreen />;
  }

  if (error || !idea) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-800">Idea Unavailable</h2>
        <p className="text-slate-500 mt-2">
          {error || 'This project idea does not exist or is marked private.'}
        </p>
        <Link to="/ideas" className="mt-4 inline-flex items-center text-indigo-600 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Public Ideas
        </Link>
      </div>
    );
  }

  const techStackList = idea.tech_stack
    ? idea.tech_stack.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-8 py-6">
      {/* Back button */}
      <div>
        <Link
          to="/ideas"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to all public ideas
        </Link>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        {/* Top Badges & Title */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={idea.status} />
              {idea.track && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                  {idea.track}
                </span>
              )}
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                idea.is_public ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {idea.is_public ? 'Public Showcase' : 'Private Submission'}
              </span>
            </div>

            <span className="text-xs text-slate-400">
              Submitted on {new Date(idea.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {idea.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
            {idea.hackathon_title && (
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                Submitted for:{' '}
                <Link
                  to={`/hackathons/${idea.hackathon_id}`}
                  className="ml-1 text-indigo-600 hover:underline font-medium"
                >
                  {idea.hackathon_title}
                </Link>
              </span>
            )}

            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-slate-400" />
              By: <strong className="ml-1 text-slate-700">{idea.team_name || idea.leader_name || 'Individual Hacker'}</strong>
            </span>
          </div>
        </div>

        {/* Abstract */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-amber-500" /> Executive Abstract
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {idea.abstract}
          </p>
        </div>

        {/* Tech Stack */}
        {techStackList.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-indigo-600" /> Technology Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStackList.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links: Repo & Demo */}
        <div className="flex flex-wrap gap-4 pt-2">
          {idea.repository_url && (
            <a
              href={idea.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Code2 className="w-4 h-4 mr-2" /> View GitHub Repository
              <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
            </a>
          )}
          {idea.demo_url && (
            <a
              href={idea.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4 mr-2" /> Live Demo Video
              <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
            </a>
          )}
        </div>

        {/* Attached Files & Version History Section */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-indigo-600" /> Attached Pitch Deck & Version History
            </h3>
            {idea.files && idea.files.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {idea.files.length} {idea.files.length === 1 ? 'version' : 'versions'}
              </span>
            )}
          </div>

          {idea.files && idea.files.length > 0 ? (
            <div className="overflow-hidden border border-slate-200 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left">Version</th>
                    <th scope="col" className="px-4 py-3 text-left">File Name</th>
                    <th scope="col" className="px-4 py-3 text-left">Format & Size</th>
                    <th scope="col" className="px-4 py-3 text-left">Uploaded By</th>
                    <th scope="col" className="px-4 py-3 text-left">Date</th>
                    <th scope="col" className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {idea.files.map((file) => (
                    <tr key={file.file_id} className={file.is_current ? 'bg-indigo-50/30' : 'hover:bg-slate-50/60'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">v{file.version_no || 1}</span>
                          {file.is_current ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
                              Current
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full">
                              Previous
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate font-medium text-slate-800" title={file.original_name}>
                        {file.original_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {file.file_type?.toUpperCase()} • {formatFileSize(file.file_size_bytes)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {file.uploaded_by_name || 'Team Submitter'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                        {new Date(file.uploaded_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDownload(file)}
                          disabled={downloadingId === file.file_id}
                          className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No presentation deck or files attached to this idea.</p>
          )}
        </div>

        {/* Formal Evaluations Section (Visible to Organizers/Admins) */}
        {idea.evaluations && idea.evaluations.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" /> Official Jury Evaluations
            </h3>
            <div className="space-y-3">
              {idea.evaluations.map((ev) => (
                <div key={ev.evaluation_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{ev.evaluator_name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        ev.decision === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                        ev.decision === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ev.decision}
                      </span>
                    </div>
                    {ev.score !== null && (
                      <span className="text-sm font-extrabold text-indigo-700">
                        Score: {ev.score}/100
                      </span>
                    )}
                  </div>
                  {ev.comments && (
                    <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-100">
                      "{ev.comments}"
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Evaluated on {new Date(ev.evaluated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
