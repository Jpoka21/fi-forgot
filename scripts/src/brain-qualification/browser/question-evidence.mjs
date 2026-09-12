import {questionRequestKind} from './policy.mjs';
const need=(v)=>{if(!v)throw Error('FAIL_CLOSED: question response evidence mismatch')};
export function questionResponse(path,body,owner){
 const kind=questionRequestKind(path,owner);need(kind!==null);need(body&&typeof body==='object');
 const recipientId=kind==='health'?null:path.split('/')[4];
 if(kind==='fresh'){need(Array.isArray(body.freshUpdates));for(const row of body.freshUpdates){need(row&&typeof row.id==='string'&&typeof row.questionKey==='string'&&typeof row.answerText==='string');if('recipientId'in row)need(row.recipientId===recipientId);if('userId'in row)need(row.userId===owner.id);}}
 if(kind==='health'){need(Array.isArray(body.scores));need(new Set(body.scores.map(r=>r.recipientId)).size===body.scores.length);for(const row of body.scores){need(owner.recipientIds.includes(row.recipientId)&&typeof row.name==='string'&&Number.isFinite(row.score));if('userId'in row)need(row.userId===owner.id);}}
 if(kind==='question'){need(typeof body.profileComplete==='boolean'&&Number.isFinite(body.profileScore));need(body.nextQuestion===null||body.nextQuestion&&typeof body.nextQuestion.fieldKey==='string'&&typeof body.nextQuestion.question==='string'&&typeof body.nextQuestion.mode==='string');if(body.nextQuestion){if('recipientId'in body.nextQuestion)need(body.nextQuestion.recipientId===recipientId);if('userId'in body.nextQuestion)need(body.nextQuestion.userId===owner.id);}}
 return {kind,recipientId};
}
export function questionProjection(captured,owner,recipients,insights){
 need(captured.length===3);const checked=captured.map(x=>questionResponse(x.record.path,x.body,owner));need(checked.map(x=>x.kind).join(',')==='fresh,question,health'&&checked[0].recipientId===checked[1].recipientId);
 need(Array.isArray(insights));const insight=insights.find(x=>x.recipientName);need(insight&&typeof insight.recipientName==='string');const selected=recipients.find(r=>r.name.trim().toLowerCase()===insight.recipientName.trim().toLowerCase())??recipients[0];need(selected&&selected.id===checked[0].recipientId);const recipient=recipients.find(r=>r.id===checked[0].recipientId);need(recipient&&typeof recipient.name==='string');need(captured[2].body.scores.some(row=>row.recipientId===recipient.id));for(const score of captured[2].body.scores){const known=recipients.find(r=>r.id===score.recipientId);need(known&&known.name===score.name);}
 return {recipientId:recipient.id,recipientName:recipient.name,responseRecords:captured.map(x=>x.record),nextQuestion:captured[1].body.nextQuestion,profileComplete:captured[1].body.profileComplete,profileScore:captured[1].body.profileScore,materializingGet:true};
}
