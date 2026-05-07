/**
 * generate-sitemap.js
 * Run with: node generate-sitemap.js
 * Outputs: sitemap.xml in the project root
 *
 * Add to your build pipeline (GitHub Actions) so it runs on every deploy.
 */

const fs   = require('fs');
const path = require('path');

const BASE  = 'https://fapleaks.com';
const TODAY = new Date().toISOString().split('T')[0];

const videos = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'videos.json'), 'utf8'));
const models = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'models.json'), 'utf8'));

// Build category list from videos
const catSlugs = [...new Set(videos.map(v => v.category_slug).filter(Boolean))];

function urlEntry(loc, priority = '0.7', freq = 'weekly', lastmod = TODAY) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries = [
  urlEntry(`${BASE}/`,           '1.0', 'daily'),
  urlEntry(`${BASE}/models`,     '0.9', 'daily'),
  urlEntry(`${BASE}/categories`, '0.8', 'weekly'),
  ...catSlugs.map(slug => urlEntry(`${BASE}/category/${slug}`, '0.7', 'daily')),
  ...models.map(m   => urlEntry(`${BASE}/model/${m.slug}`, '0.7', 'weekly')),
  ...videos.map(v   => urlEntry(`${BASE}/video/${v.slug}`, '0.8', 'weekly',
    v.created_at ? v.created_at.split('T')[0] : TODAY)),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml, 'utf8');
console.log(`✅  sitemap.xml generated — ${entries.length} URLs`);
