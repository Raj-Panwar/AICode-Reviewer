/**
 * AI Code Reviewer - Settings Controller
 * Handles user preferences, GitHub connection state, and mentor configuration.
 */

import { mockSettings } from './data/mockData.js';

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

  if (nameInput) nameInput.value = mockSettings.profile.fullName;
  if (emailInput) emailInput.value = mockSettings.profile.email;
  if (roleInput) roleInput.value = mockSettings.profile.role;
  if (orgInput) orgInput.value = mockSettings.profile.organization;

  if (autoPush) autoPush.checked = mockSettings.preferences.autoAnalyzeOnPush;
  if (mentorMode) mentorMode.checked = mockSettings.preferences.strictMentorMode;
  if (thresholdSelect) thresholdSelect.value = mockSettings.preferences.complexityAlertThreshold;
}

function initFormHandlers() {
  const saveBtn = document.getElementById('saveSettingsBtn');
  const toast = document.getElementById('settingsToast');

  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (toast) {
        toast.style.display = 'block';
        toast.style.opacity = '1';
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => (toast.style.display = 'none'), 300);
        }, 3000);
      }
    });
  }

  const disconnectBtn = document.getElementById('disconnectGithubBtn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      if (confirm('Disconnect GitHub account? New commits will not trigger automatic reviews.')) {
        alert('GitHub disconnected successfully.');
      }
    });
  }
}
