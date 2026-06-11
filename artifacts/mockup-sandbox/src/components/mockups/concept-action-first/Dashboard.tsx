import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const queue=[
  {emoji:"🤝",name:"Steve",event:"Birthday",days:3,action:"Approve card draft",priority:"high",ctaLabel:"Review Draft →"},
  {emoji:"💛",name:"Mom",event:"Mother's Day surgery follow-up",days:0,action:"Check in after knee surgery",priority:"high",ctaLabel:"Log Update →"},
  {emoji:"💍",name:"Sarah",event:"Anniversary",days:8,action:"Add anniversary date to profile",priority:"medium",ctaLabel:"Add Date →"},
  {emoji:"👔",name:"Dad",event:"Father's Day",days:28,action:"Preview card early",priority:"low",ctaLabel:"Preview →"},
];

const people=[
  {emoji:"🧢",name:"Marcus",health:38,color:RED,event:"Birthday",days:0},
  {emoji:"🤝",name:"Steve",health:82,color:"#3b82f6",event:"Birthday",days:3},
  {emoji:"👩",name:"Sarah",health:94,color:SAGE,event:"Anniversary",days:8},
  {emoji:"💛",name:"Mom",health:71,color:"#f59e0b",event:"Mother's Day",days:15},
  {emoji:"👔",name:"Dad",health:65,color:GRAY,event:"Father's Day",days:28},
];

function HealthRing({h,color}:{h:number,color:string}){
  const r=22,c=Math.PI*2*r,fill=c*(h/100);
  return (
    <svg width={54} height={54}>
      <circle cx={27} cy={27} r={r} fill="none" stroke={`${color}20`} strokeWidth={5}/>
      <circle cx={27} cy={27} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${fill} ${c-fill}`} strokeLinecap="round" transform="rotate(-90 27 27)"/>
      <text x={27} y={32} textAnchor="middle" fontFamily="'Bebas Neue',cursive" fontSize={14} fill={color}>{h}</text>
    </svg>
  );
}

export function Dashboard() {
  const [done,setDone]=useState(false);
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      <div style={{background:BLACK,height:54,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",position:"sticky",top:0,zIndex:10}}>
        <div>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.45rem",color:RED,letterSpacing:"0.08em"}}>F.I. FORGOT</span>
          <span style={{fontFamily:"'Caveat',cursive",fontSize:"0.9rem",color:"#ffffff50",marginLeft:12}}>we got your important people</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:"0.78rem",color:"#ffffff60",letterSpacing:"0.04em"}}>5 COVERED</span>
          <div style={{width:30,height:30,borderRadius:"50%",background:RED,display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:700,fontSize:"0.78rem"}}>M</div>
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"28px 22px 48px"}}>

        {/* HERO ACTION CARD */}
        <div style={{
          background:done?`${SAGE}15`:BLACK,
          borderRadius:20,padding:"30px 32px",marginBottom:28,
          border:done?`2px solid ${SAGE}40`:"none",
          boxShadow:done?"none":"0 8px 40px rgba(0,0,0,0.22)",
          transition:"all 0.4s",
        }}>
          {done
            ? <div style={{textAlign:"center" as const,padding:"12px 0"}}>
                <div style={{fontSize:"2.5rem",marginBottom:10}}>✅</div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.8rem",color:SAGE,letterSpacing:"0.04em"}}>Done. We'll handle the rest.</div>
                <div style={{fontFamily:"'Caveat',cursive",fontSize:"1.05rem",color:GRAY,marginTop:6}}>Next up: Steve's birthday in 3 days</div>
              </div>
            : <>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                  <div style={{background:`${RED}30`,borderRadius:6,padding:"3px 10px"}}>
                    <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"0.78rem",color:RED,letterSpacing:"0.1em"}}>TODAY'S ACTION</span>
                  </div>
                  <div style={{flex:1,height:1,background:"#ffffff15"}}/>
                  <HealthRing h={38} color={RED}/>
                </div>
                <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
                  <div style={{fontSize:"3rem",lineHeight:1}}>🧢</div>
                  <div style={{flex:1}}>
                    <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2rem",color:WHITE,letterSpacing:"0.03em",margin:"0 0 6px",lineHeight:1.1}}>Send Marcus a Birthday Card</h2>
                    <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.1rem",color:"#ffffff80",margin:"0 0 20px",lineHeight:1.5}}>His birthday is today — 14 months since his last card. One click and we'll handle the rest.</p>
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={()=>setDone(true)} style={{background:RED,color:WHITE,border:"none",borderRadius:11,padding:"13px 28px",fontFamily:"'Bebas Neue',cursive",fontSize:"1.1rem",letterSpacing:"0.06em",cursor:"pointer",boxShadow:`0 4px 20px ${RED}55`}}>
                        DO IT NOW →
                      </button>
                      <button style={{background:"#ffffff12",color:"#ffffffcc",border:"1px solid #ffffff20",borderRadius:11,padding:"13px 20px",fontSize:"0.85rem",fontWeight:600,cursor:"pointer"}}>View card first</button>
                    </div>
                  </div>
                </div>
              </>
          }
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:22,alignItems:"start"}}>
          {/* Action queue */}
          <div>
            <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.35rem",letterSpacing:"0.04em",color:BLACK,margin:"0 0 14px"}}>Up Next</h3>
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {queue.map((q,i)=>(
                <div key={i} style={{background:WHITE,borderRadius:13,padding:"14px 18px",border:`1.5px solid ${q.priority==="high"?`${RED}30`:BORDER}`,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
                  <div style={{fontSize:"1.6rem",lineHeight:1}}>{q.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:"0.9rem"}}>{q.name} — {q.event}</div>
                    <div style={{fontSize:"0.8rem",color:GRAY,marginTop:2}}>{q.action}</div>
                  </div>
                  {q.days>0&&<span style={{fontSize:"0.72rem",fontWeight:700,color:q.days<=7?RED:GRAY,background:q.days<=7?`${RED}10`:`${BLACK}07`,padding:"2px 8px",borderRadius:99}}>{q.days}d</span>}
                  <button style={{background:q.priority==="high"?"transparent":"transparent",color:RED,border:`1.5px solid ${RED}40`,borderRadius:8,padding:"6px 14px",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" as const}}>
                    {q.ctaLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* People health sidebar */}
          <div style={{background:WHITE,borderRadius:14,padding:"18px",border:`1px solid ${BORDER}`}}>
            <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.1rem",letterSpacing:"0.05em",color:BLACK,margin:"0 0 14px"}}>Coverage</h3>
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {people.map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:"1.2rem"}}>{p.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:"0.85rem"}}>{p.name}</div>
                    <div style={{height:3,borderRadius:99,background:`${BLACK}10`,marginTop:4,overflow:"hidden"}}>
                      <div style={{width:`${p.health}%`,height:"100%",background:p.color,borderRadius:99}}/>
                    </div>
                  </div>
                  <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"0.95rem",color:p.color}}>{p.health}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
