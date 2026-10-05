import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hackathonService } from '../services/hackathonService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { ArrowLeft, Save, Calendar, Trophy, Users } from 'lucide-react';

export default function EditHackathon() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    description: '',
    rules: '',
    status: 'UPCOMING',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    min_team_size: 1,
    max_team_size: 4,
    prize_pool: '',
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const formatDateInput = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hRes, tagsRes] = await Promise.all([
          hackathonService.getHackathonById(id),
          hackathonService.getTags(),
        ]);

        const h = hRes.data?.hackathon || hRes.data;
        if (h) {
          setFormData({
            title: h.title || '',
            theme: h.theme || '',
            description: h.description || '',
            rules: h.rules || '',
            status: h.status || 'UPCOMING',
            start_date: formatDateInput(h.start_date),
            end_date: formatDateInput(h.end_date),
            registration_deadline: formatDateInput(h.registration_deadline),
            min_team_size: h.min_team_size || 1,
            max_team_size: h.max_team_size || 4,
            prize_pool: h.prize_pool || '',
          });

          // Match tags
          const tags = Array.isArray(tagsRes.data) ? tagsRes.data : (tagsRes.data?.tags || []);
          setAvailableTags(tags);
          if (h.tags && Array.isArray(h.tags)) {
            const matchedTagIds = tags
              .filter((t) => h.tags.includes(t.tag_name))
              .map((t) => t.tag_id);
            setSelectedTagIds(matchedTagIds);
          }
        }
      } catch (err) {
        setAlert({
          type: 'error',
          message: err.response?.data?.message || 'Failed to load hackathon for editing.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((i) => i !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    setSaving(true);
    try {
      const payload = {
        ...formData,
        min_team_size: Number(formData.min_team_size),
        max_team_size: Number(formData.max_team_size),
        tag_ids: selectedTagIds,
        tags: selectedTagIds,
      };

      await hackathonService.updateHackathon(id, payload);
      setAlert({ type: 'success', message: 'Hackathon updated successfully!' });
      setTimeout(() => {
        navigate(`/organizer/hackathons/${id}/manage`);
      }, 1200);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update hackathon.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading hackathon details..." fullScreen />;
  }

  return (
    <div className="space-y-6 py-6 max-w-3xl mx-auto">
      <div>
        <Link
          to={`/organizer/hackathons/${id}/manage`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Hackathon Management
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Hackathon
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Modify event schedule, rules, tags, and competition status.
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
        {/* Title & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hackathon Title *
            </label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="UPCOMING">UPCOMING</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
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
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
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
              Categories / Tags
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
          disabled={saving}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving Changes...' : 'Update Hackathon'}
        </button>
      </form>
    </div>
  );
}
