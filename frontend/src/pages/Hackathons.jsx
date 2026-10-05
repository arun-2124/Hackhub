import React, { useState, useEffect } from 'react';
import { hackathonService } from '../services/hackathonService';
import HackathonCard from '../components/hackathon/HackathonCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, Calendar, Tag as TagIcon, X } from 'lucide-react';

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    // Fetch tags
    hackathonService.getTags()
      .then((res) => setTags(res.data?.tags || []))
      .catch((err) => console.error('Failed to load tags:', err));
  }, []);

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (status !== 'ALL') params.status = status;
        if (selectedTag) params.tag = selectedTag;

        const res = await hackathonService.getHackathons(params);
        setHackathons(res.data?.hackathons || []);
      } catch (err) {
        console.error('Failed to load hackathons:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchHackathons();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, status, selectedTag]);

  const clearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setSelectedTag('');
  };

  const hasActiveFilters = search || status !== 'ALL' || selectedTag;

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Hackathons
        </h1>
        <p className="mt-1 text-slate-500 text-sm">
          Discover hackathons, find your team, and build groundbreaking software solutions.
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
              placeholder="Search hackathons by title, theme, description..."
              className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Tag Selector */}
          <div className="w-full md:w-64 relative">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Categories & Tags</option>
              {tags.map((t) => (
                <option key={t.tag_id} value={t.tag_name}>
                  {t.tag_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'All Hackathons' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'ONGOING', label: 'Ongoing' },
              { id: 'COMPLETED', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  status === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <LoadingSpinner text="Searching hackathons..." />
      ) : hackathons.length === 0 ? (
        <EmptyState
          title="No hackathons found"
          description="We couldn't find any hackathons matching your criteria. Try adjusting your search or filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Showing {hackathons.length} {hackathons.length === 1 ? 'hackathon' : 'hackathons'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => (
              <HackathonCard key={hackathon.hackathon_id} hackathon={hackathon} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
