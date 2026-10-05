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
        setIdea(res.data?.idea || null);
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

        {/* Attached Files Section */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-indigo-600" /> Attached Pitch Deck & Documentation
          </h3>

          {idea.files && idea.files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {idea.files.map((file) => (
                <div
                  key={file.file_id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 truncate" title={file.file_original_name}>
                        {file.file_original_name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {file.file_type?.toUpperCase()} • {formatFileSize(file.file_size)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(file)}
                    disabled={downloadingId === file.file_id}
                    className="ml-3 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No presentation deck or files attached to this idea.</p>
          )}
        </div>
      </div>
    </div>
  );
}
