/**
 * AI Code Reviewer - Login & Registration Page Controller
 */

import { apiClient } from '../api.js';

document.addEventListener('DOMContentLoaded', () => {
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const errorAlert = document.getElementById('authErrorAlert');
  const fillDemoBtn = document.getElementById('fillDemoBtn');

  // Tab switching
  if (tabLoginBtn && tabRegisterBtn && loginForm && registerForm) {
    tabLoginBtn.addEventListener('click', () => {
      tabLoginBtn.style.background = 'white';
      tabLoginBtn.style.color = 'var(--teal-700)';
      tabLoginBtn.style.boxShadow = 'var(--shadow-sm)';
      tabRegisterBtn.style.background = 'transparent';
      tabRegisterBtn.style.color = 'var(--text-secondary)';
      tabRegisterBtn.style.boxShadow = 'none';
      loginForm.style.display = 'flex';
      registerForm.style.display = 'none';
      if (errorAlert) errorAlert.style.display = 'none';
    });

    tabRegisterBtn.addEventListener('click', () => {
      tabRegisterBtn.style.background = 'white';
      tabRegisterBtn.style.color = 'var(--teal-700)';
      tabRegisterBtn.style.boxShadow = 'var(--shadow-sm)';
      tabLoginBtn.style.background = 'transparent';
      tabLoginBtn.style.color = 'var(--text-secondary)';
      tabLoginBtn.style.boxShadow = 'none';
      registerForm.style.display = 'flex';
      loginForm.style.display = 'none';
      if (errorAlert) errorAlert.style.display = 'none';
    });
  }

  // Demo credentials autofill
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');
      if (emailInput) emailInput.value = 'rajesh.panwar@enterprise.io';
      if (passInput) passInput.value = 'Password123!';
    });
  }

  // Login Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorAlert) errorAlert.style.display = 'none';

      const email = document.getElementById('loginEmail')?.value.trim();
      const password = document.getElementById('loginPassword')?.value;

      try {
        const res = await apiClient.post('/api/auth/login', { email, password });
        if (res.ok && res.data && res.data.token) {
          apiClient.setToken(res.data.token);
          if (res.data.user) {
            localStorage.setItem('auth_user', JSON.stringify(res.data.user));
          }
          window.location.href = 'dashboard.html';
        } else {
          throw new Error(res.data?.error?.message || 'Invalid email or password.');
        }
      } catch (err) {
        if (errorAlert) {
          errorAlert.textContent = err.message || 'Login failed. Please check credentials.';
          errorAlert.style.display = 'block';
        }
      }
    });
  }

  // Register Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorAlert) errorAlert.style.display = 'none';

      const name = document.getElementById('regName')?.value.trim();
      const email = document.getElementById('regEmail')?.value.trim();
      const password = document.getElementById('regPassword')?.value;
      const role = document.getElementById('regRole')?.value.trim();
      const organization = document.getElementById('regOrg')?.value.trim();

      if (!name || !email || !password) {
        if (errorAlert) {
          errorAlert.textContent = 'Please fill in name, email, and password.';
          errorAlert.style.display = 'block';
        }
        return;
      }

      try {
        const res = await apiClient.post('/api/auth/register', { name, email, password, role, organization });
        if (res.ok && res.data && res.data.token) {
          apiClient.setToken(res.data.token);
          if (res.data.user) {
            localStorage.setItem('auth_user', JSON.stringify(res.data.user));
          }
          window.location.href = 'dashboard.html';
        } else {
          throw new Error(res.data?.error?.message || 'Registration failed.');
        }
      } catch (err) {
        if (errorAlert) {
          errorAlert.textContent = err.message || 'Registration failed. Email may already be in use.';
          errorAlert.style.display = 'block';
        }
      }
    });
  }
});
