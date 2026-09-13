/**
 * AI Code Reviewer - Dashboard Controller
 * Connects through reviewService to render metrics, health score, and recent reviews.
 */

import { reviewService } from './services/reviewService.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardStats();
  await loadRecentReviews();
});

/**
 * Loads statistical metrics and updates stat cards
 */
async function loadDashboardStats() {
  try {
    const stats = await reviewService.getStats();

    // Update stat numbers
    const totalReviewsEl = document.getElementById('statTotalReviews');
    const criticalIssuesEl = document.getElementById('statCriticalIssues');
    const securityIssuesEl = document.getElementById('statSecurityIssues');
    const avgQualityEl = document.getElementById('statAvgQuality');
    const avgComplexityEl = document.getElementById('statAvgComplexity');
    const healthScoreEl = document.getElementById('healthScoreNumber');
    const healthStatusTextEl = document.getElementById('healthStatusText');
    const healthCircleEl = document.getElementById('healthScoreCircle');

    if (totalReviewsEl) totalReviewsEl.textContent = stats.totalReviews;
    if (criticalIssuesEl) criticalIssuesEl.textContent = stats.criticalIssues;
    if (securityIssuesEl) securityIssuesEl.textContent = stats.securityIssues;
    if (avgQualityEl) avgQualityEl.textContent = `${stats.averageCodeQuality}%`;
    if (avgComplexityEl) avgComplexityEl.textContent = stats.averageComplexity;

    if (healthScoreEl) healthScoreEl.textContent = stats.codeHealth;
    if (healthStatusTextEl) healthStatusTextEl.textContent = `${stats.codeHealth} / 100 — ${stats.healthStatusText}`;

    if (healthCircleEl) {
      healthCircleEl.style.background = `conic-gradient(var(--green-500) ${stats.codeHealth}%, #e2e8f0 0)`;
    }
  } catch (error) {
    console.error('Failed to load dashboard statistics:', error);
  }
}

/**
 * Loads and renders the recent reviews table
 */
async function loadRecentReviews() {
  const tableBody = document.getElementById('recentReviewsTableBody');
  if (!tableBody) return;

  try {
    const reviews = await reviewService.getReviews();
    tableBody.innerHTML = '';

    reviews.forEach((review) => {
      const tr = document.createElement('tr');
      const totalIssues = (review.counts.bugs || 0) + (review.counts.security || 0) + (review.counts.quality || 0);

      let statusBadge = review.status === 'Completed'
        ? `<span class="badge" style="background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-100);">Healthy</span>`
        : `<span class="badge" style="background: var(--amber-50); color: var(--amber-600); border: 1px solid var(--amber-100);">Attention Needed</span>`;

      tr.innerHTML = `
        <td>
          <strong>${escapeHtml(review.project)}</strong>
          <div style="font-size: 12px; color: var(--text-tertiary);">${escapeHtml(review.file)}</div>
        </td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
            ${escapeHtml(review.repository)}
          </span>
        </td>
        <td><span class="badge" style="background: var(--bg-subtle); color: var(--text-primary); border: 1px solid var(--border-light);">${escapeHtml(review.language)}</span></td>
        <td style="font-size: 13px; color: var(--text-tertiary);">${escapeHtml(review.date)}</td>
        <td>
          <span style="font-weight: 700; color: ${review.overallScore >= 80 ? 'var(--green-700)' : 'var(--amber-600)'}">
            ${review.overallScore}/100
          </span>
        </td>
        <td><span class="complexity-badge time">${escapeHtml(review.timeComplexity)}</span></td>
        <td><span class="complexity-badge space">${escapeHtml(review.spaceComplexity)}</span></td>
        <td>
          <span style="font-size: 13px; font-weight: 600; color: ${totalIssues > 2 ? 'var(--amber-600)' : 'var(--text-secondary)'}">
            ${totalIssues} ${totalIssues === 1 ? 'issue' : 'issues'}
          </span>
        </td>
        <td>${statusBadge}</td>
        <td>
          <a href="review.html?id=${encodeURIComponent(review.id)}" class="btn btn-secondary btn-sm">
            View Review
          </a>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Failed to load recent reviews:', error);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
