import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",AMBER="#D97706";

const people=[
  {n:"Marcus",e:"👦",r:"Friend",  h:92,next:"Birthday",nextDate:"Jun 14",d:3,  last:"Mar 2026",urgent:true, cards:8},
  {n:"Emily", e:"💑",r:"Wife",    h:95,next:"Anniversary",nextDate:"Jul 9",d:28,last:"May 2026",urgent:false,cards:24},
  {n:"Mom",   e:"👩",r:"Mother",  h:87,next:"Birthday",nextDate:"Jun 22",d:11,last:"Apr 2026",urgent:false,cards:18},
  {n:"Sarah", e:"👧",r:"Sister",  h:78,next:"Anniversary",nextDate:"Jun 28",d:17,last:"Feb 2026",urgent:false,cards:7},
  {n:"Dad",   e:"👨",r:"Father",  h:71,next:"Father's Day",nextDate:"Jun 21",d:10,last:"Dec 2025",urgent:false,cards:9},
  {n:"Steve", e:"🧔",r:"Friend",  h:64,next:"Birthday",nextDate:"Jul 5",d:24, last:"Jul 2025",urgent:false,cards:5},
];

function HealthRing({pct,color}:{pct:number,color:string}){
  const r=22,c=2*Math.PI*r,dash=c*pct/100;
  return(
    <svg width={54} height={54} style={{transform:"rotate(-90deg)"}}>
      <circle cx={27} cy={27} r={r} fill="none" stroke={BORDER} strokeWidth={4}/>
      <circle cx={27} cy={27} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={`${dash} ${c}`} strokeLinecap="round"/>
      <text x={27} y={27} textAnchor="middle" dominantBaseline="central" fill={BLACK} fontSize={11} fontWeight={700} style={{transform:"rotate(90deg)",transformOrigin:"27px 27px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{pct}</text>
    </svg>
  );
}
const hColor=(h:number)=>h>=80?SAGE:h>=65?AMBER:RED;

export default function Dashboard(){
  const [filter,setFilter]=useState("all");
  const [hov,setHov]=useState("");
  const filtered=filter==="all"?people:filter==="urgent"?people.filter(p=>p.urgent):people.filter(p=>p.h<75);
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* NAV */}
      <div style={{background:BLACK,padding:"13px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
          <span style={{color:"#555",fontSize:"0.7rem",letterSpacing:"0.1em"}}>RELATIONSHIP AUTOPILOT</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {["Home","People","Moments","Points"].map(t=>(
            <span key={t} style={{padding:"5px 13px",borderRadius:6,fontSize:"0.76rem",color:t==="People"?WHITE:"#888",background:t==="People"?SAGE:"transparent",cursor:"pointer",fontWeight:t==="People"?700:400}}>{t}</span>
          ))}
          <div style={{width:30,height:30,borderRadius:"50%",background:RED,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,marginLeft:6}}>JM</div>
        </div>
      </div>

      {/* HERO */}
      <div style={{background:WHITE,borderBottom:`1px solid ${BORDER}`,padding:"24px 32px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.8rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>YOUR PEOPLE</p>
          <p style={{color:GRAY,fontSize:"0.84rem",margin:"5px 0 0"}}>6 people · avg health <strong style={{color:SAGE}}>81%</strong> · <span style={{color:RED}}>1 needs attention now</span></p>
        </div>
        <button style={{background:BLACK,color:WHITE,border:"none",borderRadius:10,padding:"11px 22px",fontWeight:700,fontSize:"0.84rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>+ Add Person</button>
      </div>

      <div style={{padding:"22px 32px",maxWidth:1060,margin:"0 auto"}}>
        {/* FILTER TABS */}
        <div style={{display:"flex",gap:6,marginBottom:18}}>
          {[["all","Everyone"],["urgent","Urgent 🔴"],["attention","Needs attention"]].map(([id,label])=>(
            <button key={id} onClick={()=>setFilter(id)} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${filter===id?BLACK:BORDER}`,background:filter===id?BLACK:WHITE,color:filter===id?WHITE:GRAY,fontSize:"0.78rem",fontWeight:filter===id?700:400,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{label}</button>
          ))}
        </div>

        {/* PEOPLE GRID */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {filtered.map((p,i)=>(
            <div key={i} onMouseEnter={()=>setHov(p.n)} onMouseLeave={()=>setHov("")}
              style={{background:WHITE,border:`1px solid ${hov===p.n?hColor(p.h):BORDER}`,borderRadius:14,padding:"18px 18px 14px",cursor:"pointer",boxShadow:hov===p.n?"0 4px 20px rgba(0,0,0,0.09)":"none",transition:"all 0.12s",position:"relative" as const}}>
              {p.urgent&&<div style={{position:"absolute" as const,top:10,right:10,width:8,height:8,borderRadius:"50%",background:RED,boxShadow:"0 0 0 3px rgba(226,59,46,0.18)"}}/>}
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:46,height:46,borderRadius:12,background:p.h>=80?"#EDF5F0":"#FFF8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem"}}>{p.e}</div>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,fontSize:"0.92rem",margin:0}}>{p.n}</p>
                  <span style={{display:"inline-block",background:p.h>=80?"#EDF5F0":"#FFF8F0",color:p.h>=80?SAGE:AMBER,borderRadius:20,padding:"1px 8px",fontSize:"0.67rem",fontWeight:700,marginTop:2}}>{p.r}</span>
                </div>
                <HealthRing pct={p.h} color={hColor(p.h)}/>
              </div>
              <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:10,display:"flex",flexDirection:"column" as const,gap:4}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:"0.72rem",color:GRAY}}>Next moment</span>
                  <span style={{fontSize:"0.72rem",fontWeight:700,color:p.urgent?RED:BLACK}}>{p.next} · {p.nextDate}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:"0.72rem",color:GRAY}}>Last card</span>
                  <span style={{fontSize:"0.72rem",color:BLACK}}>{p.last}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:"0.72rem",color:GRAY}}>Cards sent</span>
                  <span style={{fontSize:"0.72rem",color:BLACK}}>{p.cards} total</span>
                </div>
              </div>
              {p.urgent&&(
                <button style={{marginTop:10,width:"100%",background:RED,color:WHITE,border:"none",borderRadius:8,padding:"8px",fontWeight:700,fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Send Card Now →</button>
              )}
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div style={{marginTop:22,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {[{label:"Avg Health",val:"81%",color:SAGE},{label:"Cards This Year",val:"14",color:BLACK},{label:"Moments Tracked",val:"38",color:BLACK},{label:"Streak",val:"6 wks",color:AMBER}].map((s,i)=>(
            <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:12,padding:"14px 16px"}}>
              <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.6rem",color:s.color,margin:0,lineHeight:1}}>{s.val}</p>
              <p style={{fontSize:"0.71rem",color:GRAY,margin:"4px 0 0"}}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
