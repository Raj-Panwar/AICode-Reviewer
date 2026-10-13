import React from 'react';
import { Shield, Zap, GitBranch, Cpu, ArrowRight, Code2 } from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-600 selection:text-white">
      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">AI Code Reviewer</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#complexity" className="hover:text-white transition">Big-O Engine</a>
          <a href="#security" className="hover:text-white transition">Security</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm rounded-lg transition shadow-sm cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Intelligent Code Analysis & Big-O Engine
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight mb-6">
          Code reviews and complexity analysis in seconds
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Detect bugs, security vulnerabilities, and evaluate algorithmic Time & Space complexity with actionable mentor fixes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition shadow flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            Start Code Review <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-800 transition text-sm cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Big-O Complexity Profiling</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Computes algorithmic time and space complexity with bottleneck detection and before-and-after benchmarks.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Vulnerabilities & Null Safety</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Flags security risks, unhandled null exceptions, resource leaks, and edge-case boundary errors.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">GitHub Repositories</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connect corporate repositories to review code across multiple branches and languages.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 AI Code Reviewer. Built for engineering teams.</p>
      </footer>
    </div>
  );
};
