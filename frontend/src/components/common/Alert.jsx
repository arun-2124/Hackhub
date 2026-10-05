import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const alertConfig = {
  success: {
    bg: 'bg-emerald-950/60 border-emerald-800 text-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400'
  },
  error: {
    bg: 'bg-rose-950/60 border-rose-800 text-rose-200',
    icon: AlertCircle,
    iconColor: 'text-rose-400'
  },
  warning: {
    bg: 'bg-amber-950/60 border-amber-800 text-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-400'
  },
  info: {
    bg: 'bg-blue-950/60 border-blue-800 text-blue-200',
    icon: Info,
    iconColor: 'text-blue-400'
  }
};

export default function Alert({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null;
  const config = alertConfig[type] || alertConfig.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm backdrop-blur-sm ${config.bg} ${className}`}
      role="alert"
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors -mr-1 -mt-1 p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
