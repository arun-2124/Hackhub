import React from 'react';
import { FolderSearch } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records matching your criteria.',
  icon: Icon = FolderSearch,
  actionButton = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800 backdrop-blur-sm">
      <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionButton}
    </div>
  );
}
