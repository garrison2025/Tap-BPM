# Tempo Lab — Cloudflare Pages launch checklist

This repository is **not yet ready for Google indexing**. There is no final public domain or verified operator contact in the codebase. Keep the site as a preview until both are established.

## 1. Pre-launch preview

- GitHub repository: `garrison2025/Tap-BPM`; production branch: `main`.
- Cloudflare Pages Framework preset: `None`; root directory: `/`.
- Build command: `npm run build`; output directory: `dist`.
- Preview HTML has `<meta name="robots" content="noindex, nofollow">` and the static `_headers` file sets `X-Robots-Tag: noindex, nofollow`. `robots.txt` intentionally allows crawl access so crawlers can read `noindex`.
- `npm run check` must pass in GitHub Actions.
- Do not interpret preview success as proof that Google can rank the future domain.

## 2. Indexable launch (after domain and contact are real)

1. Decide the final domain and canonical host; connect that domain to Cloudflare Pages and configure the opposite host's redirect through Cloudflare.
2. Review brand ownership, About, Privacy, cookie/advertising disclosure and genuine contact inbox. Do not enable AdSense before privacy/consent requirements are satisfied.
3. Set `SITE_URL=https://final-domain.example` (substitute the actual HTTPS origin) and `CONTACT_EMAIL=real-contact@example.com` in Cloudflare Pages production environment variables. Do not use these examples verbatim.
4. Change the **production** build command to `npm run build:production`, output `dist`, production branch `main`; leave preview branches with `npm run build` so they remain nonindexable. The build refuses a non-main `CF_PAGES_BRANCH` for the indexable mode and rejects `pages.dev`/`workers.dev` as final `SITE_URL`.
5. Verify over HTTP: homepage and calculator 200; unknown path 404; `sitemap.xml` 200 with canonical HTTPS URLs; `robots.txt` points to sitemap; `_headers` applies security headers **without** `X-Robots-Tag: noindex` on production; canonical matches actual hostname.
6. Use PageSpeed Insights (mobile and desktop) on the actual public URL and inspect Search Console Indexing + Core Web Vitals. Record LCP, CLS and INP from the real deployment. Lab metrics alone are not field Core Web Vitals.
7. Only then request indexing through Search Console and begin measuring the target non-brand search terms.

## 3. Ads later

- This code contains no AdSense or other ad scripts. The Privacy page states this accurately **for the current version**.
- If advertisements or analytics are added, revisit the privacy notice and obtain relevant user consent where required; test ads for layout shift and tap-button obstruction on mobile.
- Do not assume the test preview or `pages.dev` origin is suitable as the final SEO canonical domain.

## 4. Dependencies and costs

No runtime external API, database, paid font, analytics, account service or file upload is required for the current two free tools. The only likely recurring cost after launch is the chosen domain, subject to hosting provider plan limits and actual traffic.
