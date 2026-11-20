/** Run a real HTTP smoke test against the zero-dependency local preview server. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const child=spawn(process.execPath,[path.join(root,'scripts/serve.mjs')],{
  cwd:root, env:{...process.env,PORT:'0'}, stdio:['ignore','pipe','pipe']
});
let stderr='';child.stderr.on('data',d=>{stderr+=d.toString();});
async function waitForServer() {
  return await new Promise((resolve,reject)=>{
    let stdout='';
    const timer=setTimeout(()=>reject(new Error('HTTP preview did not start: '+stderr)),7000);
    const fail=(code)=>{clearTimeout(timer);reject(new Error('Preview exited early: '+code+' '+stderr));};
    child.once('exit',fail);
    child.stdout.on('data',(chunk)=>{
      stdout+=chunk.toString();
      const m=stdout.match(/Private preview:\s*(http:\/\/127\.0\.0\.1:\d+\/)/);
      if(m){clearTimeout(timer);child.removeListener('exit',fail);resolve(m[1]);}
    });
  });
}
try {
  const origin=await waitForServer();
  const cases=[
    ['/',200,'text/html','noindex, nofollow'],
    ['/delay-reverb-calculator/',200,'text/html','BPM Delay'],
    ['/about/',200,'text/html','About'],
    ['/privacy/',200,'text/html','Privacy'],
    ['/contact/',200,'text/html','Feedback'],
    ['/assets/style.css',200,'text/css','--paper'],
    ['/assets/tempo-ui.js',200,'text/javascript','registerTap'],
    ['/not-a-page-xyz/',404,'text/html','Page not found']
  ];
  for(const [route,status,type,needle] of cases){
    const r=await fetch(new URL(route,origin));
    assert.equal(r.status,status,`${route} HTTP status`);
    assert.ok((r.headers.get('content-type')||'').includes(type),`${route} content type`);
    assert.ok((await r.text()).includes(needle),`${route} response body`);
  }
  const redirect=await fetch(new URL('/delay-reverb-calculator',origin),{redirect:'manual'});
  assert.equal(redirect.status,308);
  assert.equal(redirect.headers.get('location'),'/delay-reverb-calculator/');
  console.log(`HTTP smoke: ${cases.length} routes plus canonical slash redirect passed.`);
} finally {
  child.kill();
}
