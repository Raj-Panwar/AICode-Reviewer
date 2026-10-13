import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { ReviewEntity } from '../types';
import { Search, Eye, Trash2 } from 'lucide-react';

interface ReviewsListViewProps {
  initialSearch?: string;
  onSelectReview: (id: string) => void;
}

export const ReviewsListView: React.FC<ReviewsListViewProps> = ({ initialSearch = '', onSelectReview }) => {
  const [reviews, setReviews] = useState<ReviewEntity[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    loadReviews();
  }, [languageFilter]);

  const loadReviews = async () => {
    setLoading(true);
    const params: any = {};
    if (languageFilter !== 'ALL') params.language = languageFilter;

    const res = await apiClient.get('/api/reviews', params);
    if (res.ok && Array.isArray(res.data)) {
      setReviews(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this review?')) return;
    await apiClient.delete(`/api/reviews/${id}`);
    loadReviews();
  };

  const filtered = reviews.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.file || r.fileName || '').toLowerCase().includes(q) ||
      (r.language || '').toLowerCase().includes(q) ||
      (r.summary || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Review History</h1>
          <p className="text-xs text-slate-500 mt-0.5">Browse and inspect past code reviews and complexity reports.</p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          {filtered.length} {filtered.length === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter reviews by file name, summary or keywords..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
          />
        </div>

        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-600"
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-4">File Name</th>
              <th className="py-2.5 px-4">Language</th>
              <th className="py-2.5 px-4">Quality Score</th>
              <th className="py-2.5 px-4">Complexity</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  {loading ? 'Loading reviews...' : 'No review reports match your search criteria.'}
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const score = r.overallScore || r.score || 85;
                const formattedDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent';
                return (
                  <tr
                    key={r.id || r.reviewId}
                    onClick={() => onSelectReview(r.id || r.reviewId)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.file || r.fileName || 'Solution.code'}
                      <div className="text-[11px] font-normal text-slate-400 truncate max-w-xs">{r.summary || 'AI code evaluation completed.'}</div>
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
                    <td className="py-3 px-4 text-slate-400">{formattedDate}</td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectReview(r.id || r.reviewId); }}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded transition cursor-pointer"
                        title="View Report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(r.id || r.reviewId, e)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                        title="Delete"
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
  );
};
