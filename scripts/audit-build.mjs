import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root,'dist');
const origin = 'https://preview-audit-tempo.example.net';
const routes = ['', 'delay-reverb-calculator/','about/','privacy/','contact/'];
const read = file => fs.readFileSync(path.join(out,file),'utf8');
const exists = file => fs.existsSync(path.join(out,file));
const build = (prod,patch={}) => execFileSync(process.execPath,[path.join(root,'scripts/build.mjs'),...(prod?['--production']:[])], {cwd:root,env:{...process.env,CF_PAGES_BRANCH:'',SITE_URL:prod?origin:'',CONTACT_EMAIL:prod?'qa@example.net':'',...patch},stdio:'pipe'});
let assertions=0;
const check = (ok,comment) => { assert.ok(ok,comment); assertions++; };
function inspect(prod) {
 const robots = read('robots.txt');
 check(robots.includes('Allow: /'),'robots allows crawler to see noindex');
 check(prod ? exists('sitemap.xml') : !exists('sitemap.xml'),'sitemap only in production');
 check(prod ? !exists('_headers') : read('_headers').includes('X-Robots-Tag: noindex, nofollow'),'preview HTTP noindex header');
 for(const route of routes){
  const html = read(route+'index.html');
  check((html.match(/<h1\b/g)||[]).length===1,'unique H1: '+route);
  check(html.includes('lang="en"'),'language: '+route);
  check(html.includes('name="description"'),'description: '+route);
  check(html.includes('name="viewport"'),'viewport: '+route);
  check(!/{{[A-Z_]+}}/.test(html),'unresolved placeholders: '+route);
  check(prod ? (html.includes('rel="canonical" href="'+origin+'/'+route+'"') && html.includes('content="index,follow"')) : (html.includes('content="noindex, nofollow"') && !html.includes('rel="canonical"')),'robots/canonical: '+route);
  if(prod)check(!/working prototype|this prototype|private prototype|provisional until launch|not been configured/i.test(html),'no prototype copy: '+route);
  for(const m of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)){
    const dest = m[1].split('?')[0].split('#')[0];
    const rel = dest.replace(/^\//,'');
    check(exists(dest.endsWith('/') ? rel+'index.html' : rel),'broken internal route/asset: '+dest);
  }
 }
 if(prod){const sitemap=read('sitemap.xml');for(const route of routes)check(sitemap.includes('<loc>'+origin+'/'+route+'</loc>'),'sitemap: '+route);
   check(!sitemap.includes('/404'),'404 excluded');check(read('privacy/index.html').includes('qa@example.net'),'privacy contact');}
 check(read('404.html').includes('content="noindex"'),'404 noindex');
}
try {
 build(false); inspect(false);
 build(true); inspect(true);
 for(const overrides of [{SITE_URL:'https://staging.pages.dev'},{CF_PAGES_BRANCH:'not-main'}]) {
   let failed=false; try{build(true,overrides);}catch{failed=true;}
   check(failed,'unsafe production config rejected');
 }
 console.log('SEO build audit: '+assertions+' checks passed.');
} finally {
 build(false);
 check(read('index.html').includes('content="noindex, nofollow"'),'safe preview restored');
}
