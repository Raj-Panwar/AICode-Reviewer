/**
 * AI Code Reviewer - Settings Controller
 * Handles user preferences, Spring Boot REST API configuration, and GitHub status.
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
}

function initFormHandlers() {
  const saveBtn = document.getElementById('saveSettingsBtn');
  const toast = document.getElementById('settingsToast');
  const apiUrlInput = document.getElementById('settingApiBaseUrl');
  const testApiBtn = document.getElementById('testApiConnectionBtn');
  const apiStatusBadge = document.getElementById('apiStatusBadge');

  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (apiUrlInput) {
        apiClient.setBaseUrl(apiUrlInput.value.trim());
      }

      showToast('✓ Preferences & API configuration saved successfully.');
    });
  }

  if (testApiBtn) {
    testApiBtn.addEventListener('click', async () => {
      if (apiStatusBadge) {
        apiStatusBadge.textContent = 'Testing connection...';
        apiStatusBadge.style.background = '#eff6ff';
        apiStatusBadge.style.color = '#1d4ed8';
      }

      const isReachable = await apiClient.checkHealth();
      if (isReachable) {
        if (apiStatusBadge) {
          apiStatusBadge.textContent = 'Online (Spring Boot Connected)';
          apiStatusBadge.style.background = '#ecfdf5';
          apiStatusBadge.style.color = '#047857';
        }
        showToast('✓ Spring Boot API connected at ' + apiClient.getBaseUrl());
      } else {
        if (apiStatusBadge) {
          apiStatusBadge.textContent = 'Offline (Fallback Mock Active)';
          apiStatusBadge.style.background = '#fffbeb';
          apiStatusBadge.style.color = '#b45309';
        }
        showToast('Notice: Spring Boot server offline. Seamless mock fallback active.');
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
