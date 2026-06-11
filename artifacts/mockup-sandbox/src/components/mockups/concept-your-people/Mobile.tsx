import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",AMBER="#D97706";

type Level="great"|"good"|"check"|"risk";

const people=[
  {emoji:"🤝",name:"Steve",rel:"Friend",health:82,level:"good" as Level,next:"Birthday",days:3},
  {emoji:"👩",name:"Sarah",rel:"Sister",health:94,level:"great" as Level,next:"Anniversary",days:8},
  {emoji:"💛",name:"Mom",rel:"Mom",health:71,level:"good" as Level,next:"Mother's Day",days:15},
  {emoji:"🧢",name:"Marcus",rel:"Friend",health:38,level:"risk" as Level,next:"Just Because",days:22},
  {emoji:"👔",name:"Dad",rel:"Dad",health:65,level:"check" as Level,next:"Father's Day",days:28},
];

const dotColor:Record<Level,string>={great:SAGE,good:"#3b82f6",check:AMBER,risk:RED};
const levelLabel:Record<Level,string>={great:"Great",good:"Good",check:"Check in",risk:"At risk"};

function Ring({score,level}:{score:number,level:Level}){
  const r=16,c=Math.PI*2*r,fill=c*(score/100),col=dotColor[level];
  return (
    <svg width={38} height={38}>
      <circle cx={19} cy={19} r={r} fill="none" stroke={`${col}22`} strokeWidth={3.5}/>
      <circle cx={19} cy={19} r={r} fill="none" stroke={col} strokeWidth={3.5}
        strokeDasharray={`${fill} ${c-fill}`} strokeLinecap="round"
        transform="rotate(-90 19 19)"/>
      <text x={19} y={23} textAnchor="middle" fontFamily="'Bebas Neue',cursive" fontSize={11} fill={col}>{score}</text>
    </svg>
  );
}

const navItems=[
  {icon:"🏠",label:"Home"},
  {icon:"👥",label:"People"},
  {icon:"➕",label:"",fab:true},
  {icon:"💌",label:"Cards"},
  {icon:"⚙️",label:"Settings"},
];

export function Mobile() {
  const [activeNav,setActiveNav]=useState(1);
  const [expanded,setExpanded]=useState<number|null>(null);

  return (
    <div style={{width:390,height:844,background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK,display:"flex",flexDirection:"column" as const,overflow:"hidden",borderRadius:40,boxShadow:"0 8px 48px rgba(0,0,0,0.18)"}}>
      <div style={{background:BLACK,padding:"14px 22px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",color:RED,letterSpacing:"0.08em"}}>F.I. FORGOT</span>
        <span style={{fontSize:"0.72rem",color:"#ffffff55"}}>9:41 AM</span>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"18px 16px 12px"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:16}}>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.65rem",letterSpacing:"0.04em",color:BLACK,margin:0}}>Your People</h2>
          <span style={{fontFamily:"'Caveat',cursive",fontSize:"0.9rem",color:GRAY}}>1 needs attention</span>
        </div>

        <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
          {people.map((p,i)=>{
            const col=dotColor[p.level];
            const isOpen=expanded===i;
            return (
              <div key={i} style={{background:WHITE,borderRadius:14,border:`1.5px solid ${isOpen?`${col}50`:BORDER}`,overflow:"hidden",cursor:"pointer",transition:"border-color 0.15s"}}>
                <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}} onClick={()=>setExpanded(isOpen?null:i)}>
                  <div style={{fontSize:"1.55rem"}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:"0.95rem"}}>{p.name}</div>
                    <div style={{fontSize:"0.75rem",color:GRAY,marginTop:1}}>{p.rel} · next: {p.next} in {p.days}d</div>
                  </div>
                  <Ring score={p.health} level={p.level}/>
                  <span style={{fontSize:"0.9rem",color:GRAY,marginLeft:2}}>{isOpen?"▲":"▼"}</span>
                </div>
                {isOpen && (
                  <div style={{padding:"0 15px 14px",borderTop:`1px solid ${BORDER}`}}>
                    <div style={{paddingTop:12,display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <div style={{flex:1,height:4,borderRadius:99,background:`${BLACK}10`,overflow:"hidden"}}>
                        <div style={{width:`${p.health}%`,height:"100%",borderRadius:99,background:col}}/>
                      </div>
                      <span style={{fontSize:"0.72rem",fontWeight:700,color:col}}>{levelLabel[p.level]}</span>
                    </div>
                    <div style={{display:"flex",gap:7}}>
                      <button style={{flex:1,padding:"8px 6px",borderRadius:9,background:p.level==="risk"?RED:"transparent",border:`1.5px solid ${p.level==="risk"?RED:`${BLACK}18`}`,color:p.level==="risk"?WHITE:BLACK,fontWeight:700,fontSize:"0.76rem",cursor:"pointer"}}>
                        {p.level==="risk"?"Fix Now →":"Send Card"}
                      </button>
                      <button style={{flex:1,padding:"8px 6px",borderRadius:9,background:"transparent",border:`1.5px solid ${BLACK}18`,color:BLACK,fontWeight:700,fontSize:"0.76rem",cursor:"pointer"}}>View Profile</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{background:`${SAGE}0c`,borderRadius:14,padding:"13px 15px",border:`1.5px dashed ${SAGE}45`,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
            <span style={{fontSize:"1.4rem",color:SAGE}}>＋</span>
            <div>
              <div style={{fontWeight:700,fontSize:"0.88rem",color:SAGE}}>Add Another Person</div>
              <div style={{fontSize:"0.73rem",color:`${SAGE}90`}}>Grow your coverage</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{background:WHITE,borderTop:`1px solid ${BORDER}`,padding:"8px 6px 16px",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
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
