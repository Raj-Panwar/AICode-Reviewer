import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { RepositoryEntity } from '../types';
import { GitBranch, Plus, Shield, ExternalLink, Code } from 'lucide-react';

interface RepositoriesViewProps {
  onStartReviewForRepo: (repoName: string) => void;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({ onStartReviewForRepo }) => {
  const [repos, setRepos] = useState<RepositoryEntity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [repoInput, setRepoInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    setLoading(true);
    const res = await apiClient.get('/api/repositories');
    if (res.ok && Array.isArray(res.data)) {
      setRepos(res.data);
    }
    setLoading(false);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.trim()) return;

    let owner = 'enterprise-org';
    let name = repoInput.trim();
    if (name.includes('/')) {
      const parts = name.split('/');
      owner = parts[0];
      name = parts[1];
    }

    const res = await apiClient.post('/api/repositories', { owner, name });
    if (res.ok) {
      setShowModal(false);
      setRepoInput('');
      loadRepos();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Connected Repositories</h1>
          <p className="text-sm text-slate-500 mt-1">Manage GitHub repositories integrated with continuous AI code review workflows.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Connect Repository
        </button>
      </div>

      {/* Repos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => {
          const healthColor = repo.healthScore >= 85 ? 'text-emerald-600' : 'text-amber-600';
          return (
            <div key={repo.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{repo.owner}</span>
                    <h3 className="text-lg font-bold text-slate-900">{repo.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                    {repo.defaultBranch || 'main'}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Language</span>
                    <span className="font-semibold text-slate-900">{repo.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Code Health</span>
                    <span className={`font-extrabold ${healthColor}`}>{repo.healthScore} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Complexity</span>
                    <span className="font-mono text-xs px-2 py-0.5 bg-teal-50 text-teal-800 rounded font-semibold">{repo.timeComplexity || 'O(n)'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Last reviewed: {repo.lastReviewed || 'Recently'}</span>
                <button
                  onClick={() => onStartReviewForRepo(repo.name)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
                >
                  Review Repo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Connect GitHub Repository</h3>
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Repository Identifier (owner/name)</label>
                <input
                  type="text"
                  required
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="org-fintech/payment-service"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition"
                >
                  Connect & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
