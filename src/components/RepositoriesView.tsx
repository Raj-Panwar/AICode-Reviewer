import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { RepositoryEntity } from '../types';
import { GitBranch, Plus, Trash2, ArrowRight, X } from 'lucide-react';

interface RepositoriesViewProps {
  onStartReviewForRepo: (repoName: string) => void;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({ onStartReviewForRepo }) => {
  const [repos, setRepos] = useState<RepositoryEntity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [repoInput, setRepoInput] = useState('');
  const [languageInput, setLanguageInput] = useState('TypeScript');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    let owner = 'github';
    let name = repoInput.trim();
    if (name.includes('/')) {
      const parts = name.split('/');
      owner = parts[0].trim();
      name = parts[1].trim();
    }

    const res = await apiClient.post('/api/repositories', { owner, name, language: languageInput });
    setSubmitting(false);
    if (res.ok) {
      setShowModal(false);
      setRepoInput('');
      loadRepos();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;
    await apiClient.delete(`/api/repositories/${id}`);
    loadRepos();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Repositories</h1>
          <p className="text-xs text-slate-500 mt-0.5">Connect and manage GitHub repositories for automated reviews.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Connect Repository
        </button>
      </div>

      {/* Repos Grid or Empty State */}
      {repos.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <GitBranch className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-sm">No Repositories Connected</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Connect a GitHub repository to review source code, pull requests, and detect complexity bottlenecks.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" /> Connect Repository
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => {
            return (
              <div key={repo.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-400 font-medium truncate">{repo.owner}</div>
                      <h3 className="text-sm font-bold text-slate-900 truncate">{repo.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono font-medium flex-shrink-0">
                      {repo.defaultBranch || 'main'}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Language</span>
                      <span className="font-medium text-slate-800">{repo.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Code Health</span>
                      <span className="font-bold text-teal-700">{repo.healthScore} / 100</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDelete(repo.id, repo.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                    title="Disconnect Repository"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onStartReviewForRepo(repo.name)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    Review <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Connect Repository</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Repository Name (owner/repo)
                </label>
                <input
                  type="text"
                  required
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="facebook/react or my-project"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Primary Language
                </label>
                <select
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                >
                  <option value="TypeScript">TypeScript</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="Go">Go</option>
                  <option value="Rust">Rust</option>
                  <option value="C++">C++</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
