import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { ReviewEntity } from '../types';
import { Shield, AlertTriangle, CheckCircle2, Cpu, Copy, Printer, ArrowLeft, Terminal } from 'lucide-react';

interface ReviewDetailViewProps {
  reviewId: string;
  onBack: () => void;
}

export const ReviewDetailView: React.FC<ReviewDetailViewProps> = ({ reviewId, onBack }) => {
  const [review, setReview] = useState<ReviewEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'issues' | 'complexity' | 'code' | 'optimized'>('issues');

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
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Loading AI review analysis report...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-600 font-bold mb-4">Review report not found.</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-900 text-white rounded-xl">Back to Dashboard</button>
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
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top bar with back & actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reviews
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition shadow-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-teal-50 text-teal-800 font-bold rounded-lg text-xs">
              {review.language}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {review.file || review.fileName || 'Solution.java'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">AI Code Inspection Report</h1>
          <p className="text-slate-500 text-sm mt-1">{review.summary}</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Health Index</div>
            <div className="text-3xl font-black text-teal-700">{score}/100</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold text-xl">
            ⚡
          </div>
        </div>
      </div>

      {/* Complexity & Key Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Time Complexity</div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-lg rounded-xl">
              {comp.time}
            </span>
            <span className="text-sm text-slate-600 font-medium">{comp.explanation}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Space Complexity</div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono font-bold text-lg rounded-xl">
              {comp.space}
            </span>
            <span className="text-sm text-slate-600 font-medium">Auxiliary memory footprint boundary.</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === 'issues' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Detected Issues ({review.issues?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('complexity')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === 'complexity' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Big-O Analysis & Bottlenecks
        </button>
        <button
          onClick={() => setActiveTab('optimized')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
            activeTab === 'optimized' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Optimized Mentor Solution
        </button>
      </div>

      {/* Tab Content: Issues */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {(!review.issues || review.issues.length === 0) ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
              No critical bugs or vulnerabilities detected in this revision.
            </div>
          ) : (
            review.issues.map((iss, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      iss.severity === 'CRITICAL' || iss.severity === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {iss.severity}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{iss.title}</h3>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Line {iss.line || 1}</span>
                </div>
                <p className="text-sm text-slate-600">{iss.description}</p>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
                  <strong className="text-slate-900">Suggested Fix:</strong> {iss.suggestedFix || iss.whyItMatters}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Complexity */}
      {activeTab === 'complexity' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Asymptotic Complexity Deep Dive</h3>
          <div className="space-y-4 text-sm text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">Time Complexity: {comp.time}</strong>
              <p>{comp.explanation}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">Identified Bottleneck</strong>
              <p>{comp.bottleneck || 'Sequential iteration pattern over unindexed inputs.'}</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-teal-900">
              <strong className="block mb-1">Recommended Approach</strong>
              <p>{comp.suggestedApproach || 'Utilize hash map or memoization for O(1) expected time complexity.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Optimized Code */}
      {activeTab === 'optimized' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-teal-400">
              <Terminal className="w-4 h-4" /> Recommended Optimized Implementation
            </div>
            <button
              onClick={copyOptimized}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-slate-700"
            >
              <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="font-mono text-xs text-slate-100 bg-slate-950 p-5 rounded-xl overflow-x-auto leading-relaxed">
            {review.optimizedCode || '// No optimization diff generated.'}
          </pre>
        </div>
      )}
    </div>
  );
};
