/** Dependency-free static delivery budget, NOT a Lighthouse/Core Web Vitals measurement. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const size = name => {
  const bytes = fs.readFileSync(path.join(root, name));
  return {raw: bytes.length, gzip: gzipSync(bytes, {level:9}).length};
};
const css = size('assets/style.css');
const shared = size('assets/shared.js');
const tempo = size('assets/tempo-ui.js');
const delay = size('assets/delay-ui.js');
const coreTempo = size('core/tempo.mjs');
const coreTiming = size('core/timing.mjs');
const home = size('index.html');
const calculator = size('delay-reverb-calculator/index.html');
const kb = b => (b / 1024).toFixed(1);
const routes = [
  {name:'Tap Tempo', html:home, critical: [css,shared,tempo,coreTempo]},
  {name:'Delay Calculator', html:calculator, critical:[css,shared,delay,coreTiming]}
];
assert.ok(css.gzip < 12*1024, `CSS exceeds 12 KiB gzip budget (${kb(css.gzip)} KiB)`);
assert.ok(Math.max(home.gzip,calculator.gzip) < 8*1024, 'Page HTML exceeds 8 KiB gzip budget');
for(const route of routes){
  const estimate = route.html.gzip + route.critical.reduce((a,s)=>a+s.gzip,0);
  assert.ok(estimate < 25*1024, `${route.name} critical text payload exceeds 25 KiB gzip (${kb(estimate)} KiB)`);
  console.log(`${route.name}: ~${kb(estimate)} KiB gzip HTML/CSS/JS (static payload only)`);
}
for(const route of ['index.html','delay-reverb-calculator/index.html']) {
  const html = fs.readFileSync(path.join(root,route),'utf8');
  assert.doesNotMatch(html, /<(?:script|iframe)\b[^>]*\bsrc\s*=\s*["']https?:\/\//i, `${route} contains a third-party runtime script/frame`);
  assert.doesNotMatch(html, /<link\b[^>]*\bhref\s*=\s*["']https?:\/\/[^"']+["'][^>]*rel\s*=\s*["']stylesheet/i, `${route} contains a third-party stylesheet`);
}
console.log('Static performance budgets passed. These estimates are not Lighthouse lab scores or field CWV.');
