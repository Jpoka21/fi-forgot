import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF";

const heroAction={
  emoji:"🧢",name:"Marcus",event:"Birthday",dueText:"Today",days:0,
  msg:"Send Marcus a birthday card",
  context:"His birthday is today — we have a draft ready. One tap.",
};

const nextActions=[
  {emoji:"🤝",name:"Steve",event:"Birthday",days:3,action:"Review draft"},
  {emoji:"💛",name:"Mom",event:"Check-in",days:0,action:"Post-surgery update"},
];

const navItems=[
  {icon:"🏠",label:"Home",active:true},
  {icon:"👥",label:"People",active:false},
  {icon:"",label:"",fab:true},
  {icon:"💌",label:"Cards",active:false},
  {icon:"⚙️",label:"Settings",active:false},
];

function Ring({h,color}:{h:number,color:string}){
  const r=15,c=Math.PI*2*r,fill=c*(h/100);
  return (
    <svg width={36} height={36}>
      <circle cx={18} cy={18} r={r} fill="none" stroke={`${color}22`} strokeWidth={3.5}/>
      <circle cx={18} cy={18} r={r} fill="none" stroke={color} strokeWidth={3.5}
        strokeDasharray={`${fill} ${c-fill}`} strokeLinecap="round" transform="rotate(-90 18 18)"/>
      <text x={18} y={22} textAnchor="middle" fontFamily="'Bebas Neue',cursive" fontSize={10} fill={color}>{h}</text>
    </svg>
  );
}

export function Mobile() {
  const [done,setDone]=useState(false);
  const [activeNav,setActiveNav]=useState(0);

  return (
    <div style={{width:390,height:844,background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK,display:"flex",flexDirection:"column" as const,overflow:"hidden",borderRadius:40,boxShadow:"0 8px 48px rgba(0,0,0,0.18)"}}>
      {/* Status bar */}
      <div style={{background:BLACK,padding:"14px 22px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.2rem",color:RED,letterSpacing:"0.08em"}}>F.I. FORGOT</span>
        <span style={{fontSize:"0.72rem",color:"#ffffff55"}}>9:41 AM</span>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"20px 18px 80px"}}>
        {/* Hero action — full card */}
        <div style={{
          background:done?`${SAGE}15`:BLACK,
          borderRadius:20,padding:"26px 22px",marginBottom:18,
          border:done?`2px solid ${SAGE}40`:"none",
          boxShadow:done?"none":"0 6px 32px rgba(0,0,0,0.25)",
          transition:"all 0.4s",
          minHeight:220,display:"flex",flexDirection:"column" as const,justifyContent:"space-between",
        }}>
          {done
            ? <div style={{textAlign:"center" as const,padding:"20px 0"}}>
                <div style={{fontSize:"2.5rem",marginBottom:12}}>✅</div>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.6rem",color:SAGE,letterSpacing:"0.04em",marginBottom:6}}>Done! We'll handle it.</div>
                <div style={{fontFamily:"'Caveat',cursive",fontSize:"1rem",color:GRAY}}>Next: Steve's birthday in 3 days</div>
              </div>
            : <>
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <div style={{background:`${RED}30`,borderRadius:6,padding:"3px 10px"}}>
                      <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"0.72rem",color:RED,letterSpacing:"0.1em"}}>DO THIS NOW</span>
                    </div>
                    <Ring h={38} color={RED}/>
                  </div>
                  <div style={{fontSize:"2.4rem",marginBottom:10}}>{heroAction.emoji}</div>
                  <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.65rem",color:WHITE,letterSpacing:"0.03em",margin:"0 0 8px",lineHeight:1.1}}>{heroAction.msg}</h2>
                  <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.02rem",color:"#ffffff70",margin:"0 0 18px",lineHeight:1.5}}>{heroAction.context}</p>
                </div>
                <button onClick={()=>setDone(true)} style={{
                  background:RED,color:WHITE,border:"none",borderRadius:13,
                  padding:"15px",width:"100%",
                  fontFamily:"'Bebas Neue',cursive",fontSize:"1.15rem",letterSpacing:"0.06em",
                  cursor:"pointer",boxShadow:`0 4px 20px ${RED}55`,
                }}>SEND THE CARD →</button>
              </>
          }
        </div>

        {/* Swipe hint */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:16}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:BLACK}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:`${BLACK}30`}}/>
          <div style={{width:6,height:6,borderRadius:"50%",background:`${BLACK}30`}}/>
          <span style={{fontSize:"0.72rem",color:GRAY,marginLeft:6}}>2 more actions</span>
        </div>

        {/* Next actions */}
        <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.2rem",letterSpacing:"0.04em",color:BLACK,margin:"0 0 10px"}}>Up Next</h3>
        <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
          {nextActions.map((a,i)=>(
            <div key={i} style={{background:WHITE,borderRadius:13,padding:"13px 15px",border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:"1.5rem"}}>{a.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:"0.9rem"}}>{a.name} · {a.event}</div>
                <div style={{fontSize:"0.76rem",color:GRAY,marginTop:1}}>{a.action}</div>
              </div>
              <div style={{textAlign:"right" as const}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"0.9rem",color:a.days===0?RED:GRAY}}>{a.days===0?"Today":`${a.days}d`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{background:WHITE,borderTop:`1px solid ${BORDER}`,padding:"8px 6px 16px",display:"flex",justifyContent:"space-around",alignItems:"center",position:"absolute" as const,bottom:0,left:0,right:0}}>
        {navItems.map((n,i)=>
          n.fab
            ? <button key={i} style={{width:48,height:48,borderRadius:"50%",background:RED,border:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",color:WHITE,cursor:"pointer",marginTop:-20,boxShadow:`0 4px 16px ${RED}50`}}>+</button>
            : <button key={i} onClick={()=>setActiveNav(i)} style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",opacity:activeNav===i?1:0.4}}>
                <span style={{fontSize:"1.2rem"}}>{n.icon}</span>
                <span style={{fontSize:"0.6rem",fontWeight:700,color:activeNav===i?RED:GRAY}}>{n.label}</span>
              </button>
        )}
      </div>
    </div>
  );
}
