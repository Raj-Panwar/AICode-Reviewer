import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { Shield, Lock, Mail, User, Building, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthViewProps {
  onSuccess: (user: any) => void;
  onSwitchToLanding: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onSwitchToLanding }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Enterprise Engineer');
  const [org, setOrg] = useState('Engineering Core');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { name, email, password, role, organization: org }
        : { email, password };

      const res = await apiClient.post(endpoint, body);
      if (res.ok && res.data && res.data.token) {
        apiClient.setToken(res.data.token);
        apiClient.setUser(res.data.user);
        onSuccess(res.data.user);
      } else {
        throw new Error(res.data?.error?.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    // Simulate secure Google OAuth popup / handshake for enterprise workspace
    const googleEmail = prompt('Enter your corporate Google Workspace email:', 'executive@enterprise.io');
    if (!googleEmail) {
      setLoading(false);
      return;
    }
    const googleName = prompt('Enter your full name:', 'Alex Morgan') || 'Google User';

    try {
      const res = await apiClient.post('/api/auth/google', {
        email: googleEmail,
        name: googleName,
        googleId: `g_${Date.now()}`
      });
      if (res.ok && res.data && res.data.token) {
        apiClient.setToken(res.data.token);
        apiClient.setUser(res.data.user);
        onSuccess(res.data.user);
      } else {
        throw new Error(res.data?.error?.message || 'Google Workspace authentication failed.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl p-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onSwitchToLanding}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/60 text-teal-400 text-xs font-semibold mb-6 hover:bg-slate-700 transition"
          >
            ← Back to Overview
          </button>
          
          <div className="inline-flex w-12 h-12 rounded-xl bg-teal-500 text-slate-900 items-center justify-center font-black text-2xl shadow-lg shadow-teal-500/20 mb-4">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isRegister ? 'Create Enterprise Account' : 'Sign In to Workspace'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Secure AI code review & Big-O complexity intelligence
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition shadow-md mb-6 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.32 7.24 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.8 0 12s.43 3.9 1.19 5.42l4.09-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.24 0 3.17 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          Continue with Google Workspace
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="px-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">or enterprise email</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Organization</label>
                  <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Enterprise Account' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? 'Already have an enterprise account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-teal-400 font-semibold hover:underline ml-1"
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </div>

      </div>
    </div>
  );
};
