/**
 * AI Code Reviewer - Settings Controller
 * Handles user preferences, centralized API Mode configuration, and GitHub status.
 */

import { apiClient } from '../api.js';

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  initFormHandlers();
});

function loadSettings() {
  const nameInput = document.getElementById('settingFullName');
  const emailInput = document.getElementById('settingEmail');
  const roleInput = document.getElementById('settingRole');
  const orgInput = document.getElementById('settingOrg');
  const autoPush = document.getElementById('prefAutoAnalyze');
  const mentorMode = document.getElementById('prefMentorMode');
  const thresholdSelect = document.getElementById('prefThreshold');
  const apiUrlInput = document.getElementById('settingApiBaseUrl');
  const delaySelect = document.getElementById('settingMockDelay');
  const errorCheckbox = document.getElementById('settingSimulateError');
  const radioMock = document.getElementById('apiModeRadioMock');
  const radioReal = document.getElementById('apiModeRadioReal');

  if (nameInput) nameInput.value = 'Rajesh Panwar';
  if (emailInput) emailInput.value = 'rajesh.panwar@enterprise.io';
  if (roleInput) roleInput.value = 'Staff Software Engineer';
  if (orgInput) orgInput.value = 'Fintech Core Infrastructure';

  if (autoPush) autoPush.checked = true;
  if (mentorMode) mentorMode.checked = true;
  if (thresholdSelect) thresholdSelect.value = 'O(n²)';

  if (apiUrlInput) {
    apiUrlInput.value = apiClient.getBaseUrl();
  }

  // Load API Mode
  const currentMode = apiClient.getMode();
  if (currentMode === 'real') {
    if (radioReal) radioReal.checked = true;
    updateModeUI('real');
  } else {
    if (radioMock) radioMock.checked = true;
    updateModeUI('mock');
  }

  // Load Developer simulation controls
  if (delaySelect) {
    delaySelect.value = String(apiClient.getNetworkDelay());
  }

  if (errorCheckbox) {
    errorCheckbox.checked = apiClient.isSimulateError();
  }
}

function updateModeUI(mode) {
  const badge = document.getElementById('apiStatusBadge');
  const cardMock = document.getElementById('modeCardMock');
  const cardReal = document.getElementById('modeCardReal');

  if (mode === 'mock') {
    if (badge) {
      badge.textContent = 'MOCK MODE (Active)';
      badge.style.background = '#ecfdf5';
      badge.style.color = '#047857';
      badge.style.borderColor = '#a7f3d0';
    }
    if (cardMock) {
      cardMock.style.border = '2px solid var(--teal-600)';
      cardMock.style.background = 'var(--teal-50)';
    }
    if (cardReal) {
      cardReal.style.border = '1px solid var(--border-light)';
      cardReal.style.background = 'var(--bg-surface)';
    }
  } else {
    if (badge) {
      badge.textContent = 'REAL MODE (Spring Boot)';
      badge.style.background = '#eff6ff';
      badge.style.color = '#1d4ed8';
      badge.style.borderColor = '#bfdbfe';
    }
    if (cardReal) {
      cardReal.style.border = '2px solid var(--teal-600)';
      cardReal.style.background = 'var(--teal-50)';
    }
    if (cardMock) {
      cardMock.style.border = '1px solid var(--border-light)';
      cardMock.style.background = 'var(--bg-surface)';
    }
  }
}

function initFormHandlers() {
  const saveBtn = document.getElementById('saveSettingsBtn');
  const toast = document.getElementById('settingsToast');
  const apiUrlInput = document.getElementById('settingApiBaseUrl');
  const testApiBtn = document.getElementById('testApiConnectionBtn');
  const apiStatusBadge = document.getElementById('apiStatusBadge');
  const delaySelect = document.getElementById('settingMockDelay');
  const errorCheckbox = document.getElementById('settingSimulateError');
  const radioMock = document.getElementById('apiModeRadioMock');
  const radioReal = document.getElementById('apiModeRadioReal');

  // Mode radio change listeners
  if (radioMock) {
    radioMock.addEventListener('change', () => {
      if (radioMock.checked) {
        apiClient.setMode('mock');
        updateModeUI('mock');
        showToast('Switched to Mock Mode (Standalone).');
      }
    });
  }

  if (radioReal) {
    radioReal.addEventListener('change', () => {
      if (radioReal.checked) {
        apiClient.setMode('real');
        updateModeUI('real');
        showToast('Switched to Real Backend Mode (Spring Boot).');
      }
    });
  }

  // Developer control listeners
  if (delaySelect) {
    delaySelect.addEventListener('change', (e) => {
      const delay = parseInt(e.target.value, 10);
      apiClient.setNetworkDelay(delay);
      showToast(`Mock latency set to ${delay} ms.`);
    });
  }

  if (errorCheckbox) {
    errorCheckbox.addEventListener('change', (e) => {
      apiClient.setSimulateError(e.target.checked);
      if (e.target.checked) {
        showToast('Warning: Mock API error simulation ENABLED.');
      } else {
        showToast('Mock API error simulation disabled.');
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (apiUrlInput) {
        apiClient.setBaseUrl(apiUrlInput.value.trim());
      }

      if (radioReal && radioReal.checked) {
        apiClient.setMode('real');
      } else {
        apiClient.setMode('mock');
      }

      showToast('✓ Preferences & API routing saved successfully.');
    });
  }

  if (testApiBtn) {
    testApiBtn.addEventListener('click', async () => {
      if (apiStatusBadge) {
        apiStatusBadge.textContent = 'Testing connection...';
        apiStatusBadge.style.background = '#eff6ff';
        apiStatusBadge.style.color = '#1d4ed8';
      }

      if (apiClient.isMockMode()) {
        const health = await apiClient.checkHealth();
        if (apiStatusBadge) {
          apiStatusBadge.textContent = 'MOCK MODE (Active)';
          apiStatusBadge.style.background = '#ecfdf5';
          apiStatusBadge.style.color = '#047857';
          apiStatusBadge.style.borderColor = '#a7f3d0';
        }
        showToast('✓ Mock API is operational. Standalone frontend mode ready (No backend required).');
        return;
      }

      // Real Mode check
      const health = await apiClient.checkHealth();
      if (health.ok) {
        if (apiStatusBadge) {
          apiStatusBadge.textContent = 'Online (Spring Boot Connected)';
          apiStatusBadge.style.background = '#ecfdf5';
          apiStatusBadge.style.color = '#047857';
        }
        showToast('✓ Connected to Spring Boot REST backend at ' + apiClient.getBaseUrl());
      } else {
        if (apiStatusBadge) {
          apiStatusBadge.textContent = 'Offline (Spring Boot Not Found)';
          apiStatusBadge.style.background = '#fef2f2';
          apiStatusBadge.style.color = '#b91c1c';
        }
        showToast('Notice: Spring Boot server not reachable at ' + apiClient.getBaseUrl() + '. Switch to Mock Mode for standalone testing.');
      }
    });
  }

  const disconnectBtn = document.getElementById('disconnectGithubBtn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      const isConnected = disconnectBtn.textContent.trim() === 'Disconnect';
      if (isConnected) {
        disconnectBtn.textContent = 'Connect GitHub';
        disconnectBtn.style.color = 'var(--teal-700)';
        showToast('✓ GitHub account disconnected.');
      } else {
        disconnectBtn.textContent = 'Disconnect';
        disconnectBtn.style.color = 'var(--red-600)';
        showToast('✓ GitHub account connected.');
      }
    });
  }

  function showToast(message) {
    if (toast) {
      toast.textContent = message;
      toast.style.display = 'block';
      toast.style.opacity = '1';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => (toast.style.display = 'none'), 300);
      }, 3500);
    }
  }
}
