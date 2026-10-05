import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { Calendar, Users, MapPin, Clock, ArrowRight, ExternalLink, Globe } from 'lucide-react';

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

  // Parse external source if embedded in description
  const sourceMatch = description ? description.match(/\[Source:\s*([^\s|]+)\s*\|\s*([^\]]+)\]/) : null;
  const isExternal = Boolean(sourceMatch);
  const sourcePlatform = sourceMatch ? sourceMatch[1] : null;
  const sourceUrl = sourceMatch ? sourceMatch[2] : null;
  const cleanDescription = description ? description.replace(/\[Source:[^\]]+\]/g, '').trim() : '';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Top Media & Badges */}
      <div>
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={banner_image || defaultBanner}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = defaultBanner;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            <StatusBadge status={status} />
            {isExternal ? (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-md shadow-xs flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                {sourcePlatform}
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-600/90 text-white rounded-md shadow-xs">
                HackHub Native
              </span>
            )}
          </div>

          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white bg-slate-900/70 backdrop-blur-xs px-2.5 py-1 rounded-lg">
            <span className="flex items-center gap-1 text-[11px] font-medium">
              <Users className="w-3 h-3 text-indigo-300" />
              {registered_count || 0} registered
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium truncate max-w-[150px]">
              <MapPin className="w-3 h-3 text-sky-300 shrink-0" />
              <span className="truncate">{location || 'Online'}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tags &&
              tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100"
                >
                  #{typeof tag === 'object' ? tag.tag_name : tag}
                </span>
              ))}
          </div>

          <div>
            <Link to={`/hackathons/${hackathon_id}`}>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {title}
              </h3>
            </Link>
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {cleanDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Logistics & Actions */}
      <div className="p-5 pt-0 space-y-3">
        <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Dates
            </span>
            <span className="font-semibold text-slate-800">
              {formatDate(start_date)} - {formatDate(end_date)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Deadline
            </span>
            <span className="font-semibold text-amber-700">
              {formatDate(registration_deadline)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Users className="w-3.5 h-3.5 text-sky-500" />
              Team Size
            </span>
            <span className="font-semibold text-slate-800">
              {min_team_size === max_team_size
                ? `${min_team_size} Members`
                : `${min_team_size} - ${max_team_size} Members`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            to={`/hackathons/${hackathon_id}`}
            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs text-center transition-colors shadow-xs"
          >
            View & Register
          </Link>
          {isExternal && sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors"
              title={`View on ${sourcePlatform}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
