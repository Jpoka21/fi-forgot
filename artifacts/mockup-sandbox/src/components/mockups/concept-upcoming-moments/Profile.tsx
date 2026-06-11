import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FAF4EC";

const upcomingMoments=[
  {ev:"Birthday",date:"Jul 5",d:24,year:2026},
  {ev:"Christmas",date:"Dec 25",d:197,year:2026},
];
const cardHistory=[
  {ev:"Birthday",date:"Jul 5, 2025",msg:"Sent a handwritten card — 'Happy Birthday, you old man 🎉'",status:"delivered"},
  {ev:"Christmas",date:"Dec 25, 2024",msg:"Card sent — 'Merry Christmas, Steve. Catch up soon.'",status:"delivered"},
  {ev:"Birthday",date:"Jul 5, 2024",msg:"Card sent — 'Another year wiser. Drinks soon.'",status:"delivered"},
];
const notes=[
  "Started guitar lessons in March 2026",
  "Big into trail running lately",
  "Wife is Amy, daughter is Lily (age 4)",
  "College roommates — met Aug 2012",
];

export default function Profile(){
  const [tab,setTab]=useState<"moments"|"history"|"notes">("moments");
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* NAV */}
      <div style={{background:BLACK,padding:"13px 32px",display:"flex",alignItems:"center",gap:12}}>
        <button style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"0.82rem",padding:0}}>← Back</button>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
      </div>

      {/* HERO HEADER */}
      <div style={{background:CREAM,borderBottom:`1px solid ${BORDER}`,padding:"28px 32px 24px"}}>
        <div style={{maxWidth:840,margin:"0 auto",display:"flex",alignItems:"flex-start",gap:22}}>
          <div style={{width:72,height:72,borderRadius:18,background:SAGE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",boxShadow:"0 4px 16px rgba(91,140,107,0.25)"}}>🧔</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"baseline",gap:12}}>
              <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.4rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>STEVE</h1>
              <span style={{background:SAGE,color:WHITE,borderRadius:20,padding:"3px 12px",fontSize:"0.73rem",fontWeight:700,letterSpacing:"0.04em"}}>FRIEND</span>
            </div>
            <p style={{color:GRAY,fontSize:"0.82rem",margin:"5px 0 0"}}>Friend since 2012 · 14 cards sent · Last card Jul 2025</p>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button style={{background:RED,color:WHITE,border:"none",borderRadius:9,padding:"8px 18px",fontWeight:700,fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Send a Card</button>
              <button style={{background:WHITE,color:BLACK,border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 16px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Log Moment</button>
              <button style={{background:WHITE,color:BLACK,border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 16px",fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Edit Profile</button>
            </div>
          </div>
          {/* Health score */}
          <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"16px 20px",textAlign:"center" as const,minWidth:110}}>
            <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.2rem",color:SAGE,margin:0,lineHeight:1}}>64%</p>
            <p style={{fontSize:"0.68rem",color:GRAY,margin:"4px 0 0",textTransform:"uppercase" as const,letterSpacing:"0.07em"}}>Relationship<br/>Health</p>
          </div>
        </div>
      </div>

      <div style={{padding:"24px 32px",maxWidth:840,margin:"0 auto"}}>
        {/* TABS */}
        <div style={{display:"flex",gap:2,marginBottom:22,background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:4,width:"fit-content" as const}}>
          {(["moments","history","notes"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 18px",borderRadius:7,border:"none",background:tab===t?BLACK:"transparent",color:tab===t?WHITE:GRAY,fontWeight:tab===t?700:400,fontSize:"0.8rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",textTransform:"capitalize" as const}}>{t}</button>
          ))}
        </div>

        {tab==="moments"&&(
          <div>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",letterSpacing:"0.07em",margin:"0 0 14px"}}>STEVE'S UPCOMING MOMENTS</h2>
            <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
              {upcomingMoments.map((m,i)=>(
                <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:16,borderLeft:`4px solid ${m.d<=14?RED:SAGE}`}}>
                  <div style={{minWidth:54,height:54,borderRadius:10,background:m.d<=14?"#FEE2E2":"#EDF5F0",display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.3rem",color:m.d<=14?RED:SAGE,lineHeight:1}}>{m.date.split(" ")[1]}</span>
                    <span style={{fontSize:"0.6rem",color:GRAY,textTransform:"uppercase" as const,letterSpacing:"0.07em"}}>{m.date.split(" ")[0]}</span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:"0.92rem",margin:0}}>{m.ev} {m.year}</p>
                    <p style={{fontSize:"0.76rem",color:GRAY,margin:"3px 0 0"}}>In {m.d} days</p>
                  </div>
                  <button style={{background:RED,color:WHITE,border:"none",borderRadius:9,padding:"8px 16px",fontWeight:700,fontSize:"0.8rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Send Card</button>
                </div>
              ))}
            </div>
            <button style={{marginTop:14,width:"100%",background:"none",border:`2px dashed ${BORDER}`,borderRadius:12,padding:"12px",fontSize:"0.8rem",color:GRAY,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>+ Add a Moment for Steve</button>
          </div>
        )}

        {tab==="history"&&(
          <div>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",letterSpacing:"0.07em",margin:"0 0 14px"}}>CARDS SENT</h2>
            <div style={{display:"flex",flexDirection:"column" as const,gap:2}}>
              {cardHistory.map((c,i)=>(
                <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"14px 18px",display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"#EDF5F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0}}>💌</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <p style={{fontWeight:700,fontSize:"0.84rem",margin:0}}>{c.ev}</p>
                      <span style={{background:"#EDF5F0",color:SAGE,borderRadius:20,padding:"2px 8px",fontSize:"0.68rem",fontWeight:600}}>✓ {c.status}</span>
                    </div>
                    <p style={{fontSize:"0.75rem",color:GRAY,margin:"3px 0 0"}}>{c.date}</p>
                    <p style={{fontSize:"0.78rem",color:BLACK,margin:"5px 0 0",fontStyle:"italic"}}>{c.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="notes"&&(
          <div>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",letterSpacing:"0.07em",margin:"0 0 14px"}}>WHAT WE KNOW ABOUT STEVE</h2>
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {notes.map((n,i)=>(
                <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 16px",display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:"0.9rem",marginTop:1}}>📝</span>
                  <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.1rem",color:BLACK,margin:0,lineHeight:1.4}}>{n}</p>
                </div>
              ))}
            </div>
            <button style={{marginTop:12,width:"100%",background:"none",border:`2px dashed ${BORDER}`,borderRadius:10,padding:"11px",fontSize:"0.78rem",color:GRAY,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>+ Add a note</button>
          </div>
        )}
      </div>
    </div>
  );
}
