import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { ReviewEntity } from '../types';
import { Search, Eye, Trash2, Filter } from 'lucide-react';

interface ReviewsListViewProps {
  onSelectReview: (id: string) => void;
}

export const ReviewsListView: React.FC<ReviewsListViewProps> = ({ onSelectReview }) => {
  const [reviews, setReviews] = useState<ReviewEntity[]>([]);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [languageFilter]);

  const loadReviews = async () => {
    setLoading(true);
    const params: any = {};
    if (languageFilter !== 'ALL') params.language = languageFilter;
    if (search) params.search = search;

    const res = await apiClient.get('/api/reviews', params);
    if (res.ok && Array.isArray(res.data)) {
      setReviews(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this review report?')) return;
    await apiClient.delete(`/api/reviews/${id}`);
    loadReviews();
  };

  const filtered = reviews.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.file || r.fileName || '').toLowerCase().includes(q) ||
      (r.language || '').toLowerCase().includes(q) ||
      (r.summary || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Review History</h1>
          <p className="text-sm text-slate-500 mt-1">Inspect previous code quality assessments and Big-O complexity profiles.</p>
        </div>
        <div className="text-sm font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          {filtered.length} {filtered.length === 1 ? 'Review' : 'Reviews'} Found
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by file, language or summary..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
        >
          <option value="ALL">All Languages</option>
          <option value="Java">Java</option>
          <option value="Python">Python</option>
          <option value="JavaScript">JavaScript</option>
          <option value="TypeScript">TypeScript</option>
          <option value="C++">C++</option>
          <option value="Go">Go</option>
          <option value="Rust">Rust</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
              <th className="py-3 px-6">File & Project</th>
              <th className="py-3 px-6">Repository</th>
              <th className="py-3 px-6">Language</th>
              <th className="py-3 px-6">Health Score</th>
              <th className="py-3 px-6">Time Complexity</th>
              <th className="py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No review reports match your search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const score = r.overallScore || r.score || 85;
                const repoName = typeof r.repository === 'object' ? `${r.repository.owner}/${r.repository.name}` : r.repository || 'Direct Upload';
                return (
                  <tr
                    key={r.id || r.reviewId}
                    onClick={() => onSelectReview(r.id || r.reviewId)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {r.file || r.fileName || 'Solution.java'}
                      <div className="text-xs font-normal text-slate-400">{r.summary?.substring(0, 45)}...</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{repoName}</td>
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
                        onClick={(e) => { e.stopPropagation(); onSelectReview(r.id || r.reviewId); }}
                        className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(r.id || r.reviewId, e)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
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
  );
};
