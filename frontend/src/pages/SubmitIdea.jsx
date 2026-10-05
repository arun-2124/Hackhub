import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ideaService } from '../services/ideaService';
import { hackathonService } from '../services/hackathonService';
import { registrationService } from '../services/registrationService';
import { teamService } from '../services/teamService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import {
  Send,
  Upload,
  FileText,
  X,
  Users,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

export default function SubmitIdea() {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hackathon, setHackathons] = useState(null);
  const [team, setTeam] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState('Open Innovation');
  const [abstract, setAbstract] = useState('');
  const [techStack, setTechStack] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState(null);

  // State
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const tracks = [
    'Open Innovation',
    'AI/ML',
    'Healthcare & Biotech',
    'Web3 & Blockchain',
    'FinTech & Banking',
    'EdTech & Learning',
    'CyberSecurity',
    'Smart City & IoT',
  ];

  useEffect(() => {
    const checkEligibility = async () => {
      setLoading(true);
      try {
        const [hRes, regRes] = await Promise.all([
          hackathonService.getHackathonById(hackathonId),
          registrationService.getMyRegistrations(),
        ]);
        setHackathons(hRes.data?.hackathon || hRes.data || null);

        const regList = Array.isArray(regRes.data) ? regRes.data : (regRes.data?.registrations || regRes.registrations || []);
        const reg = regList.some(
          (r) => Number(r.hackathon_id) === Number(hackathonId)
        );
        setIsRegistered(reg);

        if (reg) {
          try {
            const teamRes = await teamService.getMyTeam(hackathonId);
            setTeam(teamRes.data?.team || teamRes.data || null);
          } catch (e) {
            setTeam(null);
          }
        }
      } catch (err) {
        console.error('Error verifying submission eligibility:', err);
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [hackathonId]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Check size <= 10MB
    if (selected.size > 10 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'File size exceeds maximum limit of 10MB.' });
      return;
    }

    // Check extension
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['pdf', 'ppt', 'pptx'].includes(ext)) {
      setAlert({ type: 'error', message: 'Only PDF and PPT/PPTX files are allowed.' });
      return;
    }

    setFile(selected);
    setAlert({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!title.trim() || !abstract.trim()) {
      setAlert({ type: 'error', message: 'Title and abstract are required.' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('hackathon_id', hackathonId);
      if (team?.team_id) {
        formData.append('team_id', team.team_id);
      }
      formData.append('title', title.trim());
      formData.append('track', track);
      formData.append('abstract', abstract.trim());
      if (techStack.trim()) formData.append('tech_stack', techStack.trim());
      if (repositoryUrl.trim()) formData.append('repository_url', repositoryUrl.trim());
      if (demoUrl.trim()) formData.append('demo_url', demoUrl.trim());
      formData.append('is_public', isPublic ? 'true' : 'false');

      if (file) {
        formData.append('file', file);
      }

      const res = await ideaService.submitIdea(formData);
      const newIdeaId = res.data?.idea?.idea_id || res.data?.idea_id;

      setAlert({ type: 'success', message: 'Project idea submitted successfully!' });
      setTimeout(() => {
        if (newIdeaId) {
          navigate(`/ideas/${newIdeaId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || err.response?.data?.message || 'Submission failed. Please check inputs and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Checking submission eligibility..." fullScreen />;
  }

  return (
    <div className="space-y-6 py-6 max-w-3xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to={`/hackathons/${hackathonId}`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Hackathon
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit Project Proposal
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Hackathon: <span className="font-semibold text-slate-800">{hackathon?.title}</span>
        </p>
      </div>

      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />
      )}

      {/* Roster & Eligibility Warning */}
      {!isRegistered ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-amber-900">Registration Required</h3>
          <p className="text-xs text-amber-700">
            You must be registered for this hackathon before pitching an idea.
          </p>
          <Link
            to={`/hackathons/${hackathonId}`}
            className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold"
          >
            Register Now
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Team Context Note */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-slate-600">
                Submitting as:{' '}
                <strong className="text-slate-900">
                  {team ? team.team_name : 'Individual Participant'}
                </strong>
              </span>
            </div>
            {!team && (
              <Link
                to={`/hackathons/${hackathonId}/team`}
                className="text-indigo-600 hover:underline font-semibold"
              >
                Join or Create a Team first?
              </Link>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MediVault - Decentralized EHR Records"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Track Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hackathon Track / Category *
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {tracks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Executive Abstract & Problem Statement *
              </label>
              <textarea
                required
                rows={4}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Explain the problem you are solving, target beneficiaries, architecture, and expected impact..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technology Stack (comma-separated)
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="e.g. React, Node.js, Express, MySQL 8.4, Docker"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub / Code Repository URL
                </label>
                <input
                  type="url"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Live Demo / Video URL
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://youtu.be/demo"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* File Upload (PPT/PDF) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attach Pitch Deck / Research Paper (.PDF, .PPT, .PPTX, Max 10MB)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-indigo-400 transition-colors">
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  <div className="flex text-xs text-slate-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
                      <span>Upload a presentation</span>
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-[11px] text-slate-400">PDF, PPT, PPTX up to 10MB</p>
                </div>
              </div>

              {file && (
                <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-indigo-900">{file.name}</span>
                    <span className="text-slate-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Public Showcase Toggle */}
            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="isPublicToggle"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="isPublicToggle" className="text-xs text-slate-700 cursor-pointer">
                <strong>Feature in Public Ideas Showcase</strong> (Allow other participants and recruiters to discover your project)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center"
            >
              {submitting ? (
                'Submitting Idea & Uploading Files...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Submit Project Idea
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
