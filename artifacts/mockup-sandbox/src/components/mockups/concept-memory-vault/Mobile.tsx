// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const ACCENT=[RED,SAGE,BLACK,RED,SAGE,BLACK];
const feed=[
  {emoji:"🧢",name:"Marcus",text:"Got promoted to VP of Sales — big deal for him",ago:"2 weeks ago",followUp:true,usedIn:"Birthday Card"},
  {emoji:"💛",name:"Mom",text:"Knee surgery went really well, recovering at home",ago:"1 week ago",followUp:false,usedIn:null},
  {emoji:"🤝",name:"Steve",text:"Started taking guitar lessons — always wanted to learn",ago:"3 weeks ago",followUp:true,usedIn:null},
  {emoji:"👩",name:"Sarah",text:"Her daughter just started kindergarten, emotional week",ago:"4 weeks ago",followUp:false,usedIn:null},
  {emoji:"👔",name:"Dad",text:"Officially retired last month, adjusting to the rhythm",ago:"5 weeks ago",followUp:true,usedIn:null},
  {emoji:"💼",name:"Jenny",text:"Just closed her biggest deal of the year",ago:"1 week ago",followUp:false,usedIn:null},
];
const navItems=[
  {icon:"📖",label:"Feed",active:true},
  {icon:"👥",label:"People",active:false},
  {icon:"🗓",label:"Moments",active:false},
  {icon:"⚙️",label:"Settings",active:false},
];

export function Mobile() {
  const [activeTab,setActiveTab]=useState(0);
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",maxWidth:390,margin:"0 auto",display:"flex",flexDirection:"column",position:"relative"}}>
      {/* Header */}
      <div style={{background:BLACK,padding:"14px 20px",flexShrink:0}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",color:WHITE,fontSize:26,letterSpacing:1}}>WHAT'S NEW</div>
        <div style={{color:"rgba(255,255,255,0.45)",fontSize:12,marginTop:2}}>6 memories · 3 follow-ups waiting</div>
      </div>

      {/* Warning */}
      <div style={{background:"#FEF3C7",padding:"10px 20px",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:13,color:"#92400E",fontWeight:600,flex:1}}>↻ 3 follow-ups waiting</span>
        <button style={{background:"#D97706",color:WHITE,border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Review</button>
      </div>

      {/* Feed */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 88px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {feed.map((f,i)=>(
            <div key={i} style={{background:WHITE,borderRadius:14,padding:"14px 16px",border:`1px solid ${BORDER}`,borderLeft:`3px solid ${ACCENT[i]}`,boxShadow:"0 1px 5px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{background:CREAM,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4,border:`1px solid ${BORDER}`}}>
                  {f.emoji} {f.name}
                </span>
                <span style={{color:GRAY,fontSize:11,marginLeft:"auto"}}>{f.ago}</span>
              </div>
              <div style={{fontFamily:"'Caveat',cursive",fontSize:16,color:BLACK,lineHeight:1.5}}>"{f.text}"</div>
              {(f.followUp||f.usedIn)&&(
                <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                  {f.followUp&&<span style={{background:"#FEF3C7",color:"#92400E",border:"1px solid #FDE68A",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>↻ Follow-up due</span>}
                  {f.usedIn&&<span style={{background:SAGE+"18",color:SAGE,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>✓ {f.usedIn}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button style={{position:"fixed",bottom:72,right:"calc(50% - 195px + 16px)",width:52,height:52,borderRadius:"50%",background:RED,color:WHITE,border:"none",fontSize:24,cursor:"pointer",boxShadow:"0 4px 16px rgba(226,59,46,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,zIndex:10}}>＋</button>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,background:BLACK,display:"flex",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        {navItems.map((t,i)=>(
          <button key={i} onClick={()=>setActiveTab(i)} style={{flex:1,background:"none",border:"none",padding:"10px 0 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:19}}>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:activeTab===i?RED:"rgba(255,255,255,0.4)",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
