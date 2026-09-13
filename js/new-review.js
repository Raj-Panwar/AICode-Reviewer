/**
 * AI Code Reviewer - New Review Controller
 * Handles 3 distinct workflows: Write Code, Add File, and Connect Repository.
 * Fully synchronized with languageState.js across all 9 supported languages.
 */

import { reviewService } from './services/reviewService.js';
import {
  languageState,
  SUPPORTED_LANGUAGES,
  detectLanguageFromFilename
} from './services/languageState.js';
import { mockRepositories } from './data/mockData.js';

let activeWorkflow = null; // 'writeCode' | 'addFile' | 'connectRepo'
let currentUploadedFile = null; // { name, size, text, detectedLanguage }
let selectedRepo = null;
let selectedBranch = 'main';
let selectedRepoFile = null;

const SAMPLE_SNIPPETS = {
  'ts-order': {
    fileName: 'OrderProcessor.ts',
    language: 'TypeScript',
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
  'java-payment': {
    fileName: 'PaymentProcessor.java',
    language: 'Java',
    code: `package com.fintech.payments;

import java.util.List;
import java.math.BigDecimal;

public class PaymentProcessor {
    // Nested O(n²) loop comparison across transactions & settlement batches
    public BigDecimal calculatePendingSettlement(List<Transaction> transactions, List<BatchRule> rules) {
        BigDecimal total = BigDecimal.ZERO;
        for (Transaction tx : transactions) {
            // Missing null guard on transaction status
            if (tx.getStatus().equals("PENDING")) {
                for (BatchRule rule : rules) {
                    if (rule.matches(tx.getMerchantId())) {
                        total = total.add(tx.getAmount().multiply(rule.getRate()));
                    }
                }
            }
        }
        return total;
    }
}`
  },
  'python-twosum': {
    fileName: 'two_sum_solution.py',
    language: 'Python',
    code: `def two_sum(nums, target):
    # Brute-force quadratic search: O(n²) time complexity
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`
  },
  'c-buffer': {
    fileName: 'buffer_pool.c',
    language: 'C',
    code: `#include <stdlib.h>
#include <string.h>

typedef struct {
    char *data;
    size_t size;
    size_t capacity;
} BufferPool;

void append_data(BufferPool *pool, const char *src, size_t len) {
    // Direct memory copy without checking bounds
    memcpy(pool->data + pool->size, src, len);
    pool->size += len;
}`
  },
  'cpp-orderbook': {
    fileName: 'OrderBook.cpp',
    language: 'C++',
    code: `#include <vector>
#include <algorithm>

struct Order {
    int id;
    double price;
    int quantity;
};

class OrderBook {
    std::vector<Order> orders;
public:
    void cancelOrder(int orderId) {
        // Linear scan and O(n) erase shifting vector elements
        for (auto it = orders.begin(); it != orders.end(); ++it) {
            if (it->id == orderId) {
                orders.erase(it);
                break;
            }
        }
    }
};`
  },
  'js-aggregator': {
    fileName: 'dataAggregator.js',
    language: 'JavaScript',
    code: `export function filterUniqueTransactions(transactions, blocklist) {
  // Nested filter + indexOf creates O(n*m) bottleneck
  return transactions.filter(tx => {
    return blocklist.indexOf(tx.senderAddress) === -1 && tx.amount > 0;
  });
}`
  },
  'go-verifier': {
    fileName: 'jwt_verifier.go',
    language: 'Go',
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
  },
  'kotlin-repo': {
    fileName: 'AccountRepository.kt',
    language: 'Kotlin',
    code: `package com.bank.repository

import kotlinx.coroutines.*

class AccountRepository(private val dbDispatcher: CoroutineDispatcher) {
    // Missing Dispatchers.IO context switch causes main thread blocking
    suspend fun fetchAccountBalance(accountId: String): Double {
        Thread.sleep(150) // Blocking simulation
        return 4250.00
    }
}`
  },
  'rust-ring': {
    fileName: 'hash_ring.rs',
    language: 'Rust',
    code: `use std::collections::BTreeMap;

pub struct HashRing {
    nodes: BTreeMap<u64, String>,
}

impl HashRing {
    pub fn get_node(&self, key: u64) -> Option<&String> {
        // Range search on BTreeMap
        if let Some((_, node)) = self.nodes.range(key..).next() {
            Some(node)
        } else {
            self.nodes.values().next()
        }
    }
}`
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initChoiceScreen();
  initLanguageSync();
  initWriteCodeWorkflow();
  initAddFileWorkflow();
  initConnectRepoWorkflow();
  initFormSubmission();
});

/**
 * Switch between Choice Screen and Active Workflows
 */
function initChoiceScreen() {
  const choiceScreen = document.getElementById('methodChoiceScreen');
  const workflowContainer = document.getElementById('activeWorkflowContainer');
  const reviewConfigCard = document.getElementById('reviewConfigCard');
  const badge = document.getElementById('currentWorkflowBadge');
  const backBtn = document.getElementById('backToOptionsBtn');

  const chooseWriteCode = document.getElementById('chooseWriteCodeBtn');
  const chooseAddFile = document.getElementById('chooseAddFileBtn');
  const chooseConnectRepo = document.getElementById('chooseConnectRepoBtn');

  function openWorkflow(type, badgeLabel, targetTabId) {
    activeWorkflow = type;
    if (choiceScreen) choiceScreen.style.display = 'none';
    if (workflowContainer) workflowContainer.style.display = 'block';
    if (reviewConfigCard) reviewConfigCard.style.display = 'block';
    if (badge) badge.textContent = badgeLabel;

    // Show matching tab content
    document.querySelectorAll('.tab-content').forEach((tab) => {
      tab.classList.remove('active');
    });
    const targetTab = document.getElementById(targetTabId);
    if (targetTab) targetTab.classList.add('active');

    // Scroll smoothly to active container
    workflowContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function backToOptions() {
    activeWorkflow = null;
    if (choiceScreen) choiceScreen.style.display = 'block';
    if (workflowContainer) workflowContainer.style.display = 'none';
    if (reviewConfigCard) reviewConfigCard.style.display = 'none';

    // Clear transient upload preview if leaving add file
    clearUploadedFile();
  }

  if (chooseWriteCode) {
    chooseWriteCode.addEventListener('click', () => {
      openWorkflow('writeCode', 'Write Code', 'tabPaste');
    });
    chooseWriteCode.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWorkflow('writeCode', 'Write Code', 'tabPaste');
      }
    });
  }

  if (chooseAddFile) {
    chooseAddFile.addEventListener('click', () => {
      openWorkflow('addFile', 'Add File', 'tabUpload');
    });
    chooseAddFile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWorkflow('addFile', 'Add File', 'tabUpload');
      }
    });
  }

  if (chooseConnectRepo) {
    chooseConnectRepo.addEventListener('click', () => {
      openWorkflow('connectRepo', 'Connect Repository', 'tabGitHub');
      // Ensure initial repo selection is populated
      triggerInitialRepoLoad();
    });
    chooseConnectRepo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWorkflow('connectRepo', 'Connect Repository', 'tabGitHub');
        triggerInitialRepoLoad();
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', backToOptions);
  }
}

/**
 * Synchronize language selectors across all workflows via languageState.js
 */
function initLanguageSync() {
  const pasteLangSelect = document.getElementById('pasteLanguage');
  const uploadLangSelect = document.getElementById('uploadLanguageSelect');
  const githubLangSelect = document.getElementById('githubLanguageSelect');

  // Populate any select that doesn't already have all 9 options
  [pasteLangSelect, uploadLangSelect, githubLangSelect].forEach((selectEl) => {
    if (!selectEl) return;
    if (selectEl.options.length < SUPPORTED_LANGUAGES.length) {
      selectEl.innerHTML = '';
      SUPPORTED_LANGUAGES.forEach((lang) => {
        const opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = lang;
        selectEl.appendChild(opt);
      });
    }
  });

  // Listen to centralized state changes
  languageState.subscribe((currentLang) => {
    if (pasteLangSelect && pasteLangSelect.value !== currentLang) {
      pasteLangSelect.value = currentLang;
    }
    if (uploadLangSelect && uploadLangSelect.value !== currentLang) {
      uploadLangSelect.value = currentLang;
    }
    if (githubLangSelect && githubLangSelect.value !== currentLang) {
      githubLangSelect.value = currentLang;
    }
    const uploadBadge = document.getElementById('uploadFileLangBadge');
    if (uploadBadge) uploadBadge.textContent = currentLang;
  });

  // Wire event listeners on user change
  if (pasteLangSelect) {
    pasteLangSelect.addEventListener('change', (e) => {
      languageState.setLanguage(e.target.value);
    });
  }

  if (uploadLangSelect) {
    uploadLangSelect.addEventListener('change', (e) => {
      languageState.setLanguage(e.target.value);
    });
  }

  if (githubLangSelect) {
    githubLangSelect.addEventListener('change', (e) => {
      languageState.setLanguage(e.target.value);
    });
  }
}

/**
 * Workflow 1: Write Code / Paste Editor
 */
function initWriteCodeWorkflow() {
  const selectPreset = document.getElementById('samplePresetSelect');
  const fileNameInput = document.getElementById('pasteFileName');
  const codeArea = document.getElementById('pasteCodeArea');

  if (!selectPreset || !codeArea) return;

  selectPreset.addEventListener('change', (e) => {
    const key = e.target.value;
    if (!key || !SAMPLE_SNIPPETS[key]) return;

    const sample = SAMPLE_SNIPPETS[key];
    if (fileNameInput) fileNameInput.value = sample.fileName;
    codeArea.value = sample.code;
    languageState.setLanguage(sample.language);
  });
}

/**
 * Workflow 2: Add File (Drag & Drop, Auto-Detect, Code Preview)
 */
function initAddFileWorkflow() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('fileUploadInput');
  const browseBtn = document.getElementById('uploadBrowseBtn');
  const replaceBtn = document.getElementById('uploadReplaceBtn');
  const removeBtn = document.getElementById('uploadRemoveBtn');

  if (!dropzone || !fileInput) return;

  if (browseBtn) {
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  dropzone.addEventListener('click', () => fileInput.click());

  if (replaceBtn) {
    replaceBtn.addEventListener('click', () => fileInput.click());
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', clearUploadedFile);
  }

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

  dropzone.addEventListener('drop', async (e) => {
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processSingleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await processSingleFile(files[0]);
    }
  });

  async function processSingleFile(file) {
    try {
      const text = await file.text();
      const detectedLang = detectLanguageFromFilename(file.name);

      currentUploadedFile = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        text: text,
        detectedLanguage: detectedLang
      };

      // Update centralized language
      languageState.setLanguage(detectedLang);

      // Render uploaded card & code preview
      renderUploadedFilePreview();
    } catch (err) {
      console.error('Failed reading file:', err);
    }
  }
}

function renderUploadedFilePreview() {
  const dropzone = document.getElementById('uploadDropzone');
  const infoCard = document.getElementById('uploadFileInfoCard');
  const previewContainer = document.getElementById('uploadCodePreviewContainer');
  const fileNameEl = document.getElementById('uploadFileName');
  const fileSizeEl = document.getElementById('uploadFileSize');
  const langBadgeEl = document.getElementById('uploadFileLangBadge');
  const previewTitleEl = document.getElementById('uploadPreviewFileTitle');
  const previewLinesEl = document.getElementById('uploadPreviewLineCount');
  const previewCodeEl = document.getElementById('uploadCodePreview');

  if (!currentUploadedFile) return;

  if (dropzone) dropzone.style.display = 'none';
  if (infoCard) infoCard.style.display = 'flex';
  if (previewContainer) previewContainer.style.display = 'block';

  if (fileNameEl) fileNameEl.textContent = currentUploadedFile.name;
  if (fileSizeEl) fileSizeEl.textContent = currentUploadedFile.size;
  if (langBadgeEl) langBadgeEl.textContent = currentUploadedFile.detectedLanguage;

  const linesCount = currentUploadedFile.text.split('\n').length;
  if (previewTitleEl) previewTitleEl.textContent = currentUploadedFile.name;
  if (previewLinesEl) previewLinesEl.textContent = `${linesCount} lines loaded`;
  if (previewCodeEl) previewCodeEl.textContent = currentUploadedFile.text;
}

function clearUploadedFile() {
  currentUploadedFile = null;
  const dropzone = document.getElementById('uploadDropzone');
  const infoCard = document.getElementById('uploadFileInfoCard');
  const previewContainer = document.getElementById('uploadCodePreviewContainer');
  const fileInput = document.getElementById('fileUploadInput');

  if (dropzone) dropzone.style.display = 'block';
  if (infoCard) infoCard.style.display = 'none';
  if (previewContainer) previewContainer.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

/**
 * Workflow 3: Connect Repository (Step-by-Step GitHub Integration)
 */
function initConnectRepoWorkflow() {
  const repoSelect = document.getElementById('githubRepoSelect');
  const branchSelect = document.getElementById('githubBranchSelect');
  const langSelect = document.getElementById('githubLanguageSelect');

  if (!repoSelect) return;

  repoSelect.innerHTML = '';
  mockRepositories.forEach((repo) => {
    const opt = document.createElement('option');
    opt.value = repo.name;
    opt.textContent = `${repo.owner}/${repo.name} (${repo.language})`;
    repoSelect.appendChild(opt);
  });

  repoSelect.addEventListener('change', (e) => {
    loadRepositoryDetails(e.target.value);
  });

  if (branchSelect) {
    branchSelect.addEventListener('change', (e) => {
      selectedBranch = e.target.value;
    });
  }

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      languageState.setLanguage(e.target.value);
    });
  }
}

function triggerInitialRepoLoad() {
  const repoSelect = document.getElementById('githubRepoSelect');
  if (repoSelect && repoSelect.value) {
    loadRepositoryDetails(repoSelect.value);
  } else if (mockRepositories.length > 0) {
    loadRepositoryDetails(mockRepositories[0].name);
  }
}

function loadRepositoryDetails(repoName) {
  const repo = mockRepositories.find((r) => r.name === repoName) || mockRepositories[0];
  selectedRepo = repo;

  // Set repository declared language
  languageState.setLanguage(repo.language);

  // Populate branches
  const branchSelect = document.getElementById('githubBranchSelect');
  if (branchSelect) {
    branchSelect.innerHTML = '';
    const branches = repo.branches || ['main', 'develop'];
    branches.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b === repo.defaultBranch ? `${b} (default)` : b;
      branchSelect.appendChild(opt);
    });
    selectedBranch = repo.defaultBranch || 'main';
  }

  // Populate files
  const filesList = document.getElementById('githubFilesList');
  const filesCount = document.getElementById('githubFilesCount');
  if (filesList && repo.files) {
    filesList.innerHTML = '';
    if (filesCount) filesCount.textContent = `${repo.files.length} files available`;

    repo.files.forEach((file, index) => {
      const row = document.createElement('div');
      row.className = `repo-file-row ${index === 0 ? 'selected' : ''}`;
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>📄</span>
          <span style="font-family: var(--font-mono); font-size: 13px;">${escapeHtml(file.path)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 11px; color: var(--text-tertiary);">${file.size || '2.4 KB'}</span>
          <span class="badge" style="background: var(--bg-subtle); color: var(--teal-700); font-size: 11px;">${file.language || repo.language}</span>
        </div>
      `;

      row.addEventListener('click', () => {
        document.querySelectorAll('.repo-file-row').forEach((r) => r.classList.remove('selected'));
        row.classList.add('selected');
        selectRepoFile(file);
      });

      filesList.appendChild(row);
    });

    // Select first file by default
    if (repo.files.length > 0) {
      selectRepoFile(repo.files[0]);
    }
  }
}

function selectRepoFile(file) {
  selectedRepoFile = file;

  // Update language from selected file
  const fileLang = file.language || detectLanguageFromFilename(file.name);
  languageState.setLanguage(fileLang);

  // Render code preview
  const titleEl = document.getElementById('githubPreviewFileTitle');
  const linesEl = document.getElementById('githubPreviewLineCount');
  const codeEl = document.getElementById('githubCodePreview');

  const lines = (file.code || '').split('\n').length;
  if (titleEl) titleEl.textContent = file.path || file.name;
  if (linesEl) linesEl.textContent = `${lines} lines`;
  if (codeEl) codeEl.textContent = file.code || '// Empty file';
}

/**
 * Form Submission & Transparent Multi-Stage Progress
 */
function initFormSubmission() {
  const startBtn = document.getElementById('startReviewBtn');
  const modalBackdrop = document.getElementById('analysisModal');
  const stepItems = document.querySelectorAll('.analysis-step-item');
  const progressFill = document.getElementById('analysisProgressFill');
  const currentStepText = document.getElementById('currentStepText');

  if (!startBtn || !modalBackdrop) return;

  startBtn.addEventListener('click', async () => {
    const currentLang = languageState.getLanguage();

    let submission = {
      source: activeWorkflow || 'editor',
      language: currentLang,
      fileName: 'OrderProcessor.ts',
      code: '',
      repository: null,
      branch: 'main'
    };

    if (activeWorkflow === 'writeCode') {
      submission.source = 'editor';
      submission.fileName = document.getElementById('pasteFileName')?.value || 'OrderProcessor.ts';
      submission.code = document.getElementById('pasteCodeArea')?.value || '';
    } else if (activeWorkflow === 'addFile') {
      submission.source = 'file';
      if (currentUploadedFile) {
        submission.fileName = currentUploadedFile.name;
        submission.code = currentUploadedFile.text;
      } else {
        submission.fileName = 'UploadedSource.ts';
        submission.code = '// Uploaded file';
      }
    } else if (activeWorkflow === 'connectRepo') {
      submission.source = 'repository';
      submission.repository = selectedRepo ? `${selectedRepo.owner}/${selectedRepo.name}` : 'org-fintech/payment-gateway';
      submission.branch = selectedBranch;
      if (selectedRepoFile) {
        submission.fileName = selectedRepoFile.name;
        submission.code = selectedRepoFile.code;
      } else {
        submission.fileName = 'src/PaymentProcessor.java';
      }
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
