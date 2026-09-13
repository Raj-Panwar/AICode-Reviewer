/**
 * AI Code Reviewer - Complexity Analysis Controller
 *
 * Provides educational Big-O spectrum hierarchy, algorithmic trade-off analysis,
 * estimated time and space complexity evaluations, and before/after comparisons.
 */

import { reviewService } from '../reviewService.js';

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

    if (!algorithms || algorithms.length === 0) {
      container.innerHTML = `
        <div style="background: white; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 32px; text-align: center; color: var(--text-tertiary);">
          No algorithmic case studies found in library.
        </div>
      `;
      return;
    }

    algorithms.forEach((algo) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '24px';

      card.innerHTML = `
        <div class="card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="badge" style="background: var(--teal-50); color: var(--teal-700); border: 1px solid var(--teal-100);">${escapeHtml(algo.category || 'Algorithm')}</span>
              <span class="badge badge-low">${escapeHtml(algo.difficulty || 'Medium')}</span>
              <span style="font-size: 12px; color: var(--text-tertiary);">Estimated complexity evaluation</span>
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

          <div style="background: #fafbfc; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
              <div>
                <strong style="font-size: 13px; color: var(--text-primary);">Identified Bottleneck:</strong>
                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">${escapeHtml(algo.bottleneck || 'Nested sequential loops over input elements')}</div>
              </div>
              <div>
                <strong style="font-size: 13px; color: var(--text-primary);">Key Data Structure / Pattern:</strong>
                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">${escapeHtml(algo.keyStructure || 'Hash Map / Frequency Counter')}</div>
              </div>
              <div>
                <strong style="font-size: 13px; color: var(--text-primary);">Optimization Leverage:</strong>
                <div style="font-size: 13px; color: var(--teal-700); font-weight: 600; margin-top: 2px;">${escapeHtml(algo.optimizationLeverage || 'High — Drops quadratic time to linear O(n)')}</div>
              </div>
            </div>
          </div>

          <div class="complexity-comparison-grid">
            <div class="comparison-box current">
              <div class="comparison-label">Current / Unoptimized Approach — ${escapeHtml(algo.currentApproach.title)}</div>
              <div class="comparison-metrics">
                <span class="complexity-badge time">Estimated Time: ${escapeHtml(algo.currentApproach.time)}</span>
                <span class="complexity-badge space">Estimated Space: ${escapeHtml(algo.currentApproach.space)}</span>
              </div>
              <div class="comparison-desc">${escapeHtml(algo.currentApproach.description)}</div>
            </div>

            <div class="comparison-box optimized">
              <div class="comparison-label">Optimized Mentor Approach — ${escapeHtml(algo.optimizedApproach.title)}</div>
              <div class="comparison-metrics">
                <span class="complexity-badge time" style="background: #ecfdf5; color: #047857; border-color: #a7f3d0;">Estimated Time: ${escapeHtml(algo.optimizedApproach.time)}</span>
                <span class="complexity-badge space" style="background: #f0fdfa; color: #0f766e; border-color: #99f6e4;">Estimated Space: ${escapeHtml(algo.optimizedApproach.space)}</span>
              </div>
              <div class="comparison-desc">${escapeHtml(algo.optimizedApproach.description)}</div>
            </div>
          </div>

          <div style="margin-top: 20px;">
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
      cards.forEach((c) => (c.style.boxShadow = 'none'));
      card.style.boxShadow = '0 0 0 2px var(--teal-500)';
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
