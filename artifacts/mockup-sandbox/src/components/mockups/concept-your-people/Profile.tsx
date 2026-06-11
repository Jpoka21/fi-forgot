import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",AMBER="#D97706";

function HealthBar({label,val,color}:{label:string,val:number,color:string}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:"0.78rem",color:BLACK,fontWeight:500}}>{label}</span>
        <span style={{fontSize:"0.78rem",fontWeight:700,color}}>{val}%</span>
      </div>
      <div style={{height:8,borderRadius:4,background:BORDER,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${val}%`,background:color,borderRadius:4,transition:"width 0.3s"}}/>
      </div>
    </div>
  );
}

const cardHistory=[
  {ev:"Birthday",date:"Mar 12, 2026",msg:"'Happy birthday, sis. Can't believe you're 32. Love you tons.'",tone:"Warm"},
  {ev:"Christmas",date:"Dec 25, 2025",msg:"'Merry Christmas! Wishing you and the family the best year yet.'",tone:"Festive"},
  {ev:"Anniversary",date:"Jun 28, 2025",msg:"'Happy anniversary to you and Tom. 6 years — you two are the best.'",tone:"Heartfelt"},
  {ev:"Birthday",date:"Mar 12, 2025",msg:"'31 and thriving. So proud of everything you've done this year.'",tone:"Warm"},
];
const actions=[
  {label:"Send a Card",icon:"✉️",bg:RED,color:WHITE},
  {label:"Log Moment",icon:"📝",bg:WHITE,color:BLACK},
  {label:"Ask AI",icon:"✨",bg:WHITE,color:BLACK},
];
const memories=[
  "Started a new job at Fidelity in Jan 2026",
  "Husband Tom coaches little league",
  "Two dogs: Biscuit and Pepper",
  "Lives in Austin, TX — moved from Boston",
  "Runs a half marathon every spring",
];

export default function Profile(){
  const [tab,setTab]=useState<"health"|"cards"|"notes">("health");
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* NAV */}
      <div style={{background:BLACK,padding:"13px 32px",display:"flex",alignItems:"center",gap:12}}>
        <button style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"0.82rem",padding:0}}>← Your People</button>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
      </div>

      {/* PERSON HEADER */}
      <div style={{background:WHITE,borderBottom:`1px solid ${BORDER}`,padding:"26px 32px 22px"}}>
        <div style={{maxWidth:860,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:20}}>
            <div style={{width:68,height:68,borderRadius:16,background:"#EDF5F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.1rem"}}>👧</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
                <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.3rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>SARAH</h1>
                <span style={{background:"#EDF5F0",color:SAGE,borderRadius:20,padding:"3px 12px",fontSize:"0.73rem",fontWeight:700}}>SISTER</span>
              </div>
              <p style={{color:GRAY,fontSize:"0.8rem",margin:"0 0 12px"}}>Friend since birth · 7 cards sent · Last card Mar 2026</p>
              <div style={{display:"flex",gap:8}}>
                {actions.map((a,i)=>(
                  <button key={i} style={{background:a.bg,color:a.color,border:`1px solid ${a.bg===WHITE?BORDER:a.bg}`,borderRadius:9,padding:"8px 16px",fontWeight:700,fontSize:"0.8rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>
                    <span>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Health ring */}
            <div style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:14,padding:"16px 18px",textAlign:"center" as const}}>
              <div style={{position:"relative" as const,width:72,height:72,margin:"0 auto 8px"}}>
                <svg width={72} height={72} style={{transform:"rotate(-90deg)"}}>
                  <circle cx={36} cy={36} r={28} fill="none" stroke={BORDER} strokeWidth={6}/>
                  <circle cx={36} cy={36} r={28} fill="none" stroke={SAGE} strokeWidth={6} strokeDasharray={`${2*Math.PI*28*0.78} ${2*Math.PI*28}`} strokeLinecap="round"/>
                </svg>
                <div style={{position:"absolute" as const,inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" as const}}>
                  <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.4rem",color:BLACK,lineHeight:1}}>78</span>
                  <span style={{fontSize:"0.55rem",color:GRAY,textTransform:"uppercase" as const}}>%</span>
                </div>
              </div>
              <p style={{fontSize:"0.68rem",color:GRAY,margin:0,textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>Health<br/>Score</p>
            </div>
          </div>
          {/* Next moment */}
          <div style={{marginTop:16,background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:"1.1rem"}}>📅</span>
              <div>
                <p style={{fontWeight:700,fontSize:"0.82rem",margin:0}}>Anniversary coming up</p>
                <p style={{fontSize:"0.72rem",color:GRAY,margin:"1px 0 0"}}>June 28 · 17 days away</p>
              </div>
            </div>
            <button style={{background:RED,color:WHITE,border:"none",borderRadius:8,padding:"7px 16px",fontWeight:700,fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Send Card</button>
          </div>
        </div>
      </div>

      <div style={{padding:"22px 32px",maxWidth:860,margin:"0 auto"}}>
        {/* TABS */}
        <div style={{display:"flex",gap:2,marginBottom:20,background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:3,width:"fit-content" as const}}>
          {(["health","cards","notes"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 18px",borderRadius:7,border:"none",background:tab===t?BLACK:"transparent",color:tab===t?WHITE:GRAY,fontWeight:tab===t?700:400,fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",textTransform:"capitalize" as const}}>{t==="health"?"Health Score":t==="cards"?"Card History":"Notes"}</button>
          ))}
        </div>

        {tab==="health"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
            <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"20px 22px"}}>
              <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.1rem",letterSpacing:"0.07em",margin:"0 0 16px"}}>HEALTH BREAKDOWN</h3>
              <HealthBar label="Recency (last contact)" val={72} color={AMBER}/>
              <HealthBar label="Consistency (monthly)" val={80} color={SAGE}/>
              <HealthBar label="Effort (personalization)" val={85} color={SAGE}/>
              <HealthBar label="Coverage (all occasions)" val={70} color={AMBER}/>
              <div style={{marginTop:12,background:BG,borderRadius:8,padding:"10px 12px"}}>
                <p style={{fontSize:"0.75rem",color:GRAY,margin:0}}>💡 <strong>Tip:</strong> It's been 3 months since your last contact with Sarah. A card soon would lift her score.</p>
              </div>
            </div>
            <div>
              <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"18px 20px",marginBottom:14}}>
                <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.1rem",letterSpacing:"0.07em",margin:"0 0 14px"}}>STATS</h3>
                {[{l:"Cards sent",v:"7 total"},{l:"This year",v:"2 cards"},{l:"Streak",v:"4 months"},{l:"Avg cadence",v:"Every 2 mo"}].map((s,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?`1px solid ${BORDER}`:"none"}}>
                    <span style={{fontSize:"0.78rem",color:GRAY}}>{s.l}</span>
                    <span style={{fontSize:"0.78rem",fontWeight:700,color:BLACK}}>{s.v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"18px 20px"}}>
                <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.1rem",letterSpacing:"0.07em",margin:"0 0 12px"}}>OCCASIONS COVERED</h3>
                {[{ev:"Birthday ✓",ok:true},{ev:"Anniversary ✓",ok:true},{ev:"Christmas ✓",ok:true},{ev:"Mother's Day",ok:false},{ev:"Valentine's",ok:false}].map((ev,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:ev.ok?SAGE:BORDER,flexShrink:0}}/>
                    <span style={{fontSize:"0.78rem",color:ev.ok?BLACK:GRAY}}>{ev.ev}</span>
                    {!ev.ok&&<span style={{fontSize:"0.67rem",color:AMBER,marginLeft:"auto"}}>+ Add</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==="cards"&&(
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {cardHistory.map((c,i)=>(
              <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:12,padding:"14px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <span style={{fontSize:"1.1rem"}}>💌</span>
                  <p style={{fontWeight:700,fontSize:"0.86rem",margin:0}}>{c.ev}</p>
                  <span style={{marginLeft:"auto",fontSize:"0.72rem",color:GRAY}}>{c.date}</span>
                  <span style={{background:"#EDF5F0",color:SAGE,borderRadius:20,padding:"2px 8px",fontSize:"0.67rem",fontWeight:600}}>{c.tone}</span>
                </div>
                <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.05rem",color:BLACK,margin:0,paddingLeft:8,borderLeft:`3px solid ${BORDER}`}}>{c.msg}</p>
              </div>
            ))}
          </div>
        )}

        {tab==="notes"&&(
          <div>
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {memories.map((m,i)=>(
                <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 16px",display:"flex",gap:10}}>
                  <span style={{fontSize:"0.9rem",marginTop:2}}>📝</span>
                  <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.1rem",margin:0,lineHeight:1.4}}>{m}</p>
                </div>
              ))}
            </div>
            <button style={{marginTop:12,width:"100%",background:"none",border:`2px dashed ${BORDER}`,borderRadius:10,padding:"11px",fontSize:"0.78rem",color:GRAY,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>+ Log something new about Sarah</button>
          </div>
        )}
      </div>
    </div>
  );
}
