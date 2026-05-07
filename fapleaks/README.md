# Fapleaks – Static Site (GitHub Pages + Cloudflare Workers)

Migrated from PHP + XML to pure static HTML/JS, hosted on GitHub Pages with routing via Cloudflare Workers.

## Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Hosting    | GitHub Pages                        |
| Routing    | Cloudflare Worker (`worker.js`)     |
| Frontend   | Vanilla HTML + JavaScript (no framework) |
| Database   | JSON files (`/data/*.json`)         |
| Styles     | Custom CSS (`/assets/css/custom.css`) |
| Icons      | Font Awesome 6                      |
| CI/CD      | GitHub Actions                      |

## Project Structure

```
fapleaks/
├── index.html           # Homepage (video grid)
├── video.html           # Single video page (slug from URL)
├── model.html           # Model profile page (slug from URL)
├── models.html          # All models listing
├── category.html        # Single category page (slug from URL)
├── categories.html      # All categories listing
├── search.html          # Search results page
├── 404.html             # Not found page
├── worker.js            # Cloudflare Worker (URL routing)
├── wrangler.toml        # Cloudflare Wrangler config
├── generate-sitemap.js  # Node script → outputs sitemap.xml
├── robots.txt
├── _redirects           # Cloudflare Pages / Netlify fallback
├── data/
│   ├── videos.json      # All videos (converted from XML)
│   └── models.json      # All models
├── assets/
│   ├── css/
│   │   └── custom.css
│   └── js/
│       ├── utils.js     # Shared helpers (fetch, format, render)
│       └── layout.js    # Navbar + footer injection
└── .github/
    └── workflows/
        └── deploy.yml   # Auto-deploy to GitHub Pages
```

## URL Routing

| URL pattern          | Served HTML      |
|----------------------|------------------|
| `/`                  | `index.html`     |
| `/video/<slug>`      | `video.html`     |
| `/model/<slug>`      | `model.html`     |
| `/category/<slug>`   | `category.html`  |
| `/models`            | `models.html`    |
| `/categories`        | `categories.html`|
| `/search?q=…`        | `search.html`    |
| anything else        | `404.html`       |

## Quick Start

### 1. GitHub Pages

```bash
# Push the project to a GitHub repo
git init && git add . && git commit -m "initial"
git remote add origin https://github.com/YOURUSER/fapleaks.git
git push -u origin main
# Enable GitHub Pages → Settings → Pages → Branch: main / root
```

### 2. Cloudflare Worker

```bash
npm install -g wrangler
wrangler login
# Edit wrangler.toml: set ORIGIN to your GitHub Pages URL
wrangler deploy
# Add route in Cloudflare: fapleaks.com/* → fapleaks-worker
```

### 3. Generate Sitemap

```bash
node generate-sitemap.js
# → sitemap.xml created in project root
```

## Adding New Videos

Edit `data/videos.json` and add an object:

```json
{
  "id": 200,
  "title": "Video Title Here",
  "slug": "video-title-here",
  "thumbnail": "https://cdn.example.com/thumb.jpg",
  "embed_url": "https://embedprovider.com/embed/VIDEO_ID",
  "model": "Model Name",
  "category": "OnlyFans",
  "category_slug": "onlyfans",
  "category_color": "#e11d48",
  "views": 1500,
  "description": "Short description of the video.",
  "duration": 720,
  "duration_fmt": "12:00",
  "created_at": "2024-06-01T00:00:00Z"
}
```

Push to `main` — GitHub Actions auto-deploys.

## Performance Notes

- The full `videos.json` (~199 videos, ~180 KB) is fetched once and cached in-memory per session.
- Thumbnails use `loading="lazy"` except above-the-fold cards.
- The video player uses a click-to-reveal poster pattern — the embed iframe is injected only on user interaction (no auto-load).
- For 1 000+ videos, split `videos.json` into per-category files and lazy-load them per route.
