import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const upcomingMoments=[
  {event:"Birthday",date:"Jun 14",days:3,status:"draft",note:"Draft is ready to review"},
  {event:"Christmas",date:"Dec 25",days:197,status:"on-track",note:"On track"},
];

const pastCards=[
  {event:"Birthday",date:"Jun 14, 2025",msg:"Happy birthday, bud! Hope this year is your best yet.",tone:"Funny",delivery:"Mailed"},
  {event:"Christmas",date:"Dec 22, 2024",msg:"Wishing you the warmest holiday season. Grateful for our friendship.",tone:"Sweet",delivery:"Mailed"},
  {event:"Birthday",date:"Jun 14, 2024",msg:"Another year older, still my favorite person to grab coffee with.",tone:"Funny",delivery:"Mailed"},
];

export function Profile() {
  const [tab,setTab]=useState<"upcoming"|"history">("upcoming");
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* Nav */}
      <div style={{background:BLACK,height:54,display:"flex",alignItems:"center",gap:14,padding:"0 22px"}}>
        <button style={{background:"none",border:"none",color:"#ffffff80",fontSize:"1.1rem",cursor:"pointer",padding:0}}>←</button>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.35rem",color:RED,letterSpacing:"0.06em"}}>F.I. FORGOT</span>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"28px 22px 48px"}}>

        {/* Person header */}
        <div style={{background:WHITE,borderRadius:18,padding:"26px 28px",border:`1px solid ${BORDER}`,marginBottom:20,display:"flex",gap:20,alignItems:"center"}}>
          <div style={{width:68,height:68,borderRadius:18,background:`${SAGE}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.2rem",border:`2px solid ${SAGE}25`}}>🤝</div>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2rem",letterSpacing:"0.03em",color:BLACK,margin:0,lineHeight:1}}>Steve</h1>
            <div style={{fontSize:"0.88rem",color:GRAY,marginTop:4}}>Friend · Since 2018 · 3 events per year</div>
            <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap" as const}}>
              <span style={{fontSize:"0.76rem",fontWeight:600,padding:"3px 10px",borderRadius:99,background:`${SAGE}15`,color:SAGE}}>🎂 Birthday Jun 14</span>
              <span style={{fontSize:"0.76rem",fontWeight:600,padding:"3px 10px",borderRadius:99,background:`${BLACK}08`,color:GRAY}}>🎄 Christmas</span>
              <span style={{fontSize:"0.76rem",fontWeight:600,padding:"3px 10px",borderRadius:99,background:`${BLACK}08`,color:GRAY}}>💌 Just Because</span>
            </div>
          </div>
          <button style={{background:RED,color:WHITE,border:"none",borderRadius:10,padding:"10px 20px",fontFamily:"'Bebas Neue',cursive",fontSize:"0.92rem",letterSpacing:"0.06em",cursor:"pointer"}}>EDIT PROFILE</button>
        </div>

        {/* Urgency alert */}
        <div style={{background:`${RED}0e`,borderRadius:12,padding:"14px 18px",marginBottom:20,border:`1.5px solid ${RED}30`,display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:"1.4rem"}}>⚡</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:"0.95rem",color:RED}}>Steve's birthday is in 3 days</div>
            <div style={{fontSize:"0.83rem",color:GRAY,marginTop:2}}>A draft is ready for your review — approve it and we'll handle the rest.</div>
          </div>
          <button style={{background:RED,color:WHITE,border:"none",borderRadius:9,padding:"9px 18px",fontWeight:700,fontSize:"0.84rem",cursor:"pointer",whiteSpace:"nowrap" as const}}>Review Draft →</button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:16,background:WHITE,borderRadius:10,padding:4,border:`1px solid ${BORDER}`}}>
          {(["upcoming","history"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",
              fontWeight:700,fontSize:"0.84rem",
              background:tab===t?BLACK:"transparent",
              color:tab===t?WHITE:GRAY,
              letterSpacing:"0.04em",
              transition:"all 0.15s",
            }}>{t==="upcoming"?"Upcoming Moments":"Card History"}</button>
          ))}
        </div>

        {tab==="upcoming" && (
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {upcomingMoments.map((m,i)=>(
              <div key={i} style={{background:WHITE,borderRadius:13,padding:"16px 20px",border:`1.5px solid ${m.days<=7?`${RED}35`:BORDER}`,display:"flex",alignItems:"center",gap:16}}>
                <div style={{minWidth:52,textAlign:"center" as const,background:m.days<=7?RED:CREAM,borderRadius:9,padding:"8px 4px"}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.4rem",color:m.days<=7?WHITE:BLACK,lineHeight:1}}>{m.days}</div>
                  <div style={{fontSize:"0.62rem",color:m.days<=7?"#ffffff90":GRAY,fontWeight:700}}>DAYS</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"1rem"}}>{m.event}</div>
                  <div style={{fontSize:"0.82rem",color:GRAY,marginTop:2}}>{m.date} — {m.note}</div>
                </div>
                <button style={{background:m.days<=7?RED:"transparent",color:m.days<=7?WHITE:RED,border:`1.5px solid ${m.days<=7?RED:`${RED}40`}`,borderRadius:9,padding:"7px 16px",fontSize:"0.82rem",fontWeight:700,cursor:"pointer"}}>
                  {m.status==="draft"?"Review →":"View →"}
                </button>
              </div>
            ))}
            <button style={{background:`${SAGE}0e`,borderRadius:12,padding:"14px",border:`1.5px dashed ${SAGE}50`,display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",color:SAGE,fontWeight:700,fontSize:"0.9rem"}}>
              ＋ Add a moment for Steve
            </button>
          </div>
        )}

        {tab==="history" && (
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {pastCards.map((c,i)=>(
              <div key={i} style={{background:WHITE,borderRadius:13,padding:"18px 20px",border:`1px solid ${BORDER}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <span style={{fontWeight:700,fontSize:"0.95rem"}}>{c.event}</span>
                    <span style={{fontSize:"0.8rem",color:GRAY,marginLeft:8}}>{c.date}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <span style={{fontSize:"0.72rem",fontWeight:600,padding:"2px 8px",borderRadius:99,background:`${SAGE}15`,color:SAGE}}>{c.tone}</span>
                    <span style={{fontSize:"0.72rem",fontWeight:600,padding:"2px 8px",borderRadius:99,background:`${BLACK}08`,color:GRAY}}>{c.delivery}</span>
                  </div>
                </div>
                <div style={{fontFamily:"'Caveat',cursive",fontSize:"1.05rem",color:BLACK,lineHeight:1.55,background:CREAM,borderRadius:8,padding:"10px 14px"}}>"{c.msg}"</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
