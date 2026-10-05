import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import {
  Shield,
  Users,
  Calendar,
  Lightbulb,
  HardDrive,
  Database,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getAdminStats();
        setStats(res.data?.stats || res.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load system admin statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Querying database system metrics..." fullScreen />;
  }

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-purple-400/30">
            <Shield className="w-3.5 h-3.5" />
            <span>DBMS System Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            HackHub System Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time telemetry, storage metrics, and relational aggregate statistics across MySQL 8.4.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Top Level Aggregate Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Total Users',
            val: stats?.total_users ?? 0,
            sub: `${stats?.role_breakdown?.PARTICIPANT ?? 0} Students`,
            icon: Users,
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            label: 'Hackathons',
            val: stats?.total_hackathons ?? 0,
            sub: `${stats?.status_breakdown?.UPCOMING ?? 0} Upcoming`,
            icon: Calendar,
            color: 'text-sky-600 bg-sky-50',
          },
          {
            label: 'Registered Teams',
            val: stats?.total_teams ?? 0,
            sub: 'Collaborating',
            icon: Layers,
            color: 'text-amber-600 bg-amber-50',
          },
          {
            label: 'Submissions',
            val: stats?.total_submissions ?? 0,
            sub: `${stats?.submission_status_breakdown?.ACCEPTED ?? 0} Accepted`,
            icon: Lightbulb,
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            label: 'Storage Used',
            val: `${stats?.storage_used_mb ?? '0.00'} MB`,
            sub: `${stats?.total_files ?? 0} Files`,
            icon: HardDrive,
            color: 'text-purple-600 bg-purple-50',
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{item.label}</span>
              <div className={`p-2 rounded-xl ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{item.val}</p>
              <p className="text-[11px] text-slate-400 font-medium">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Relational Breakdown Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Role Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Users className="w-4 h-4 mr-2 text-indigo-600" /> User Role Distribution
          </h3>
          <div className="space-y-3">
            {[
              { role: 'PARTICIPANT', count: stats?.role_breakdown?.PARTICIPANT ?? 0, color: 'bg-indigo-600' },
              { role: 'ORGANIZER', count: stats?.role_breakdown?.ORGANIZER ?? 0, color: 'bg-amber-500' },
              { role: 'ADMIN', count: stats?.role_breakdown?.ADMIN ?? 0, color: 'bg-purple-600' },
            ].map((r) => (
              <div key={r.role} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{r.role}</span>
                  <span className="text-slate-900">{r.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${r.color} h-2 rounded-full`}
                    style={{
                      width: `${
                        stats?.total_users
                          ? Math.round((r.count / stats.total_users) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hackathon Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-sky-600" /> Hackathon Lifecycle
          </h3>
          <div className="space-y-3">
            {[
              { status: 'UPCOMING', count: stats?.status_breakdown?.UPCOMING ?? 0, color: 'bg-indigo-600' },
              { status: 'ONGOING', count: stats?.status_breakdown?.ONGOING ?? 0, color: 'bg-emerald-500' },
              { status: 'COMPLETED', count: stats?.status_breakdown?.COMPLETED ?? 0, color: 'bg-slate-400' },
            ].map((s) => (
              <div key={s.status} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{s.status}</span>
                  <span className="text-slate-900">{s.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${s.color} h-2 rounded-full`}
                    style={{
                      width: `${
                        stats?.total_hackathons
                          ? Math.round((s.count / stats.total_hackathons) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Review Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Submission Verdicts
          </h3>
          <div className="space-y-3">
            {[
              { status: 'PENDING', count: stats?.submission_status_breakdown?.PENDING ?? 0, color: 'bg-slate-400' },
              { status: 'UNDER_REVIEW', count: stats?.submission_status_breakdown?.UNDER_REVIEW ?? 0, color: 'bg-amber-500' },
              { status: 'ACCEPTED', count: stats?.submission_status_breakdown?.ACCEPTED ?? 0, color: 'bg-emerald-500' },
              { status: 'REJECTED', count: stats?.submission_status_breakdown?.REJECTED ?? 0, color: 'bg-rose-500' },
            ].map((v) => (
              <div key={v.status} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{v.status}</span>
                  <span className="text-slate-900">{v.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${v.color} h-2 rounded-full`}
                    style={{
                      width: `${
                        stats?.total_submissions
                          ? Math.round((v.count / stats.total_submissions) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Relational Database Engine Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Relational Database Engine</h4>
            <p className="text-xs text-slate-500">
              MySQL 8.4 Server • InnoDB Storage Engine • Normalized to 3NF
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700">Healthy & Connected</span>
        </div>
      </div>
    </div>
  );
}
