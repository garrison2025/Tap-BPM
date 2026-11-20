# Tempo Lab — Tap BPM / Free SEO Traffic Site Prototype (V1.1)

An **offline-capable once loaded, zero-dependency browser prototype** for the approved V1.1 research plan. **This is a working code prototype, not an indexed SEO launch.** The name "Tempo Lab" is provisional; no domain has been purchased or deployed.

## Included

- `/` — functional Tap Tempo / BPM Tapper: touch / mouse / Space, 120 ms accidental double-tap rejection, median with outlier filtering, last-12-interval rolling measurement, half-time / double-time, consistency indicator, optional opt-in click sound, copy BPM, easy transfer to calculator.
- `/delay-reverb-calculator/` — 20–300 BPM conversion, six note divisions × straight/dotted/triplet (18 timings), milliseconds, Hertz, beat/bar references, **musical** pre-delay and decay guidelines (not acoustic RT60), copy table and shareable BPM link.
- `/about/`, `/privacy/`, `/contact/`, `404.html` — written, honest prototype messaging; contact email required for public launch.
- Accessibility: semantic controls, aria-live, focus states, keyboard, touch, prefers-reduced-motion and responsive layout.
- Pure static HTML, CSS, JavaScript; no NPM runtime packages, paid API, database, server side processing or external font dependencies.
- SEO policy: one main Tap BPM homepage for overlapping intent and one genuinely distinct delay calculator page; **no mass-created duplicate keyword pages**.

## Windows local use

**Simplest:** right-click `start-preview.ps1` and choose **Run with PowerShell** (after installing Node.js 18+). The script runs the tests and starts a local web server, with no paid packages.

Requires Node.js >=18 only for local builds and tests (no `npm install` required).

```powershell
cd Tap_BPM_Prototype_V1.1
npm test
npm run build
npm run dev
```

If you prefer not to download `http-server`, use a Python installation:

```powershell
python -m http.server 4173 --directory dist
```

Open `http://127.0.0.1:4173/` and `http://127.0.0.1:4173/delay-reverb-calculator/`.

### Private-preview SEO safety

`npm run build` creates a **private preview**: `robots.txt` disallows all crawling and every HTML page contains `noindex,nofollow`. No canonical or sitemap is generated without a domain. Do **not** publish this preview and claim that real SEO is validated.

### Production build (only after deciding to launch)

Set both the final HTTPS domain and a real operator contact email. For example on Windows PowerShell:

```powershell
$env:SITE_URL = 'https://YOUR-FINAL-DOMAIN.COM'
$env:CONTACT_EMAIL = 'YOUR-REAL-CONTACT-EMAIL'
npm run build:production
```

This creates a ready-to-upload `dist/` with unique canonical URLs, `robots.txt`, `sitemap.xml`, WebApplication JSON-LD on the two working tools, Open Graph metadata, and clickable contact mailto address. The build **fails** if either required production setting is missing. Before public launch update the provisional brand, privacy/operator details and legal notices. If enabling AdSense/GA4, update privacy and configure relevant consent management first.

**Cloudflare Pages:** Framework preset None; build command `npm run build:production`; output directory `dist`. Add `SITE_URL` and `CONTACT_EMAIL` as environment variables in Cloudflare Pages. Do not launch publicly until brand, pages, policies, routing and ad approval are verified. Static hosting requires no Functions. If previewing on Cloudflare without formal SEO testing, use `npm run build` (robots=noindex).

## Testing and quality gates

`npm test` exercises precision, pause reset, outliers, accidental double taps, rolling history, half/double BPM, conversion values, and invalid input. Browser integration also needs to be inspected on desktop/mobile; unit tests alone do not prove all browsers are bug-free.

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
6. The app stores the latest BPM in sessionStorage for navigation, but no server receives tap history.
7. No third-party advertisements, analytics, tracking, consent manager or `ads.txt` are added in this prototype.
8. User's V1.1 research workbook is supplied separately / in `research/` for reference. None of its historical SEO figures are fabricated or used to create doorway pages.
