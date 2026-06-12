// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const cards=[
  {name:"Steve",event:"Birthday",date:"Jun 14",days:3,emoji:"🤝",urgent:true},
  {name:"Sarah",event:"Anniversary",date:"Jun 19",days:8,emoji:"👩",urgent:false},
  {name:"Mom",event:"Mother's Day",date:"Jun 26",days:15,emoji:"💛",urgent:false},
  {name:"Marcus",event:"Just Because",date:"Jul 3",days:22,emoji:"🧢",urgent:false},
  {name:"Dad",event:"Father's Day",date:"Jul 9",days:28,emoji:"👔",urgent:false},
];
const people=[
  {emoji:"🤝",name:"Steve",rel:"Friend",next:3},
  {emoji:"👩",name:"Sarah",rel:"Sister",next:8},
  {emoji:"💛",name:"Mom",rel:"Mother",next:15},
  {emoji:"🧢",name:"Marcus",rel:"Friend",next:22},
  {emoji:"👔",name:"Dad",rel:"Father",next:28},
];
const navItems=[
  {icon:"🗓",label:"Moments",active:true},
  {icon:"👥",label:"People",active:false},
  {icon:"💌",label:"Cards",active:false},
  {icon:"⚙️",label:"Settings",active:false},
];

export function Mobile() {
  const [activeTab,setActiveTab]=useState(0);
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",maxWidth:390,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative"}}>
      {/* Header */}
      <div style={{background:BLACK,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",flexShrink:0}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:RED,fontSize:24,letterSpacing:1}}>F.I. FORGOT</span>
        <span style={{background:RED,color:WHITE,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,letterSpacing:0.5}}>30 DAYS</span>
      </div>

      {/* Scrollable content */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:72}}>
        {/* Horizontal cards */}
        <div style={{padding:"20px 0 4px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",marginBottom:12}}>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:1}}>NEXT UP</span>
            <span style={{color:GRAY,fontSize:11}}>5 moments</span>
          </div>
          <div style={{display:"flex",gap:12,overflowX:"auto",padding:"4px 20px 16px",scrollbarWidth:"none"}}>
            {cards.map((c,i)=>(
              <div key={i} style={{
                minWidth:260,background:WHITE,borderRadius:16,padding:"16px",flexShrink:0,
                border:c.urgent?`2px solid ${RED}`:`1px solid ${BORDER}`,
                boxShadow:c.urgent?"0 3px 14px rgba(226,59,46,0.13)":"0 1px 6px rgba(0,0,0,0.05)",
              }}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{background:c.urgent?RED:CREAM,color:c.urgent?WHITE:BLACK,borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,lineHeight:1}}>{c.days}</span>
                    <span style={{fontSize:9,textTransform:"uppercase",fontWeight:700,opacity:0.8}}>days</span>
                  </div>
                  <span style={{fontSize:32}}>{c.emoji}</span>
                </div>
                <div style={{fontWeight:700,fontSize:16}}>{c.name}</div>
                <div style={{color:GRAY,fontSize:13,marginTop:2}}>{c.event}</div>
                <div style={{color:GRAY,fontSize:12,marginTop:1}}>{c.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* People list */}
        <div style={{padding:"4px 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:1}}>YOUR PEOPLE</span>
            <span style={{color:SAGE,fontSize:12,fontWeight:600}}>See all</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {people.map(p=>(
              <div key={p.name} style={{background:WHITE,borderRadius:12,padding:"12px 16px",border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
                <div style={{fontSize:24}}>{p.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                  <div style={{color:GRAY,fontSize:12}}>{p.rel}</div>
                </div>
                <div style={{background:p.next<=7?RED+"15":CREAM,color:p.next<=7?RED:GRAY,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700}}>
                  {p.next}d
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,background:BLACK,display:"flex",borderTop:`1px solid rgba(255,255,255,0.1)`}}>
        {navItems.map((t,i)=>(
          <button key={i} onClick={()=>setActiveTab(i)} style={{flex:1,background:"none",border:"none",padding:"10px 0 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:activeTab===i?RED:"rgba(255,255,255,0.45)",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
