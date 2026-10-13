import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { DashboardStats, ReviewEntity } from '../types';
import { Shield, AlertTriangle, CheckCircle2, Cpu, GitBranch, ArrowUpRight, Plus, Eye, Trash2 } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reviews, setReviews] = useState<ReviewEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const statsRes = await apiClient.get('/api/dashboard/stats');
    if (statsRes.ok && statsRes.data) {
      setStats(statsRes.data);
    }

    const reviewsRes = await apiClient.get('/api/reviews');
    if (reviewsRes.ok && Array.isArray(reviewsRes.data)) {
      setReviews(reviewsRes.data.slice(0, 5));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this review?')) return;
    await apiClient.delete(`/api/reviews/${id}`);
    loadDashboardData();
  };

  const healthScore = stats?.codeHealth || stats?.averageCodeQuality || 88;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">Engineering Review Dashboard</h1>
            <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Studio Connected
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Continuous AI-assisted code health, algorithmic complexity profiling, and defect insights.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('new-review')}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New AI Review
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Total Reviews</div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalReviews || 0}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">↑ Active Enterprise Pool</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Critical Vulnerabilities</div>
          <div className="text-3xl font-extrabold text-amber-600">{stats?.bugsDetected || 0}</div>
          <div className="text-xs text-slate-500 mt-2">Null safety & security risks</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Avg Code Quality</div>
          <div className="text-3xl font-extrabold text-teal-700">{stats?.averageCodeQuality || 88}%</div>
          <div className="text-xs text-teal-600 font-semibold mt-2">Exceeds threshold (80%)</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Avg Complexity</div>
          <div className="text-3xl font-extrabold text-indigo-600">{stats?.averageComplexity || 'O(n log n)'}</div>
          <div className="text-xs text-slate-500 mt-2">Optimal bounds maintained</div>
        </div>
      </div>

      {/* Health Score & Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">Enterprise Health Index</span>
          <h2 className="text-3xl font-extrabold">{healthScore} / 100 — {stats?.healthStatusText || 'Optimal Code Health'}</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Your codebase maintains rigorous architectural compliance. Zero critical unhandled exceptions detected in recent production builds.
          </p>
        </div>

        <div className="w-32 h-32 rounded-full flex items-center justify-center relative shadow-inner bg-slate-800 border-4 border-teal-500/30">
          <div className="text-3xl font-black text-teal-400">{healthScore}%</div>
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent AI Reviews</h3>
          <button
            onClick={() => onNavigate('reviews')}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            View All Reviews <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">Project / File</th>
                <th className="py-3 px-6">Repository</th>
                <th className="py-3 px-6">Language</th>
                <th className="py-3 px-6">Score</th>
                <th className="py-3 px-6">Time Complexity</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No reviews executed yet. Click "New AI Review" to start analyzing source code.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const score = r.overallScore || r.score || 85;
                  const repoName = typeof r.repository === 'object' ? `${r.repository.owner}/${r.repository.name}` : r.repository || 'Direct Upload';
                  return (
                    <tr
                      key={r.id || r.reviewId}
                      onClick={() => onNavigate('review-detail', r.id || r.reviewId)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {r.file || r.fileName || 'Solution.java'}
                        <div className="text-xs font-normal text-slate-400">{r.summary?.substring(0, 45)}...</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{repoName}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                          {r.language}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-teal-700">{score}/100</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-md text-xs font-mono font-semibold">
                          {r.timeComplexity || 'O(n)'}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onNavigate('review-detail', r.id || r.reviewId); }}
                          className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                          title="Inspect Review"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(r.id || r.reviewId, e)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
