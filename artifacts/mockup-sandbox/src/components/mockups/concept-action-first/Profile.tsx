import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF";

const actions=[
  {id:1,label:"Send birthday card",due:"Jun 14 · 3 days",urgency:"critical",done:false},
  {id:2,label:"Log guitar lesson update",due:"Overdue 9 days",urgency:"memory",done:false},
  {id:3,label:"Christmas card",due:"Dec 25 · 197 days",urgency:"upcoming",done:false},
];
const memories=[
  {date:"Jun 7, 2026", text:"Started guitar lessons — working on chord progressions in his garage."},
  {date:"Apr 22, 2026",text:"Trail running obsession has gotten serious — running 4x/week."},
  {date:"Feb 14, 2026",text:"Wife Amy's birthday is March 3rd. Got her jewelry this year."},
  {date:"Dec 30, 2025",text:"New Year's plans: cabin trip with college friends."},
];
const cardHistory=[
  {ev:"Birthday",date:"Jul 5, 2025",status:"delivered",msg:"Happy Birthday — still on his fridge apparently."},
  {ev:"Christmas",date:"Dec 25, 2024",status:"delivered",msg:"Merry Christmas, stay out of trouble."},
  {ev:"Birthday",date:"Jul 5, 2024",status:"delivered",msg:"Another year wiser. Drinks soon."},
];

const urgencyColor=(u:string)=>u==="critical"?RED:u==="memory"?"#3B82F6":SAGE;
const urgencyLabel=(u:string)=>u==="critical"?"🔴 Critical":u==="memory"?"🔵 Memory":"🟢 Upcoming";

export default function Profile(){
  const [doneIds,setDoneIds]=useState<number[]>([]);
  const [tab,setTab]=useState<"context"|"cards">("context");
  const toggle=(id:number)=>setDoneIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* NAV */}
      <div style={{background:BLACK,padding:"13px 32px",display:"flex",alignItems:"center",gap:12}}>
        <button style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"0.82rem",padding:0}}>← Dashboard</button>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
      </div>

      {/* PERSON HEADER */}
      <div style={{background:WHITE,borderBottom:`1px solid ${BORDER}`,padding:"22px 32px 18px"}}>
        <div style={{maxWidth:860,margin:"0 auto",display:"flex",alignItems:"center",gap:18}}>
          <div style={{width:56,height:56,borderRadius:14,background:"#DBEAFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem"}}>👦</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"baseline",gap:10}}>
              <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.1rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>MARCUS</h1>
              <span style={{background:"#DBEAFE",color:"#1E40AF",borderRadius:20,padding:"3px 11px",fontSize:"0.71rem",fontWeight:700}}>FRIEND</span>
            </div>
            <p style={{color:GRAY,fontSize:"0.78rem",margin:"4px 0 0"}}>Friend since 2018 · 8 cards sent · Health <strong style={{color:SAGE}}>92%</strong></p>
          </div>
          <div style={{display:"flex",gap:7}}>
            <button style={{background:RED,color:WHITE,border:"none",borderRadius:9,padding:"9px 16px",fontWeight:700,fontSize:"0.8rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>✉️ Send Card</button>
            <button style={{background:WHITE,color:BLACK,border:`1px solid ${BORDER}`,borderRadius:9,padding:"9px 14px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>📝 Log</button>
          </div>
        </div>
      </div>

      <div style={{padding:"20px 32px",maxWidth:860,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {/* LEFT: ACTION QUEUE */}
        <div>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.2rem",letterSpacing:"0.08em",margin:"0 0 12px",display:"flex",alignItems:"center",gap:8}}>
            ACTION QUEUE
            <span style={{background:RED,color:WHITE,borderRadius:20,padding:"2px 8px",fontSize:"0.66rem",letterSpacing:0,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700}}>{actions.length-doneIds.length}</span>
          </h2>
          <div style={{display:"flex",flexDirection:"column" as const,gap:8,marginBottom:18}}>
            {actions.map((a,i)=>(
              <div key={a.id} style={{background:i===0&&!doneIds.includes(a.id)?BLACK:WHITE,border:`2px solid ${i===0&&!doneIds.includes(a.id)?BLACK:BORDER}`,borderRadius:12,padding:"13px 15px",opacity:doneIds.includes(a.id)?0.4:1,transition:"all 0.12s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={()=>toggle(a.id)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${doneIds.includes(a.id)?SAGE:i===0?"#555":BORDER}`,background:doneIds.includes(a.id)?SAGE:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"inherit"}}>
                    {doneIds.includes(a.id)&&<span style={{color:WHITE,fontSize:"0.68rem"}}>✓</span>}
                  </button>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:"0.86rem",margin:0,color:i===0&&!doneIds.includes(a.id)?WHITE:BLACK,textDecoration:doneIds.includes(a.id)?"line-through":"none"}}>{a.label}</p>
                    <p style={{fontSize:"0.7rem",color:i===0&&!doneIds.includes(a.id)?"#aaa":GRAY,margin:"2px 0 0"}}>{a.due}</p>
                  </div>
                  <span style={{fontSize:"0.67rem"}}>{urgencyLabel(a.urgency)}</span>
                </div>
                {i===0&&!doneIds.includes(a.id)&&(
                  <button style={{marginTop:10,width:"100%",background:RED,color:WHITE,border:"none",borderRadius:9,padding:"10px",fontWeight:700,fontSize:"0.84rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Send Birthday Card →</button>
                )}
              </div>
            ))}
          </div>

          {/* Quick facts */}
          <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:12,padding:"14px 16px"}}>
            <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1rem",letterSpacing:"0.07em",margin:"0 0 11px"}}>QUICK FACTS</h3>
            {[{l:"Relationship",v:"Friend since 2018"},{l:"Birthday",v:"June 14"},{l:"Loves",v:"Trail running, guitar"},{l:"Lives in",v:"Denver, CO"},{l:"Cards sent",v:"8 total"}].map((f,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<4?`1px solid ${BORDER}`:"none"}}>
                <span style={{fontSize:"0.76rem",color:GRAY}}>{f.l}</span>
                <span style={{fontSize:"0.76rem",fontWeight:600,color:BLACK}}>{f.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: CONTEXT */}
        <div>
          <div style={{display:"flex",gap:2,marginBottom:14,background:WHITE,border:`1px solid ${BORDER}`,borderRadius:9,padding:3,width:"fit-content" as const}}>
            {(["context","cards"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 16px",borderRadius:6,border:"none",background:tab===t?BLACK:"transparent",color:tab===t?WHITE:GRAY,fontWeight:tab===t?700:400,fontSize:"0.76rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",textTransform:"capitalize" as const}}>{t==="context"?"Memories":"Card History"}</button>
            ))}
          </div>

          {tab==="context"&&(
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {memories.map((m,i)=>(
                <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"11px 14px"}}>
                  <p style={{fontSize:"0.67rem",color:GRAY,margin:"0 0 5px"}}>{m.date}</p>
                  <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.05rem",color:BLACK,margin:0,lineHeight:1.4}}>{m.text}</p>
                </div>
              ))}
              <button style={{background:"none",border:`2px dashed ${BORDER}`,borderRadius:10,padding:"10px",fontSize:"0.77rem",color:GRAY,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>+ Log something</button>
            </div>
          )}

          {tab==="cards"&&(
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {cardHistory.map((c,i)=>(
                <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"11px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <span style={{fontSize:"1rem"}}>💌</span>
                    <p style={{fontWeight:700,fontSize:"0.82rem",margin:0}}>{c.ev}</p>
                    <span style={{marginLeft:"auto",fontSize:"0.67rem",color:GRAY}}>{c.date}</span>
                  </div>
                  <p style={{fontFamily:"'Caveat',cursive",fontSize:"1rem",color:BLACK,margin:0}}>{c.msg}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
