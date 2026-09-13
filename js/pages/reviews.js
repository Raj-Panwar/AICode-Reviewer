/**
 * AI Code Reviewer - Reviews History Controller
 *
 * Displays previous reviews with dynamic filtering by:
 *   - Language (Java, Python, C, C++, JavaScript, TypeScript, Go, Kotlin, Rust)
 *   - Review status
 *   - Keyword search across project, repository, and file names
 */

import { reviewService } from '../reviewService.js';
import { SUPPORTED_LANGUAGES } from '../languageState.js';

let activeFilters = {
  language: 'ALL',
  status: 'ALL',
  search: ''
};

document.addEventListener('DOMContentLoaded', async () => {
  initLanguageFilterOptions();
  initFilterControls();
  await loadReviews();
});

function initLanguageFilterOptions() {
  const langSelect = document.getElementById('reviewsLangFilter') || document.getElementById('reviewLangFilter');
  if (!langSelect) return;

  langSelect.innerHTML = '<option value="ALL">All Languages</option>';
  SUPPORTED_LANGUAGES.forEach((lang) => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang;
    langSelect.appendChild(opt);
  });
}

function initFilterControls() {
  const langSelect = document.getElementById('reviewsLangFilter') || document.getElementById('reviewLangFilter');
  const statusSelect = document.getElementById('reviewsStatusFilter') || document.getElementById('reviewStatusFilter');
  const searchInput = document.getElementById('reviewsSearchInput');

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      activeFilters.language = e.target.value;
      loadReviews();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      activeFilters.status = e.target.value;
      loadReviews();
    });
  }

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        activeFilters.search = e.target.value.trim();
        loadReviews();
      }, 250);
    });
  }
}

async function loadReviews() {
  const tableBody = document.getElementById('historyTableBody') || document.getElementById('reviewsTableBody');
  const countBadge = document.getElementById('reviewsCountBadge');
  if (!tableBody) return;

  try {
    const reviews = await reviewService.getReviews(activeFilters);

    if (countBadge) {
      countBadge.textContent = `${reviews.length} ${reviews.length === 1 ? 'Review' : 'Reviews'}`;
    }

    tableBody.innerHTML = '';

    if (!reviews || reviews.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
            No reviews match your selected filters.
          </td>
        </tr>
      `;
      return;
    }

    reviews.forEach((review) => {
      const tr = document.createElement('tr');
      const counts = review.counts || {};
      const totalIssues = (counts.bugs || 0) + (counts.security || 0) + (counts.quality || 0) + (counts.critical || 0) + (counts.performance || 0);
      const score = review.overallScore || review.score || 85;

      const statusBadge = review.status === 'Completed' || score >= 80
        ? `<span class="badge" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">Healthy</span>`
        : `<span class="badge" style="background: #fffbeb; color: #b45309; border: 1px solid #fde68a;">Attention Needed</span>`;

      tr.innerHTML = `
        <td>
          <strong>${escapeHtml(review.project || 'Project')}</strong>
          <div style="font-size: 12px; color: var(--text-tertiary);">${escapeHtml(review.file || review.fileName || 'Solution')}</div>
        </td>
        <td>
          <span style="font-size: 13px; color: var(--text-secondary);">
            ${escapeHtml(review.repository || 'Direct Upload')}
          </span>
        </td>
        <td>
          <span class="badge" style="background: var(--bg-subtle); color: var(--text-primary); border: 1px solid var(--border-light);">
            ${escapeHtml(review.language)}
          </span>
        </td>
        <td style="font-size: 13px; color: var(--text-tertiary);">${escapeHtml(review.date || 'Recent')}</td>
        <td>
          <strong style="color: ${score >= 80 ? 'var(--teal-700)' : 'var(--amber-600)'}">
            ${score}/100
          </strong>
        </td>
        <td><span class="complexity-badge time">${escapeHtml(review.timeComplexity || (review.complexity && review.complexity.time) || 'O(n)')}</span></td>
        <td><span class="complexity-badge space">${escapeHtml(review.spaceComplexity || (review.complexity && review.complexity.space) || 'O(1)')}</span></td>
        <td>
          <span style="font-size: 13px; font-weight: 600; color: ${totalIssues > 2 ? 'var(--amber-600)' : 'var(--text-secondary)'}">
            ${totalIssues} items
          </span>
        </td>
        <td>
          <a href="review.html?id=${encodeURIComponent(review.id || review.reviewId)}" class="btn btn-secondary btn-sm">
            Inspect Review
          </a>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Failed to load reviews:', error);
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
