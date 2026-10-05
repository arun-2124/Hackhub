import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { hackathonService } from '../services/hackathonService';
import Alert from '../components/common/Alert';
import { Calendar, PlusCircle, ArrowLeft, Layers, Trophy, Users, ShieldAlert } from 'lucide-react';

export default function CreateHackathon() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    description: '',
    rules: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    min_team_size: 1,
    max_team_size: 4,
    prize_pool: '',
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    hackathonService.getTags()
      .then((res) => {
        const tagList = Array.isArray(res.data) ? res.data : (res.data?.tags || res.tags || []);
        setAvailableTags(tagList);
      })
      .catch((err) => console.error('Failed to load tags:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    // Validation
    const regDeadline = new Date(formData.registration_deadline);
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (startDate >= endDate) {
      setAlert({ type: 'error', message: 'End date must be strictly after the start date.' });
      return;
    }

    if (regDeadline > startDate) {
      setAlert({ type: 'error', message: 'Registration deadline cannot be after the hackathon start date.' });
      return;
    }

    if (Number(formData.min_team_size) > Number(formData.max_team_size)) {
      setAlert({ type: 'error', message: 'Min team size cannot exceed max team size.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        min_team_size: Number(formData.min_team_size),
        max_team_size: Number(formData.max_team_size),
        tag_ids: selectedTagIds,
        tags: selectedTagIds,
      };

      const res = await hackathonService.createHackathon(payload);
      setAlert({ type: 'success', message: 'Hackathon created successfully!' });
      setTimeout(() => {
        navigate('/organizer/dashboard');
      }, 1500);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create hackathon. Please verify inputs.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-3xl mx-auto">
      <div>
        <Link
          to="/organizer/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Organizer Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Host a New Hackathon
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Publish details, rules, registration windows, and invite student developers.
        </p>
      </div>

      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Hackathon Title *
          </label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. InnovateX 2026 - National Tech Sprint"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Theme & Prize Pool */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Theme / Focus Area
            </label>
            <input
              type="text"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              placeholder="e.g. AI for Social Good, Sustainable Urbanism"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prize Pool & Bounties
            </label>
            <input
              type="text"
              name="prize_pool"
              value={formData.prize_pool}
              onChange={handleChange}
              placeholder="e.g. $10,000 + Cloud Grants"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description & Overview *
          </label>
          <textarea
            required
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the competition, judging criteria, problem statements..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
          />
        </div>

        {/* Rules */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Rules & Code of Conduct
          </label>
          <textarea
            rows={3}
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            placeholder="Official rules, plagiarism policy, submission formats..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
          />
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registration Deadline *
            </label>
            <input
              type="date"
              required
              name="registration_deadline"
              value={formData.registration_deadline}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              required
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Team Sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Team Size *
            </label>
            <input
              type="number"
              min={1}
              max={10}
              required
              name="min_team_size"
              value={formData.min_team_size}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maximum Team Size *
            </label>
            <input
              type="number"
              min={1}
              max={10}
              required
              name="max_team_size"
              value={formData.max_team_size}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tags Selection */}
        {availableTags.length > 0 && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Select Categories / Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.tag_id);
                return (
                  <button
                    key={tag.tag_id}
                    type="button"
                    onClick={() => handleTagToggle(tag.tag_id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    #{tag.tag_name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          {loading ? 'Creating Hackathon...' : 'Publish Hackathon'}
        </button>
      </form>
    </div>
  );
}
