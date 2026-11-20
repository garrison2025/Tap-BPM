import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const pages = ['', 'delay-reverb-calculator/', 'about/', 'privacy/', 'contact/'];
const testOrigin = 'https://preview-audit-tempo.example.net'; // Internal build fixture only; never published.
const read = (file) => fs.readFileSync(path.join(out, file), 'utf8');
const build = (production) => execFileSync(process.execPath,
  [path.join(root, 'scripts/build.mjs'), ...(production ? ['--production'] : [])],
  { cwd:root, env:production ? {...process.env, SITE_URL:testOrigin, CONTACT_EMAIL:'testing@example.net'} : {...process.env, SITE_URL:'', CONTACT_EMAIL:''}, stdio:'pipe' });

let checks = 0;
function check(cond, label) { assert.ok(cond, label); checks++; }
function inspectSite(production) {
  const sitemap = path.join(out, 'sitemap.xml');
  const robots = read('robots.txt');
  check(production ? fs.existsSync(sitemap) : !fs.existsSync(sitemap), 'sitemap only on configured production build');
  const headers = read('_headers');
  check(headers.includes('X-Content-Type-Options: nosniff') && headers.includes('Referrer-Policy: strict-origin-when-cross-origin') && headers.includes('X-Frame-Options: DENY') && headers.includes('Permissions-Policy: camera=(), microphone=(), geolocation=()'), 'both build stages contain Cloudflare security response headers');
  check(production ? !headers.includes('X-Robots-Tag: noindex') : headers.includes('X-Robots-Tag: noindex, nofollow'), 'preview sends noindex response header; production does not');
  check(production ? /Allow: \/\n/.test(robots) && robots.includes('Sitemap: '+testOrigin+'/sitemap.xml')
    : /Allow: \/\n/.test(robots), 'robots allows crawlers to observe preview noindex rules');
  for (const route of pages) {
    const html = read(route + 'index.html');
    const url = testOrigin + '/' + route;
    check((html.match(/<h1\b/g) || []).length === 1, `${route} has exactly one H1`);
    check(html.includes('<html lang="en">') && html.includes('<meta name="viewport"'), `${route} has document language and viewport`);
    check(html.includes('<meta name="description"'), `${route} has meta description`);
    check(!/{{[A-Z_]+}}/.test(html), `${route} has no unresolved placeholders`);
    check(production ? html.includes(`<link rel="canonical" href="${url}"/>`) && html.includes('name="robots" content="index,follow"')
      : html.includes('name="robots" content="noindex, nofollow"') && !html.includes('rel="canonical"'), `${route} canonical and robots follow build stage`);
    if (production) check(!/working prototype|this prototype|private prototype|provisional until launch|not been configured|registered brand or domain/i.test(html), `${route} has no prototype-only statements`);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
      const dest = match[1].split('?')[0].split('#')[0];
      if (!dest) continue;
      const relative = dest.replace(/^\//,'');
      const file = dest.endsWith('/') || dest === '/' ? path.join(out, relative, 'index.html') : path.join(out, relative);
      check(fs.existsSync(file), `${route} links to existing asset or route ${dest}`);
    }
  }
  if(production) {
    const map = read('sitemap.xml');
    for (const route of pages) check(map.includes(`<loc>${testOrigin}/${route}</loc>`), `sitemap contains ${route}`);
    check(!map.includes('/404'), 'sitemap excludes error page');
    check(read('privacy/index.html').includes('testing@example.net'), 'production privacy supplies contact');
  }
  check(read('404.html').includes('name="robots" content="noindex"'), '404 not indexable');
}

try {
  build(false);
  inspectSite(false);
  build(true);
  inspectSite(true);
  // Guard against accidental releases pointed at Pages preview URLs.
  const blocked = execFileSync; // Run the negative case as a child to avoid mixing output with the production fixture.
  let blockedOk = false;
  try { blocked(process.execPath, [path.join(root,'scripts/build.mjs'),'--production'],
     {cwd:root,env:{...process.env,SITE_URL:'https://preview.pages.dev',CONTACT_EMAIL:'testing@example.net'},stdio:'pipe'}); }
  catch { blockedOk = true; }
  check(blockedOk, 'production build rejects Cloudflare Pages preview host');
  let branchRejected = false;
  try { blocked(process.execPath, [path.join(root,'scripts/build.mjs'),'--production'],
     {cwd:root,env:{...process.env,SITE_URL:testOrigin, CONTACT_EMAIL:'testing@example.net',CF_PAGES_BRANCH:'feature-preview'},stdio:'pipe'}); }
  catch { branchRejected = true; }
  check(branchRejected, 'production build rejects non-main Cloudflare Pages branch');
  console.log(`Site build audit: ${checks} assertions passed across preview and production fixtures.`);
} finally {
  build(false); // Never leave locally-generated production indexability enabled after testing.
  check(read('index.html').includes('name="robots" content="noindex, nofollow"'), 'preview restored after audit');
}
