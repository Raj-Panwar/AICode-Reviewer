import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { DashboardStats, ReviewEntity } from '../types';
import { Shield, Plus, ArrowUpRight, Eye, Trash2, ArrowRight } from 'lucide-react';

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

  const hasReviews = (stats?.totalReviews || 0) > 0;
  const healthScore = hasReviews ? stats?.averageCodeQuality || 85 : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Summary of code health, recent reviews, and complexity metrics.</p>
        </div>

        <button
          onClick={() => onNavigate('new-review')}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Review
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Total Reviews</div>
          <div className="text-2xl font-bold text-slate-900">{stats?.totalReviews || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Processed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Issues Found</div>
          <div className="text-2xl font-bold text-amber-600">{stats?.bugsDetected || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Bugs & vulnerabilities</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Avg Code Quality</div>
          <div className="text-2xl font-bold text-teal-700">{hasReviews ? `${stats?.averageCodeQuality}%` : '—'}</div>
          <div className="text-[11px] text-slate-400 mt-1">{hasReviews ? 'Quality score' : 'No data yet'}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Avg Complexity</div>
          <div className="text-2xl font-bold text-slate-800 font-mono text-xl">{hasReviews ? stats?.averageComplexity : '—'}</div>
          <div className="text-[11px] text-slate-400 mt-1">{hasReviews ? 'Asymptotic bound' : 'No iterations analyzed'}</div>
        </div>
      </div>

      {/* Clean Health Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Health</div>
          <div className="text-lg font-bold text-slate-900">
            {healthScore} / 100 — {hasReviews ? stats?.healthStatusText || 'Healthy' : 'Ready for First Review'}
          </div>
          <p className="text-xs text-slate-500 max-w-lg">
            {hasReviews
              ? 'Your code reviews are actively tracked. Run new inspections anytime to catch bugs early.'
              : 'Submit your first piece of source code to generate automatic defect detection and Big-O profiling.'}
          </p>
        </div>

        {!hasReviews && (
          <button
            onClick={() => onNavigate('new-review')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            Start First Review <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Recent Reviews Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Reviews</h3>
          {reviews.length > 0 && (
            <button
              onClick={() => onNavigate('reviews')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">File Name</th>
                <th className="py-2.5 px-4">Language</th>
                <th className="py-2.5 px-4">Quality</th>
                <th className="py-2.5 px-4">Time Complexity</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No reviews executed yet. Click "New Review" above to test your code.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const score = r.overallScore || r.score || 85;
                  return (
                    <tr
                      key={r.id || r.reviewId}
                      onClick={() => onNavigate('review-detail', r.id || r.reviewId)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {r.file || r.fileName || 'Solution.code'}
                        <div className="text-[11px] font-normal text-slate-400 truncate max-w-xs">{r.summary}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                          {r.language}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-teal-700">{score} / 100</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[11px]">
                          {r.timeComplexity || 'O(n)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onNavigate('review-detail', r.id || r.reviewId); }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded transition cursor-pointer"
                          title="Inspect Review"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(r.id || r.reviewId, e)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
