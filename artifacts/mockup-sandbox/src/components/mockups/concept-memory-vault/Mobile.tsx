import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF";

const feed=[
  {p:"Steve",  e:"👦",col:"#DBEAFE",text:"Started guitar lessons — working on chord progressions.", date:"4 days ago",follow:true},
  {p:"Marcus", e:"👦",col:"#FEE2E2",text:"Birthday in 3 days! Last card still on his fridge.",     date:"urgent",    follow:true},
  {p:"Mom",    e:"👩",col:"#FCE7F3",text:"Knee surgery went well. Says she's walking better.",       date:"1 week ago", follow:false},
  {p:"Dad",    e:"👨",col:"#FEF3C7",text:"Mentioned wanting to get back into fishing.",               date:"2 weeks ago",follow:true},
  {p:"Sarah",  e:"👧",col:"#D1FAE5",text:"New job at Fidelity — 90 day review went great.",          date:"3 weeks ago",follow:false},
];

export default function Mobile(){
  const [tab,setTab]=useState("home");
  const [logOpen,setLogOpen]=useState(false);
  return(
    <div style={{width:"100%",height:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",flexDirection:"column" as const,overflow:"hidden",position:"relative" as const}}>
      {/* STATUS */}
      <div style={{background:BLACK,padding:"10px 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
        <div style={{width:26,height:26,borderRadius:"50%",background:RED,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.62rem",fontWeight:700}}>JM</div>
      </div>

      {/* HEADER */}
      <div style={{background:WHITE,borderBottom:`1px solid ${BORDER}`,padding:"12px 16px"}}>
        <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>WHAT'S NEW</p>
        <p style={{fontSize:"0.72rem",color:GRAY,margin:"3px 0 0"}}>5 updates · <span style={{color:RED,fontWeight:700}}>3 follow-ups waiting</span></p>
      </div>

      {/* FEED */}
      <div style={{flex:1,overflowY:"auto" as const,padding:"10px 14px",display:"flex",flexDirection:"column" as const,gap:9}}>
        {feed.map((item,i)=>(
          <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:13,padding:"12px 13px",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
              <div style={{width:32,height:32,borderRadius:8,background:item.col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem"}}>{item.e}</div>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,fontSize:"0.82rem",margin:0}}>{item.p}</p>
                <p style={{fontSize:"0.66rem",color:item.date==="urgent"?RED:GRAY,margin:"1px 0 0",fontWeight:item.date==="urgent"?700:400}}>{item.date==="urgent"?"⚡ 3 days away":item.date}</p>
              </div>
            </div>
            <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.08rem",color:BLACK,margin:"0 0 8px",lineHeight:1.45}}>{item.text}</p>
            {item.follow&&(
              <div style={{display:"flex",gap:6}}>
                <button style={{flex:1,background:item.date==="urgent"?RED:SAGE,color:WHITE,border:"none",borderRadius:7,padding:"7px",fontWeight:700,fontSize:"0.7rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  {item.date==="urgent"?"Send Card →":"Follow up →"}
                </button>
                <button style={{background:BG,color:GRAY,border:`1px solid ${BORDER}`,borderRadius:7,padding:"7px 10px",fontSize:"0.7rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Skip</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={()=>setLogOpen(!logOpen)}
        style={{position:"absolute" as const,bottom:76,right:18,width:52,height:52,borderRadius:"50%",background:BLACK,color:WHITE,border:"none",cursor:"pointer",fontSize:"1.4rem",boxShadow:"0 4px 16px rgba(0,0,0,0.22)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
        📝
      </button>

      {/* LOG SHEET */}
      {logOpen&&(
        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.4)",zIndex:20,display:"flex",alignItems:"flex-end"}} onClick={()=>setLogOpen(false)}>
          <div style={{background:WHITE,borderRadius:"16px 16px 0 0",padding:"20px 18px 32px",width:"100%"}} onClick={e=>e.stopPropagation()}>
            <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.4rem",letterSpacing:"0.06em",margin:"0 0 14px"}}>LOG A MOMENT</p>
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {["Marcus 👦","Steve 🧔","Mom 👩","Dad 👨","Sarah 👧","Emily 💑"].map(p=>(
                <button key={p} style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:"11px 14px",textAlign:"left" as const,fontSize:"0.84rem",fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      )}

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
