/**
 * AI Code Reviewer - New Review Page Controller
 *
 * Implements EXACTLY THREE distinct input methods:
 *   A. WRITE CODE (In-browser editor with line numbers, templates, language selection)
 *   B. ADD FILE (Local file upload with auto-detection, size, preview, validation)
 *   C. CONNECT REPOSITORY (GitHub repository browsing, branch selection, file selector)
 *
 * Fully synchronized with centralized languageState across all 9 supported languages.
 * Sends clean contract payload to Spring Boot REST API (/api/reviews/analyze).
 */

import { reviewService } from '../reviewService.js';
import { repositoryService } from '../repositoryService.js';
import {
  languageState,
  SUPPORTED_LANGUAGES,
  detectLanguageFromFilename
} from '../languageState.js';

let activeWorkflow = 'writeCode'; // 'writeCode' | 'addFile' | 'connectRepo'
let currentUploadedFile = null; // { name, size, text, detectedLanguage }
let availableRepositories = [];
let selectedRepo = null;
let selectedBranch = 'main';
let selectedRepoFile = null;

document.addEventListener('DOMContentLoaded', async () => {
  initWorkflowSwitchers();
  initLanguageSelectors();
  initCodeEditor();
  initFileUpload();
  await initRepositoryConnection();
  initFormSubmission();
  initSampleSnippets();

  // Subscribe to centralized language changes
  languageState.subscribe((newLang) => {
    updateLanguageInUI(newLang);
  });

  // Set initial default language
  languageState.setLanguage('Java');
});

/**
 * Switch between the 3 input methods
 */
function initWorkflowSwitchers() {
  const methodChoiceScreen = document.getElementById('methodChoiceScreen');
  const activeWorkflowContainer = document.getElementById('activeWorkflowContainer');
  const backToOptionsBtn = document.getElementById('backToOptionsBtn');
  const currentWorkflowBadge = document.getElementById('currentWorkflowBadge');

  const chooseWriteCodeBtn = document.getElementById('chooseWriteCodeBtn');
  const chooseAddFileBtn = document.getElementById('chooseAddFileBtn');
  const chooseConnectRepoBtn = document.getElementById('chooseConnectRepoBtn');

  // Top navigation tabs if present
  const navTabWrite = document.getElementById('navTabWrite');
  const navTabFile = document.getElementById('navTabFile');
  const navTabRepo = document.getElementById('navTabRepo');

  function activateWorkflow(workflowKey, badgeLabel) {
    activeWorkflow = workflowKey;

    if (methodChoiceScreen) methodChoiceScreen.style.display = 'none';
    if (activeWorkflowContainer) activeWorkflowContainer.style.display = 'block';

    if (currentWorkflowBadge) currentWorkflowBadge.textContent = badgeLabel;

    // Switch tab contents
    const tabPaste = document.getElementById('tabPaste');
    const tabUpload = document.getElementById('tabUpload');
    const tabGithub = document.getElementById('tabGithub');

    if (tabPaste) tabPaste.classList.toggle('active', workflowKey === 'writeCode');
    if (tabUpload) tabUpload.classList.toggle('active', workflowKey === 'addFile');
    if (tabGithub) tabGithub.classList.toggle('active', workflowKey === 'connectRepo');

    // Update tab bar buttons if available
    [
      { btn: navTabWrite, key: 'writeCode' },
      { btn: navTabFile, key: 'addFile' },
      { btn: navTabRepo, key: 'connectRepo' }
    ].forEach(({ btn, key }) => {
      if (btn) btn.classList.toggle('active', workflowKey === key);
    });

    // If switching to editor, ensure code area has template if empty
    if (workflowKey === 'writeCode') {
      const codeArea = document.getElementById('pasteCodeArea');
      if (codeArea && !codeArea.value.trim()) {
        const lang = languageState.getLanguage();
        codeArea.value = languageState.getCodeTemplate(lang);
        updateLineNumbers();
      }
    }
  }

  if (chooseWriteCodeBtn) {
    chooseWriteCodeBtn.addEventListener('click', () => activateWorkflow('writeCode', 'Write Code'));
  }
  if (chooseAddFileBtn) {
    chooseAddFileBtn.addEventListener('click', () => activateWorkflow('addFile', 'Add File'));
  }
  if (chooseConnectRepoBtn) {
    chooseConnectRepoBtn.addEventListener('click', () => activateWorkflow('connectRepo', 'Connect Repository'));
  }

  if (navTabWrite) navTabWrite.addEventListener('click', () => activateWorkflow('writeCode', 'Write Code'));
  if (navTabFile) navTabFile.addEventListener('click', () => activateWorkflow('addFile', 'Add File'));
  if (navTabRepo) navTabRepo.addEventListener('click', () => activateWorkflow('connectRepo', 'Connect Repository'));

  if (backToOptionsBtn) {
    backToOptionsBtn.addEventListener('click', () => {
      if (methodChoiceScreen) methodChoiceScreen.style.display = 'block';
      if (activeWorkflowContainer) activeWorkflowContainer.style.display = 'none';
    });
  }
}

/**
 * Synchronize language selectors across the page
 */
function initLanguageSelectors() {
  const pasteLangSelect = document.getElementById('pasteLanguageSelect');
  const uploadLangSelect = document.getElementById('uploadLanguageSelect');

  function populateSelect(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const opt = document.createElement('option');
      opt.value = lang;
      opt.textContent = lang;
      selectEl.appendChild(opt);
    });
  }

  populateSelect(pasteLangSelect);
  populateSelect(uploadLangSelect);

  if (pasteLangSelect) {
    pasteLangSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      languageState.setLanguage(newLang);

      // Auto update filename field
      const fileNameEl = document.getElementById('pasteFileName');
      if (fileNameEl) {
        fileNameEl.value = languageState.getDefaultFileName(newLang);
      }

      // Update template code
      const codeArea = document.getElementById('pasteCodeArea');
      if (codeArea) {
        codeArea.value = languageState.getCodeTemplate(newLang);
        updateLineNumbers();
      }
    });
  }

  if (uploadLangSelect) {
    uploadLangSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      languageState.setLanguage(newLang);
      if (currentUploadedFile) {
        currentUploadedFile.detectedLanguage = newLang;
      }
    });
  }
}

function updateLanguageInUI(newLang) {
  const pasteLangSelect = document.getElementById('pasteLanguageSelect');
  const uploadLangSelect = document.getElementById('uploadLanguageSelect');
  const activeLangTag = document.getElementById('activeLangTag');

  if (pasteLangSelect && pasteLangSelect.value !== newLang) {
    pasteLangSelect.value = newLang;
  }
  if (uploadLangSelect && uploadLangSelect.value !== newLang) {
    uploadLangSelect.value = newLang;
  }
  if (activeLangTag) {
    activeLangTag.textContent = newLang;
  }
}

/**
 * Editor Controls (line numbers, tab indent, copy, clear)
 */
function initCodeEditor() {
  const codeArea = document.getElementById('pasteCodeArea');
  const copyBtn = document.getElementById('editorCopyBtn');
  const clearBtn = document.getElementById('editorClearBtn');
  const fileNameInput = document.getElementById('pasteFileName');

  if (fileNameInput && !fileNameInput.value) {
    fileNameInput.value = 'Solution.java';
  }

  if (codeArea) {
    // Initial content
    if (!codeArea.value.trim()) {
      codeArea.value = languageState.getCodeTemplate('Java');
    }
    updateLineNumbers();

    codeArea.addEventListener('input', updateLineNumbers);
    codeArea.addEventListener('scroll', () => {
      const lineNumbers = document.getElementById('editorLineNumbers');
      if (lineNumbers) {
        lineNumbers.scrollTop = codeArea.scrollTop;
      }
    });

    // Enable Tab indentation inside textarea
    codeArea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeArea.selectionStart;
        const end = codeArea.selectionEnd;
        codeArea.value = codeArea.value.substring(0, start) + '    ' + codeArea.value.substring(end);
        codeArea.selectionStart = codeArea.selectionEnd = start + 4;
        updateLineNumbers();
      }
    });
  }

  if (copyBtn && codeArea) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeArea.value);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy Code'), 2000);
      } catch {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy Code'), 2000);
      }
    });
  }

  if (clearBtn && codeArea) {
    clearBtn.addEventListener('click', () => {
      codeArea.value = '';
      updateLineNumbers();
      codeArea.focus();
    });
  }
}

function updateLineNumbers() {
  const codeArea = document.getElementById('pasteCodeArea');
  const lineNumbers = document.getElementById('editorLineNumbers');
  if (!codeArea || !lineNumbers) return;

  const lines = (codeArea.value || '').split('\n').length;
  let nums = '';
  for (let i = 1; i <= Math.max(lines, 1); i++) {
    nums += i + '\n';
  }
  lineNumbers.textContent = nums;
}

/**
 * File Upload Handler (Drag & Drop + File Input)
 */
function initFileUpload() {
  const dropZone = document.getElementById('fileDropZone');
  const fileInput = document.getElementById('fileInput');
  const filePreview = document.getElementById('fileUploadPreview');
  const uploadErrorEl = document.getElementById('fileUploadError');

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
  });

  ['dragleave', 'dragend'].forEach((ev) => {
    dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-active'));
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });

  function handleFileSelection(file) {
    if (uploadErrorEl) uploadErrorEl.style.display = 'none';

    // File size limit: 2MB
    if (file.size > 2 * 1024 * 1024) {
      showUploadError('File size exceeds 2MB limit. Please upload a single source-code module.');
      return;
    }

    const detectedLang = detectLanguageFromFilename(file.name);
    const reader = new FileReader();

    reader.onload = (ev) => {
      const text = ev.target.result;
      currentUploadedFile = {
        name: file.name,
        size: formatBytes(file.size),
        text,
        detectedLanguage: detectedLang
      };

      // Set centralized language
      languageState.setLanguage(detectedLang);

      // Render preview
      renderFilePreview(currentUploadedFile);
    };

    reader.onerror = () => {
      showUploadError('Failed to read file. Please ensure it is a valid UTF-8 text source file.');
    };

    reader.readAsText(file);
  }

  function showUploadError(msg) {
    if (uploadErrorEl) {
      uploadErrorEl.textContent = msg;
      uploadErrorEl.style.display = 'block';
    }
  }

  function renderFilePreview(fileInfo) {
    if (!filePreview) return;
    filePreview.style.display = 'block';

    const titleEl = document.getElementById('uploadedFileName');
    const sizeEl = document.getElementById('uploadedFileSize');
    const langBadgeEl = document.getElementById('uploadedDetectedLang');
    const codePreviewEl = document.getElementById('uploadedCodePreview');

    if (titleEl) titleEl.textContent = fileInfo.name;
    if (sizeEl) sizeEl.textContent = fileInfo.size;
    if (langBadgeEl) langBadgeEl.textContent = fileInfo.detectedLanguage;
    if (codePreviewEl) codePreviewEl.textContent = fileInfo.text;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Connect Repository Workflow
 */
async function initRepositoryConnection() {
  const repoSelect = document.getElementById('githubRepoSelect');
  const branchSelect = document.getElementById('githubBranchSelect');
  const filesList = document.getElementById('githubFilesList');

  if (!repoSelect) return;

  try {
    availableRepositories = await repositoryService.getRepositories();

    repoSelect.innerHTML = '';
    availableRepositories.forEach((repo) => {
      const opt = document.createElement('option');
      opt.value = repo.id;
      opt.textContent = `${repo.owner}/${repo.name} (${repo.language})`;
      repoSelect.appendChild(opt);
    });

    if (availableRepositories.length > 0) {
      selectRepository(availableRepositories[0]);
    }

    repoSelect.addEventListener('change', (e) => {
      const repo = availableRepositories.find((r) => r.id === e.target.value);
      if (repo) selectRepository(repo);
    });

    if (branchSelect) {
      branchSelect.addEventListener('change', (e) => {
        selectedBranch = e.target.value;
      });
    }
  } catch (err) {
    console.error('Failed to load repositories:', err);
  }

  function selectRepository(repo) {
    selectedRepo = repo;
    selectedBranch = repo.defaultBranch || 'main';

    if (branchSelect) {
      branchSelect.innerHTML = '';
      (repo.branches || [repo.defaultBranch || 'main']).forEach((b) => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        branchSelect.appendChild(opt);
      });
      branchSelect.value = selectedBranch;
    }

    // Render files
    if (filesList) {
      filesList.innerHTML = '';
      (repo.files || []).forEach((file, index) => {
        const row = document.createElement('div');
        row.className = `repo-file-row ${index === 0 ? 'selected' : ''}`;
        row.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${escapeHtml(file.name)}</span>
          </div>
          <span style="font-size: 12px; color: var(--text-tertiary);">${escapeHtml(file.size)}</span>
        `;

        row.addEventListener('click', () => {
          document.querySelectorAll('.repo-file-row').forEach((r) => r.classList.remove('selected'));
          row.classList.add('selected');
          selectRepoFile(file);
        });

        filesList.appendChild(row);
      });

      if (repo.files && repo.files.length > 0) {
        selectRepoFile(repo.files[0]);
      }
    }
  }

  function selectRepoFile(file) {
    selectedRepoFile = file;
    const fileLang = file.language || detectLanguageFromFilename(file.name);
    languageState.setLanguage(fileLang);

    const titleEl = document.getElementById('githubPreviewFileTitle');
    const linesEl = document.getElementById('githubPreviewLineCount');
    const codeEl = document.getElementById('githubCodePreview');

    const lines = (file.code || '').split('\n').length;
    if (titleEl) titleEl.textContent = file.path || file.name;
    if (linesEl) linesEl.textContent = `${lines} lines`;
    if (codeEl) codeEl.textContent = file.code || '// Empty file';
  }
}

/**
 * Load Sample Snippets
 */
function initSampleSnippets() {
  const sampleSelect = document.getElementById('sampleProblemSelect');
  if (!sampleSelect) return;

  sampleSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    if (!key) return;

    const sampleMap = {
      'java-twosum': { lang: 'Java', file: 'TwoSum.java' },
      'python-bubblesort': { lang: 'Python', file: 'bubble_sort.py' },
      'ts-order': { lang: 'TypeScript', file: 'OrderProcessor.ts' },
      'go-buffer': { lang: 'Go', file: 'buffer_pool.go' }
    };

    const target = sampleMap[key];
    if (target) {
      languageState.setLanguage(target.lang);
      const fileNameEl = document.getElementById('pasteFileName');
      if (fileNameEl) fileNameEl.value = target.file;

      const codeArea = document.getElementById('pasteCodeArea');
      if (codeArea) {
        codeArea.value = languageState.getCodeTemplate(target.lang);
        updateLineNumbers();
      }
    }
  });
}

/**
 * Form Submission & Review Execution
 */
function initFormSubmission() {
  const startBtn = document.getElementById('startReviewBtn');
  const modalBackdrop = document.getElementById('analysisModal');
  const stepItems = document.querySelectorAll('.analysis-step-item');
  const currentStepText = document.getElementById('currentStepText');
  const errorContainer = document.getElementById('submitErrorContainer');
  const retryBtn = document.getElementById('analysisRetryBtn');

  if (!startBtn || !modalBackdrop) return;

  startBtn.addEventListener('click', async () => {
    if (errorContainer) errorContainer.style.display = 'none';

    const currentLang = languageState.getLanguage();

    // Prepare API Contract Payload
    let submission = {
      source: 'editor',
      language: currentLang,
      fileName: 'Solution.java',
      code: '',
      repository: null,
      branch: null
    };

    if (activeWorkflow === 'writeCode') {
      submission.source = 'editor';
      submission.fileName = document.getElementById('pasteFileName')?.value.trim() || languageState.getDefaultFileName(currentLang);
      submission.code = document.getElementById('pasteCodeArea')?.value || '';
    } else if (activeWorkflow === 'addFile') {
      submission.source = 'file';
      if (!currentUploadedFile || !currentUploadedFile.text) {
        alert('Please select or drop a source-code file first.');
        return;
      }
      submission.fileName = currentUploadedFile.name;
      submission.code = currentUploadedFile.text;
    } else if (activeWorkflow === 'connectRepo') {
      submission.source = 'repository';
      submission.repository = selectedRepo
        ? { name: selectedRepo.name, owner: selectedRepo.owner }
        : { name: 'ecommerce-checkout-service', owner: 'org-fintech' };
      submission.branch = selectedBranch || 'main';
      submission.fileName = selectedRepoFile ? selectedRepoFile.name : 'Solution.java';
      submission.code = selectedRepoFile ? selectedRepoFile.code : '// Source code from repository';
    }

    // Client-side validation: ensure code is not empty
    if (!submission.code || !submission.code.trim()) {
      alert('Please enter or upload source code before initiating analysis.');
      return;
    }

    // Launch multi-stage loading modal
    modalBackdrop.classList.add('active');

    // Reset steps
    stepItems.forEach((el) => {
      el.className = 'analysis-step-item pending';
      const ind = el.querySelector('.step-indicator');
      if (ind) ind.textContent = el.getAttribute('data-step');
    });

    try {
      const resultReview = await reviewService.runAnalysis(submission, (stage) => {
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

      // Navigate to Review Result
      setTimeout(() => {
        window.location.href = `review.html?id=${resultReview.id || resultReview.reviewId}`;
      }, 500);
    } catch (err) {
      console.error('Analysis execution failed:', err);
      modalBackdrop.classList.remove('active');
      if (errorContainer) {
        errorContainer.innerHTML = `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-md); padding: 16px; margin-top: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; color: #991b1b; font-size: 14px;">Review Service Notice</div>
              <div style="font-size: 13px; color: #b91c1c;">Unable to connect to the Spring Boot review backend at ${apiClient.getBaseUrl()}. Please ensure the backend is active or check settings.</div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="retryAnalysisBtn">Retry</button>
          </div>
        `;
        errorContainer.style.display = 'block';
        document.getElementById('retryAnalysisBtn')?.addEventListener('click', () => startBtn.click());
      }
    }
  });

  if (retryBtn) {
    retryBtn.addEventListener('click', () => startBtn.click());
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
