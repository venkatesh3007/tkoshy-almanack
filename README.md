# thampykoshy.com — Rollingstone Revelations

T. Koshy's blog, statically rendered from the original Blogger feed
(`rollingstone-revelations.blogspot.com`) as a fully SEO-optimized Next.js
site for deployment on Vercel.

## How it works

- All posts are pulled from the Blogger Atom feed **at build time** and each
  becomes a real static HTML page at `/{year}/{month}/{slug}` (mirroring the
  original Blogger permalinks; `…/slug.html` requests 308-redirect to the
  clean URL).
- **ISR (`revalidate: 3600`)**: every page re-checks the feed hourly, so new
  posts published on Blogger appear on thampykoshy.com within an hour —
  no rebuild or redeploy needed. Brand-new post URLs render on demand
  (`dynamicParams: true`).
- Content is sanitized server-side (`sanitize-html`) before rendering.

## SEO features

- Per-post `<title>`, meta description, canonical URL on `https://thampykoshy.com`
- Open Graph + Twitter Card tags, with a generated 1200×630 OG image per post
  (plus the Blogger post thumbnail when available)
- JSON-LD structured data: `Blog` on the home page, `BlogPosting` + `Person`
  on every post
- `sitemap.xml` (home, all posts, all topic pages), `robots.txt`, RSS at `/feed.xml`
- Topic/label archive pages at `/topics` and `/topics/{label}`
- Semantic HTML (`article`, `time`, `nav`), self-hosted fonts via `next/font`,
  lazy-loaded images, fully server-rendered register on the home page

## Develop

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build (fetches the full feed)
```

## Deploy to Vercel at thampykoshy.com

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Vercel: **Add New → Project**, import the repo. Framework preset
   "Next.js" is auto-detected; no env vars or build settings needed.
3. After the first deploy: **Project → Settings → Domains → Add** →
   `thampykoshy.com`. Also add `www.thampykoshy.com` and set it to redirect
   to the apex.
4. At the domain registrar, point DNS as Vercel instructs:
   - `A` record for `thampykoshy.com` → `76.76.21.21`
   - `CNAME` for `www` → `cname.vercel-dns.com`
5. Once live, submit `https://thampykoshy.com/sitemap.xml` in
   [Google Search Console](https://search.google.com/search-console) (verify
   the domain via DNS TXT record) and Bing Webmaster Tools.

New Blogger posts appear automatically within an hour of publishing. To force
an immediate refresh, trigger a redeploy from the Vercel dashboard.

## Repo layout

- `lib/posts.ts` — feed fetching, parsing, sanitizing, slugs, topics
- `lib/site.ts` — site name/URL/description constants
- `app/page.tsx` + `components/Register.tsx` — the register (home) with
  year spine and client-side search
- `app/[year]/[month]/[slug]/` — post pages + per-post OG image
- `app/topics/` — label archive pages
- `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/route.ts` — SEO endpoints
- `legacy/koshy_full_index.html` — the original single-file client-side site
  this replaces (kept for reference)
