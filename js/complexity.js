/**
 * AI Code Reviewer - Complexity Analysis & Algorithm Education Controller
 * Deep-dive educational and analytical interface for Time and Space Complexity.
 */

import { reviewService } from './services/reviewService.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadComplexityLibrary();
  initBigOGuide();
});

async function loadComplexityLibrary() {
  const container = document.getElementById('complexityLibraryContainer');
  if (!container) return;

  try {
    const algorithms = await reviewService.getComplexityLibrary();
    container.innerHTML = '';

    algorithms.forEach((algo, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '24px';

      card.innerHTML = `
        <div class="card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-suggestion">${escapeHtml(algo.category)}</span>
              <span class="badge badge-low">${escapeHtml(algo.difficulty)}</span>
            </div>
            <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 6px;">
              ${escapeHtml(algo.name)}
            </h3>
          </div>
        </div>

        <div class="card-body">
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
            ${escapeHtml(algo.explanation)}
          </p>

          <div class="complexity-comparison-grid">
            <div class="comparison-box current">
              <div class="comparison-label">Before Optimization — ${escapeHtml(algo.currentApproach.title)}</div>
              <div class="comparison-metrics">
                <span class="complexity-badge time">Time: ${escapeHtml(algo.currentApproach.time)}</span>
                <span class="complexity-badge space">Space: ${escapeHtml(algo.currentApproach.space)}</span>
              </div>
              <div class="comparison-desc">${escapeHtml(algo.currentApproach.description)}</div>
            </div>

            <div class="comparison-box optimized">
              <div class="comparison-label">AI Recommended Approach — ${escapeHtml(algo.optimizedApproach.title)}</div>
              <div class="comparison-metrics">
                <span class="complexity-badge time" style="background: #ecfdf5; color: #047857; border-color: #a7f3d0;">Time: ${escapeHtml(algo.optimizedApproach.time)}</span>
                <span class="complexity-badge space" style="background: #f0fdfa; color: #0f766e; border-color: #99f6e4;">Space: ${escapeHtml(algo.optimizedApproach.space)}</span>
              </div>
              <div class="comparison-desc">${escapeHtml(algo.optimizedApproach.description)}</div>
            </div>
          </div>

          <div style="margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.04em;">
                Comparative Implementation Code
              </span>
            </div>
            <pre class="mentor-fix-diff" style="max-height: 280px; overflow-y: auto;"><code>${escapeHtml(algo.codeExample)}</code></pre>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load complexity library:', error);
  }
}

function initBigOGuide() {
  const cards = document.querySelectorAll('.big-o-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => (c.style.borderColor = 'var(--border-light)'));
      card.style.borderColor = 'var(--teal-500)';
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
