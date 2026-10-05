import React from 'react';
import { Database, Code2, Server, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">HackHub</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A comprehensive Hackathon Management & Idea Sharing Platform built as a robust full-stack DBMS project. Demonstrating normalized 3NF relational schemas, transactions, RBAC, and document metadata storage.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-indigo-400" /> MySQL 8.4 (InnoDB)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-cyan-400" /> Node.js / Express
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" /> React / Tailwind
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/hackathons" className="hover:text-white transition-colors">
                  Upcoming Hackathons
                </a>
              </li>
              <li>
                <a href="/ideas" className="hover:text-white transition-colors">
                  Public Project Ideas
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-colors">
                  Participant Login
                </a>
              </li>
              <li>
                <a href="/register" className="hover:text-white transition-colors">
                  Create an Account
                </a>
              </li>
            </ul>
          </div>

          {/* DBMS Architecture Details */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              DBMS Features
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• 10 Normalized 3NF Tables</li>
              <li>• ACID Multi-Table Transactions</li>
              <li>• Foreign Key Cascades & Checks</li>
              <li>• Row Locking (FOR UPDATE)</li>
              <li>• PPT/PDF Filesystem Metadata</li>
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HackHub Platform. Developed for College DBMS Project Evaluation.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for developers & organizers.
          </p>
        </div>
      </div>
    </footer>
  );
}
