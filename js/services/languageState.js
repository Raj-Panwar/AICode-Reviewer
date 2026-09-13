/**
 * Language State Service
 * Central source of truth for the selected programming language across all review input methods.
 * Supported languages: Java, Python, C, C++, JavaScript, TypeScript, Go, Kotlin, Rust.
 */

export const SUPPORTED_LANGUAGES = [
  'Java',
  'Python',
  'C',
  'C++',
  'JavaScript',
  'TypeScript',
  'Go',
  'Kotlin',
  'Rust'
];

export const EXTENSION_LANGUAGE_MAP = {
  java: 'Java',
  py: 'Python',
  c: 'C',
  h: 'C',
  cpp: 'C++',
  cc: 'C++',
  cxx: 'C++',
  hpp: 'C++',
  js: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  go: 'Go',
  kt: 'Kotlin',
  kts: 'Kotlin',
  rs: 'Rust'
};

export const LANGUAGE_FILE_DEFAULTS = {
  Java: { fileName: 'Solution.java', placeholder: '// Paste Java class or algorithm here...\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}' },
  Python: { fileName: 'solution.py', placeholder: '# Paste Python function or algorithm here...\ndef solve():\n    pass' },
  C: { fileName: 'solution.c', placeholder: '// Paste C code here...\n#include <stdio.h>\n\nint main() {\n    return 0;\n}' },
  'C++': { fileName: 'solution.cpp', placeholder: '// Paste C++ code here...\n#include <iostream>\n#include <vector>\n\nint main() {\n    return 0;\n}' },
  JavaScript: { fileName: 'solution.js', placeholder: '// Paste JavaScript code here...\nfunction calculate() {\n    \n}' },
  TypeScript: { fileName: 'OrderProcessor.ts', placeholder: '// Paste TypeScript code here...\nexport class Processor {\n    \n}' },
  Go: { fileName: 'solution.go', placeholder: '// Paste Go code here...\npackage main\n\nfunc main() {\n    \n}' },
  Kotlin: { fileName: 'Solution.kt', placeholder: '// Paste Kotlin code here...\nfun main() {\n    \n}' },
  Rust: { fileName: 'solution.rs', placeholder: '// Paste Rust code here...\nfn main() {\n    \n}' }
};

class LanguageStateManager {
  constructor() {
    this.currentLanguage = 'TypeScript';
    this.listeners = [];
  }

  getLanguage() {
    return this.currentLanguage;
  }

  setLanguage(lang, source = 'manual') {
    const normalized = SUPPORTED_LANGUAGES.find(
      (l) => l.toLowerCase() === (lang || '').toLowerCase()
    );
    if (!normalized) return;

    if (this.currentLanguage !== normalized) {
      this.currentLanguage = normalized;
      this.notify(source);
    }
  }

  detectFromFileName(fileName) {
    if (!fileName) return null;
    const parts = fileName.split('.');
    if (parts.length < 2) return null;
    const ext = parts.pop().toLowerCase();
    const detected = EXTENSION_LANGUAGE_MAP[ext];
    if (detected) {
      return detected;
    }
    return null;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  notify(source) {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentLanguage, source);
      } catch (err) {
        console.error('LanguageState subscriber error:', err);
      }
    });
  }
}

export const languageState = new LanguageStateManager();

export function detectLanguageFromFilename(fileName) {
  return languageState.detectFromFileName(fileName);
}
