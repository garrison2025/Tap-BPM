import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const out = path.join(root, 'dist');
const production = process.argv.includes('--production');
const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
const contactEmail = (process.env.CONTACT_EMAIL || '').trim();
const brand = 'Tempo Lab'; // PROVISIONAL. Update the final brand and project metadata before launch.
if (production && (!/^https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/.*)?$/i.test(siteUrl) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))) {
  console.error('Production build requires HTTPS SITE_URL and a genuine CONTACT_EMAIL. Example: SITE_URL=https://yourdomain.com CONTACT_EMAIL=your-real-email npm run build:production');
  process.exit(1);
}
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(src, 'assets'), path.join(out, 'assets'), { recursive: true });
fs.cpSync(path.join(src, 'core'), path.join(out, 'core'), { recursive: true });
const pageConfig = [
  ['home', '', 'Tap Tempo – Free BPM Tapper & Tempo Counter', 'Find a song’s tempo by tapping the beat. Fast, free BPM counter with keyboard support, stable timing and a mobile-friendly interface.'],
  ['delay', 'delay-reverb-calculator', 'BPM Delay & Reverb Calculator – Note Timing in Milliseconds', 'Calculate quarter, eighth, sixteenth, dotted and triplet delay times in milliseconds for any BPM. Free music production timing calculator.'],
  ['about', 'about', 'About Tempo Lab – Free Music Timing Tools', 'Learn how our free browser-based Tap Tempo and BPM Delay Calculator work and how they handle timing and privacy.'],
  ['privacy', 'privacy', 'Privacy – Tempo Lab', 'Read how the free Tap Tempo and BPM Timing Calculator process timing information locally in your browser.'],
  ['contact', 'contact', 'Contact & Feedback – Tempo Lab', 'Share feedback about our free music tempo tools and report inaccurate timing or browser compatibility problems.']
];
const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const year = new Date().getUTCFullYear();
const nav = '<nav id="primary-nav" data-mobile-nav class="nav" aria-label="Primary navigation"><a href="/" data-nav-home>Tap Tempo</a><a href="/delay-reverb-calculator/" data-nav-delay>Delay Calculator</a><a href="/about/" data-nav-about>About</a><a href="/contact/" data-nav-contact>Feedback</a></nav>';
const header = `<a class="sr-only" style="position:fixed" href="#main">Skip to content</a><header class="header"><div class="container header-inner"><a class="brand" href="/" aria-label="Tempo Lab home"><span class="brand-mark" aria-hidden="true"><b></b><b></b><b></b><b></b></span><span class="brand-word">tempo<span>lab.</span></span></a>${nav}<span class="header-utility"><i></i> IN THE POCKET. ON THE BEAT.</span><button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle navigation">☰ Menu</button><a class="header-cta" href="/delay-reverb-calculator/">Timing calculator ↗</a></div></header>`;
const footer = `<footer class="footer"><div class="container footer-grid"><div><a class="brand" href="/"><span class="brand-mark" aria-hidden="true"><b></b><b></b><b></b><b></b></span><span class="brand-word">tempo<span>lab.</span></span></a><p class="footer-note">© ${year} Tempo Lab prototype. Free rhythm tools, no uploads. Brand provisional until launch.</p></div><div class="footer-links"><a href="/">Tap Tempo</a><a href="/delay-reverb-calculator/">Delay Calculator</a><a href="/about/">About</a><a href="/privacy/">Privacy</a><a href="/contact/">Feedback</a></div></div></footer><div class="toast" role="status" aria-live="polite" data-toast></div><script type="module" src="/assets/shared.js"></script>`;
function getMeta(title, description, route, key) {
  const url = siteUrl + '/' + (route ? `${route}/` : '');
  const base = `<meta name="description" content="${escapeHtml(description)}"/><meta name="theme-color" content="#f5f6f2"/><meta property="og:title" content="${escapeHtml(title)}"/><meta property="og:description" content="${escapeHtml(description)}"/><meta property="og:type" content="website"/><meta name="twitter:card" content="summary"/>`;
  if (!production) return base + '<meta name="robots" content="noindex, nofollow"/>';
  let structured = '';
  if (['home', 'delay'].includes(key)) {
    const json = {
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: key === 'home' ? 'Tap Tempo and BPM Tapper' : 'BPM Delay and Reverb Calculator',
      url, description, operatingSystem: 'Any', applicationCategory: 'MusicApplication', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    };
    structured = `<script type="application/ld+json">${JSON.stringify(json)}</script>`;
  }
  return base + `<meta name="robots" content="index,follow"/><link rel="canonical" href="${escapeHtml(url)}"/><meta property="og:url" content="${escapeHtml(url)}"/>` + structured;
}
function render(key, route, title, description) {
  let body = fs.readFileSync(path.join(src, 'pages', `${key}.html`), 'utf8');
  const contactSection = production
    ? `<p>Send your feedback to the project contact: <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>. For bug reports, include the information below.</p>`
    : '<p class="under-construction">This is a private prototype. No public support inbox has been configured. Before publishing, the site owner must set a real contact address and review the privacy notice. This form only prepares a report; it does not send anything.</p>';
  body = body.replaceAll('{{CONTACT_SECTION}}', contactSection);
  const meta = getMeta(title, description, route, key);
  const currentNav = key === 'home' ? 'home' : key === 'delay' ? 'delay' : key === 'about' ? 'about' : key === 'contact' ? 'contact' : '';
  let finalHeader = header;
  if (currentNav) finalHeader = finalHeader.replace(`data-nav-${currentNav}`, 'aria-current="page"');
  const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${escapeHtml(title)}</title>${meta}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"/><link rel="stylesheet" href="/assets/style.css"/></head><body>${finalHeader}${body}${footer}</body></html>`;
  const target = path.join(out, route, 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
}
for (const entry of pageConfig) render(...entry);
const notFound = fs.readFileSync(path.join(src, 'pages', '404.html'), 'utf8');
fs.writeFileSync(path.join(out, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Page Not Found – Tempo Lab</title><meta name="robots" content="noindex"/><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"/><link rel="stylesheet" href="/assets/style.css"/></head><body>${header}${notFound}${footer}</body></html>`);
if (production) {
  const urls = pageConfig.map(([key, route]) => `<url><loc>${escapeHtml(siteUrl + '/' + (route ? `${route}/` : ''))}</loc></url>`).join('');
  fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
} else {
  fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
}
console.log(`${production ? 'Production' : 'Private prototype'} build ready: ${out}`);
console.log(`Pages: ${pageConfig.map(([,route]) => '/' + (route ? route + '/' : '')).join(', ')}`);