import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { Paperclip, Trophy, Users, User, ArrowRight, Code2 } from 'lucide-react';

export default function IdeaCard({ idea }) {
  const {
    idea_id,
    title,
    abstract,
    track,
    domain_track,
    tech_stack,
    demo_url,
    repository_url,
    repo_url,
    status,
    submission_status,
    hackathon_title,
    author_or_team,
    submitter_name,
    team_name,
    leader_name,
    attachments_count,
    files_count
  } = idea;

  const currentTrack = track || domain_track;
  const currentStatus = status || submission_status || 'PENDING';
  const stackList = tech_stack ? tech_stack.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const displayName = team_name || author_or_team || leader_name || submitter_name || 'Individual Hacker';
  const fileCount = attachments_count ?? files_count ?? (idea.files?.length || 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md group">
      <div className="space-y-3.5">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          {currentTrack ? (
            <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg">
              {currentTrack}
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg">
              Open Track
            </span>
          )}

          <StatusBadge status={currentStatus} size="xs" />
        </div>

        {/* Title & Hackathon */}
        <div>
          <Link to={`/ideas/${idea_id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
              {title}
            </h3>
          </Link>
          {hackathon_title && (
            <p className="text-xs text-indigo-600 font-medium flex items-center gap-1.5 truncate">
              <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              {hackathon_title}
            </p>
          )}
        </div>

        {/* Abstract */}
        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
          {abstract}
        </p>

        {/* Tech Stack Tags */}
        {stackList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {stackList.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] font-mono bg-slate-50 text-slate-600 rounded border border-slate-200"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            {team_name ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="font-semibold text-slate-700 truncate max-w-[140px]">
            {displayName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {fileCount > 0 && (
            <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
              <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
              {fileCount}
            </span>
          )}

          <Link
            to={`/ideas/${idea_id}`}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-600 text-slate-600 hover:text-white transition-colors"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
