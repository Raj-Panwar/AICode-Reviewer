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
    const healthStatus = review.overallScore >= 85 ? 'Excellent Code Health' : (review.overallScore >= 75 ? 'Good Code Health' : 'Needs Optimization');
    healthTitleEl.textContent = `${review.overallScore} / 100 — ${healthStatus}`;
  }
  if (healthDescEl) {
    healthDescEl.textContent = `Analyzed ${review.file}. Found ${review.issues ? review.issues.length : 0} items for review with algorithmic complexity optimization opportunities.`;
  }

  const scoreNumberEl = document.querySelector('.health-score-pill .score-number');
  const scoreStatusEl = document.querySelector('.health-score-pill .score-text-status');
  if (scoreNumberEl) {
    scoreNumberEl.textContent = review.overallScore;
  }
  if (scoreStatusEl) {
    scoreStatusEl.textContent = review.overallScore >= 80 ? 'Production Ready*' : 'Needs Attention';
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

  const timeVal = complexity.time || complexity.timeComplexity || 'O(n)';
  const spaceVal = complexity.space || complexity.spaceComplexity || 'O(1)';

  if (timeEl) timeEl.textContent = timeVal;
  if (spaceEl) spaceEl.textContent = spaceVal;
  if (bestEl) bestEl.textContent = complexity.timeBestCase || (timeVal === 'O(n²)' ? 'O(n)' : timeVal);
  if (avgEl) avgEl.textContent = complexity.timeAverageCase || timeVal;
  if (worstEl) worstEl.textContent = complexity.timeWorstCase || timeVal;
  if (expEl) expEl.textContent = complexity.timeExplanation || complexity.summaryExplanation || 'Algorithmic time complexity calculated from loop structures and abstract syntax tree tokens.';

  if (partsListEl) {
    if (complexity.contributingParts && complexity.contributingParts.length > 0) {
      partsListEl.innerHTML = complexity.contributingParts
        .map(
          (part) => `
          <li style="margin-bottom: 6px; font-size: 13px; color: var(--text-secondary); display: flex; align-items: baseline; gap: 8px;">
            <span class="badge badge-medium">Line ${part.line}</span>
            <span>${escapeHtml(part.label)}</span>
          </li>`
        )
        .join('');
    } else if (complexity.bottleneckLine) {
      partsListEl.innerHTML = `
        <li style="margin-bottom: 6px; font-size: 13px; color: var(--text-secondary); display: flex; align-items: baseline; gap: 8px;">
          <span class="badge badge-medium">Line ${complexity.bottleneckLine}</span>
          <span>${escapeHtml(complexity.timeExplanation || 'Primary iteration bottleneck location')}</span>
        </li>
      `;
    }
  }

  // Side-by-side comparison
  const compGrid = document.getElementById('complexityComparisonContainer');
  const tradeOffEl = document.getElementById('tradeoffExplanationText');

  if (compGrid) {
    if (complexity.comparison) {
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
      if (tradeOffEl) {
        tradeOffEl.textContent = comp.tradeoffExplanation || comp.tradeoff;
      }
    } else if (complexity.comparisonTable && complexity.comparisonTable.length >= 2) {
      const current = complexity.comparisonTable[0];
      const opt = complexity.comparisonTable[1];
      compGrid.innerHTML = `
        <div class="comparison-box current">
          <div class="comparison-label">${escapeHtml(current.metric)}</div>
          <div class="comparison-metrics">
            <span class="complexity-badge time">Time: ${escapeHtml(current.time)}</span>
            <span class="complexity-badge space">Space: ${escapeHtml(current.space)}</span>
          </div>
          <div class="comparison-desc">Throughput: ${escapeHtml(current.throughput || 'Base')}</div>
        </div>

        <div class="comparison-box optimized">
          <div class="comparison-label">${escapeHtml(opt.metric)}</div>
          <div class="comparison-metrics">
            <span class="complexity-badge time" style="background: #ecfdf5; color: #047857; border-color: #a7f3d0;">Time: ${escapeHtml(opt.time)}</span>
            <span class="complexity-badge space" style="background: #f0fdfa; color: #0f766e; border-color: #99f6e4;">Space: ${escapeHtml(opt.space)}</span>
          </div>
          <div class="comparison-desc">Throughput: ${escapeHtml(opt.throughput || 'Optimized')}</div>
        </div>
      `;
      if (tradeOffEl && complexity.recommendedPattern) {
        tradeOffEl.textContent = complexity.recommendedPattern;
      }
    }
  }
}

function updateFilterCounts(issues = []) {
  const allCount = issues.length;
  const critCount = issues.filter((i) => {
    const s = (i.severity || '').toUpperCase();
    return s === 'CRITICAL' || s === 'HIGH';
  }).length;
  const medCount = issues.filter((i) => (i.severity || '').toUpperCase() === 'MEDIUM').length;
  const lowCount = issues.filter((i) => {
    const s = (i.severity || '').toUpperCase();
    return s === 'LOW' || s === 'SUGGESTION';
  }).length;

  const btnAll = document.querySelector('.issue-filter-btn[data-filter="ALL"]');
  const btnCrit = document.querySelector('.issue-filter-btn[data-filter="CRITICAL"]');
  const btnMed = document.querySelector('.issue-filter-btn[data-filter="MEDIUM"]');
  const btnLow = document.querySelector('.issue-filter-btn[data-filter="LOW"]');

  if (btnAll) btnAll.textContent = `All Issues (${allCount})`;
  if (btnCrit) btnCrit.textContent = `Critical (${critCount})`;
  if (btnMed) btnMed.textContent = `Medium (${medCount})`;
  if (btnLow) btnLow.textContent = `Low (${lowCount})`;
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

  updateFilterCounts(issues);
  issuesContainer.innerHTML = '';

  let filtered = issues;
  if (currentFilter !== 'ALL') {
    filtered = issues.filter((iss) => {
      const s = (iss.severity || '').toUpperCase();
      if (currentFilter === 'CRITICAL') return s === 'CRITICAL' || s === 'HIGH';
      return s === currentFilter;
    });
  }

  if (filtered.length === 0) {
    issuesContainer.innerHTML = `
      <div style="padding: 32px; text-align: center; color: var(--text-tertiary); background: var(--bg-surface); border: 1px dashed var(--border-light); border-radius: var(--radius-md);">
        No issues matching the filter "${currentFilter}".
      </div>
    `;
    return;
  }

  filtered.forEach((issue) => {
    const card = document.createElement('div');
    card.className = 'issue-card';
    card.id = `issue-card-${issue.id}`;

    const sevUpper = (issue.severity || 'LOW').toUpperCase();
    let badgeClass = 'badge-low';
    if (sevUpper === 'CRITICAL') badgeClass = 'badge-critical';
    else if (sevUpper === 'HIGH') badgeClass = 'badge-high';
    else if (sevUpper === 'MEDIUM') badgeClass = 'badge-medium';
    else if (sevUpper === 'SUGGESTION') badgeClass = 'badge-suggestion';

    const whatIsWrong =
      issue.mentorExplanation?.whatIsWrong ||
      issue.description ||
      'Defect detected in this code section.';

    const whyItMatters =
      issue.mentorExplanation?.whyItMatters ||
      issue.whyItMatters ||
      'May produce unexpected runtime behavior or algorithmic performance degradation.';

    const howToImprove =
      issue.mentorExplanation?.howToImprove ||
      (issue.suggestedFix ? 'Refactor code using the verified fix below:' : 'Follow idiomatic patterns and guard checks.');

    const whatWillChange =
      issue.mentorExplanation?.whatWillChange ||
      'Restores predictable flow and eliminates vulnerability.';

    const expectedComplexity =
      issue.mentorExplanation?.expectedComplexity ||
      issue.expectedComplexity ||
      (currentReview?.timeComplexity || 'O(n)');

    const codeDiff =
      issue.codeFix ||
      (issue.suggestedFix
        ? issue.suggestedFix
            .split('\n')
            .map((l) => `+ ${l}`)
            .join('\n')
        : null);

    card.innerHTML = `
      <div class="issue-header">
        <div class="issue-title-area">
          <span class="badge ${badgeClass}">${issue.severity || 'Medium'}</span>
          <span style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${escapeHtml(issue.title)}</span>
        </div>
        <div class="issue-meta">
          <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--teal-700);">Line ${issue.line}</span>
          <span class="badge" style="background: var(--bg-subtle); color: var(--text-secondary);">${escapeHtml(issue.category || 'General')}</span>
          <span class="toggle-icon" style="font-size: 12px; color: var(--text-tertiary);">▼</span>
        </div>
      </div>

      <div class="issue-body">
        <div class="mentor-section">
          <div class="mentor-question">
            <span>❓</span> What is wrong?
          </div>
          <div class="mentor-answer">
            ${escapeHtml(whatIsWrong)}
          </div>
        </div>

        <div class="mentor-section">
          <div class="mentor-question">
            <span>⚠️</span> Why does it matter?
          </div>
          <div class="mentor-answer">
            ${escapeHtml(whyItMatters)}
          </div>
        </div>

        <div class="mentor-section">
          <div class="mentor-question">
            <span>💡</span> How can it be improved?
          </div>
          <div class="mentor-answer">
            ${escapeHtml(howToImprove)}
          </div>
        </div>

        <div class="mentor-section">
          <div class="mentor-question">
            <span>🔄</span> What will change after the fix?
          </div>
          <div class="mentor-answer">
            ${escapeHtml(whatWillChange)}
          </div>
        </div>

        <div class="mentor-section">
          <div class="mentor-question">
            <span>⚡</span> Expected complexity after improvement
          </div>
          <div class="mentor-answer" style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--teal-700);">
            ${escapeHtml(expectedComplexity)}
          </div>
        </div>

        ${
          codeDiff
            ? `
          <div class="mentor-section">
            <div class="mentor-question"><span>🛠️</span> Suggested Code Fix</div>
            <pre class="mentor-fix-diff"><code>${formatDiff(codeDiff)}</code></pre>
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
      if (e.target.closest('.focus-line-btn')) return;
      const isVisible = body.style.display !== 'none';
      body.style.display = isVisible ? 'none' : 'flex';
      toggleIcon.textContent = isVisible ? '▶' : '▼';
    });

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
  // Comments (supports //, /*, *, #)
  if (
    safe.trim().startsWith('//') ||
    safe.trim().startsWith('/*') ||
    safe.trim().startsWith('*') ||
    safe.trim().startsWith('#')
  ) {
    return `<span class="token-comment">${safe}</span>`;
  }

  // Multi-language keywords: Java, Python, C, C++, JS, TS, Go, Kotlin, Rust
  const kwPattern = /\b(import|export|from|as|class|interface|struct|enum|union|typedef|public|private|protected|internal|static|final|const|let|var|val|fun|func|fn|function|def|return|if|else|elif|for|while|do|switch|case|default|break|continue|match|when|try|catch|finally|throw|throws|raise|with|package|namespace|using|impl|trait|type|mut|override|virtual|constexpr|nullptr|null|nil|None|True|False|true|false|new|this|self|Self|super|async|await|suspend|defer|go|select|chan|yield|pass|unsafe|where)\b/g;
  safe = safe.replace(kwPattern, '<span class="token-kw">$1</span>');

  // Common types across all supported languages
  const typePattern = /\b(int|long|short|byte|float|double|char|bool|boolean|string|String|number|any|void|size_t|uint64_t|int64_t|uint32_t|int32_t|u8|u16|u32|u64|usize|i8|i16|i32|i64|isize|f32|f64|str|Option|Result|Vec|BTreeMap|HashMap|Map|Set|HashSet|List|ArrayList|Array|Object|Promise|BigDecimal|MemoryBlock|Order|OrderDto|OrderItem|CustomerOrder)\b/g;
  safe = safe.replace(typePattern, '<span class="token-type">$1</span>');

  // Strings
  safe = safe.replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="token-str">$1</span>');

  // Numeric literals
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
