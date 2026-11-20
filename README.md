# Tempo Lab — Free Tap BPM & Music Timing Tools (V2.4)

An **offline-capable once loaded, zero-dependency browser prototype** for the approved V1.1 research plan. **This is a working code prototype, not an indexed SEO launch.** The name "Tempo Lab" is provisional; no domain has been purchased or deployed.

## Included

- `/` — functional Tap Tempo / BPM Tapper: touch / mouse / Space, 120 ms accidental double-tap rejection, median with outlier filtering, last-12-interval rolling measurement, half-time / double-time, consistency indicator, optional opt-in click sound, copy BPM, easy transfer to calculator.
- `/delay-reverb-calculator/` — 20–300 BPM conversion, six note divisions × straight/dotted/triplet (18 timings), milliseconds, Hertz, beat/bar references, **musical** pre-delay and decay guidelines (not acoustic RT60), copy table and shareable BPM link.
- `/about/`, `/privacy/`, `/contact/`, `404.html` — stage-aware pages: preview is clearly marked as a prototype; production uses public-facing copy and requires a real contact email.
- Accessibility: semantic controls, aria-live, focus states, keyboard, touch, prefers-reduced-motion and responsive layout.
- Pure static HTML, CSS, JavaScript; no NPM runtime packages, paid API, database, server side processing or external font dependencies.
- SEO policy: one main Tap BPM homepage for overlapping intent and one genuinely distinct delay calculator page; **no mass-created duplicate keyword pages**.

## Windows local use

**Simplest:** right-click `start-preview.ps1` and choose **Run with PowerShell** (after installing Node.js 18+). The script runs the tests and starts a local web server, with no paid packages.

Requires Node.js >=18 only for local builds and tests (no `npm install` required).

```powershell
cd Tap-BPM
npm run check
npm run dev
```

If you prefer not to download `http-server`, use a Python installation:

```powershell
python -m http.server 4173 --directory dist
```

Open `http://127.0.0.1:4173/` and `http://127.0.0.1:4173/delay-reverb-calculator/`.

### Private-preview SEO safety

`npm run build` creates a **non-indexable preview**: `robots.txt` permits crawling so search engines can see the HTML `noindex,nofollow` directive. Cloudflare Pages also receives an `_headers` file setting `X-Robots-Tag: noindex, nofollow` for preview responses. No canonical or sitemap is generated without a domain. Do **not** publish this preview and claim that real SEO is validated.

### Production build (only after deciding to launch)

Set both the final HTTPS domain and a real operator contact email. For example on Windows PowerShell:

```powershell
$env:SITE_URL = 'https://YOUR-FINAL-DOMAIN.COM'
$env:CONTACT_EMAIL = 'YOUR-REAL-CONTACT-EMAIL'
npm run build:production
```

This creates an indexable static `dist/` build with unique canonical URLs, `robots.txt`, `sitemap.xml`, WebApplication JSON-LD on the two working tools, Open Graph metadata, and clickable contact mailto address. The build **fails** if either required production setting is missing or SITE_URL is a Cloudflare Pages preview hostname; it requires an HTTPS domain origin with no path or query. Before public launch update the provisional brand, privacy/operator details and legal notices. If enabling AdSense/GA4, update privacy and configure relevant consent management first.

**Cloudflare Pages:** Framework preset None; build command `npm run build:production`; output directory `dist`. Add `SITE_URL` and `CONTACT_EMAIL` as environment variables in Cloudflare Pages. Do not launch publicly until brand, pages, policies, routing and ad approval are verified. Static hosting requires no Functions. If previewing on Cloudflare without formal SEO testing, use `npm run build` (robots=noindex).

## Testing and quality gates

`npm test` exercises precision, pause reset, outliers, accidental double taps, rolling history, half/double BPM, conversion values, and invalid input. Browser integration also needs to be inspected on desktop/mobile; unit tests alone do not prove all browsers are bug-free.

`npm run check` runs the 20 existing calculation tests, then performs a two-mode build audit (preview and production fixture): 189+ assertions cover robots rules, canonical URLs, headings, internal assets/routes, sitemap, 404, contact/privacy copy and restoration of safe noindex preview output. The fake production domain and email used by this audit are local-only fixtures, not launch settings. `npm run build` still produces the default safe preview; GitHub Actions now checks both stages on every push.

Functional acceptance cases:

| Test | Expected |
| --- | --- |
| First tap | no fabricated BPM |
| 500ms intervals | 120 BPM |
| 600ms intervals | 100 BPM |
| 750ms intervals | 80 BPM |
| <120ms accidental double tap | ignored |
| >3000ms pause | next tap begins new run |
| 120 BPM eighth note | 250ms |
| 120 BPM dotted eighth | 375ms |
| 120 BPM eighth triplet | 166.7ms |
| Keyboard Space | exactly one tap per press, does not scroll |
| Phone tap | exactly one tap per click/pointer action |

## Known limits / pre-launch checklist

1. Brand, website domain, operator contact and legal details are **not final**. The prototype is marked accordingly.
2. Need actual mobile browser/Core Web Vitals checks after final hosting; the current browser-only checks don't prove live CWV.
3. Do not treat prototype testing as validated Google rankings, domain traffic or AdSense approval.
4. The helper's "consistency" uses a heuristic median absolute deviation; it is not a calibrated measurement device.
5. Reverb decay suggestions are *musical timing references*, not prescriptions for acoustics or actual RT60.
6. The app stores a supported BPM in sessionStorage for navigation, but no server receives tap history. A shareable URL can include a BPM parameter visible to the host as part of the page request.
7. No third-party advertisements, analytics, tracking, consent manager or `ads.txt` are added in this prototype.
8. User's V1.1 research workbook is supplied separately / in `research/` for reference. None of its historical SEO figures are fabricated or used to create doorway pages.


## UI V2.1 refinement (2026-11-20)

- Reduced the accent palette to one high-visibility lime interaction color, with indigo reserved for selective data emphasis.
- Improved text contrast, tightened small-screen spacing and moved the interactive Tap console higher in the mobile viewport.
- Replaced the full-lime Delay input panel with a calm neutral surface and added clear `aria-pressed` feedback to BPM presets.
- Preserved all timing algorithms, routes, search intent targeting and prototype `noindex` protection.
- Verified browser layouts at 1440, 390 and 320 CSS pixels, alongside all 20 existing timing tests.


### V2.2 interaction reliability pass
- Spacebar taps never intercept native keyboard activation of FAQ summaries, links, buttons, or editable elements.
- Reset clears the cached BPM so the calculator cannot resurrect a cleared measurement.
- Invalid Delay BPM clears all dependent references and disables copy/share until input is valid again.
- Mobile navigation can be dismissed with Escape or an outside click, with focus restored to the menu control on Escape.
- Reduced live-region verbosity during rapid BPM measurements, plus distinct active/paused status indicator.


### V2.3 SEO / release safety and cross-tool continuity
- Production About, Privacy, Footer and 404 text no longer contain prototype-only claims. Preview builds remain noindex.
- Production builds require an HTTPS domain origin and a contact email; Cloudflare `pages.dev` and `workers.dev` preview domains and non-main Pages branches are rejected for indexed production builds.
- A build audit verifies internal routes, metadata, canonical, sitemap, 404, preview robots and output restoration.
- BPM readings outside the Delay Calculator's 20–300 range are shown honestly; the link opens the calculator without a misleading BPM transfer.
- The last BPM cache is cleared when a new measurement begins or the selected multiplier produces an out-of-range value.
- Privacy wording now distinguishes browser-only tap timestamps from BPM query parameters in shareable URLs.
- No AdSense or analytics scripts have been added; privacy and consent requirements must be revisited before activating them.

### V2.4 production-delivery safeguards (2026-11-20)

- Both preview and indexable production builds now ship a Cloudflare Pages `_headers` file. It adds `X-Content-Type-Options: nosniff`, a privacy-conscious `Referrer-Policy`, `X-Frame-Options: DENY`, and a restrictive `Permissions-Policy`. Preview builds additionally serve `X-Robots-Tag: noindex, nofollow`. Production intentionally **does not** include this header.
- `npm run check` runs 20 calculation tests, the preview/production SEO safety audit, a compressed static-payload budget, and an HTTP smoke test of the local preview routes and trailing-slash redirect. No external packages are needed.
- The static page budgets are **not** Lighthouse scores or measured Core Web Vitals. Current first-load HTML/CSS/JS gzip estimates are approximately **16.5 KiB for Tap Tempo and 14.4 KiB for Delay Calculator**, excluding transfer headers, network latency and browser execution. These values are derived from local compiled assets.
- Cloudflare's `_headers` rules apply to **static asset** responses; these are not a general substitute for Pages Functions response handling. There are no Pages Functions in this project.
- Before formal SEO launch, configure `SITE_URL` and `CONTACT_EMAIL` with the real, final values, then select `npm run build:production` in Cloudflare Pages. Until then use `npm run build`, which retains `noindex` and avoids exposing a placeholder canonical domain.
- After publishing, use the *actual deployment URL* to check HTTP status codes, response headers, mobile Lighthouse/LCP/CLS/INP and Search Console index coverage. Neither the Github CI tests nor these local byte budgets establish live performance or SEO rankings.

### V2.5 — keyword intent and workflow improvements (2026-11-20)
- The homepage H1 now explicitly identifies **Tap Tempo**, while the main tool remains one page covering overlapping manual BPM tapper/counter queries. A concise how-to section shows the BPM calculation and limitations.
- The Delay calculator now supports 2/4, 3/4, 4/4, 6/8 and 12/8 bar references at **quarter-note BPM**. It can copy a single displayed note timing (ms), copy the full table, and share both BPM and time signature in the URL.
- The meter changes **bar-dependent guidance only**; straight/dotted/triplet note milliseconds remain quarter-note BPM based. In compound meters such as 6/8, a dotted-quarter tempo must be converted before entry.
- `docs/SEO_KEYWORD_MAP.md` records measured keyword groups, source-date KD discrepancies, rejected intents, and the correct URL mapping. `npm run check` now checks page-intent contracts; no duplicate keyword doorway pages were added.
- Preview remains **noindex** until real-domain and contact requirements are set. No Google indexation, Cloudflare deployment or AdSense activation is claimed by this code change.
