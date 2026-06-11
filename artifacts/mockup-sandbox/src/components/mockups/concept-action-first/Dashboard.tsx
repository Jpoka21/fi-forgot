import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FAF4EC";

const queue=[
  {rank:1,p:"Marcus",e:"👦",action:"Send birthday card",due:"Jun 14 · 3 days",priority:"🔴 Critical",done:false},
  {rank:2,p:"Dad",   e:"👨",action:"Send Father's Day card",due:"Jun 21 · 10 days",priority:"🟡 Soon",done:false},
  {rank:3,p:"Mom",   e:"👩",action:"Send birthday card",due:"Jun 22 · 11 days",priority:"🟡 Soon",done:false},
  {rank:4,p:"Sarah", e:"👧",action:"Send anniversary card",due:"Jun 28 · 17 days",priority:"🟢 Upcoming",done:false},
  {rank:5,p:"Steve", e:"🧔",action:"Log guitar lesson update",due:"Overdue 9 days",priority:"🔵 Memory",done:false},
];

const stats=[{v:"3",l:"This week"},{v:"6",l:"This month"},{v:"81%",l:"Avg health"},{v:"42",l:"Days streak"}];

function HealthRing({pct}:{pct:number}){
  const r=36,c=2*Math.PI*r,dash=c*pct/100;
  return(
    <svg width={90} height={90}>
      <circle cx={45} cy={45} r={r} fill="none" stroke="#2a2a2a" strokeWidth={7}/>
      <circle cx={45} cy={45} r={r} fill="none" stroke={SAGE} strokeWidth={7} strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 45 45)"/>
      <text x={45} y={45} textAnchor="middle" dominantBaseline="central" fill={WHITE} fontSize={14} fontWeight={700} fontFamily="'Plus Jakarta Sans',sans-serif">{pct}%</text>
    </svg>
  );
}

export default function Dashboard(){
  const [done,setDone]=useState<number[]>([]);
  const [hov,setHov]=useState(0);
  const toggle=(r:number)=>setDone(prev=>prev.includes(r)?prev.filter(x=>x!==r):[...prev,r]);
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* NAV */}
      <div style={{background:BLACK,padding:"13px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
          <span style={{color:"#555",fontSize:"0.7rem",letterSpacing:"0.1em"}}>WE GOT YOUR IMPORTANT PEOPLE</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {["Home","People","Moments","Points"].map(t=>(
            <span key={t} style={{padding:"5px 13px",borderRadius:6,fontSize:"0.76rem",color:t==="Home"?WHITE:"#888",background:t==="Home"?RED:"transparent",cursor:"pointer",fontWeight:t==="Home"?700:400}}>{t}</span>
          ))}
          <div style={{width:30,height:30,borderRadius:"50%",background:RED,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,marginLeft:6}}>JM</div>
        </div>
      </div>

      <div style={{padding:"24px 32px",maxWidth:1040,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:22}}>
          {/* LEFT */}
          <div>
            {/* HERO CARD */}
            <div style={{background:BLACK,borderRadius:18,padding:"28px 30px",marginBottom:20,boxShadow:"0 8px 40px rgba(0,0,0,0.18)"}}>
              <p style={{color:"#666",fontSize:"0.72rem",letterSpacing:"0.14em",fontWeight:700,margin:"0 0 6px",textTransform:"uppercase" as const}}>TODAY'S ACTION</p>
              <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.2rem",color:WHITE,margin:"0 0 4px",letterSpacing:"0.04em",lineHeight:1.1}}>SEND MARCUS A<br/>BIRTHDAY CARD</p>
              <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0 20px"}}>
                <span style={{fontSize:"1.4rem"}}>👦</span>
                <div>
                  <p style={{fontSize:"0.78rem",color:"#aaa",margin:0}}>Marcus · Friend · Birthday June 14</p>
                  <p style={{fontSize:"0.72rem",color:RED,fontWeight:700,margin:"2px 0 0"}}>⚡ 3 days away — order today for on-time delivery</p>
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button style={{flex:1,background:RED,color:WHITE,border:"none",borderRadius:12,padding:"14px",fontWeight:700,fontSize:"0.92rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:"0.02em"}}>
                  ✉️ Send Birthday Card →
                </button>
                <button style={{background:"#222",color:"#aaa",border:"1px solid #333",borderRadius:12,padding:"14px 16px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Skip</button>
              </div>
            </div>

            {/* ACTION QUEUE */}
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",letterSpacing:"0.08em",margin:"0 0 13px",display:"flex",alignItems:"center",gap:8}}>
              ACTION QUEUE
              <span style={{background:RED,color:WHITE,borderRadius:20,padding:"2px 9px",fontSize:"0.68rem",letterSpacing:0,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700}}>{queue.length-done.length}</span>
            </h2>
            <div style={{display:"flex",flexDirection:"column" as const,gap:7}}>
              {queue.map((item,i)=>(
                <div key={i} onMouseEnter={()=>setHov(item.rank)} onMouseLeave={()=>setHov(0)}
                  style={{background:WHITE,border:`1px solid ${hov===item.rank?GRAY:BORDER}`,borderRadius:12,padding:"11px 16px",display:"flex",alignItems:"center",gap:13,opacity:done.includes(item.rank)?0.4:1,transition:"all 0.12s",cursor:"pointer"}}>
                  <button onClick={()=>toggle(item.rank)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${done.includes(item.rank)?SAGE:BORDER}`,background:done.includes(item.rank)?SAGE:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"inherit"}}>
                    {done.includes(item.rank)&&<span style={{color:WHITE,fontSize:"0.7rem"}}>✓</span>}
                  </button>
                  <span style={{fontSize:"1.3rem"}}>{item.e}</span>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:"0.86rem",margin:0,textDecoration:done.includes(item.rank)?"line-through":"none"}}>{item.p} — {item.action}</p>
                    <p style={{fontSize:"0.71rem",color:GRAY,margin:"2px 0 0"}}>{item.due}</p>
                  </div>
                  <span style={{fontSize:"0.7rem",whiteSpace:"nowrap" as const}}>{item.priority}</span>
                  {!done.includes(item.rank)&&<button style={{background:BG,color:BLACK,border:`1px solid ${BORDER}`,borderRadius:7,padding:"5px 12px",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",flexShrink:0}}>Do it →</button>}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
            {/* Health ring */}
            <div style={{background:BLACK,borderRadius:16,padding:"20px",textAlign:"center" as const}}>
              <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1rem",letterSpacing:"0.1em",color:"#666",margin:"0 0 8px",textTransform:"uppercase" as const}}>Relationship Score</p>
              <HealthRing pct={81}/>
              <p style={{color:"#888",fontSize:"0.72rem",margin:"8px 0 0"}}>Up 4pts this month</p>
            </div>

            {/* Stats */}
            <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"16px 18px"}}>
              <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1rem",letterSpacing:"0.08em",margin:"0 0 12px"}}>MOMENTUM</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {stats.map((s,i)=>(
                  <div key={i} style={{background:BG,borderRadius:10,padding:"10px 12px"}}>
                    <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.5rem",color:i===0?RED:i===3?"#D97706":BLACK,margin:0,lineHeight:1}}>{s.v}</p>
                    <p style={{fontSize:"0.67rem",color:GRAY,margin:"3px 0 0"}}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* People quick list */}
            <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"16px 18px"}}>
              <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1rem",letterSpacing:"0.08em",margin:"0 0 12px"}}>YOUR PEOPLE</p>
              {[{n:"Marcus",e:"👦",h:92,c:RED},{n:"Emily",e:"💑",h:95,c:SAGE},{n:"Mom",e:"👩",h:87,c:SAGE},{n:"Sarah",e:"👧",h:78,c:SAGE},{n:"Dad",e:"👨",h:71,c:"#D97706"},{n:"Steve",e:"🧔",h:64,c:"#D97706"}].map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,cursor:"pointer"}}>
                  <span style={{fontSize:"1.1rem"}}>{p.e}</span>
                  <span style={{flex:1,fontSize:"0.8rem",fontWeight:600}}>{p.n}</span>
                  <div style={{height:6,width:50,borderRadius:3,background:BORDER,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${p.h}%`,background:p.c,borderRadius:3}}/>
                  </div>
                  <span style={{fontSize:"0.7rem",fontWeight:700,color:p.c}}>{p.h}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
