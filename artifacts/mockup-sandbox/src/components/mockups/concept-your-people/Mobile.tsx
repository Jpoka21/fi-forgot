import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",AMBER="#D97706";

const people=[
  {n:"Marcus",e:"👦",r:"Friend",  h:92,next:"Birthday · Jun 14",d:3, urgent:true},
  {n:"Emily", e:"💑",r:"Wife",    h:95,next:"Anniversary · Jul 9",d:28,urgent:false},
  {n:"Mom",   e:"👩",r:"Mother",  h:87,next:"Birthday · Jun 22",d:11,urgent:false},
  {n:"Sarah", e:"👧",r:"Sister",  h:78,next:"Anniversary · Jun 28",d:17,urgent:false},
  {n:"Dad",   e:"👨",r:"Father",  h:71,next:"Father's Day · Jun 21",d:10,urgent:false},
  {n:"Steve", e:"🧔",r:"Friend",  h:64,next:"Birthday · Jul 5",d:24,urgent:false},
];
const hColor=(h:number)=>h>=80?SAGE:h>=65?AMBER:RED;

export default function Mobile(){
  const [expanded,setExpanded]=useState<string|null>(null);
  const [tab,setTab]=useState("people");
  return(
    <div style={{width:"100%",height:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",flexDirection:"column" as const,overflow:"hidden"}}>
      {/* STATUS */}
      <div style={{background:BLACK,padding:"10px 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
        <div style={{width:26,height:26,borderRadius:"50%",background:RED,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.62rem",fontWeight:700}}>JM</div>
      </div>

      {/* HEADER */}
      <div style={{background:WHITE,borderBottom:`1px solid ${BORDER}`,padding:"12px 16px"}}>
        <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>YOUR PEOPLE</p>
        <p style={{fontSize:"0.72rem",color:GRAY,margin:"3px 0 0"}}>6 people · avg <span style={{color:SAGE,fontWeight:700}}>81%</span> health</p>
      </div>

      {/* PEOPLE LIST */}
      <div style={{flex:1,overflowY:"auto" as const,padding:"10px 14px",display:"flex",flexDirection:"column" as const,gap:8}}>
        {people.map((p,i)=>(
          <div key={i}>
            <div onClick={()=>setExpanded(expanded===p.n?null:p.n)}
              style={{background:WHITE,border:`1px solid ${expanded===p.n?hColor(p.h):BORDER}`,borderRadius:12,padding:"11px 13px",display:"flex",alignItems:"center",gap:11,cursor:"pointer",transition:"all 0.12s"}}>
              {/* Health dot */}
              <div style={{position:"relative" as const,flexShrink:0}}>
                <div style={{width:40,height:40,borderRadius:10,background:p.h>=80?"#EDF5F0":"#FFF8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.25rem"}}>{p.e}</div>
                <div style={{position:"absolute" as const,bottom:-1,right:-1,width:11,height:11,borderRadius:"50%",background:hColor(p.h),border:`2px solid ${WHITE}`}}/>
              </div>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:"0.84rem",margin:0}}>{p.n}</p>
                <p style={{fontSize:"0.68rem",color:GRAY,margin:"1px 0 0"}}>{p.r} · {p.next}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column" as const,alignItems:"flex-end",gap:2}}>
                <span style={{fontSize:"0.76rem",fontWeight:700,color:hColor(p.h)}}>{p.h}%</span>
                {p.urgent&&<span style={{background:"#FEE2E2",color:RED,borderRadius:20,padding:"1px 6px",fontSize:"0.6rem",fontWeight:700}}>{p.d}d</span>}
              </div>
              <span style={{color:GRAY,fontSize:"0.75rem"}}>{expanded===p.n?"▲":"▼"}</span>
            </div>
            {expanded===p.n&&(
              <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"10px 13px",display:"flex",gap:7}}>
                <button style={{flex:1,background:RED,color:WHITE,border:"none",borderRadius:8,padding:"8px 6px",fontWeight:700,fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>✉️ Send Card</button>
                <button style={{flex:1,background:BG,color:BLACK,border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 6px",fontWeight:600,fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>📝 Log</button>
                <button style={{flex:1,background:BG,color:BLACK,border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 6px",fontWeight:600,fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>👤 Profile</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <div style={{background:WHITE,borderTop:`1px solid ${BORDER}`,padding:"10px 0 14px",display:"flex",justifyContent:"space-around"}}>
        {[{icon:"🏠",label:"Home",id:"home"},{icon:"📅",label:"Moments",id:"moments"},{icon:"👥",label:"People",id:"people"},{icon:"🏆",label:"Points",id:"points"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <span style={{fontSize:"1.2rem"}}>{t.icon}</span>
            <span style={{fontSize:"0.6rem",fontWeight:t.id===tab?700:400,color:t.id===tab?SAGE:GRAY}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
