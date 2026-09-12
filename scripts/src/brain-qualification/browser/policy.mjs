export const origin='http://127.0.0.1:25460';
export const reads=new Set(['/api/recipients','/api/personal/cards','/api/personal/briefings','/api/v2/concierge','/api/v2/concierge/opportunity-feedback','/api/v2/concierge/opportunity-follow-through']);
export function admittedApi(method,path,headers,body,owner){
 if(method==='GET')return (reads.has(path)||questionRequestKind(path,owner)!==null)&&headers['x-user-id']===owner.id;
 if(method!=='POST'||path!=='/api/auth/session'||Buffer.byteLength(body)>1024)return false;
 try{const value=JSON.parse(body);return Object.keys(value).sort().join(',')==='email,name'&&value.email===owner.email&&value.name===owner.name;}catch{return false;}
}
export function staticPath(raw){
 if(!raw.startsWith('/')||raw.includes('\\')||raw.includes('%')||raw.includes('?')||raw.includes('#')||raw.split('/').some(x=>x==='.'||x==='..'))return null;
 return raw==='/'||raw==='/recipients'||raw==='/concierge'?'index.html':raw.slice(1);
}
export const presented=items=>items.filter(x=>x.presentation.recommendationEligible&&x.recommendation!==null&&(x.timing.temporal?.recommendationEligible??true)).slice(0,3);
export function current(history){const latest=new Map();for(const e of history)if(!latest.has(e.lineageId)||latest.get(e.lineageId).version<e.version)latest.set(e.lineageId,e);return [...latest.values()].filter(e=>e.active&&e.action==='set');}

/** Diagnostics never admit a request. Only known route names and declared synthetic
 * recipient paths may be exported; query/header/body values are never recorded. */
export function deniedRequest(method,rawUrl,headers,owner){
 const record={method:['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].includes(method)?method:'OTHER',kind:'external',path:'unclassified',queryPresent:false,ownerHeader:'absent',reason:'external-origin'};
 try{const url=new URL(rawUrl,origin);record.kind=url.origin===origin?'local-unapproved':'external';record.queryPresent=!!url.search;record.ownerHeader=headers['x-user-id']==null?'absent':headers['x-user-id']===owner.id?'matching':'different';
 if(url.origin===origin){record.reason=url.search?'query-present':method!=='GET'&&method!=='POST'?'method-not-admitted':url.pathname.startsWith('/api/')?(method==='GET'&&!reads.has(url.pathname)?'route-not-admitted':record.ownerHeader!=='matching'&&method==='GET'?'owner-header-mismatch':'api-request-not-admitted'):'asset-not-admitted';const known=new Set([...reads,'/api/auth/session','/api/v2/recipient-health']);for(const id of owner.recipientIds??[])if(/^brain-qual-[ab]-r[1-5]$/.test(id))for(const suffix of ['fresh-updates','next-question'])known.add('/api/v2/recipients/'+id+'/'+suffix);if(known.has(url.pathname))record.path=url.pathname;else if(url.pathname.startsWith('/api/'))record.path='unclassified-api';else record.path='unclassified-asset';}
 }catch{record.kind='invalid-url';record.reason='invalid-url';}return record;
}

export function questionRequestKind(path,owner){
 const group=owner.id==='brain-qual-owner-a'?'a':owner.id==='brain-qual-owner-b'?'b':null;if(!group)return null;
 if(path==='/api/v2/recipient-health')return 'health';
 for(const id of owner.recipientIds??[])if(new RegExp('^brain-qual-'+group+'-r[1-'+(group==='a'?5:2)+']$').test(id)){if(path==='/api/v2/recipients/'+id+'/fresh-updates')return 'fresh';if(path==='/api/v2/recipients/'+id+'/next-question')return 'question';}return null;
}
