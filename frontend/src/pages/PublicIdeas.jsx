import React, { useState, useEffect } from 'react';
import { ideaService } from '../services/ideaService';
import IdeaCard from '../components/idea/IdeaCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Search, Lightbulb, X, Filter } from 'lucide-react';

export default function PublicIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [track, setTrack] = useState('');

  const tracks = [
    'AI/ML',
    'Healthcare & Biotech',
    'Web3 & Blockchain',
    'FinTech & Banking',
    'EdTech & Learning',
    'CyberSecurity',
    'Smart City & IoT',
    'Open Innovation',
  ];

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (track) params.track = track;

        const res = await ideaService.getPublicIdeas(params);
        setIdeas(res.data?.ideas || []);
      } catch (err) {
        console.error('Failed to load public ideas:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchIdeas();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, track]);

  const clearFilters = () => {
    setSearch('');
    setTrack('');
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Public Project Ideas
        </h1>
        <p className="mt-1 text-slate-500 text-sm">
          Browse innovative proposals, pitch decks, and technical architectures shared openly by student teams.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ideas by title, abstract, tech stack..."
              className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Track Selector */}
          <div className="w-full md:w-64 relative">
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Tracks & Domains</option>
              {tracks.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(search || track) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Filters applied</span>
            <button
              onClick={clearFilters}
              className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Searching ideas..." />
      ) : ideas.length === 0 ? (
        <EmptyState
          title="No public ideas found"
          description="We couldn't find any public project ideas matching your query."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Showing {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <IdeaCard key={idea.idea_id} idea={idea} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
