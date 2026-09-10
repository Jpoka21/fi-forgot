/** Controlled PostgreSQL protocol fixture for the REAL Drizzle adapter.
 * It implements relational query operations, not understanding-domain rules. */
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@workspace/db/schema';
type Row=Record<string,unknown>;
export class UnderstandingPgFixture {
 tables:Record<string,Row[]>={}; queries:Array<{text:string;params:unknown[]}>=[];
 failOn:RegExp|null=null; private snapshots:Record<string,Row[]>[]=[];
 readonly db=drizzle(this as never,{schema});
 seed(table:string,rows:Row[]){this.tables[table]=structuredClone(rows);}
 private matches(row:Row,where:string,params:unknown[]) {
  const column='(?:"[^"]+"\\.)?"([^"]+)"';
  for(const match of where.matchAll(new RegExp(column+'\\s*=\\s*\\$(\\d+)','g'))) if(row[match[1]]!==params[Number(match[2])-1])return false;
  for(const match of where.matchAll(new RegExp(column+'\\s+is (not )?null','g'))) if(match[2]?(row[match[1]]==null):(row[match[1]]!=null))return false;
  for(const match of where.matchAll(new RegExp(column+'\\s+in \\(([^)]+)\\)','g'))) {
   const allowed=[...match[2].matchAll(/\$(\d+)/g)].map(m=>params[Number(m[1])-1]);if(!allowed.includes(row[match[1]]))return false;
  }
  for(const match of where.matchAll(new RegExp(column+'\\s*<>\\s*\\$(\\d+)','g'))) if(row[match[1]]===params[Number(match[2])-1])return false;
  return true;
 }
 async query(config:string|{text:string;rowMode?:string},params:unknown[]=[]):Promise<{rows:unknown[];rowCount:number}> {
  const text=typeof config==='string'?config:config.text;this.queries.push({text,params:structuredClone(params)});
  if(this.failOn?.test(text)){this.failOn=null;throw new Error('injected database write failure');}
  if(/^(begin|savepoint)/i.test(text)){this.snapshots.push(structuredClone(this.tables));return{rows:[],rowCount:0};}
  if(/^rollback/i.test(text)){this.tables=this.snapshots.pop()!;return{rows:[],rowCount:0};}
  if(/^(commit|release savepoint)/i.test(text)){this.snapshots.pop();return{rows:[],rowCount:0};}
  if(text.includes('pg_advisory_xact_lock'))return{rows:[],rowCount:1};
  const found=text.match(/^(?:select[\s\S]+?from|insert into|update) "([^"]+)"/i);
  if(!found)throw new Error(`Unimplemented fixture SQL: ${text}`);
  const table=found[1],rows=this.tables[table]??(this.tables[table]=[]);let selected:Row[]=[];let fields='';
  if(/^select/i.test(text)) {
   const where=text.split(/\bwhere\b/i)[1]?.split(/\border by\b|\blimit\b/i)[0]??'';
   selected=rows.filter(row=>this.matches(row,where,params));
   const order=text.match(/order by (?:"[^"]+"\.)?"([^"]+)"( desc)?/i);
   if(order)selected=[...selected].sort((a,b)=>(a[order[1]]!<b[order[1]]!?-1:a[order[1]]!>b[order[1]]!?1:0)*(order[2]?-1:1));
   const limit=text.match(/limit \$(\d+)/i);if(limit)selected=selected.slice(0,Number(params[Number(limit[1])-1]));
   fields=text.slice(7,text.indexOf(' from '));
  } else if(/^insert/i.test(text)) {
   const match=text.match(/^insert into "[^"]+" \(([^)]+)\) values ([\s\S]+?)(?: returning | on conflict |$)/i)!;
   if(!match)throw new Error(`Unimplemented insert: ${text}`);
   const columns=[...match[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
   for(const tuple of match[2].matchAll(/\(([^)]+)\)/g)) {
    const values=tuple[1].split(',').map(v=>v.trim());const row:Row={};
    columns.forEach((column,index)=>{const token=values[index];const arg=token.match(/^\$(\d+)/);row[column]=arg?params[Number(arg[1])-1]:column==='created_at'||column==='recorded_at'||column==='updated_at'||column==='acted_at'?new Date().toISOString():column==='revision'?1:column==='lifecycle_state'?'active':column==='uncertainty_acknowledged'?true:column==='was_skipped'?false:null;});
    // pg decodes JSONB while the Drizzle encoder sends JSON text.
    if(typeof row.source_provenance==='string')row.source_provenance=JSON.parse(row.source_provenance);
    rows.push(row);selected.push(row);
   }
   fields=text.split(' returning ')[1]??'';
  } else {
   const where=text.split(' where ')[1]?.split(' returning ')[0]??'';
   selected=rows.filter(row=>this.matches(row,where,params));
   const changes=text.split(' set ')[1].split(' where ')[0];
   for(const match of changes.matchAll(/"([^"]+)"\s*=\s*\$(\d+)/g))for(const row of selected)row[match[1]]=params[Number(match[2])-1];
   fields=text.split(' returning ')[1]??'';
  }
  const columns=[...fields.matchAll(/(?:"[^"]+"\.)?"([^"]+)"/g)].map(m=>m[1]);
  const projected=selected.map(row=>columns.map(column=>row[column]??null));
  return{rows:typeof config==='object'&&config.rowMode==='array'?projected:selected,rowCount:selected.length};
 }
}
