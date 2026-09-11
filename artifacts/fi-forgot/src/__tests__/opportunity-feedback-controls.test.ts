import { readFileSync } from "node:fs";
import { currentOpportunityFeedback } from "../app/concierge-brain/currentOpportunityFeedback.js";
import { mutateOpportunityFeedback } from "../app/concierge-brain/mutateOpportunityFeedback.js";

const event = { id: "set", lineageId: "lineage", version: 1, action: "set", active: true } as any;
if (currentOpportunityFeedback([event, { ...event, id: "withdraw", version: 2, action: "withdraw", active: false }]).length !== 0) throw new Error("withdrawn history rendered active");
if (currentOpportunityFeedback([event, { ...event, id: "new", version: 2 }])[0]?.id !== "new") throw new Error("superseded history rendered active");

let request: { path: string; init?: RequestInit } | undefined;
globalThis.fetch = (async (path: string | URL | Request, init?: RequestInit) => { request = { path: String(path), init }; return new Response(JSON.stringify({ feedback: event }), { status: 201, headers: { "Content-Type": "application/json" } }); }) as typeof fetch;
await mutateOpportunityFeedback({ recipientId: "recipient", feedbackEventId: "historic", expectedVersion: 1, idempotencyKey: "stable-key", withdraw: true });
if (request?.path !== "/api/v2/concierge/opportunity-feedback" || request.init?.method !== "POST" || !String(request.init?.body).includes('"feedbackEventId":"historic"')) throw new Error("real historical withdrawal transport was not invoked");

const panel = readFileSync(new URL("../app/components/ai-concierge/FiConciergeWorkspacePanel.tsx", import.meta.url), "utf8");
const hook = readFileSync(new URL("../app/ai-concierge/hooks/useAiConciergeWorkspace.ts", import.meta.url), "utf8");
for (const label of ["Helpful", "Not helpful", "Not now", "Too early", "Too late", "Already handled", "Do not remind", "More often", "Less often", "Withdraw"]) if (!panel.includes(label)) throw new Error(`missing control ${label}`);
if (!panel.includes("<select") || !panel.includes("your preference") || !panel.includes("Retained Opportunity")) throw new Error("modest control or retained state missing");
if (!hook.includes("retryKeysRef") || hook.includes("Nothing changed") || !hook.includes("Save status is uncertain")) throw new Error("stable retry or truthful uncertainty missing");
console.log("opportunity feedback transport, reducer, and control wiring passed");

const {reserveFeedbackRequest, settleFeedbackRequest} = await import('../app/concierge-brain/feedbackRequestRetry.js');
const pending = new Map();
const firstIntent = {recipientId:'recipient',feedbackEventId:'historic',withdraw:true,expectedVersion:1};
const firstRequest = reserveFeedbackRequest(pending, firstIntent, ()=>'request-stable');
globalThis.fetch = (async () => {throw new Error('response lost after possible commit');}) as typeof fetch;
let uncertain=false;
try {await mutateOpportunityFeedback(firstRequest);} catch {uncertain=true;}
if (!uncertain) throw Error('Transport loss falsely reported success');
// A reload can reveal a newer version before the user retries: preserve the original request.
const retriedRequest = reserveFeedbackRequest(pending, {...firstIntent,expectedVersion:2}, ()=>'must-not-be-used');
if (JSON.stringify(retriedRequest)!==JSON.stringify(firstRequest)) throw Error('Reload changed retry key or expected version');
globalThis.fetch = (async (_path:unknown, init?:RequestInit) => {if(JSON.stringify(JSON.parse(String(init?.body)))!==JSON.stringify(firstRequest))throw Error('Retried transport changed payload');return new Response(JSON.stringify({feedback:event}),{status:201,headers:{'Content-Type':'application/json'}});}) as typeof fetch;
await mutateOpportunityFeedback(retriedRequest);
settleFeedbackRequest(pending,retriedRequest);
if(pending.size)throw Error('Successful request remained pending');
const nextRequest=reserveFeedbackRequest(pending,{...firstIntent,expectedVersion:2},()=> 'next-request');
if(nextRequest.idempotencyKey==='request-stable'||nextRequest.expectedVersion!==2)throw Error('New intent reused completed request');
console.log('Actual mutation transport preserves uncertain retry payload across reload and settles only on success.');

// The repository tsx runner preserves classic JSX; expose the installed React runtime for SSR.
const reactRuntime = await import('react');
Object.assign(globalThis, {React:reactRuntime});
const {createElement} = reactRuntime;
const {renderToStaticMarkup} = await import('react-dom/server');
const {FiConciergeWorkspacePanel} = await import('../app/components/ai-concierge/FiConciergeWorkspacePanel.js');
const savedEvent={...event,recipientId:'recipient',opportunityId:'gone:birthday',type:'not_now',scope:'occurrence'};
const workspaceForRender={opportunities:[],recommendations:[],insights:[],memories:[],suggestedConversations:[],defaults:{recommendationsTitle:'Suggestions',insightsTitle:'Insights',memoryTitle:'Memories'},aiDefaults:{emptyDescription:'Nothing to show'},feedbackHistory:[savedEvent],feedbackPending:null,feedbackStatus:null,submitFeedback:async()=>undefined};
const savedMarkup=renderToStaticMarkup(createElement(FiConciergeWorkspacePanel,{workspace:workspaceForRender as never,onPromptSelect:()=>undefined}));
if(!savedMarkup.includes('Withdraw') || !savedMarkup.includes('Retained Opportunity'))throw Error('Actual page omits withdrawal when Opportunity is absent');
const withdrawnMarkup=renderToStaticMarkup(createElement(FiConciergeWorkspacePanel,{workspace:{...workspaceForRender,feedbackHistory:[savedEvent,{...savedEvent,id:'withdrawn',version:2,action:'withdraw',active:false}]} as never,onPromptSelect:()=>undefined}));
if(withdrawnMarkup.includes('>Withdraw<'))throw Error('Actual page still presents superseded feedback as active');
const pendingMarkup=renderToStaticMarkup(createElement(FiConciergeWorkspacePanel,{workspace:{...workspaceForRender,feedbackPending:'historic:not_now',feedbackStatus:'Withdrawing feedback…'} as never,onPromptSelect:()=>undefined}));
if(!pendingMarkup.includes('Withdrawing feedback') || !pendingMarkup.includes('disabled'))throw Error('Actual page omits understandable visible pending state');
console.log('Actual Concierge panel renders historical withdrawal without an Opportunity and hides withdrawn active controls.');

