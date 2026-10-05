import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { Calendar, Users, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function HackathonCard({ hackathon }) {
  const {
    hackathon_id,
    title,
    description,
    banner_image,
    start_date,
    end_date,
    registration_deadline,
    min_team_size,
    max_team_size,
    status,
    location,
    registered_count,
    tags
  } = hackathon;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const defaultBanner =
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-slate-700 overflow-hidden shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col">
      {/* Banner & Status Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={banner_image || defaultBanner}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            e.target.src = defaultBanner;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

        <div className="absolute top-3 left-3">
          <StatusBadge status={status} />
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            {registered_count || 0} registered
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            {location || 'Online'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {tags &&
              tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-medium bg-indigo-950/50 text-indigo-300 rounded-md border border-indigo-900/50"
                >
                  {tag}
                </span>
              ))}
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1.5">
            {title}
          </h3>

          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Schedule & Team Bounds */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Event Dates
            </span>
            <span className="font-medium text-slate-200">
              {formatDate(start_date)} - {formatDate(end_date)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Register By
            </span>
            <span className="font-medium text-amber-300">
              {formatDate(registration_deadline)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Team Size
            </span>
            <span className="font-medium text-slate-200">
              {min_team_size === max_team_size
                ? `${min_team_size} Members`
                : `${min_team_size} - ${max_team_size} Members`}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/hackathons/${hackathon_id}`}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 group-hover:shadow-md group-hover:shadow-indigo-600/20"
        >
          <span>View Hackathon</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
