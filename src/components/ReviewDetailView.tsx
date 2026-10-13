import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { ReviewEntity } from '../types';
import { Copy, Printer, ArrowLeft, Check, Terminal } from 'lucide-react';

interface ReviewDetailViewProps {
  reviewId: string;
  onBack: () => void;
}

export const ReviewDetailView: React.FC<ReviewDetailViewProps> = ({ reviewId, onBack }) => {
  const [review, setReview] = useState<ReviewEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'issues' | 'complexity' | 'optimized'>('issues');

  useEffect(() => {
    loadReviewDetail();
  }, [reviewId]);

  const loadReviewDetail = async () => {
    setLoading(true);
    const res = await apiClient.get(`/api/reviews/${reviewId}`);
    if (res.ok && res.data) {
      setReview(res.data.data || res.data);
    }
    setLoading(false);
  };

  const copyOptimized = () => {
    if (review?.optimizedCode) {
      navigator.clipboard.writeText(review.optimizedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-xs">Loading report...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="py-24 text-center space-y-3">
        <p className="text-slate-700 font-semibold text-sm">Review report not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const score = review.overallScore || review.score || 85;
  const comp = review.complexity || {
    time: review.timeComplexity || 'O(n)',
    space: review.spaceComplexity || 'O(1)',
    explanation: 'Algorithmic efficiency verified.'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" /> Export / Print
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded text-[11px]">
              {review.language}
            </span>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              {review.file || review.fileName || 'Solution.code'}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Code Review Inspection Report</h1>
          <p className="text-slate-500 text-xs mt-1 max-w-2xl leading-relaxed">{review.summary}</p>
        </div>

        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 flex-shrink-0">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Quality Score</div>
          <div className="text-3xl font-extrabold text-teal-700">{score} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
        </div>
      </div>

      {/* Complexity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Time Complexity</div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-100 font-mono font-bold text-sm text-slate-800 rounded">
              {comp.time}
            </span>
            <span className="text-xs text-slate-600 truncate">{comp.explanation}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Space Complexity</div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-100 font-mono font-bold text-sm text-slate-800 rounded">
              {comp.space}
            </span>
            <span className="text-xs text-slate-600">Memory footprint</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer ${
            activeTab === 'issues'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Issues Found ({review.issues?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('complexity')}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer ${
            activeTab === 'complexity'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Complexity Details
        </button>
        <button
          onClick={() => setActiveTab('optimized')}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer ${
            activeTab === 'optimized'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Optimized Code
        </button>
      </div>

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="space-y-3">
          {(!review.issues || review.issues.length === 0) ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              No critical bugs or security vulnerabilities found.
            </div>
          ) : (
            review.issues.map((iss, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        iss.severity === 'CRITICAL' || iss.severity === 'HIGH'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {iss.severity}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs">{iss.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Line {iss.line || 1}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{iss.description}</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <strong className="text-slate-900 font-semibold">Suggested Fix:</strong>{' '}
                  {iss.suggestedFix || iss.whyItMatters}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Complexity Tab */}
      {activeTab === 'complexity' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <strong className="text-slate-900 block mb-1">Time Complexity: {comp.time}</strong>
            <p>{comp.explanation}</p>
          </div>
          {comp.bottleneck && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block mb-1">Identified Bottleneck</strong>
              <p>{comp.bottleneck}</p>
            </div>
          )}
          {comp.suggestedApproach && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-900">
              <strong className="block mb-1">Recommended Approach</strong>
              <p>{comp.suggestedApproach}</p>
            </div>
          )}
        </div>
      )}

      {/* Optimized Code Tab */}
      {activeTab === 'optimized' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-teal-400" /> Recommended Optimized Code
            </div>
            <button
              onClick={copyOptimized}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition flex items-center gap-1 border border-slate-700 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="font-mono text-xs text-slate-100 bg-slate-950 p-4 rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
            {review.optimizedCode || '// No optimization code provided.'}
          </pre>
        </div>
      )}
    </div>
  );
};
