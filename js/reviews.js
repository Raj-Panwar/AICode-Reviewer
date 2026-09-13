/**
 * AI Code Reviewer - Review History Controller
 * Search, filter, sort, and inspect past code reviews.
 */

import { reviewService } from './services/reviewService.js';

let allReviews = [];

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search') || '';

  const searchInput = document.getElementById('reviewsSearchInput');
  if (searchInput && initialSearch) {
    searchInput.value = initialSearch;
  }

  initFilters();
  await loadReviewsList({ search: initialSearch });
});

function initFilters() {
  const searchInput = document.getElementById('reviewsSearchInput');
  const langFilter = document.getElementById('reviewsLangFilter');
  const statusFilter = document.getElementById('reviewsStatusFilter');
  const sortSelect = document.getElementById('reviewsSortSelect');

  const triggerFilter = () => {
    const filters = {
      search: searchInput ? searchInput.value.trim() : '',
      language: langFilter ? langFilter.value : 'All',
      status: statusFilter ? statusFilter.value : 'All'
    };
    loadReviewsList(filters, sortSelect ? sortSelect.value : 'date-desc');
  };

  if (searchInput) searchInput.addEventListener('input', debounce(triggerFilter, 250));
  if (langFilter) langFilter.addEventListener('change', triggerFilter);
  if (statusFilter) statusFilter.addEventListener('change', triggerFilter);
  if (sortSelect) sortSelect.addEventListener('change', triggerFilter);
}

async function loadReviewsList(filters = {}, sortBy = 'date-desc') {
  const tableBody = document.getElementById('historyTableBody');
  const countEl = document.getElementById('reviewCountBadge');
  if (!tableBody) return;

  try {
    let reviews = await reviewService.getReviews(filters);

    // Sorting
    if (sortBy === 'score-desc') {
      reviews.sort((a, b) => b.overallScore - a.overallScore);
    } else if (sortBy === 'score-asc') {
      reviews.sort((a, b) => a.overallScore - b.overallScore);
    } else if (sortBy === 'issues-desc') {
      reviews.sort((a, b) => {
        const aIssues = (a.counts.bugs || 0) + (a.counts.quality || 0);
        const bIssues = (b.counts.bugs || 0) + (b.counts.quality || 0);
        return bIssues - aIssues;
      });
    }

    if (countEl) countEl.textContent = `${reviews.length} ${reviews.length === 1 ? 'Review' : 'Reviews'}`;

    if (reviews.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
            No code reviews match the chosen criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';
    reviews.forEach((review) => {
      const tr = document.createElement('tr');
      const totalIssues = (review.counts.bugs || 0) + (review.counts.security || 0) + (review.counts.quality || 0);

      const statusBadge = review.status === 'Completed'
        ? `<span class="badge" style="background: var(--green-50); color: var(--green-700); border: 1px solid var(--green-100);">Completed</span>`
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
            ${review.overallScore} / 100
          </span>
        </td>
        <td><span class="complexity-badge time">${escapeHtml(review.timeComplexity)}</span></td>
        <td><span class="complexity-badge space">${escapeHtml(review.spaceComplexity)}</span></td>
        <td>
          <span style="font-size: 13px; font-weight: 600; color: ${totalIssues > 2 ? 'var(--amber-600)' : 'var(--text-secondary)'}">
            ${totalIssues}
          </span>
        </td>
        <td>${statusBadge}</td>
        <td>
          <a href="review.html?id=${encodeURIComponent(review.id)}" class="btn btn-secondary btn-sm">
            View Details
          </a>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error('Failed to load reviews history:', error);
  }
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
