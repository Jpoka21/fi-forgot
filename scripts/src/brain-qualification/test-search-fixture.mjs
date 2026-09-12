import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {qualificationPersonalRecipients} from './fixture-config.ts';
const root=resolve(import.meta.dirname,'../../..');
const fixture=JSON.parse(readFileSync(resolve(root,'docs/brain-qualification-preparation/synthetic-fixtures.json'),'utf8'));
const require=createRequire(resolve(root,'artifacts/api-server/package.json'));
const {build}=require('esbuild');
// Execute the complete production index, dynamic builders, data reader, and notification
// index. Only browser storage is a synthetic in-memory boundary; no fetch or DB.
const built=await build({absWorkingDir:root,stdin:{contents:"export * from './artifacts/fi-forgot/src/app/search/searchEngine.ts';export {hydrateRecipientsFromServer,hydrateCardsFromServer,hydrateBriefingsFromServer,getBriefings} from './artifacts/fi-forgot/src/lib/data.ts';",resolveDir:root,sourcefile:'search-qualification-test.mjs'},bundle:true,platform:'node',format:'esm',target:'node24',write:false,alias:{'@':resolve(root,'artifacts/fi-forgot/src')},define:{'import.meta.env.DEV':'false'},logLevel:'silent'});
const store=new Map([['fi_forgot_data_version','5']]);
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear(),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
const {buildSearchIndex,runGlobalSearch,hydrateRecipientsFromServer,hydrateCardsFromServer,hydrateBriefingsFromServer,getBriefings}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
let checks=0;
for(const owner of fixture.owners){
 store.clear();store.set('fi_forgot_data_version','5');
 const payload=qualificationPersonalRecipients(fixture,offset=>new Date(Date.UTC(2031,3,5+offset)).toISOString().slice(0,10)).filter(r=>r.userId===owner.id).map(r=>r.data);
 const oldPayload=payload.map(({customDates,selectedEvents,favoriteMemories,insideJokes,...old})=>old);
 store.set('fi_forgot_recipients',JSON.stringify(oldPayload));assert.throws(()=>buildSearchIndex(),TypeError);checks++;
 const requests=[];const answers=fixture.questionAnswers.filter(r=>r.userId===owner.id).map(r=>({...r,createdAt:fixture.clock}));
 // This mocked HTTP boundary supplies fixture-only timestamps; it is not live evidence.
 globalThis.fetch=async(url,options)=>{assert.equal(options.headers['x-user-id'],owner.id);assert.ok(!options.method||options.method==='GET');requests.push(url);const bodies={'/api/recipients':{recipients:payload},'/api/personal/cards':{cards:[]},'/api/personal/briefings':{answers}};assert.ok(url in bodies);return {ok:true,json:async()=>bodies[url]};};
 store.delete('fi_forgot_recipients');await hydrateRecipientsFromServer(owner.id);await hydrateCardsFromServer(owner.id);await hydrateBriefingsFromServer(owner.id);
 assert.deepEqual(requests,['/api/recipients','/api/personal/cards','/api/personal/briefings']);assert.equal(getBriefings().flatMap(b=>b.answers).length,answers.length);
 const index=buildSearchIndex(),matches=runGlobalSearch('Concierge');
 assert.equal(index.filter(r=>r.id==='nav-concierge').length,1);
 assert.equal(matches[0].id,'nav-concierge');assert.equal(matches[0].href,'/concierge');assert.equal(matches[0].label,'Concierge');
 assert.deepEqual(index.filter(r=>r.id.startsWith('recipient-')).map(r=>r.id),owner.recipientIds.map(id=>'recipient-'+id));checks+=5;
 assert.equal(runGlobalSearch('Concierge',{filter:'concierge'}).some(r=>r.id==='nav-concierge'),true);checks++;
 for(const data of payload){const source=fixture.recipients.find(r=>r.id===data.id);assert.equal(data.anniversaryDate,source.anniversary);assert.equal(data.relationship,source.relationshipType);if(source.birthday===null)assert.equal(data.birthday,null);assert.deepEqual(data.customDates,[]);assert.deepEqual(data.selectedEvents,[]);assert.equal(data.favoriteMemories,'');assert.equal(data.insideJokes,'');}
}
for(const personalRecipientDefaults of [undefined,{...fixture.personalRecipientDefaults,customDates:[{date:'2031-01-01'}]},{...fixture.personalRecipientDefaults,selectedEvents:['birthday']},{...fixture.personalRecipientDefaults,favoriteMemories:'invented'},{...fixture.personalRecipientDefaults,insideJokes:'invented'},{...fixture.personalRecipientDefaults,extra:''}]){assert.throws(()=>qualificationPersonalRecipients({...fixture,personalRecipientDefaults},()=>''),/defaults mismatch/);checks++;}
console.log(`production search fixture DTO: PASS ${checks} checks plus per-recipient fact preservation (actual full index, no browser/network/database)`);
