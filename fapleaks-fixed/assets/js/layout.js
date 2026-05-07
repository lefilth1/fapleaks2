// ── layout.js — injects navbar + footer into every page ──────────────────

(function () {
  const SITE_NAME = 'Fapleaks';

  function renderNav() {
    const path = window.location.pathname;
    const active = (href) => (path === href || (href !== '/' && path.startsWith(href))) ? 'active' : '';
    const el = document.getElementById('navbar');
    if (!el) return;
    el.innerHTML = `
      <a href="/" class="nav-logo">${SITE_NAME}</a>
      <nav class="nav-links" id="nav-links">
        <a href="/" class="${active('/')}"><i class="fas fa-home"></i> Home</a>
        <a href="/models" class="${active('/models')}"><i class="fas fa-star"></i> Stars</a>
        <a href="/categories" class="${active('/categories')}"><i class="fas fa-th"></i> Categories</a>
      </nav>
      <form class="search-form" onsubmit="handleSearch(event)">
        <i class="fas fa-search"></i>
        <input type="search" id="nav-search" placeholder="Search videos…" autocomplete="off"
               value="${path === '/search' ? new URLSearchParams(location.search).get('q') || '' : ''}">
      </form>
      <button class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Menu">
        <i class="fas fa-bars"></i>
      </button>`;
  }

  function renderFooter() {
    const el = document.getElementById('footer');
    if (!el) return;
    el.innerHTML = `
      <div class="footer-logo">${SITE_NAME}</div>
      <nav class="footer-links">
        <a href="/">Home</a>
        <a href="/models">Stars</a>
        <a href="/categories">Categories</a>
        <a href="/dmca">DMCA</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms</a>
        <a href="/contact">Contact</a>
      </nav>
      <p class="footer-copy">
        &copy; ${new Date().getFullYear()} ${SITE_NAME}. All models are 18+ years of age.
        This site does not host any video files. All content is embedded from third-party platforms.
        18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement.
      </p>`;
  }

  window.toggleMobileMenu = function () {
    document.getElementById('nav-links')?.classList.toggle('open');
  };

  window.handleSearch = function (e) {
    e.preventDefault();
    const q = document.getElementById('nav-search')?.value.trim();
    if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { renderNav(); renderFooter(); });
  } else {
    renderNav(); renderFooter();
  }
})();
