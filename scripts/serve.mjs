/** Local preview only. Run `npm run build` before `npm run dev`. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png'};
if(!fs.existsSync(root)) { console.error('Missing dist/. Run npm run build first.'); process.exit(1); }
http.createServer((req,res)=>{
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,`http://localhost:${port}`).pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  const target = path.resolve(root, '.' + pathname);
  if(target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
  let filepath = target;
  try {
    if(fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      if(!pathname.endsWith('/')) { res.writeHead(308,{Location:pathname+'/'}).end(); return; }
      filepath=path.join(target,'index.html');
    }
    if(!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) { filepath=path.join(root,'404.html'); res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}); }
    else res.writeHead(200,{'Content-Type':mime[path.extname(filepath)] || 'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(filepath).pipe(res);
  } catch { res.writeHead(500).end('Internal preview error'); }
}).listen(port,'127.0.0.1',()=>console.log(`Private preview: http://127.0.0.1:${port}/`));
