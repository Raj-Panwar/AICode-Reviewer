/**
 * AI Code Reviewer - Repositories Controller
 * Manages GitHub linked repositories, code health status, and repository-level reviews.
 */

import { repositoryService } from '../repositoryService.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadRepositories();
  initSearch();
  initConnectModal();
});

async function loadRepositories(search = '') {
  const container = document.getElementById('reposGrid');
  const countBadge = document.getElementById('repoCountBadge');
  if (!container) return;

  try {
    let repos = await repositoryService.getRepositories();
    if (search) {
      const q = search.toLowerCase();
      repos = repos.filter(
        (r) =>
          (r.name || '').toLowerCase().includes(q) ||
          (r.owner || '').toLowerCase().includes(q) ||
          (r.language || '').toLowerCase().includes(q)
      );
    }

    if (countBadge) countBadge.textContent = `${repos.length} Repositories`;

    if (repos.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--text-tertiary); background: var(--bg-surface); border: 1px dashed var(--border-light); border-radius: var(--radius-lg);">
          No connected repositories match your search.
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    repos.forEach((repo) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';

      const healthColor = repo.healthScore >= 85 ? 'var(--green-700)' : repo.healthScore >= 75 ? 'var(--amber-600)' : 'var(--red-600)';

      card.innerHTML = `
        <div class="card-header" style="padding: 16px 20px;">
          <div>
            <div style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;">${escapeHtml(repo.owner)}</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
              ${escapeHtml(repo.name)}
            </div>
          </div>
          <span class="badge" style="background: var(--bg-subtle); border: 1px solid var(--border-light); color: var(--text-secondary);">
            ${escapeHtml(repo.defaultBranch || 'main')}
          </span>
        </div>

        <div class="card-body" style="padding: 20px; flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <span style="font-size: 13px; color: var(--text-tertiary);">Language</span>
            <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${escapeHtml(repo.language)}</span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <span style="font-size: 13px; color: var(--text-tertiary);">Code Health Score</span>
            <span style="font-size: 14px; font-weight: 800; color: ${healthColor};">
              ${repo.healthScore} / 100
            </span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <span style="font-size: 13px; color: var(--text-tertiary);">Open Issues</span>
            <span style="font-size: 13px; font-weight: 600; color: ${repo.openIssues > 0 ? 'var(--amber-600)' : 'var(--green-600)'};">
              ${repo.openIssues} ${repo.openIssues === 1 ? 'issue' : 'issues'}
            </span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 13px; color: var(--text-tertiary);">Complexity Profile</span>
            <span class="complexity-badge time">${escapeHtml(repo.timeComplexity || 'O(n)')}</span>
          </div>
        </div>

        <div class="card-footer" style="padding: 12px 20px;">
          <span style="font-size: 12px; color: var(--text-tertiary);">Last reviewed: ${escapeHtml(repo.lastReviewed || 'Recently')}</span>
          <a href="new-review.html?repo=${encodeURIComponent(repo.name)}" class="btn btn-primary btn-sm">
            Review Repo
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load repositories:', error);
  }
}

function initSearch() {
  const searchInput = document.getElementById('reposSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    loadRepositories(e.target.value.trim());
  });
}

function initConnectModal() {
  const openBtn = document.getElementById('connectRepoBtn');
  const modal = document.getElementById('connectModal');
  const closeBtn = document.getElementById('cancelConnectBtn');
  const confirmBtn = document.getElementById('confirmConnectBtn');
  const repoNameInput = document.getElementById('newRepoName');

  if (!openBtn || !modal) return;

  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
    if (repoNameInput) repoNameInput.focus();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      const name = repoNameInput ? repoNameInput.value.trim() : '';
      if (!name) return;

      modal.classList.remove('active');
      if (repoNameInput) repoNameInput.value = '';
      await loadRepositories();
    });
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
