import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",AMBER="#D97706";

type HealthLevel="great"|"good"|"needs-attention"|"at-risk";

const people=[
  {emoji:"🤝",name:"Steve",rel:"Friend",health:82,level:"good" as HealthLevel,nextEvent:"Birthday",daysAway:3,lastCard:"3 months ago",covered:3},
  {emoji:"👩",name:"Sarah",rel:"Sister",health:94,level:"great" as HealthLevel,nextEvent:"Anniversary",daysAway:8,lastCard:"2 months ago",covered:4},
  {emoji:"💛",name:"Mom",rel:"Mom",health:71,level:"good" as HealthLevel,nextEvent:"Mother's Day",daysAway:15,lastCard:"5 months ago",covered:5},
  {emoji:"🧢",name:"Marcus",rel:"Friend",health:38,level:"at-risk" as HealthLevel,nextEvent:"Just Because",daysAway:22,lastCard:"14 months ago",covered:2},
  {emoji:"👔",name:"Dad",rel:"Dad",health:65,level:"needs-attention" as HealthLevel,nextEvent:"Father's Day",daysAway:28,lastCard:"6 months ago",covered:4},
  {emoji:"💼",name:"Jenny",rel:"Client",health:88,level:"great" as HealthLevel,nextEvent:"Birthday",daysAway:41,lastCard:"1 month ago",covered:2},
];

const HEALTH_COLOR:Record<HealthLevel,string>={great:SAGE,good:"#3b82f6",["needs-attention"]:AMBER,["at-risk"]:RED};
const HEALTH_LABEL:Record<HealthLevel,string>={great:"Great",good:"Good",["needs-attention"]:"Check in",["at-risk"]:"At risk"};

function HealthRing({score,level}:{score:number,level:HealthLevel}){
  const r=20,c=Math.PI*2*r,fill=c*(score/100);
  const color=HEALTH_COLOR[level];
  return (
    <svg width={52} height={52} style={{flexShrink:0}}>
      <circle cx={26} cy={26} r={r} fill="none" stroke={`${color}20`} strokeWidth={4}/>
      <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${fill} ${c-fill}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text x={26} y={31} textAnchor="middle" fontFamily="'Bebas Neue',cursive" fontSize={13} fill={color}>{score}</text>
    </svg>
  );
}

export function Dashboard() {
  const [hovered,setHovered]=useState<number|null>(null);
  const atRisk=people.filter(p=>p.level==="at-risk"||p.level==="needs-attention").length;
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* Nav */}
      <div style={{background:BLACK,height:54,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",position:"sticky",top:0,zIndex:10}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.45rem",color:RED,letterSpacing:"0.08em"}}>F.I. FORGOT</span>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button style={{background:"#ffffff12",border:"none",borderRadius:8,padding:"6px 14px",color:"#ffffffcc",fontSize:"0.78rem",fontWeight:600,cursor:"pointer"}}>+ ADD PERSON</button>
          <div style={{width:30,height:30,borderRadius:"50%",background:RED,display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:700,fontSize:"0.78rem"}}>M</div>
        </div>
      </div>

      <div style={{maxWidth:920,margin:"0 auto",padding:"28px 22px 48px"}}>
        {/* Page heading */}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.6rem",letterSpacing:"0.04em",color:BLACK,margin:0,lineHeight:1}}>Your People</h1>
            <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.1rem",color:GRAY,margin:"4px 0 0"}}>6 people covered. {atRisk} {atRisk===1?"needs":"need"} attention.</p>
          </div>
          <div style={{display:"flex",gap:12}}>
            {(["great","good","needs-attention","at-risk"] as HealthLevel[]).map(l=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:HEALTH_COLOR[l]}}/>
                <span style={{fontSize:"0.72rem",color:GRAY}}>{HEALTH_LABEL[l]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* People grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
          {people.map((p,i)=>{
            const color=HEALTH_COLOR[p.level];
            const isH=hovered===i;
            return (
              <div key={i}
                onMouseEnter={()=>setHovered(i)}
                onMouseLeave={()=>setHovered(null)}
                style={{
                  background:WHITE,borderRadius:16,padding:"20px",
                  border:`1.5px solid ${isH?`${color}50`:BORDER}`,
                  cursor:"pointer",transition:"all 0.15s",
                  boxShadow:isH?`0 4px 20px ${color}18`:`0 1px 6px rgba(0,0,0,0.04)`,
                }}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}>
                  <div style={{width:52,height:52,borderRadius:14,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.75rem",border:`1.5px solid ${color}30`}}>
                    {p.emoji}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:"1.1rem",lineHeight:1.2}}>{p.name}</div>
                    <div style={{fontSize:"0.8rem",color:GRAY,marginTop:2}}>{p.rel} · {p.covered} events/yr</div>
                    <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                      <div style={{flex:1,height:4,borderRadius:99,background:`${BLACK}10`,overflow:"hidden"}}>
                        <div style={{width:`${p.health}%`,height:"100%",borderRadius:99,background:color,transition:"width 0.4s"}}/>
                      </div>
                      <span style={{fontSize:"0.72rem",fontWeight:700,color:color}}>{HEALTH_LABEL[p.level]}</span>
                    </div>
                  </div>
                  <HealthRing score={p.health} level={p.level}/>
                </div>

                <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:"0.8rem",color:GRAY}}>Next: <span style={{fontWeight:700,color:p.daysAway<=7?RED:BLACK}}>{p.nextEvent}</span> in {p.daysAway}d</div>
                    <div style={{fontSize:"0.75rem",color:GRAY,marginTop:2}}>Last card: {p.lastCard}</div>
                  </div>
                  <button style={{
                    background:p.level==="at-risk"?RED:"transparent",
                    color:p.level==="at-risk"?WHITE:RED,
                    border:`1.5px solid ${p.level==="at-risk"?RED:`${RED}45`}`,
                    borderRadius:8,padding:"6px 14px",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",
                  }}>
                    {p.level==="at-risk"?"Fix Now →":"View →"}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add person tile */}
          <div style={{background:`${SAGE}0c`,borderRadius:16,padding:"20px",border:`1.5px dashed ${SAGE}45`,cursor:"pointer",display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",gap:10,minHeight:140}}>
            <div style={{width:48,height:48,borderRadius:14,background:`${SAGE}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",border:`1.5px dashed ${SAGE}50`}}>＋</div>
            <span style={{fontWeight:700,fontSize:"0.92rem",color:SAGE}}>Add Another Person</span>
            <span style={{fontSize:"0.76rem",color:`${SAGE}90`,textAlign:"center" as const}}>Grow your circle, stay covered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
