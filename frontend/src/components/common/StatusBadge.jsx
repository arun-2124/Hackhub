import React from 'react';

const statusConfig = {
  // Hackathon statuses
  UPCOMING: {
    bg: 'bg-blue-950/70 text-blue-400 border-blue-800',
    dot: 'bg-blue-400',
    label: 'Upcoming'
  },
  ONGOING: {
    bg: 'bg-emerald-950/70 text-emerald-400 border-emerald-800',
    dot: 'bg-emerald-400 animate-pulse',
    label: 'Ongoing'
  },
  COMPLETED: {
    bg: 'bg-slate-800 text-slate-400 border-slate-700',
    dot: 'bg-slate-400',
    label: 'Completed'
  },
  CANCELLED: {
    bg: 'bg-rose-950/70 text-rose-400 border-rose-800',
    dot: 'bg-rose-400',
    label: 'Cancelled'
  },

  // Idea submission statuses
  SUBMITTED: {
    bg: 'bg-amber-950/70 text-amber-400 border-amber-800',
    dot: 'bg-amber-400',
    label: 'Submitted'
  },
  UNDER_REVIEW: {
    bg: 'bg-indigo-950/70 text-indigo-400 border-indigo-800',
    dot: 'bg-indigo-400 animate-pulse',
    label: 'Under Review'
  },
  ACCEPTED: {
    bg: 'bg-emerald-950/70 text-emerald-400 border-emerald-800',
    dot: 'bg-emerald-400',
    label: 'Accepted'
  },
  REJECTED: {
    bg: 'bg-rose-950/70 text-rose-400 border-rose-800',
    dot: 'bg-rose-400',
    label: 'Rejected'
  },

  // User roles
  ADMIN: {
    bg: 'bg-purple-950/70 text-purple-400 border-purple-800',
    dot: 'bg-purple-400',
    label: 'Admin'
  },
  ORGANIZER: {
    bg: 'bg-cyan-950/70 text-cyan-400 border-cyan-800',
    dot: 'bg-cyan-400',
    label: 'Organizer'
  },
  PARTICIPANT: {
    bg: 'bg-indigo-950/70 text-indigo-400 border-indigo-800',
    dot: 'bg-indigo-400',
    label: 'Participant'
  },

  // Team roles
  LEADER: {
    bg: 'bg-amber-950/70 text-amber-400 border-amber-800',
    dot: 'bg-amber-400',
    label: 'Team Leader'
  },
  MEMBER: {
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
    label: 'Member'
  }
};

export default function StatusBadge({ status, size = 'sm' }) {
  if (!status) return null;
  const config = statusConfig[status] || {
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
    label: status
  };

  const sizeClasses = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full capitalize ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
