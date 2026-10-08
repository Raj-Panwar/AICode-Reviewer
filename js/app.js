/**
 * AI Code Reviewer - Core Application Shell
 * Handles global navigation, mobile sidebar, notifications, and shell layout.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  highlightActiveNav();
  initGlobalSearch();
  initSidebarDynamicCounts();
});

/**
 * Dynamically synchronizes sidebar badges with real backend metrics
 */
async function initSidebarDynamicCounts() {
  const reviewsBadge = document.querySelector('a[href="reviews.html"] .nav-badge');
  const reposBadge = document.querySelector('a[href="repositories.html"] .nav-badge');

  if (!reviewsBadge && !reposBadge) return;

  try {
    const res = await fetch('/api/dashboard/stats');
    if (res.ok) {
      const data = await res.json();
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
