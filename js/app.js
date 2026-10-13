/**
 * AI Code Reviewer - Core Application Shell
 * Handles global navigation, mobile sidebar, notifications, dynamic authentication state, and shell layout.
 */

import { apiClient } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  initAuthenticationGuard();
  initMobileNavigation();
  highlightActiveNav();
  initGlobalSearch();
  initSidebarDynamicCounts();
  initUserProfileSync();
});

/**
 * Ensures authenticated session exists for protected pages
 */
function initAuthenticationGuard() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const publicPages = ['index.html', 'login.html', ''];
  
  const token = apiClient.getToken();
  if (!token && !publicPages.includes(currentPath)) {
    window.location.href = 'login.html';
  }
}

/**
 * Synchronizes user profile snippet in sidebar with live authenticated user data
 */
async function initUserProfileSync() {
  const profileSnippet = document.querySelector('.user-profile-snippet');
  if (!profileSnippet) return;

  let user = null;
  try {
    const cached = localStorage.getItem('auth_user');
    if (cached) user = JSON.parse(cached);

    const res = await apiClient.get('/api/auth/me');
    if (res.ok && res.data && res.data.user) {
      user = res.data.user;
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  } catch {}

  if (!user) {
    user = {
      name: 'Rajesh Panwar',
      role: 'Staff Engineer',
      email: 'rajesh.panwar@enterprise.io'
    };
  }

  const nameEl = profileSnippet.querySelector('.user-name');
  const roleEl = profileSnippet.querySelector('.user-role');
  const avatarEl = profileSnippet.querySelector('.user-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role || user.email;
  if (avatarEl) {
    const initials = user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    avatarEl.textContent = initials || 'RP';
    avatarEl.title = 'Click to Sign Out';
    avatarEl.style.cursor = 'pointer';
    avatarEl.addEventListener('click', () => {
      if (confirm('Sign out of AI Code Reviewer workspace?')) {
        apiClient.setToken('');
        localStorage.removeItem('auth_user');
        window.location.href = 'login.html';
      }
    });
  }
}

/**
 * Dynamically synchronizes sidebar badges with real backend metrics
 */
async function initSidebarDynamicCounts() {
  const reviewsBadge = document.querySelector('a[href="reviews.html"] .nav-badge');
  const reposBadge = document.querySelector('a[href="repositories.html"] .nav-badge');

  if (!reviewsBadge && !reposBadge) return;

  try {
    const res = await apiClient.get('/api/dashboard/stats');
    if (res.ok && res.data) {
      const data = res.data;
      if (reviewsBadge && typeof data.totalReviews === 'number') {
        reviewsBadge.textContent = data.totalReviews;
      }
      if (reposBadge && typeof data.repositoriesCount === 'number') {
        reposBadge.textContent = data.repositoriesCount;
      }
    }
  } catch {}
}

/**
 * Mobile sidebar drawer toggle with overlay backdrop
 */
function initMobileNavigation() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('appSidebar');

  if (!menuBtn || !sidebar) return;

  // Create overlay if not present
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  function toggleSidebar() {
    const isOpen = sidebar.classList.toggle('open');
    overlay.classList.toggle('active', isOpen);
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }

  menuBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Close on navigation link click on small screens
  sidebar.querySelectorAll('.nav-item').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        closeSidebar();
      }
    });
  });
}

/**
 * Highlights current active sidebar or navbar item based on window.location
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const navLinks = document.querySelectorAll('.nav-item, .landing-nav-link');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
    link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Global search input handler (redirects to reviews or filters table)
 */
function initGlobalSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `reviews.html?search=${encodeURIComponent(query)}`;
      }
    }
  });
}
