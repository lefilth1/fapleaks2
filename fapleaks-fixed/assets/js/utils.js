// ── utils.js — shared helpers ──────────────────────────────────────────────

const SITE_NAME = 'Fapleaks';
// ── Base path (works on GitHub Pages subdir and root alike) ──────────────────
const BASE_PATH = (document.querySelector('base')?.getAttribute('href') || '/');
const SITE_DOMAIN = 'https://fapleaks.com';

// ── Data cache ────────────────────────────────────────────────────────────────
const _cache = {};
async function fetchJSON(url) {
  if (_cache[url]) return _cache[url];
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  _cache[url] = await r.json();
  return _cache[url];
}

async function getVideos() { return fetchJSON(BASE_PATH + 'data/videos.json'); }
async function getModels() { return fetchJSON(BASE_PATH + 'data/models.json'); }

// ── Format helpers ────────────────────────────────────────────────────────────
function formatDuration(secs) {
  if (!secs) return '';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function formatViews(n) {
  if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return n.toLocaleString();
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const map = [[31536000,'year'],[ 2592000,'month'],[604800,'week'],
               [86400,'day'],[3600,'hour'],[60,'minute'],[1,'second']];
  for (const [s, label] of map) {
    const n = Math.round(diff / s);
    if (n >= 1) return `${n} ${label}${n !== 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

function slugFromPath(prefix) {
  const path = window.location.pathname;
  const re = new RegExp(`^\\/${prefix}\\/(.+?)\\/?$`);
  const m = path.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key) || '';
}

function sortVideos(videos, sort) {
  const copy = [...videos];
  if (sort === 'popular') return copy.sort((a, b) => b.views - a.views);
  if (sort === 'recent')  return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  // random
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setMeta(title, description, image) {
  document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description || '');
  if (image) document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description || '');
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', SITE_DOMAIN + window.location.pathname);
}

function show404(msg = 'Not Found') {
  document.getElementById('main-content').innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div class="text-8xl font-black text-brand-primary mb-4">404</div>
      <h1 class="text-2xl font-bold text-white mb-2">${msg}</h1>
      <p class="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" class="btn-primary px-8 py-3 rounded-2xl font-bold text-white">← Back Home</a>
    </div>`;
}

// ── Video card HTML ───────────────────────────────────────────────────────────
function videoCardHTML(v, eager = false) {
  const hot = v.views > 200 ? `<span class="badge-hot">Hot</span>` : '';
  const dur = v.duration_fmt ? `<span class="duration-badge">${v.duration_fmt}</span>` : '';
  return `
  <article class="video-card group" data-id="${v.id}">
    <div class="thumb-wrap">
      <a href="/video/${v.slug}">
        <img src="${v.thumbnail}" alt="${esc(v.title)}" width="662" height="372"
             loading="${eager ? 'eager' : 'lazy'}"
             class="thumb-img">
        <div class="thumb-overlay">
          <div class="play-circle"><i class="fas fa-play"></i></div>
        </div>
        <div class="thumb-badges-top">${hot}</div>
        <div class="thumb-badges-bot">${dur}</div>
      </a>
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="cat-label" style="color:${v.category_color}">${esc(v.category)}</span>
        <span class="dot">·</span>
        <span class="res-label">HD</span>
      </div>
      <a href="/video/${v.slug}">
        <h3 class="card-title">${esc(v.title)}</h3>
      </a>
      <div class="card-stats">
        <span><i class="far fa-eye text-brand-primary"></i> ${formatViews(v.views)}</span>
        <span><i class="far fa-calendar-alt"></i> ${timeAgo(v.created_at)}</span>
      </div>
    </div>
  </article>`;
}

function relatedCardHTML(v) {
  return `
  <article class="related-card group" data-id="${v.id}">
    <a href="/video/${v.slug}" class="related-thumb">
      <img src="${v.thumbnail}" alt="${esc(v.title)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
      ${v.duration_fmt ? `<span class="duration-badge">${v.duration_fmt}</span>` : ''}
    </a>
    <div class="related-body">
      <a href="/video/${v.slug}"><h4 class="related-title">${esc(v.title)}</h4></a>
      <div class="card-stats mt-2">
        <span><i class="fas fa-eye text-brand-primary"></i> ${formatViews(v.views)}</span>
        <span>${timeAgo(v.created_at)}</span>
      </div>
    </div>
  </article>`;
}

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.Utils = { getVideos, getModels, formatDuration, formatViews, timeAgo,
  slugFromPath, getQueryParam, sortVideos, setMeta, show404,
  videoCardHTML, relatedCardHTML, esc };
