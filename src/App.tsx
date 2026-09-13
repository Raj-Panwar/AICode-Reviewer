/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function App() {
  return (
    <main
      id="app-root"
      className="min-h-screen w-full bg-stone-50 text-stone-900 flex items-center justify-center p-6 sm:p-12 font-sans antialiased selection:bg-stone-200 selection:text-stone-900"
    >
      <motion.section
        id="welcome-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg rounded-2xl bg-white border border-stone-200/80 shadow-sm p-8 sm:p-12 text-center"
      >
        <div
          id="welcome-badge"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-medium tracking-wide uppercase mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
          <span>Welcome Page</span>
        </div>

        <h1
          id="welcome-heading"
          className="text-4xl sm:text-5xl font-semibold tracking-tight text-stone-900 mb-4"
        >
          Hello World
        </h1>

        <p
          id="welcome-subtitle"
          className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-md mx-auto"
        >
          Welcome to your new web application. It is ready for whatever you choose to build next.
        </p>

        <div
          id="status-indicator"
          className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-stone-500 font-medium"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
          <span>Application running smoothly</span>
        </div>
      </motion.section>
    </main>
  );
}

