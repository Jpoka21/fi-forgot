import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const actions=[
  {icon:"🎂",label:"Birthday TODAY",desc:"Send Marcus a card now. His profile has enough info — click and we'll do the rest.",priority:"critical",ctaLabel:"Send Card Now →",done:false},
  {icon:"✍️",label:"Add his interests",desc:"We know he's a coffee person but his profile is thin. 2 more interests = better cards.",priority:"medium",ctaLabel:"Add Details →",done:false},
  {icon:"💬",label:"Log a recent memory",desc:"No memories logged. Cards get noticeably better when you add one real thing about them.",priority:"low",ctaLabel:"Add Memory →",done:false},
];

const pastCards=[
  {event:"Birthday",date:"Jun 14, 2025",tone:"Funny",msg:"Another year, another excuse to avoid those guitar lessons. Happy birthday, man!"},
  {event:"Christmas",date:"Dec 21, 2024",tone:"Simple",msg:"Merry Christmas. Grateful to have you in my corner."},
];

function HealthRing({h,color,size=70}:{h:number,color:string,size?:number}){
  const r=(size-10)/2,cx=size/2,cy=size/2;
  const c=Math.PI*2*r,fill=c*(h/100);
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}22`} strokeWidth={6}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${fill} ${c-fill}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}/>
      <text x={cx} y={cy+5} textAnchor="middle" fontFamily="'Bebas Neue',cursive" fontSize={16} fill={color}>{h}</text>
    </svg>
  );
}

export function Profile() {
  const [done,setDone]=useState<number|null>(null);
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      <div style={{background:BLACK,height:54,display:"flex",alignItems:"center",gap:14,padding:"0 22px"}}>
        <button style={{background:"none",border:"none",color:"#ffffff80",fontSize:"1.1rem",cursor:"pointer",padding:0}}>←</button>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.35rem",color:RED,letterSpacing:"0.06em"}}>F.I. FORGOT</span>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"28px 22px 48px"}}>

        {/* Person header */}
        <div style={{background:WHITE,borderRadius:18,padding:"22px 24px",border:`1.5px solid ${RED}30`,marginBottom:20,display:"flex",gap:18,alignItems:"center",boxShadow:`0 3px 16px ${RED}12`}}>
          <div style={{width:62,height:62,borderRadius:16,background:`${RED}10`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",border:`2px solid ${RED}20`}}>🧢</div>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.9rem",letterSpacing:"0.03em",color:BLACK,margin:0,lineHeight:1}}>Marcus</h1>
            <div style={{fontSize:"0.84rem",color:GRAY,marginTop:3}}>Friend · Since 2019 · 2 events per year</div>
            <div style={{marginTop:6,display:"flex",gap:6}}>
              <span style={{fontSize:"0.73rem",fontWeight:700,padding:"3px 10px",borderRadius:99,background:`${RED}12`,color:RED}}>⚠️ At Risk — 38/100</span>
              <span style={{fontSize:"0.73rem",fontWeight:600,padding:"3px 10px",borderRadius:99,background:`${BLACK}08`,color:GRAY}}>14 months since last card</span>
            </div>
          </div>
          <HealthRing h={38} color={RED}/>
        </div>

        {/* Actions — primary focus */}
        <div style={{marginBottom:28}}>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.4rem",letterSpacing:"0.04em",color:BLACK,margin:"0 0 14px"}}>Actions for Marcus</h2>
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {actions.map((a,i)=>(
              <div key={i} style={{
                background:done===i?`${SAGE}12`:WHITE,
                borderRadius:14,
                padding:"16px 20px",
                border:`1.5px solid ${done===i?`${SAGE}40`:a.priority==="critical"?`${RED}45`:BORDER}`,
                boxShadow:a.priority==="critical"&&done!==i?`0 3px 16px ${RED}12`:"none",
                transition:"all 0.25s",
              }}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{
                    width:42,height:42,borderRadius:11,
                    background:done===i?`${SAGE}20`:a.priority==="critical"?RED:CREAM,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:"1.2rem",flexShrink:0,
                  }}>{done===i?"✓":a.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:"0.95rem",color:done===i?SAGE:a.priority==="critical"?RED:BLACK,marginBottom:4}}>{a.label}</div>
                    <div style={{fontSize:"0.82rem",color:GRAY,lineHeight:1.55}}>{a.desc}</div>
                  </div>
                  {done!==i&&(
                    <button onClick={()=>setDone(i)} style={{
                      background:a.priority==="critical"?RED:"transparent",
                      color:a.priority==="critical"?WHITE:RED,
                      border:`1.5px solid ${a.priority==="critical"?RED:`${RED}45`}`,
                      borderRadius:9,padding:"8px 16px",
                      fontSize:"0.82rem",fontWeight:700,cursor:"pointer",
                      whiteSpace:"nowrap" as const,
                      boxShadow:a.priority==="critical"?`0 3px 12px ${RED}35`:"none",
                    }}>{a.ctaLabel}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Context */}
        <div style={{marginBottom:24}}>
          <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.2rem",letterSpacing:"0.04em",color:BLACK,margin:"0 0 12px"}}>About Marcus</h3>
          <div style={{background:WHITE,borderRadius:14,padding:"18px 20px",border:`1px solid ${BORDER}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {label:"Relationship since",value:"2019"},
                {label:"Events covered",value:"Birthday, Christmas"},
                {label:"Occasions / yr",value:"2"},
                {label:"Last card sent",value:"14 months ago"},
                {label:"Personality",value:"Laid back, coffee obsessed"},
                {label:"Interests",value:"Coffee, hiking, tech"},
              ].map((f,i)=>(
                <div key={i}>
                  <div style={{fontSize:"0.7rem",color:GRAY,fontWeight:600,letterSpacing:"0.04em",marginBottom:2}}>{f.label.toUpperCase()}</div>
                  <div style={{fontSize:"0.88rem",fontWeight:600}}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card history */}
        <div>
          <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.2rem",letterSpacing:"0.04em",color:BLACK,margin:"0 0 12px"}}>Card History</h3>
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {pastCards.map((c,i)=>(
              <div key={i} style={{background:WHITE,borderRadius:12,padding:"14px 18px",border:`1px solid ${BORDER}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontWeight:700,fontSize:"0.88rem"}}>{c.event} <span style={{fontWeight:400,color:GRAY,fontSize:"0.78rem"}}>— {c.date}</span></span>
                  <span style={{fontSize:"0.7rem",fontWeight:600,padding:"2px 7px",borderRadius:99,background:`${SAGE}15`,color:SAGE}}>{c.tone}</span>
                </div>
                <div style={{fontFamily:"'Caveat',cursive",fontSize:"1.02rem",color:BLACK,lineHeight:1.6,background:CREAM,borderRadius:7,padding:"8px 12px"}}>"{c.msg}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
