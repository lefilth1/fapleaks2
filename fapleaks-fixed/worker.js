/**
 * Fapleaks – Cloudflare Worker
 * Routes SPA-style URLs to the correct static HTML page on GitHub Pages.
 *
 * Deploy:
 *   1. wrangler deploy  (or paste in Cloudflare Dashboard → Workers)
 *   2. Set ORIGIN in wrangler.toml vars to your GitHub Pages URL
 *      e.g. ORIGIN = "https://youruser.github.io/fapleaks"
 *
 * Route patterns (add in Workers → Triggers → Routes):
 *   fapleaks.com/*
 */

const ORIGIN = 'https://lefilth1.github.io/fapleaks2'; // ← change this

// Static assets – pass straight through to GitHub Pages
const ASSET_EXTS = /\.(css|js|json|jpg|jpeg|png|gif|webp|svg|ico|woff2?|ttf|otf|map)$/i;

export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;

    // ── 1. Static assets → pass-through ──────────────────────────────────
    if (ASSET_EXTS.test(path)) {
      return fetchFromOrigin(ORIGIN + path + url.search);
    }

    // ── 2. Exact static files ─────────────────────────────────────────────
    const EXACT_FILES = ['/favicon.ico', '/robots.txt', '/sitemap.xml', '/ads.txt'];
    if (EXACT_FILES.includes(path)) {
      return fetchFromOrigin(ORIGIN + path);
    }

    // ── 3. SPA routing ────────────────────────────────────────────────────
    const html = resolveHTML(path);

    // Fetch the HTML shell from GitHub Pages
    const resp = await fetchFromOrigin(ORIGIN + '/' + html, { headers: { 'Accept': 'text/html' } });

    if (!resp.ok) return fetchFromOrigin(ORIGIN + '/404.html');

    // Clone & rewrite canonical / og:url so crawlers see the real URL
    const text    = await resp.text();
    const rewritten = rewriteMeta(text, url.href);

    return new Response(rewritten, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      }
    });
  }
};

// ── Route resolver ────────────────────────────────────────────────────────────
function resolveHTML(path) {
  if (path === '/' || path === '')            return 'index.html';
  if (/^\/video\/.+/.test(path))             return 'video.html';
  if (/^\/model\/.+/.test(path))             return 'model.html';
  if (/^\/category\/.+/.test(path))          return 'category.html';
  if (path === '/models' || path === '/stars')return 'models.html';
  if (path === '/categories')                return 'categories.html';
  if (path === '/search')                    return 'search.html';
  if (path === '/dmca')                      return 'dmca.html';
  if (path === '/privacy')                   return 'privacy.html';
  if (path === '/terms')                     return 'terms.html';
  if (path === '/contact')                   return 'contact.html';
  return '404.html';
}

// ── Meta rewriter (canonical + og:url only) ───────────────────────────────────
function rewriteMeta(html, currentUrl) {
  return html
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, `$1${currentUrl}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${currentUrl}$2`);
}

// ── Simple fetch helper ───────────────────────────────────────────────────────
async function fetchFromOrigin(url, opts = {}) {
  try {
    return await fetch(url, { cf: { cacheEverything: false }, ...opts });
  } catch {
    return new Response('Bad Gateway', { status: 502 });
  }
}
