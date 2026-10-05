import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hackathonService } from '../services/hackathonService';
import { ideaService } from '../services/ideaService';
import HackathonCard from '../components/hackathon/HackathonCard';
import IdeaCard from '../components/idea/IdeaCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Rocket, Lightbulb, Users, Calendar, Award, ArrowRight, CheckCircle2, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function Home() {
  const [hackathons, setHackathons] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hackRes, ideaRes] = await Promise.all([
          hackathonService.getHackathons({ limit: 3 }),
          ideaService.getPublicIdeas({ limit: 3 }),
        ]);
        const hackList = Array.isArray(hackRes.data) ? hackRes.data : (hackRes.data?.hackathons || hackRes.hackathons || []);
        const ideaList = Array.isArray(ideaRes.data) ? ideaRes.data : (ideaRes.data?.ideas || ideaRes.ideas || []);
        setHackathons(hackList);
        setIdeas(ideaList);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white px-6 py-16 sm:px-12 sm:py-24 shadow-2xl shadow-indigo-950/20">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 border border-indigo-400/30">
            <Rocket className="w-3.5 h-3.5" />
            <span>Next-Gen Hackathon Management</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Discover Hackathons. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-teal-300">
              Form Teams. Pitch Ideas.
            </span>
          </h1>
          <p className="mt-6 text-lg text-indigo-100 max-w-2xl font-normal leading-relaxed">
            HackHub is a complete relational DBMS platform empowering college students and organizers to manage hackathons end-to-end: verified team registrations, PPT/PDF proposal submissions, and real-time broadcasts.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/hackathons"
              className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white text-indigo-900 font-semibold text-sm hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              Explore Hackathons
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              to="/ideas"
              className="inline-flex items-center px-6 py-3.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-sm transition-all border border-indigo-500/30 cursor-pointer"
            >
              Browse Public Ideas
            </Link>
          </div>
        </div>

        {/* Decorative Grid BG */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Featured Hackathons', val: '6+', icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Active Students', val: '500+', icon: Users, color: 'text-sky-600 bg-sky-50' },
          { label: 'Innovations Pitched', val: '100+', icon: Lightbulb, color: 'text-amber-600 bg-amber-50' },
          { label: 'Cash & Grants', val: '$50K+', icon: Award, color: 'text-emerald-600 bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Upcoming Hackathons Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Upcoming Hackathons</h2>
            <p className="text-sm text-slate-500">Discover and register for cutting-edge collegiate competitions</p>
          </div>
          <Link
            to="/hackathons"
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View All ({hackathons.length}+) <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading hackathons..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => (
              <HackathonCard key={hackathon.hackathon_id} hackathon={hackathon} />
            ))}
          </div>
        )}
      </section>

      {/* Features Showcase */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Built for Serious Hackers & Organizers
          </h2>
          <p className="mt-3 text-slate-600 text-sm">
            Everything your campus community needs to streamline hackathon logistics, from registration to evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Team Formation & Workspace</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Create teams with unique invite codes, assign leadership roles, and collaborate strictly within verified hackathon roster constraints.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">PPT & PDF Submissions</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Securely upload presentation decks and research abstracts up to 10MB with automated MIME validation and disk storage.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">3NF Normalized Relational DB</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Rock-solid integrity backed by MySQL 8.4 engine constraints, composite foreign keys, cascades, and atomic transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Public Ideas Showcase */}
      {ideas.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Public Idea Showcase</h2>
              <p className="text-sm text-slate-500">Explore open proposals, research abstracts, and peer projects</p>
            </div>
            <Link
              to="/ideas"
              className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Browse All Ideas <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <IdeaCard key={idea.idea_id} idea={idea} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="rounded-3xl bg-indigo-600 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between shadow-xl">
        <div className="mb-6 md:mb-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to launch your hackathon?</h2>
          <p className="text-indigo-100 text-sm mt-2 max-w-xl">
            Whether you are organizing a university competition or joining your first sprint, HackHub has your back.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold text-sm hover:bg-indigo-50 shadow-md transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
