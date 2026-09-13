/**
 * AI Code Reviewer - New Review Controller
 * Handles Paste, File Upload, and GitHub submission tabs with transparent multi-stage progress.
 */

import { reviewService } from './services/reviewService.js';
import { mockRepositories } from './data/mockData.js';

let uploadedFiles = [];

const SAMPLE_SNIPPETS = {
  orderProcessor: {
    fileName: "OrderProcessor.ts",
    language: "TypeScript",
    code: `export class OrderProcessor {
  private taxRate: number = 0.0825;

  public calculateTotal(order: any, discounts: any[]): any {
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of order.items) {
      subtotal += item.price * item.quantity;
    }

    // Direct property access without null check
    const userTier = order.customer.tier.toLowerCase();

    // Nested O(n²) loop search
    for (const item of order.items) {
      for (const discount of discounts) {
        if (discount.applicableSku === item.sku && discount.active) {
          totalDiscount += (item.price * discount.percentage) / 100;
        }
      }
    }

    const rawTax = (subtotal - totalDiscount) * this.taxRate;
    return { subtotal, discount: totalDiscount, total: subtotal - totalDiscount + rawTax };
  }
}`
  },
  twoSum: {
    fileName: "two_sum_solution.py",
    language: "Python",
    code: `def two_sum(nums, target):
    # Brute force quadratic O(n²) approach
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`
  },
  jwtVerifier: {
    fileName: "jwt_verifier.go",
    language: "Go",
    code: `package auth

import (
  "crypto/hmac"
  "crypto/sha256"
  "errors"
)

func VerifyToken(tokenString string, secretKey []byte) (bool, error) {
  if len(tokenString) == 0 {
    return false, errors.New("empty token")
  }
  // Signature validation logic with constant time comparison
  return true, nil
}`
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPresetLoader();
  initDropzone();
  initGitHubSelector();
  initFormSubmission();
});

/**
 * Tab switching logic
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      button.classList.add('active');
      const targetId = button.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

/**
 * Quick load sample code buttons
 */
function initPresetLoader() {
  const selectPreset = document.getElementById('samplePresetSelect');
  const fileNameInput = document.getElementById('pasteFileName');
  const langSelect = document.getElementById('pasteLanguage');
  const codeArea = document.getElementById('pasteCodeArea');

  if (!selectPreset || !codeArea) return;

  selectPreset.addEventListener('change', (e) => {
    const key = e.target.value;
    if (!key || !SAMPLE_SNIPPETS[key]) return;

    const sample = SAMPLE_SNIPPETS[key];
    if (fileNameInput) fileNameInput.value = sample.fileName;
    if (langSelect) langSelect.value = sample.language;
    codeArea.value = sample.code;
  });
}

/**
 * File upload drag and drop handlers
 */
function initDropzone() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('fileUploadInput');
  const uploadedList = document.getElementById('uploadedFilesList');

  if (!dropzone || !fileInput || !uploadedList) return;

  dropzone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  });

  function handleFiles(files) {
    files.forEach((file) => {
      uploadedFiles.push({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type || 'Source Code'
      });
    });
    renderUploadedList();
  }

  function renderUploadedList() {
    uploadedList.innerHTML = '';
    uploadedFiles.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'uploaded-file-item';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="color: var(--teal-600); font-weight: 600;">📄</span>
          <div>
            <div style="font-size: 13px; font-weight: 600;">${escapeHtml(file.name)}</div>
            <div style="font-size: 11px; color: var(--text-tertiary);">${file.size} • ${file.type}</div>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-index="${index}" style="padding: 4px 8px; color: var(--red-600);">
          Remove
        </button>
      `;

      item.querySelector('button').addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        uploadedFiles.splice(idx, 1);
        renderUploadedList();
      });

      uploadedList.appendChild(item);
    });
  }
}

/**
 * GitHub repository, branch, and file selection mock
 */
function initGitHubSelector() {
  const repoSelect = document.getElementById('githubRepoSelect');
  const branchSelect = document.getElementById('githubBranchSelect');

  if (!repoSelect) return;

  mockRepositories.forEach((repo) => {
    const opt = document.createElement('option');
    opt.value = repo.name;
    opt.textContent = `${repo.owner}/${repo.name} (${repo.language})`;
    repoSelect.appendChild(opt);
  });

  repoSelect.addEventListener('change', () => {
    if (branchSelect) {
      branchSelect.innerHTML = `
        <option value="main">main (default)</option>
        <option value="develop">develop</option>
        <option value="feature/optimize-order-processing">feature/optimize-order-processing</option>
      `;
    }
  });
}

/**
 * Form Submission & Transparent Multi-Stage Analysis Orchestration
 */
function initFormSubmission() {
  const startBtn = document.getElementById('startReviewBtn');
  const modalBackdrop = document.getElementById('analysisModal');
  const stepItems = document.querySelectorAll('.analysis-step-item');
  const progressFill = document.getElementById('analysisProgressFill');
  const currentStepText = document.getElementById('currentStepText');

  if (!startBtn || !modalBackdrop) return;

  startBtn.addEventListener('click', async () => {
    // Gather inputs
    const activeTabBtn = document.querySelector('.tab-btn.active');
    const tabType = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'paste';

    let submission = {
      tabType,
      fileName: "OrderProcessor.ts",
      language: "TypeScript",
      code: ""
    };

    if (tabType === 'tabPaste') {
      submission.fileName = document.getElementById('pasteFileName')?.value || "Snippet.ts";
      submission.language = document.getElementById('pasteLanguage')?.value || "TypeScript";
      submission.code = document.getElementById('pasteCodeArea')?.value || "";
    } else if (tabType === 'tabUpload') {
      submission.fileName = uploadedFiles[0]?.name || "UploadedModule.ts";
      submission.language = "TypeScript";
    } else if (tabType === 'tabGitHub') {
      submission.fileName = document.getElementById('githubFileSelect')?.value || "src/OrderProcessor.ts";
      submission.language = "TypeScript";
    }

    // Open multi-stage modal
    modalBackdrop.classList.add('active');

    // Reset step indicators
    stepItems.forEach((el) => {
      el.className = 'analysis-step-item pending';
      const ind = el.querySelector('.step-indicator');
      if (ind) ind.textContent = el.getAttribute('data-step');
    });

    try {
      const resultReview = await reviewService.runAnalysis(submission, (stage) => {
        if (progressFill) progressFill.style.width = `${stage.progress}%`;
        if (currentStepText) currentStepText.textContent = stage.label;

        stepItems.forEach((item) => {
          const stepNum = parseInt(item.getAttribute('data-step'), 10);
          const indicator = item.querySelector('.step-indicator');

          if (stepNum < stage.step) {
            item.className = 'analysis-step-item completed';
            if (indicator) indicator.innerHTML = '✓';
          } else if (stepNum === stage.step) {
            item.className = 'analysis-step-item in-progress';
            if (indicator) indicator.textContent = '…';
          } else {
            item.className = 'analysis-step-item pending';
            if (indicator) indicator.textContent = stepNum;
          }
        });
      });

      // Brief pause to allow user to see 100% completion
      setTimeout(() => {
        window.location.href = `review.html?id=${resultReview.id}`;
      }, 600);
    } catch (err) {
      console.error('Analysis execution failed:', err);
      modalBackdrop.classList.remove('active');
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
