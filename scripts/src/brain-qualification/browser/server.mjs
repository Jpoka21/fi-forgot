import {createServer,request} from 'node:http';
import {readFileSync,realpathSync} from 'node:fs';
import {resolve,sep,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {admittedApi,staticPath,deniedRequest} from './policy.mjs';
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const headers={'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'",'Referrer-Policy':'no-referrer','X-DNS-Prefetch-Control':'off','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
/** No import-time listener. Caller must already have independently admitted the guest attempt. */
export async function startFrontend({dist,manifest,owner,denied}){
 const root=realpathSync(dist),assets=new Map();
 for(const entry of manifest.files){const path=realpathSync(resolve(root,entry.path));if(!path.startsWith(root+sep))throw Error('Asset boundary mismatch');const bytes=readFileSync(path);if(hash(bytes)!==entry.sha256.toLowerCase()||assets.has(entry.path))throw Error('Asset hash/duplicate mismatch');assets.set(entry.path,bytes);}
 if(!assets.has('index.html')||manifest.buildEnvironment?.VITE_BRAIN_CONCIERGE!=='true')throw Error('Brain build evidence missing');
 const server=createServer(async(req,res)=>{
  const fail=()=>{denied.push(deniedRequest(req.method,req.url??'',req.headers,owner));res.writeHead(403,headers);res.end();};
  try{
   if(req.headers.host!=='127.0.0.1:25460')return fail();
   if(req.url?.startsWith('/api/')){
    let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>1024){fail();return;}}
    if(!admittedApi(req.method,req.url,req.headers,body,owner))return fail();
    const upstream=request({hostname:'127.0.0.1',port:8080,path:req.url,method:req.method,timeout:10000,headers:{'content-type':'application/json',...(req.method==='GET'?{'x-user-id':owner.id}:{}),'content-length':Buffer.byteLength(body)}},response=>{
     // Never forward redirects, cookies, or arbitrary upstream headers.
     if(response.statusCode<200||response.statusCode>=300){response.resume();res.writeHead(502,headers);res.end();return;}
     let size=0;const chunks=[];response.on('data',chunk=>{size+=chunk.length;if(size>4*1024*1024){response.destroy();res.destroy();}else chunks.push(chunk);});response.on('end',()=>{res.writeHead(200,{...headers,'Content-Type':'application/json'});res.end(Buffer.concat(chunks));});response.on('error',()=>res.destroy());
    });upstream.on('timeout',()=>upstream.destroy());upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502,headers);res.end();});upstream.end(body);return;
   }
   const path=staticPath(req.url??'');if(req.method!=='GET'||!path||!assets.has(path))return fail();
   const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'}[extname(path)]??'application/octet-stream';
   res.writeHead(200,{...headers,'Content-Type':mime});res.end(assets.get(path));
  }catch{if(!res.headersSent)res.writeHead(500,headers);res.end();}
 });
 await new Promise((ok,no)=>{server.once('error',no);server.listen(25460,'127.0.0.1',ok);});
 return async()=>{server.closeAllConnections();await new Promise((ok,no)=>server.close(e=>e?no(e):ok()));};
}
