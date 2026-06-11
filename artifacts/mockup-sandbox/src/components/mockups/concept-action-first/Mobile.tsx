import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF";

const heroAction={p:"Marcus",e:"👦",ev:"Birthday",due:"Jun 14",daysAway:3,msg:"Send Marcus a birthday card",context:"His birthday is Saturday — last card is still on his fridge."};
const nextQueue=[
  {p:"Dad",   e:"👨",action:"Father's Day card", days:10},
  {p:"Mom",   e:"👩",action:"Birthday card",      days:11},
  {p:"Sarah", e:"👧",action:"Anniversary card",   days:17},
];

export default function Mobile(){
  const [tab,setTab]=useState("home");
  const [done,setDone]=useState(false);
  return(
    <div style={{width:"100%",height:"100vh",background:BLACK,fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",flexDirection:"column" as const,overflow:"hidden"}}>
      {/* STATUS */}
      <div style={{padding:"10px 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
        <div style={{width:26,height:26,borderRadius:"50%",background:RED,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.62rem",fontWeight:700}}>JM</div>
      </div>

      {/* HERO CARD - FULL WIDTH */}
      <div style={{flex:1,padding:"10px 14px 8px",display:"flex",flexDirection:"column" as const}}>
        <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"0.9rem",letterSpacing:"0.14em",color:"#555",margin:"0 0 8px",textTransform:"uppercase" as const}}>DO THIS NOW</p>

        <div style={{flex:1,background:done?"#1a1a1a":RED,borderRadius:20,padding:"22px 20px",display:"flex",flexDirection:"column" as const,justifyContent:"space-between",transition:"background 0.3s",boxShadow:"0 8px 40px rgba(226,59,46,0.3)"}}>
          <div>
            <div style={{display:"flex",gap:3,marginBottom:14}}>
              {[0,1,2].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i===0?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.25)"}}/>)}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.7rem"}}>{heroAction.e}</div>
              <div>
                <p style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.6)",margin:"0 0 2px",letterSpacing:"0.06em"}}>{heroAction.ev.toUpperCase()}</p>
                <p style={{fontWeight:700,fontSize:"1rem",color:WHITE,margin:0}}>{heroAction.p}</p>
              </div>
              <div style={{marginLeft:"auto",background:"rgba(255,255,255,0.18)",borderRadius:20,padding:"4px 10px"}}>
                <span style={{fontSize:"0.68rem",color:WHITE,fontWeight:700}}>⚡ {heroAction.daysAway}d</span>
              </div>
            </div>
            <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.1rem",color:WHITE,margin:"0 0 10px",letterSpacing:"0.03em",lineHeight:1.1}}>{heroAction.msg.toUpperCase()}</p>
            <p style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.7)",margin:"0 0 0",lineHeight:1.5}}>{heroAction.context}</p>
          </div>

          <div style={{marginTop:16}}>
            {!done?(
              <>
                <button onClick={()=>setDone(true)} style={{width:"100%",background:WHITE,color:RED,border:"none",borderRadius:14,padding:"15px",fontWeight:700,fontSize:"0.95rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:8,letterSpacing:"0.01em"}}>
                  ✉️ Send Birthday Card
                </button>
                <div style={{display:"flex",gap:8}}>
                  <button style={{flex:1,background:"rgba(255,255,255,0.12)",color:WHITE,border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"10px",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Skip</button>
                  <button style={{flex:1,background:"rgba(255,255,255,0.12)",color:WHITE,border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"10px",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Snooze 1d</button>
                </div>
              </>
            ):(
              <div style={{background:"rgba(91,140,107,0.25)",border:"1px solid rgba(91,140,107,0.4)",borderRadius:14,padding:"16px",textAlign:"center" as const}}>
                <p style={{fontSize:"1.3rem",margin:"0 0 6px"}}>✅</p>
                <p style={{fontWeight:700,fontSize:"0.88rem",color:WHITE,margin:"0 0 4px"}}>Done! Card queued for Marcus.</p>
                <p style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.6)",margin:0}}>Delivery by Jun 14</p>
              </div>
            )}
          </div>
        </div>

        {/* NEXT QUEUE */}
        <div style={{marginTop:10}}>
          <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"0.85rem",letterSpacing:"0.1em",color:"#555",margin:"0 0 8px"}}>NEXT UP</p>
          <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
            {nextQueue.map((q,i)=>(
              <div key={i} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,padding:"9px 13px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:"1.1rem"}}>{q.e}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:"0.8rem",fontWeight:600,color:WHITE,margin:0}}>{q.p} — {q.action}</p>
                  <p style={{fontSize:"0.67rem",color:"#666",margin:"1px 0 0"}}>In {q.days} days</p>
                </div>
                <span style={{fontSize:"0.67rem",color:"#555"}}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{background:"#0e0e0e",borderTop:"1px solid #222",padding:"10px 0 14px",display:"flex",justifyContent:"space-around"}}>
        {[{icon:"🏠",label:"Home",id:"home"},{icon:"📅",label:"Moments",id:"moments"},{icon:"👥",label:"People",id:"people"},{icon:"🏆",label:"Points",id:"points"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <span style={{fontSize:"1.2rem"}}>{t.icon}</span>
            <span style={{fontSize:"0.6rem",fontWeight:t.id===tab?700:400,color:t.id===tab?RED:"#555"}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
