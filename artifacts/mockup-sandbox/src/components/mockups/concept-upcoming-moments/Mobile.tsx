import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const moments=[
  {emoji:"🎂",name:"Steve",rel:"Friend",event:"Birthday",days:3,date:"Jun 14",urgent:true,status:"Draft ready"},
  {emoji:"💍",name:"Sarah",rel:"Sister",event:"Anniversary",days:8,date:"Jun 19",urgent:false,status:"On track"},
  {emoji:"🌸",name:"Mom",rel:"Mom",event:"Mother's Day",days:15,date:"Jun 26",urgent:false,status:"Add details"},
  {emoji:"💌",name:"Marcus",rel:"Friend",event:"Just Because",days:22,date:"Jul 3",urgent:false,status:"On track"},
  {emoji:"👔",name:"Dad",rel:"Dad",event:"Father's Day",days:28,date:"Jul 9",urgent:false,status:"On track"},
];

const navItems=[
  {icon:"🏠",label:"Home",active:true},
  {icon:"👥",label:"People",active:false},
  {icon:"➕",label:"",active:false,fab:true},
  {icon:"💌",label:"Cards",active:false},
  {icon:"⚙️",label:"Settings",active:false},
];

export function Mobile() {
  const [active,setActive]=useState(0);
  return (
    <div style={{width:390,height:844,background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK,display:"flex",flexDirection:"column" as const,overflow:"hidden",position:"relative" as const,borderRadius:40,boxShadow:"0 8px 48px rgba(0,0,0,0.18)"}}>
      {/* Status bar */}
      <div style={{background:BLACK,padding:"14px 24px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.2rem",color:RED,letterSpacing:"0.08em"}}>F.I. FORGOT</span>
        <span style={{fontSize:"0.75rem",color:"#ffffff60"}}>9:41 AM</span>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"18px 18px 12px"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:16}}>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",letterSpacing:"0.04em",color:BLACK,margin:0}}>Upcoming</h2>
          <span style={{fontFamily:"'Caveat',cursive",fontSize:"0.95rem",color:GRAY}}>next 30 days</span>
        </div>

        {/* Urgent alert */}
        <div style={{background:RED,borderRadius:14,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
          <div style={{minWidth:42,textAlign:"center" as const}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.8rem",color:WHITE,lineHeight:1}}>3</div>
            <div style={{fontSize:"0.58rem",color:"#ffffff80",fontWeight:700}}>DAYS</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:"0.95rem",color:WHITE}}>Steve's Birthday</div>
            <div style={{fontSize:"0.78rem",color:"#ffffff90",marginTop:2}}>Draft ready — tap to review</div>
          </div>
          <div style={{color:WHITE,fontSize:"1.1rem"}}>→</div>
        </div>

        {/* Remaining moments */}
        <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
          {moments.slice(1).map((m,i)=>(
            <div key={i} style={{background:WHITE,borderRadius:13,padding:"13px 15px",border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
              <div style={{minWidth:40,textAlign:"center" as const,background:CREAM,borderRadius:8,padding:"5px 2px"}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.1rem",color:BLACK,lineHeight:1}}>{m.days}</div>
                <div style={{fontSize:"0.58rem",color:GRAY,fontWeight:700}}>DAYS</div>
              </div>
              <div style={{fontSize:"1.4rem"}}>{m.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:"0.9rem"}}>{m.name} · {m.event}</div>
                <div style={{fontSize:"0.76rem",color:GRAY,marginTop:1}}>{m.date}</div>
              </div>
              <span style={{
                fontSize:"0.68rem",fontWeight:700,padding:"2px 8px",borderRadius:99,
                background:m.status==="On track"?`${SAGE}15`:"#fef3c7",
                color:m.status==="On track"?SAGE:"#92400e",
              }}>{m.status}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:18,background:WHITE,borderRadius:13,padding:"13px 16px",border:`1.5px dashed ${SAGE}45`,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
          <span style={{fontSize:"1.3rem",color:SAGE}}>＋</span>
          <span style={{fontWeight:700,fontSize:"0.88rem",color:SAGE}}>Add a new moment</span>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{background:WHITE,borderTop:`1px solid ${BORDER}`,padding:"8px 6px 16px",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
        {navItems.map((n,i)=>
          n.fab
            ? <button key={i} style={{width:48,height:48,borderRadius:"50%",background:RED,border:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",color:WHITE,cursor:"pointer",marginTop:-20,boxShadow:`0 4px 16px ${RED}50`}}>+</button>
            : <button key={i} onClick={()=>setActive(i)} style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",opacity:active===i?1:0.45}}>
                <span style={{fontSize:"1.2rem"}}>{n.icon}</span>
                <span style={{fontSize:"0.62rem",fontWeight:700,color:active===i?RED:GRAY,letterSpacing:"0.03em"}}>{n.label}</span>
              </button>
        )}
      </div>
    </div>
  );
}
