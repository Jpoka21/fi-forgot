import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",AMBER="#D97706";

const moments=[
  {p:"Marcus",e:"👦",ev:"Birthday",date:"Jun 14",d:3, urgent:true},
  {p:"Dad",   e:"👨",ev:"Father's Day",date:"Jun 21",d:10,urgent:false},
  {p:"Mom",   e:"👩",ev:"Birthday",date:"Jun 22",d:11,urgent:false},
  {p:"Sarah", e:"👧",ev:"Anniversary",date:"Jun 28",d:17,urgent:false},
  {p:"Steve", e:"🧔",ev:"Birthday",date:"Jul 5",d:24,urgent:false},
];
const accent=(d:number)=>d<=7?RED:d<=14?AMBER:SAGE;

export default function Mobile(){
  const [tab,setTab]=useState("moments");
  return(
    <div style={{width:"100%",height:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",flexDirection:"column" as const,overflow:"hidden"}}>
      {/* STATUS BAR */}
      <div style={{background:BLACK,padding:"10px 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
        <div style={{width:26,height:26,borderRadius:"50%",background:RED,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.62rem",fontWeight:700}}>JM</div>
      </div>

      {/* HEADER */}
      <div style={{background:WHITE,borderBottom:`1px solid ${BORDER}`,padding:"14px 16px 12px"}}>
        <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>NEXT 30 DAYS</p>
        <p style={{fontSize:"0.72rem",color:GRAY,margin:"3px 0 0"}}>
          <span style={{color:RED,fontWeight:700}}>⚡ 1 urgent</span> · 5 total
        </p>
      </div>

      {/* URGENT CARD */}
      <div style={{margin:"12px 14px 0",background:RED,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 16px rgba(226,59,46,0.22)"}}>
        <span style={{fontSize:"1.6rem"}}>👦</span>
        <div style={{flex:1}}>
          <p style={{color:WHITE,fontWeight:700,fontSize:"0.88rem",margin:0}}>Marcus's Birthday</p>
          <p style={{color:"rgba(255,255,255,0.72)",fontSize:"0.71rem",margin:"2px 0 0"}}>June 14 · 3 days away</p>
        </div>
        <button style={{background:WHITE,color:RED,border:"none",borderRadius:8,padding:"7px 12px",fontWeight:700,fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:"nowrap" as const}}>Send →</button>
      </div>

      {/* MOMENT CARDS */}
      <div style={{flex:1,overflowY:"auto" as const,padding:"12px 14px",display:"flex",flexDirection:"column" as const,gap:8}}>
        <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1rem",letterSpacing:"0.07em",color:GRAY,margin:"4px 0 10px"}}>COMING UP</p>
        {moments.slice(1).map((m,i)=>(
          <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,borderLeft:`4px solid ${accent(m.d)}`}}>
            <div style={{minWidth:42,height:42,borderRadius:8,background:m.d<=14?"#FEF9EE":"#EDF5F0",display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.05rem",color:accent(m.d),lineHeight:1}}>{m.date.split(" ")[1]}</span>
              <span style={{fontSize:"0.55rem",color:GRAY,textTransform:"uppercase" as const,letterSpacing:"0.06em"}}>{m.date.split(" ")[0]}</span>
            </div>
            <span style={{fontSize:"1.3rem"}}>{m.e}</span>
            <div style={{flex:1}}>
              <p style={{fontWeight:700,fontSize:"0.82rem",margin:0}}>{m.p}</p>
              <p style={{fontSize:"0.68rem",color:GRAY,margin:"1px 0 0"}}>{m.ev}</p>
            </div>
            <span style={{fontSize:"0.68rem",fontWeight:700,color:accent(m.d)}}>{m.d}d</span>
          </div>
        ))}
      </div>

      {/* BOTTOM NAV */}
      <div style={{background:WHITE,borderTop:`1px solid ${BORDER}`,padding:"10px 0 14px",display:"flex",justifyContent:"space-around"}}>
        {[{icon:"🏠",label:"Home",id:"home"},{icon:"📅",label:"Moments",id:"moments"},{icon:"👥",label:"People",id:"people"},{icon:"🏆",label:"Points",id:"points"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <span style={{fontSize:"1.2rem"}}>{t.icon}</span>
            <span style={{fontSize:"0.6rem",fontWeight:t.id===tab?700:400,color:t.id===tab?RED:GRAY}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
