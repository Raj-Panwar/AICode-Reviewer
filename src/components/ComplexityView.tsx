import React, { useState } from 'react';
import { Cpu, Zap, ArrowRight, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api';

export const ComplexityView: React.FC = () => {
  const [sampleCode, setSampleCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeComplexity = async () => {
    if (!sampleCode.trim()) {
      setError('Please provide code to analyze.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/api/complexity/analyze', { code: sampleCode, language });
      if (res.ok && res.data) {
        setResult(res.data.data || res.data);
      } else {
        throw new Error(res.data?.error?.message || 'Complexity analysis failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Analysis error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Algorithmic Complexity Lab</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time asymptotic Big-O Time & Space complexity evaluation engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Source Code for Profiling</h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
          </div>

          <textarea
            value={sampleCode}
            onChange={(e) => setSampleCode(e.target.value)}
            rows={12}
            placeholder="// Paste any algorithm or loop structure here to compute Big-O bounds..."
            className="w-full font-mono text-xs bg-slate-950 text-slate-100 p-4 rounded-xl focus:outline-none"
          ></textarea>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={analyzeComplexity}
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Evaluating Big-O Bounds...' : 'Calculate Complexity Bounds'} <Zap className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900">Asymptotic Bounds & Bottlenecks</h3>
          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-xs font-bold uppercase text-amber-800 mb-1">Time Complexity</div>
                  <div className="text-2xl font-black font-mono text-amber-900">{result.timeComplexity || 'O(n)'}</div>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="text-xs font-bold uppercase text-indigo-800 mb-1">Space Complexity</div>
                  <div className="text-2xl font-black font-mono text-indigo-900">{result.spaceComplexity || 'O(1)'}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <strong className="text-slate-900 block mb-1">Analysis & Reasoning</strong>
                <p className="text-slate-600">{result.explanation}</p>
              </div>

              {result.bottlenecks && result.bottlenecks.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <strong className="text-slate-900 block mb-1">Identified Bottlenecks</strong>
                  <ul className="list-disc list-inside text-slate-600 text-xs space-y-1">
                    {result.bottlenecks.map((b: string, i: number) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.optimizationSuggestions && result.optimizationSuggestions.length > 0 && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-900">
                  <strong className="block mb-1">Optimization Recommendation</strong>
                  <p>{result.optimizationSuggestions[0]}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-sm">
              Paste code on the left and click "Calculate Complexity Bounds" to evaluate asymptotic efficiency.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
