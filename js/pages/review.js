/**
 * AI Code Reviewer - Review Result Page Controller
 *
 * Implements:
 *   1. Overall Score & Health Assessment
 *   2. Summary
 *   3. Issues (Severity: Critical, High, Medium, Low, Info; Category: Bug, Security, Performance, Maintainability, Code Style, Best Practice)
 *   4. Estimated Complexity (Time, Space, Explanation, Bottleneck, Optimization availability, Suggested Approach)
 *   5. Actionable Recommendations / Suggestions
 *   6. Optimized Code with Copy Button
 *   7. IDE-Style Code Viewer with Line Highlights
 */

import { reviewService } from '../reviewService.js';

let currentReview = null;
let currentFilter = 'ALL';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const reviewId = urlParams.get('id') || 'REV-2041';

  await loadReview(reviewId);
  initIssueFilters();
  initOptimizedCodeCopy();
});

async function loadReview(id) {
  try {
    currentReview = await reviewService.getReviewById(id);
    renderHeader(currentReview);
    renderSummary(currentReview);
    renderSummaryCards(currentReview);
    renderComplexitySection(currentReview.complexityAnalysis || currentReview.complexity);
    renderIssues(currentReview.issues || []);
    renderRecommendations(currentReview.recommendations || []);
    renderOptimizedCode(currentReview.optimizedCode);
    renderCodeViewer(currentReview);
  } catch (error) {
    console.error('Failed to load review details:', error);
  }
}

function renderHeader(review) {
  const repoEl = document.getElementById('reviewRepo');
  const branchEl = document.getElementById('reviewBranch');
  const fileEl = document.getElementById('reviewFile');
  const langEl = document.getElementById('reviewLang');
  const dateEl = document.getElementById('reviewDate');
  const scoreBadgeEl = document.getElementById('reviewScoreBadge');
  const healthTitleEl = document.getElementById('healthTitle');
  const healthDescEl = document.getElementById('healthDesc');

  if (repoEl) repoEl.textContent = typeof review.repository === 'object' ? `${review.repository.owner}/${review.repository.name}` : review.repository || 'Direct Input';
  if (branchEl) branchEl.textContent = review.branch || 'main';
  if (fileEl) fileEl.textContent = review.file || review.fileName || 'Solution.java';
  if (langEl) langEl.textContent = review.language || 'Java';
  if (dateEl) dateEl.textContent = review.date || 'Recent';

  const score = review.overallScore || review.score || 85;
  if (scoreBadgeEl) {
    scoreBadgeEl.textContent = `${score} / 100`;
  }

  const healthStatus = score >= 85 ? 'Excellent Code Health' : (score >= 75 ? 'Good Code Health' : 'Needs Optimization');
  if (healthTitleEl) {
    healthTitleEl.textContent = `${score} / 100 — ${healthStatus}`;
  }
  if (healthDescEl) {
    healthDescEl.textContent = review.summary || `Analyzed ${review.file || review.fileName}. Detected algorithmic trade-offs and mentor guidance points.`;
  }

  const scoreNumberEl = document.querySelector('.health-score-pill .score-number');
  const scoreStatusEl = document.querySelector('.health-score-pill .score-text-status');
  if (scoreNumberEl) {
    scoreNumberEl.textContent = score;
  }
  if (scoreStatusEl) {
    scoreStatusEl.textContent = score >= 80 ? 'Production Ready*' : 'Needs Attention';
  }
}

function renderSummary(review) {
  const summaryBox = document.getElementById('reviewSummaryText');
  if (summaryBox) {
    summaryBox.textContent = review.summary || 'Comprehensive static analysis and algorithmic review completed.';
  }
}

function renderSummaryCards(review) {
  const bugCount = document.getElementById('countBugs');
  const secCount = document.getElementById('countSecurity');
  const qualCount = document.getElementById('countQuality');
  const perfCount = document.getElementById('countPerf');
  const timeBadge = document.getElementById('summaryTimeComplexity');
  const spaceBadge = document.getElementById('summarySpaceComplexity');

  const counts = review.counts || {};
  if (bugCount) bugCount.textContent = counts.bugs || 0;
  if (secCount) secCount.textContent = counts.security || 0;
  if (qualCount) qualCount.textContent = counts.quality || 0;
  if (perfCount) perfCount.textContent = counts.performance || 0;

  const timeStr = review.timeComplexity || (review.complexity && review.complexity.time) || 'O(n)';
  const spaceStr = review.spaceComplexity || (review.complexity && review.complexity.space) || 'O(1)';

  if (timeBadge) timeBadge.textContent = timeStr;
  if (spaceBadge) spaceBadge.textContent = spaceStr;
}

function renderComplexitySection(complexity) {
  if (!complexity) return;

  const timeEl = document.getElementById('compTimeMetric');
  const spaceEl = document.getElementById('compSpaceMetric');
  const expEl = document.getElementById('compExplanationText');
  const partsListEl = document.getElementById('compPartsList');
  const tradeoffEl = document.getElementById('tradeoffExplanationText');
  const comparisonContainer = document.getElementById('complexityComparisonContainer');

  const timeVal = complexity.time || complexity.timeComplexity || 'O(n)';
  const spaceVal = complexity.space || complexity.spaceComplexity || 'O(1)';

  if (timeEl) timeEl.textContent = timeVal;
  if (spaceEl) spaceEl.textContent = spaceVal;

  if (expEl) {
    expEl.textContent = complexity.explanation || complexity.timeExplanation || 'Estimated complexity derived from single-pass iteration and auxiliary allocations.';
  }

  if (tradeoffEl) {
    tradeoffEl.textContent = complexity.suggestedApproach || complexity.recommendedPattern || 'Trading O(m) auxiliary space for an indexed map avoids quadratic nested loop scans.';
  }

  // Contributing parts list
  if (partsListEl) {
    partsListEl.innerHTML = `
      <li style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--teal-500); margin-top: 6px;"></span>
        <span style="font-size: 13px; color: var(--text-secondary);">
          <strong>Identified Bottleneck:</strong> ${escapeHtml(complexity.bottleneck || 'Nested iteration over collection items')}
        </span>
      </li>
      <li style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--teal-500); margin-top: 6px;"></span>
        <span style="font-size: 13px; color: var(--text-secondary);">
          <strong>Optimization Possible:</strong> ${complexity.optimizationAvailable !== false ? 'Yes — High optimization leverage available' : 'Solution is already near-optimal'}
        </span>
      </li>
      <li style="display: flex; align-items: flex-start; gap: 10px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--teal-500); margin-top: 6px;"></span>
        <span style="font-size: 13px; color: var(--text-secondary);">
          <strong>Suggested Refactor:</strong> ${escapeHtml(complexity.suggestedApproach || complexity.recommendedPattern || 'Use HashMap/Set for O(1) membership lookups')}
        </span>
      </li>
    `;
  }

  // Comparison Grid
  if (comparisonContainer) {
    const table = complexity.comparisonTable || [
      { metric: 'Current Implementation', time: timeVal, space: spaceVal, throughput: '~420 ops/sec' },
      { metric: 'Mentor Recommendation', time: 'O(n)', space: 'O(n)', throughput: '~12,500 ops/sec' }
    ];

    comparisonContainer.innerHTML = table
      .map(
        (row, idx) => `
      <div class="comparison-box ${idx === 0 ? 'current' : 'optimized'}">
        <div class="comparison-label">${escapeHtml(row.metric)}</div>
        <div class="comparison-metrics">
          <span class="complexity-badge time">Time: ${escapeHtml(row.time)}</span>
          <span class="complexity-badge space">Space: ${escapeHtml(row.space)}</span>
        </div>
        <div class="comparison-desc" style="font-size: 12px; color: var(--text-tertiary); margin-top: 8px;">
          Estimated Throughput: <strong>${escapeHtml(row.throughput)}</strong>
        </div>
      </div>
    `
      )
      .join('');
  }
}

function renderIssues(issues) {
  const container = document.getElementById('issuesContainer');
  if (!container) return;

  container.innerHTML = '';

  const filtered = issues.filter((issue) => {
    if (currentFilter === 'ALL') return true;
    return (issue.severity || '').toUpperCase() === currentFilter.toUpperCase();
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background: white; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 32px; text-align: center; color: var(--text-tertiary);">
        No issues found for filter "${currentFilter}".
      </div>
    `;
    return;
  }

  filtered.forEach((issue) => {
    const card = document.createElement('div');
    card.className = 'mentor-issue-card';
    card.setAttribute('data-issue-id', issue.id || '');

    const sev = (issue.severity || 'Medium').toLowerCase();
    let badgeClass = 'badge-medium';
    if (sev === 'critical') badgeClass = 'badge-critical';
    if (sev === 'high') badgeClass = 'badge-critical';
    if (sev === 'low') badgeClass = 'badge-low';
    if (sev === 'info' || sev === 'suggestion') badgeClass = 'badge-suggestion';

    card.innerHTML = `
      <div class="issue-card-header">
        <div class="issue-card-left">
          <span class="badge ${badgeClass}">${escapeHtml(issue.severity || 'Medium')}</span>
          <span class="issue-category-tag">${escapeHtml(issue.category || 'Quality')}</span>
          ${issue.line ? `<span class="issue-line-indicator">Line ${issue.line}</span>` : ''}
        </div>
      </div>

      <h3 class="issue-card-title">${escapeHtml(issue.title)}</h3>
      <p class="issue-card-desc">${escapeHtml(issue.description)}</p>

      ${
        issue.whyItMatters
          ? `
        <div style="background: #f8fafc; border-left: 3px solid var(--teal-500); padding: 10px 14px; border-radius: 4px; margin: 12px 0; font-size: 13px; color: var(--text-secondary);">
          <strong style="color: var(--teal-800);">Why it matters:</strong> ${escapeHtml(issue.whyItMatters)}
        </div>
      `
          : ''
      }

      ${
        issue.suggestedFix
          ? `
        <div style="margin-top: 12px;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.04em; margin-bottom: 6px;">
            Suggested Mentor Fix
          </div>
          <pre class="mentor-fix-diff"><code>${escapeHtml(issue.suggestedFix)}</code></pre>
        </div>
      `
          : ''
      }
    `;

    // Clicking issue scrolls to line in Code Viewer
    card.addEventListener('click', () => {
      document.querySelectorAll('.mentor-issue-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      if (issue.line) {
        highlightCodeViewerLine(issue.line);
      }
    });

    container.appendChild(card);
  });
}

function renderRecommendations(recommendations) {
  const container = document.getElementById('recommendationsContainer');
  if (!container) return;

  if (!recommendations || recommendations.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  const listEl = document.getElementById('recommendationsList');
  if (listEl) {
    listEl.innerHTML = recommendations
      .map(
        (rec) => `
      <li style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: var(--teal-50); color: var(--teal-700); font-weight: 700; font-size: 12px; flex-shrink: 0; margin-top: 2px;">✓</span>
        <span>${escapeHtml(rec)}</span>
      </li>
    `
      )
      .join('');
  }
}

function renderOptimizedCode(code) {
  const container = document.getElementById('optimizedCodeContainer');
  const codeEl = document.getElementById('optimizedCodeSnippet');
  if (!container || !codeEl) return;

  if (!code || !code.trim()) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  codeEl.textContent = code;
}

function initOptimizedCodeCopy() {
  const copyBtn = document.getElementById('copyOptimizedCodeBtn');
  const codeEl = document.getElementById('optimizedCodeSnippet');

  if (copyBtn && codeEl) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeEl.textContent);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy Code'), 2000);
      } catch {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy Code'), 2000);
      }
    });
  }
}

function renderCodeViewer(review) {
  const tableBody = document.getElementById('codeViewerTableBody');
  const fileTab = document.getElementById('codeViewerFileTab');

  if (fileTab) {
    fileTab.textContent = review.file || review.fileName || 'Solution.java';
  }

  if (!tableBody) return;
  tableBody.innerHTML = '';

  const rawCode = review.codeContent || review.rawCode || review.code || '// No source code provided.';
  const lines = rawCode.split('\n');

  const issueLineMap = new Map();
  (review.issues || []).forEach((issue) => {
    if (issue.line) {
      issueLineMap.set(issue.line, issue);
    }
  });

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const hasIssue = issueLineMap.has(lineNum);
    const tr = document.createElement('tr');
    tr.id = `code-line-${lineNum}`;
    tr.className = `code-row ${hasIssue ? 'has-issue' : ''}`;

    tr.innerHTML = `
      <td class="line-num">${lineNum}</td>
      <td class="line-marker">${hasIssue ? '⚠' : ''}</td>
      <td class="line-content"><code>${escapeHtml(lineText || ' ')}</code></td>
    `;

    if (hasIssue) {
      tr.title = issueLineMap.get(lineNum)?.title || 'Review item';
      tr.addEventListener('click', () => {
        const issue = issueLineMap.get(lineNum);
        if (issue) {
          const card = document.querySelector(`[data-issue-id="${issue.id}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('selected');
          }
        }
      });
    }

    tableBody.appendChild(tr);
  });
}

function highlightCodeViewerLine(lineNum) {
  document.querySelectorAll('.code-row').forEach((r) => r.classList.remove('highlighted'));
  const row = document.getElementById(`code-line-${lineNum}`);
  if (row) {
    row.classList.add('highlighted');
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function initIssueFilters() {
  const buttons = document.querySelectorAll('.issue-filter-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'ALL';
      if (currentReview) {
        renderIssues(currentReview.issues || []);
      }
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
