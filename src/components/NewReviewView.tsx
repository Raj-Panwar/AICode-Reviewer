import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { Code, Upload, GitBranch, Play, CheckCircle2, AlertCircle } from 'lucide-react';

interface NewReviewViewProps {
  onReviewComplete: (reviewId: string) => void;
}

const SUPPORTED_LANGUAGES = ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'C', 'Go', 'Kotlin', 'Rust'];

const TEMPLATES: Record<string, string> = {
  Java: `public class TwoSum {\n    public int[] find(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) {\n                    return new int[] { i, j };\n                }\n            }\n        }\n        return new int[] {};\n    }\n}`,
  Python: `def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []`,
  JavaScript: `function twoSum(nums, target) {\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] === target) {\n                return [i, j];\n            }\n        }\n    }\n    return [];\n}`,
  TypeScript: `function twoSum(nums: number[], target: number): number[] {\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] === target) {\n                return [i, j];\n            }\n        }\n    }\n    return [];\n}`
};

export const NewReviewView: React.FC<NewReviewViewProps> = ({ onReviewComplete }) => {
  const [workflow, setWorkflow] = useState<'write' | 'file' | 'repo'>('write');
  const [language, setLanguage] = useState('Java');
  const [fileName, setFileName] = useState('Solution.java');
  const [code, setCode] = useState(TEMPLATES['Java'] || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Initializing AI analysis...');
  const [error, setError] = useState('');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (TEMPLATES[lang]) {
      setCode(TEMPLATES[lang]);
    } else {
      setCode(`// Enter your ${lang} source code here\n`);
    }
    const extensions: Record<string, string> = {
      Java: 'Solution.java',
      Python: 'solution.py',
      JavaScript: 'solution.js',
      TypeScript: 'solution.ts',
      'C++': 'solution.cpp',
      C: 'solution.c',
      Go: 'main.go',
      Kotlin: 'Solution.kt',
      Rust: 'main.rs'
    };
    setFileName(extensions[lang] || 'Solution.code');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const startAnalysis = async () => {
    if (!code.trim()) {
      setError('Please provide source code before initiating analysis.');
      return;
    }
    setError('');
    setAnalyzing(true);

    const stages = [
      'Analyzing source code structure & syntax...',
      'Checking for bugs, security vulnerabilities & null safety...',
      'Evaluating algorithmic Time & Space complexity...',
      'Generating mentor recommendations & optimized solution...'
    ];

    for (const stg of stages) {
      setLoadingStage(stg);
      await new Promise((r) => setTimeout(r, 450));
    }

    try {
      const payload = {
        source: workflow,
        language,
        fileName,
        code,
        repository: workflow === 'repo' ? { owner: 'org-fintech', name: 'ecommerce-checkout-service' } : null
      };

      const res = await apiClient.post('/api/reviews/analyze', payload);
      if (res.ok && res.data) {
        const review = res.data.data || res.data;
        const reviewId = review.id || review.reviewId;
        onReviewComplete(reviewId);
      } else {
        throw new Error(res.data?.error?.message || 'Review analysis failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete review analysis.');
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Initiate AI Code Review</h1>
        <p className="text-sm text-slate-500 mt-1">Submit source code via editor, local file upload, or connected GitHub repository.</p>
      </div>

      {/* Workflow Tabs */}
      <div className="grid grid-cols-3 gap-3 bg-slate-200/80 p-1.5 rounded-2xl">
        <button
          onClick={() => setWorkflow('write')}
          className={`py-3 px-4 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 ${
            workflow === 'write' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code className="w-4 h-4 text-teal-600" /> Write / Paste Code
        </button>
        <button
          onClick={() => setWorkflow('file')}
          className={`py-3 px-4 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 ${
            workflow === 'file' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4 text-teal-600" /> Upload File
        </button>
        <button
          onClick={() => setWorkflow('repo')}
          className={`py-3 px-4 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 ${
            workflow === 'repo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-4 h-4 text-teal-600" /> GitHub Repository
        </button>
      </div>

      {/* Language Selector & File Name */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Language</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-semibold text-sm focus:outline-none focus:border-teal-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-semibold text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Workflow specific input */}
        {workflow === 'file' ? (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50">
            <Upload className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <div className="font-bold text-slate-900 mb-1">Drop source code file here</div>
            <div className="text-xs text-slate-500 mb-4">Supports .java, .py, .ts, .js, .cpp, .go, .rs</div>
            <input type="file" onChange={handleFileUpload} className="block mx-auto text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
          </div>
        ) : workflow === 'repo' ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="font-bold text-slate-900 mb-1">Connected Enterprise Repository</div>
            <p className="text-sm text-slate-600 mb-4">org-fintech/ecommerce-checkout-service (branch: main)</p>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={8}
              className="w-full font-mono text-xs bg-slate-950 text-slate-100 p-4 rounded-xl border border-slate-800 focus:outline-none"
            ></textarea>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Source Code Editor</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              placeholder="Paste or write your source code here..."
              className="w-full font-mono text-xs bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-800 focus:outline-none leading-relaxed"
            ></textarea>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={startAnalysis}
            disabled={analyzing}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center gap-3 disabled:opacity-50 text-base"
          >
            {analyzing ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Analyzing Code...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Run AI Review & Complexity Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Modal Overlay */}
      {analyzing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto animate-bounce text-3xl">
              ⚡
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Google Gemini AI Engine Active</h3>
              <p className="text-sm text-teal-400 font-mono">{loadingStage}</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full w-3/4 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
