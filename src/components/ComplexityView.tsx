import React, { useState } from 'react';
import { Cpu, Zap, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/api';

export const ComplexityView: React.FC = () => {
  const [sampleCode, setSampleCode] = useState('function bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        let temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n    }\n  }\n  return arr;\n}');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeComplexity = async () => {
    setLoading(true);
    const res = await apiClient.post('/api/complexity/analyze', { code: sampleCode, language: 'JavaScript' });
    if (res.ok && res.data) {
      setResult(res.data.data || res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Algorithmic Complexity Lab</h1>
        <p className="text-sm text-slate-500 mt-1">Standalone Big-O Time & Space complexity evaluation engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Snippet for Complexity Profiling</h3>
          <textarea
            value={sampleCode}
            onChange={(e) => setSampleCode(e.target.value)}
            rows={12}
            className="w-full font-mono text-xs bg-slate-950 text-slate-100 p-4 rounded-xl focus:outline-none"
          ></textarea>
          <button
            onClick={analyzeComplexity}
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2"
          >
            {loading ? 'Evaluating Big-O...' : 'Calculate Complexity Bounds'} <Zap className="w-4 h-4" />
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
                  <div className="text-2xl font-black font-mono text-amber-900">{result.timeComplexity || 'O(n²)'}</div>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="text-xs font-bold uppercase text-indigo-800 mb-1">Space Complexity</div>
                  <div className="text-2xl font-black font-mono text-indigo-900">{result.spaceComplexity || 'O(1)'}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <strong className="text-slate-900 block mb-1">Explanation</strong>
                <p className="text-slate-600">{result.explanation}</p>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-900">
                <strong className="block mb-1">Optimization Recommendation</strong>
                <p>{result.optimizationSuggestions?.[0] || 'Replace nested iterations with optimized indexing.'}</p>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              Click "Calculate Complexity Bounds" to execute asymptotic analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
