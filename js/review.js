/**
 * AI Code Reviewer - Core Review Result Controller
 * Drives the Code Health score, mentor-style issue guidance, IDE code viewer, and complexity comparisons.
 */

import { reviewService } from './services/reviewService.js';

let currentReview = null;
let currentFilter = 'ALL';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const reviewId = urlParams.get('id') || 'REV-2041';

  await loadReview(reviewId);
  initIssueFilters();
});

async function loadReview(id) {
  try {
    currentReview = await reviewService.getReviewById(id);
    renderHeader(currentReview);
    renderSummaryCards(currentReview);
    renderComplexitySection(currentReview.complexityAnalysis);
    renderIssues(currentReview.issues);
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

  if (repoEl) repoEl.textContent = review.repository;
  if (branchEl) branchEl.textContent = review.branch;
  if (fileEl) fileEl.textContent = review.file;
  if (langEl) langEl.textContent = review.language;
  if (dateEl) dateEl.textContent = review.date;

  if (scoreBadgeEl) {
    scoreBadgeEl.textContent = `${review.overallScore} / 100`;
  }

  if (healthTitleEl) {
    healthTitleEl.textContent = `${review.overallScore} / 100 — Good Code Health`;
  }
  if (healthDescEl) {
    healthDescEl.textContent = `Analyzed ${review.file}. Found ${review.issues ? review.issues.length : 0} items for review with algorithmic complexity optimization opportunities.`;
  }
}

function renderSummaryCards(review) {
  const bugCount = document.getElementById('countBugs');
  const secCount = document.getElementById('countSecurity');
  const qualCount = document.getElementById('countQuality');
  const perfCount = document.getElementById('countPerf');
  const timeBadge = document.getElementById('summaryTimeComplexity');
  const spaceBadge = document.getElementById('summarySpaceComplexity');

  if (bugCount) bugCount.textContent = review.counts.bugs || 0;
  if (secCount) secCount.textContent = review.counts.security || 0;
  if (qualCount) qualCount.textContent = review.counts.quality || 0;
  if (perfCount) perfCount.textContent = review.counts.performance || 0;

  if (timeBadge) timeBadge.textContent = review.timeComplexity || 'O(n)';
  if (spaceBadge) spaceBadge.textContent = review.spaceComplexity || 'O(1)';
}

function renderComplexitySection(complexity) {
  if (!complexity) return;

  const timeEl = document.getElementById('compTimeMetric');
  const spaceEl = document.getElementById('compSpaceMetric');
  const bestEl = document.getElementById('compBestCase');
  const avgEl = document.getElementById('compAvgCase');
  const worstEl = document.getElementById('compWorstCase');
  const expEl = document.getElementById('compExplanationText');
  const partsListEl = document.getElementById('compPartsList');

  if (timeEl) timeEl.textContent = complexity.timeComplexity;
  if (spaceEl) spaceEl.textContent = complexity.spaceComplexity;
  if (bestEl) bestEl.textContent = complexity.timeBestCase || complexity.timeComplexity;
  if (avgEl) avgEl.textContent = complexity.timeAverageCase || complexity.timeComplexity;
  if (worstEl) worstEl.textContent = complexity.timeWorstCase || complexity.timeComplexity;
  if (expEl) expEl.textContent = complexity.summaryExplanation;

  if (partsListEl && complexity.contributingParts) {
    partsListEl.innerHTML = complexity.contributingParts
      .map(
        (part) => `
        <li style="margin-bottom: 6px; font-size: 13px; color: var(--text-secondary); display: flex; align-items: baseline; gap: 8px;">
          <span class="badge badge-medium">Line ${part.line}</span>
          <span>${escapeHtml(part.label)}</span>
        </li>`
      )
      .join('');
  }

  // Side-by-side comparison
  const compGrid = document.getElementById('complexityComparisonContainer');
  if (compGrid && complexity.comparison) {
    const comp = complexity.comparison;
    compGrid.innerHTML = `
      <div class="comparison-box current">
        <div class="comparison-label">Current Implementation</div>
        <div class="comparison-metrics">
          <span class="complexity-badge time">Time: ${escapeHtml(comp.current.time)}</span>
          <span class="complexity-badge space">Space: ${escapeHtml(comp.current.space)}</span>
        </div>
        <div class="comparison-desc">${escapeHtml(comp.current.description)}</div>
      </div>

      <div class="comparison-box optimized">
        <div class="comparison-label">Suggested AI Optimization</div>
        <div class="comparison-metrics">
          <span class="complexity-badge time" style="background: #ecfdf5; color: #047857; border-color: #a7f3d0;">Time: ${escapeHtml(comp.optimized.time)}</span>
          <span class="complexity-badge space" style="background: #f0fdfa; color: #0f766e; border-color: #99f6e4;">Space: ${escapeHtml(comp.optimized.space)}</span>
        </div>
        <div class="comparison-desc">${escapeHtml(comp.optimized.description)}</div>
      </div>
    `;

    const tradeOffEl = document.getElementById('tradeoffExplanationText');
    if (tradeOffEl) {
      tradeOffEl.textContent = comp.tradeoffExplanation;
    }
  }
}

function initIssueFilters() {
  const filterBtns = document.querySelectorAll('.issue-filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      if (currentReview) {
        renderIssues(currentReview.issues);
      }
    });
  });
}

function renderIssues(issues = []) {
  const issuesContainer = document.getElementById('issuesContainer');
  if (!issuesContainer) return;

  issuesContainer.innerHTML = '';

  let filtered = issues;
  if (currentFilter !== 'ALL') {
    filtered = issues.filter((iss) => iss.severity.toUpperCase() === currentFilter);
  }

  if (filtered.length === 0) {
    issuesContainer.innerHTML = `
      <div style="padding: 32px; text-align: center; color: var(--text-tertiary); background: var(--bg-surface); border: 1px dashed var(--border-light); border-radius: var(--radius-md);">
        No issues matching the filter "${currentFilter}".
      </div>
    `;
    return;
  }

  filtered.forEach((issue, index) => {
    const card = document.createElement('div');
    card.className = 'issue-card';
    card.id = `issue-card-${issue.id}`;

    let badgeClass = 'badge-low';
    if (issue.severity === 'CRITICAL') badgeClass = 'badge-critical';
    else if (issue.severity === 'HIGH') badgeClass = 'badge-high';
    else if (issue.severity === 'MEDIUM') badgeClass = 'badge-medium';
    else if (issue.severity === 'SUGGESTION') badgeClass = 'badge-suggestion';

    card.innerHTML = `
      <div class="issue-header">
        <div class="issue-title-area">
          <span class="badge ${badgeClass}">${issue.severity}</span>
          <span style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${escapeHtml(issue.title)}</span>
        </div>
        <div class="issue-meta">
          <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--teal-700);">Line ${issue.line}</span>
          <span class="badge" style="background: var(--bg-subtle); color: var(--text-secondary);">${escapeHtml(issue.category)}</span>
          <span class="toggle-icon" style="font-size: 12px; color: var(--text-tertiary);">▼</span>
        </div>
      </div>

      <div class="issue-body">
        <div class="mentor-section">
          <div class="mentor-question">
            <span>❓</span> What is wrong?
          </div>
          <div class="mentor-answer">
            ${escapeHtml(issue.mentorExplanation.whatIsWrong)}
          </div>
        </div>

        <div class="mentor-section">
          <div class="mentor-question">
            <span>⚠️</span> Why does it matter?
          </div>
          <div class="mentor-answer">
            ${escapeHtml(issue.mentorExplanation.whyItMatters)}
          </div>
        </div>

        <div class="mentor-section">
          <div class="mentor-question">
            <span>💡</span> How can it be improved?
          </div>
          <div class="mentor-answer">
            ${escapeHtml(issue.mentorExplanation.howToImprove)}
          </div>
        </div>

        <div class="mentor-section">
          <div class="mentor-question">
            <span>🔄</span> What will change after the fix?
          </div>
          <div class="mentor-answer">
            ${escapeHtml(issue.mentorExplanation.whatWillChange)}
          </div>
        </div>

        <div class="mentor-section">
          <div class="mentor-question">
            <span>⚡</span> Expected complexity after improvement
          </div>
          <div class="mentor-answer" style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--teal-700);">
            ${escapeHtml(issue.mentorExplanation.expectedComplexity)}
          </div>
        </div>

        ${
          issue.codeFix
            ? `
          <div class="mentor-section">
            <div class="mentor-question"><span>🛠️</span> Suggested Code Diff</div>
            <pre class="mentor-fix-diff"><code>${formatDiff(issue.codeFix)}</code></pre>
          </div>
        `
            : ''
        }

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
          <button type="button" class="btn btn-outline btn-sm focus-line-btn" data-line="${issue.line}">
            Inspect Line ${issue.line} in Code Viewer
          </button>
        </div>
      </div>
    `;

    // Collapsible header toggle
    const header = card.querySelector('.issue-header');
    const body = card.querySelector('.issue-body');
    const toggleIcon = card.querySelector('.toggle-icon');

    header.addEventListener('click', (e) => {
      // Don't toggle if clicking inspect button
      if (e.target.closest('.focus-line-btn')) return;
      const isVisible = body.style.display !== 'none';
      body.style.display = isVisible ? 'none' : 'flex';
      toggleIcon.textContent = isVisible ? '▶' : '▼';
    });

    // Inspect button links to code viewer line
    const inspectBtn = card.querySelector('.focus-line-btn');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        highlightCodeLine(issue.line, issue.severity);
      });
    }

    issuesContainer.appendChild(card);
  });
}

function renderCodeViewer(review) {
  const tableBody = document.getElementById('codeViewerTableBody');
  const codeFileTab = document.getElementById('codeViewerFileTab');

  if (!tableBody) return;
  if (codeFileTab) codeFileTab.textContent = review.file || 'SourceCode.ts';

  const rawCode = review.codeContent || '// No source code available for this review.';
  const lines = rawCode.split('\n');

  tableBody.innerHTML = '';

  const issueLinesMap = {};
  if (review.issues) {
    review.issues.forEach((iss) => {
      issueLinesMap[iss.line] = iss;
    });
  }

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const issueOnLine = issueLinesMap[lineNum];

    const row = document.createElement('tr');
    row.className = 'code-row';
    row.id = `code-line-${lineNum}`;

    if (issueOnLine) {
      if (issueOnLine.severity === 'CRITICAL') {
        row.classList.add('highlighted-critical');
      } else {
        row.classList.add('highlighted-issue');
      }
    }

    const gutterIndicator = issueOnLine
      ? `<span title="${escapeHtml(issueOnLine.title)}" style="cursor: pointer; color: ${issueOnLine.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}; font-weight: bold; margin-right: 4px;">●</span>`
      : '';

    row.innerHTML = `
      <td class="code-line-num">${gutterIndicator}${lineNum}</td>
      <td class="code-line-content">${colorizeSyntax(lineText)}</td>
    `;

    // Clicking line scrolls to issue if one exists
    if (issueOnLine) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const issueCard = document.getElementById(`issue-card-${issueOnLine.id}`);
        if (issueCard) {
          issueCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          issueCard.classList.add('active-selected');
          setTimeout(() => issueCard.classList.remove('active-selected'), 2500);
        }
      });
    }

    tableBody.appendChild(row);
  });
}

function highlightCodeLine(lineNum, severity) {
  const row = document.getElementById(`code-line-${lineNum}`);
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.style.outline = '2px solid var(--teal-500)';
    setTimeout(() => {
      row.style.outline = 'none';
    }, 2500);
  }
}

function colorizeSyntax(text) {
  let safe = escapeHtml(text);
  // Comments
  if (safe.trim().startsWith('//') || safe.trim().startsWith('/*') || safe.trim().startsWith('*')) {
    return `<span class="token-comment">${safe}</span>`;
  }

  // Basic JS/TS/Python keyword colorizer for preview
  safe = safe.replace(/\b(import|export|class|public|private|function|const|let|var|if|else|for|return|def|package|while)\b/g, '<span class="token-kw">$1</span>');
  safe = safe.replace(/\b(number|string|boolean|any|CalculationResult|Order|OrderItem|DiscountRule)\b/g, '<span class="token-type">$1</span>');
  safe = safe.replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="token-str">$1</span>');
  safe = safe.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="token-num">$1</span>');

  return safe;
}

function formatDiff(diffText) {
  return diffText
    .split('\n')
    .map((line) => {
      if (line.startsWith('+')) {
        return `<span class="mentor-diff-line-add">${escapeHtml(line)}</span>`;
      } else if (line.startsWith('-')) {
        return `<span class="mentor-diff-line-remove">${escapeHtml(line)}</span>`;
      }
      return escapeHtml(line);
    })
    .join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
