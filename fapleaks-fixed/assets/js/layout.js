// ── layout.js — injects navbar + footer into every page ──────────────────

(function () {
  const SITE_NAME = 'Fapleaks';
  const BASE_PATH = '/fapleaks2/fapleaks-fixed';

  function renderNav() {
    const path = window.location.pathname;
    const active = (href) => { const full = href === '/' ? BASE_PATH + '/' : BASE_PATH + href; return (path === full || (href !== '/' && path.startsWith(BASE_PATH + href))) ? 'active' : ''; };
    const el = document.getElementById('navbar');
    if (!el) return;
    el.innerHTML = `
      <a href="${BASE_PATH}/" class="nav-logo">${SITE_NAME}</a>
      <nav class="nav-links" id="nav-links">
        <a href="${BASE_PATH}/" class="${active('/')}"><i class="fas fa-home"></i> Home</a>
        <a href="${BASE_PATH}/models" class="${active('/models')}"><i class="fas fa-star"></i> Stars</a>
        <a href="${BASE_PATH}/categories" class="${active('/categories')}"><i class="fas fa-th"></i> Categories</a>
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
        <a href="${BASE_PATH}/">Home</a>
        <a href="${BASE_PATH}/models">Stars</a>
        <a href="${BASE_PATH}/categories">Categories</a>
        <a href="${BASE_PATH}/dmca">DMCA</a>
        <a href="${BASE_PATH}/privacy">Privacy Policy</a>
        <a href="${BASE_PATH}/terms">Terms</a>
        <a href="${BASE_PATH}/contact">Contact</a>
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
    if (q) window.location.href = `${BASE_PATH}/search?q=${encodeURIComponent(q)}`;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { renderNav(); renderFooter(); });
  } else {
    renderNav(); renderFooter();
  }
})();
