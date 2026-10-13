import React from 'react';
import { Shield, Zap, GitBranch, Cpu, ArrowRight, CheckCircle2, Code } from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-teal-500 selection:text-slate-900">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-900 flex items-center justify-center font-black text-xl shadow-lg shadow-teal-500/20">
            ⚡
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">AI Code Reviewer</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-teal-400 transition">Features</a>
          <a href="#architecture" className="hover:text-teal-400 transition">Architecture</a>
          <a href="#complexity" className="hover:text-teal-400 transition">Big-O Engine</a>
          <a href="#security" className="hover:text-teal-400 transition">Enterprise Security</a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-teal-500/20"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/80 text-teal-400 text-xs font-semibold mb-8 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Google AI Studio Enterprise Code Intelligence Engine
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-8">
          Continuous AI Code Health & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Algorithmic Profiling</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          Automate security vulnerability detection, null-safety checks, asymptotic Time & Space Big-O complexity analysis, and mentor refactoring instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-2xl transition shadow-xl shadow-teal-500/25 flex items-center justify-center gap-3 text-base"
          >
            Launch Enterprise Console <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl border border-slate-700 transition text-base"
          >
            Sign In with Google Workspace
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Enterprise Code Intelligence</h2>
          <p className="text-slate-400">Designed for elite engineering teams requiring rigorous software quality standards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/60 border border-slate-700/80 p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Asymptotic Big-O Profiling</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instantly evaluates algorithmic time and space complexity, detecting nested loop bottlenecks and recursive overhead.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Vulnerability & Null Safety</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Flags critical security flaws, unhandled reference exceptions, and boundary assertion gaps with precise line numbers.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-6">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">GitHub Repository Integration</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connect corporate repositories, browse branches, and run continuous AI reviews on every pull request.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 text-center text-sm text-slate-500">
        <p>© 2026 AI Code Reviewer Enterprise. Powered by Google Gemini AI & Vercel Serverless.</p>
      </footer>
    </div>
  );
};
