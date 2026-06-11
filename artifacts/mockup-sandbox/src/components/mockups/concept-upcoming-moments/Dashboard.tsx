import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const moments=[
  {emoji:"🎂",name:"Steve",rel:"Friend",event:"Birthday",days:3,date:"Jun 14",status:"draft",statusLabel:"Draft ready"},
  {emoji:"💍",name:"Sarah",rel:"Sister",event:"Anniversary",days:8,date:"Jun 19",status:"on-track",statusLabel:"On track"},
  {emoji:"🌸",name:"Mom",rel:"Mom",event:"Mother's Day",days:15,date:"Jun 26",status:"needs-info",statusLabel:"Add details"},
  {emoji:"💌",name:"Marcus",rel:"Friend",event:"Just Because",days:22,date:"Jul 3",status:"on-track",statusLabel:"On track"},
  {emoji:"👔",name:"Dad",rel:"Dad",event:"Father's Day",days:28,date:"Jul 9",status:"on-track",statusLabel:"On track"},
];

const people=[
  {emoji:"🤝",name:"Steve",rel:"Friend",count:3},
  {emoji:"👩",name:"Sarah",rel:"Sister",count:4},
  {emoji:"💛",name:"Mom",rel:"Mom",count:5},
  {emoji:"🧢",name:"Marcus",rel:"Friend",count:2},
  {emoji:"👔",name:"Dad",rel:"Dad",count:4},
  {emoji:"💼",name:"Jenny",rel:"Client",count:2},
];

export function Dashboard() {
  const [hovered,setHovered]=useState<number|null>(null);
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* Nav */}
      <div style={{background:BLACK,height:54,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.45rem",color:RED,letterSpacing:"0.08em"}}>F.I. FORGOT</span>
          <div style={{width:1,height:18,background:"#ffffff25"}}/>
          <span style={{fontFamily:"'Caveat',cursive",fontSize:"1rem",color:"#ffffff70"}}>your next 30 days</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button style={{background:"#ffffff12",border:"none",borderRadius:8,padding:"6px 14px",color:"#ffffffcc",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",letterSpacing:"0.04em"}}>+ ADD MOMENT</button>
          <div style={{width:30,height:30,borderRadius:"50%",background:RED,display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:700,fontSize:"0.78rem"}}>M</div>
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"28px 22px 48px"}}>

        {/* Hero stat strip */}
        <div style={{background:BLACK,borderRadius:14,padding:"16px 24px",marginBottom:28,display:"flex",gap:32,alignItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.2rem",color:RED,lineHeight:1}}>5</div>
            <div style={{fontSize:"0.7rem",color:"#ffffff60",letterSpacing:"0.06em",marginTop:2}}>EVENTS</div>
          </div>
          <div style={{width:1,height:36,background:"#ffffff15"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.2rem",color:WHITE,lineHeight:1}}>3</div>
            <div style={{fontSize:"0.7rem",color:"#ffffff60",letterSpacing:"0.06em",marginTop:2}}>DAYS TO NEXT</div>
          </div>
          <div style={{width:1,height:36,background:"#ffffff15"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.2rem",color:SAGE,lineHeight:1}}>1</div>
            <div style={{fontSize:"0.7rem",color:"#ffffff60",letterSpacing:"0.06em",marginTop:2}}>DRAFT WAITING</div>
          </div>
          <div style={{flex:1}}/>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:"1.05rem",color:"#ffffff70",textAlign:"right" as const}}>We've got it<br/>handled.</div>
        </div>

        {/* Timeline */}
        <div style={{marginBottom:36}}>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.85rem",letterSpacing:"0.04em",color:BLACK,margin:"0 0 16px",lineHeight:1}}>
            Upcoming Moments
          </h2>

          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {moments.map((m,i)=>{
              const urgent=m.days<=7;
              const isH=hovered===i;
              return (
                <div key={i}
                  onMouseEnter={()=>setHovered(i)}
                  onMouseLeave={()=>setHovered(null)}
                  style={{
                    background:WHITE,borderRadius:14,
                    border:`1.5px solid ${urgent?`${RED}45`:isH?`${BLACK}20`:BORDER}`,
                    padding:"15px 20px",display:"flex",alignItems:"center",gap:16,
                    boxShadow:urgent?`0 3px 16px ${RED}18`:`0 1px 6px rgba(0,0,0,0.04)`,
                    cursor:"pointer",transition:"all 0.15s",
                  }}>
                  {/* Day badge */}
                  <div style={{
                    minWidth:56,textAlign:"center" as const,
                    background:urgent?RED:CREAM,
                    borderRadius:10,padding:"9px 4px",
                    border:urgent?"none":`1px solid ${BORDER}`,
                  }}>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.5rem",color:urgent?WHITE:BLACK,lineHeight:1}}>{m.days}</div>
                    <div style={{fontSize:"0.62rem",color:urgent?"#ffffff90":GRAY,letterSpacing:"0.05em",fontWeight:700,marginTop:1}}>DAYS</div>
                  </div>

                  <div style={{fontSize:"1.9rem",lineHeight:1}}>{m.emoji}</div>

                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <span style={{fontWeight:700,fontSize:"1.05rem"}}>{m.name}</span>
                      <span style={{fontSize:"0.82rem",color:GRAY}}>{m.rel}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:"0.9rem",color:BLACK}}>{m.event}</span>
                      <span style={{fontSize:"0.78rem",color:GRAY}}>— {m.date}</span>
                      <span style={{
                        fontSize:"0.72rem",fontWeight:700,padding:"2px 8px",borderRadius:99,
                        background:m.status==="draft"?`${SAGE}20`:m.status==="needs-info"?"#fef3c7":`${BLACK}07`,
                        color:m.status==="draft"?SAGE:m.status==="needs-info"?"#92400e":GRAY,
                      }}>{m.statusLabel}</span>
                    </div>
                  </div>

                  <button style={{
                    background:urgent?RED:"transparent",
                    color:urgent?WHITE:RED,
                    border:`1.5px solid ${urgent?RED:`${RED}50`}`,
                    borderRadius:9,padding:"8px 18px",
                    fontSize:"0.82rem",fontWeight:700,cursor:"pointer",
                    whiteSpace:"nowrap" as const,
                    transition:"all 0.15s",
                  }}>
                    {m.status==="draft"?"Review Draft →":m.status==="needs-info"?"Add Details":"View →"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* People grid */}
        <div>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.45rem",letterSpacing:"0.04em",color:BLACK,margin:"0 0 14px"}}>Your People</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {people.map((p,i)=>(
              <div key={i} style={{background:WHITE,borderRadius:12,padding:"14px 18px",border:`1px solid ${BORDER}`,cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"border-color 0.15s"}}>
                <div style={{fontSize:"1.6rem"}}>{p.emoji}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:"0.95rem"}}>{p.name}</div>
                  <div style={{fontSize:"0.76rem",color:GRAY}}>{p.rel} · {p.count} events/yr</div>
                </div>
              </div>
            ))}
            <div style={{background:`${SAGE}0d`,borderRadius:12,padding:"14px 18px",border:`1.5px dashed ${SAGE}55`,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:"1.6rem",color:SAGE}}>＋</div>
              <div style={{fontWeight:700,fontSize:"0.92rem",color:SAGE}}>Add Person</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
