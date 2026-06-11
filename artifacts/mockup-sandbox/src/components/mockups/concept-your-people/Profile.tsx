import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const healthBreakdown=[
  {label:"Recency",desc:"Last card 2 months ago",score:90,good:true},
  {label:"Consistency",desc:"Never missed her birthday",score:98,good:true},
  {label:"Effort",desc:"Personalized notes on every card",score:95,good:true},
  {label:"Coverage",desc:"4 events per year covered",score:88,good:true},
];

const cardHistory=[
  {event:"Anniversary",date:"Apr 3, 2025",tone:"Romantic",msg:"Four years and I'd choose you every time. Happy anniversary, sis — you two are everything."},
  {event:"Birthday",date:"Feb 14, 2025",tone:"Funny",msg:"You're officially closer to 30 than to 20. On behalf of me, I'm so sorry. Happy birthday!"},
  {event:"Christmas",date:"Dec 22, 2024",tone:"Sweet",msg:"Being your brother is the gift I didn't know I needed. Merry Christmas. Love you."},
];

const nextMoments=[
  {event:"Anniversary",date:"Jun 19",days:8,status:"On track"},
  {event:"Birthday",date:"Feb 14, 2026",days:248,status:"On track"},
];

function Ring({score,color,size=70}:{score:number,color:string,size?:number}){
  const r=(size-10)/2,cx=size/2,cy=size/2;
  const c=Math.PI*2*r,fill=c*(score/100);
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}20`} strokeWidth={6}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${fill} ${c-fill}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}/>
      <text x={cx} y={cy+5} textAnchor="middle" fontFamily="'Bebas Neue',cursive" fontSize={16} fill={color}>{score}</text>
    </svg>
  );
}

export function Profile() {
  const [tab,setTab]=useState<"health"|"cards"|"moments">("health");
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      <div style={{background:BLACK,height:54,display:"flex",alignItems:"center",gap:14,padding:"0 22px"}}>
        <button style={{background:"none",border:"none",color:"#ffffff80",fontSize:"1.1rem",cursor:"pointer",padding:0}}>←</button>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.35rem",color:RED,letterSpacing:"0.06em"}}>F.I. FORGOT</span>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"28px 22px 48px"}}>

        {/* Person header */}
        <div style={{background:WHITE,borderRadius:18,padding:"24px 26px",border:`1px solid ${BORDER}`,marginBottom:18,display:"flex",gap:20,alignItems:"center"}}>
          <div style={{width:64,height:64,borderRadius:16,background:`${SAGE}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",border:`2px solid ${SAGE}25`}}>👩</div>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.9rem",letterSpacing:"0.03em",color:BLACK,margin:0,lineHeight:1}}>Sarah</h1>
            <div style={{fontSize:"0.86rem",color:GRAY,marginTop:3}}>Sister · 4 events per year</div>
            <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap" as const}}>
              <span style={{fontSize:"0.74rem",fontWeight:600,padding:"3px 10px",borderRadius:99,background:`${SAGE}15`,color:SAGE}}>💍 Anniversary Jun 19</span>
              <span style={{fontSize:"0.74rem",fontWeight:600,padding:"3px 10px",borderRadius:99,background:`${BLACK}08`,color:GRAY}}>🎂 Birthday Feb 14</span>
              <span style={{fontSize:"0.74rem",fontWeight:600,padding:"3px 10px",borderRadius:99,background:`${BLACK}08`,color:GRAY}}>🎄 Christmas</span>
            </div>
          </div>
          <div style={{textAlign:"center" as const}}>
            <Ring score={94} color={SAGE}/>
            <div style={{fontSize:"0.72rem",fontWeight:700,color:SAGE,marginTop:2,letterSpacing:"0.04em"}}>GREAT</div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {[{icon:"💌",label:"Send Card",primary:true},{icon:"📝",label:"Log Moment",primary:false},{icon:"❓",label:"Ask Question",primary:false}].map((a,i)=>(
            <button key={i} style={{
              flex:1,padding:"10px 8px",borderRadius:10,
              background:a.primary?RED:"transparent",
              border:`1.5px solid ${a.primary?RED:`${BLACK}18`}`,
              color:a.primary?WHITE:BLACK,
              fontWeight:700,fontSize:"0.82rem",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
            }}><span>{a.icon}</span><span>{a.label}</span></button>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:16,background:WHITE,borderRadius:10,padding:4,border:`1px solid ${BORDER}`}}>
          {(["health","cards","moments"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",
              fontWeight:700,fontSize:"0.8rem",letterSpacing:"0.04em",
              background:tab===t?BLACK:"transparent",
              color:tab===t?WHITE:GRAY,transition:"all 0.15s",
            }}>
              {t==="health"?"Health Score":t==="cards"?"Card History":"Moments"}
            </button>
          ))}
        </div>

        {tab==="health" && (
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            <div style={{background:WHITE,borderRadius:14,padding:"18px 20px",border:`1px solid ${BORDER}`,marginBottom:4}}>
              <div style={{fontFamily:"'Caveat',cursive",fontSize:"1.05rem",color:GRAY,marginBottom:8}}>Overall relationship health</div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <Ring score={94} color={SAGE} size={80}/>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.6rem",color:SAGE,letterSpacing:"0.04em"}}>Excellent</div>
                  <div style={{fontSize:"0.82rem",color:GRAY,maxWidth:280,lineHeight:1.55}}>Sarah is one of your strongest relationships. Cards are consistent, timely, and personal.</div>
                </div>
              </div>
            </div>
            {healthBreakdown.map((h,i)=>(
              <div key={i} style={{background:WHITE,borderRadius:12,padding:"14px 18px",border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:h.good?SAGE:RED,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"0.9rem"}}>{h.label}</div>
                  <div style={{fontSize:"0.78rem",color:GRAY,marginTop:2}}>{h.desc}</div>
                </div>
                <div style={{textAlign:"right" as const}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.1rem",color:h.good?SAGE:RED}}>{h.score}</div>
                  <div style={{fontSize:"0.62rem",color:GRAY,letterSpacing:"0.04em"}}>/ 100</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="cards" && (
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {cardHistory.map((c,i)=>(
              <div key={i} style={{background:WHITE,borderRadius:13,padding:"18px 20px",border:`1px solid ${BORDER}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontWeight:700,fontSize:"0.95rem"}}>{c.event} <span style={{fontWeight:400,color:GRAY,fontSize:"0.82rem"}}>— {c.date}</span></span>
                  <span style={{fontSize:"0.72rem",fontWeight:600,padding:"2px 8px",borderRadius:99,background:`${SAGE}15`,color:SAGE}}>{c.tone}</span>
                </div>
                <div style={{fontFamily:"'Caveat',cursive",fontSize:"1.05rem",color:BLACK,lineHeight:1.6,background:CREAM,borderRadius:8,padding:"10px 14px"}}>"{c.msg}"</div>
              </div>
            ))}
          </div>
        )}

        {tab==="moments" && (
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {nextMoments.map((m,i)=>(
              <div key={i} style={{background:WHITE,borderRadius:13,padding:"14px 18px",border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:14}}>
                <div style={{minWidth:48,textAlign:"center" as const,background:CREAM,borderRadius:8,padding:"6px 4px"}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.2rem",color:BLACK,lineHeight:1}}>{m.days}</div>
                  <div style={{fontSize:"0.6rem",color:GRAY,fontWeight:700}}>DAYS</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"0.9rem"}}>{m.event}</div>
                  <div style={{fontSize:"0.78rem",color:GRAY,marginTop:2}}>{m.date}</div>
                </div>
                <span style={{fontSize:"0.72rem",fontWeight:600,padding:"2px 8px",borderRadius:99,background:`${SAGE}15`,color:SAGE}}>{m.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
