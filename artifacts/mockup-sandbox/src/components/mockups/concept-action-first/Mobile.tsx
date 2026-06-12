// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const nextActions=[
  {num:2,text:"Answer: How's the new VP role going?",chip:"2 min",chipColor:SAGE},
  {num:3,text:"Review Sarah's anniversary card draft",chip:"Draft ready",chipColor:"#D97706"},
];
const navItems=[
  {icon:"⚡",label:"Today",active:true},
  {icon:"👥",label:"People",active:false},
  {icon:"🗓",label:"Moments",active:false},
  {icon:"⚙️",label:"Settings",active:false},
];

export function Mobile() {
  const [activeTab,setActiveTab]=useState(0);
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",maxWidth:390,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      {/* Hero — black, full-height feel */}
      <div style={{background:BLACK,padding:"24px 24px 28px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 70% 30%, rgba(91,140,107,0.14) 0%, transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <span style={{background:RED,color:WHITE,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:800,letterSpacing:0.5,display:"inline-block",marginBottom:20}}>ACTION 1 OF 4</span>
          <div style={{fontSize:52,marginBottom:12,lineHeight:1}}>🧢</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",color:WHITE,fontSize:34,lineHeight:1.05,letterSpacing:0.3,marginBottom:8}}>
            SEND MARCUS<br/>A BIRTHDAY CARD
          </div>
          <div style={{fontFamily:"'Caveat',cursive",color:"rgba(255,255,255,0.55)",fontSize:17,marginBottom:28}}>
            Birthday · June 14 · 3 days
          </div>
          <button style={{width:"100%",background:RED,color:WHITE,border:"none",borderRadius:14,padding:"16px 0",fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:1,cursor:"pointer",marginBottom:16}}>
            Write His Card →
          </button>
          <div style={{textAlign:"center",fontFamily:"'Caveat',cursive",color:"rgba(255,255,255,0.28)",fontSize:15}}>
            swipe for next →
          </div>
        </div>
      </div>

      {/* Queue */}
      <div style={{flex:1,padding:"16px 16px 80px"}}>
        <div style={{fontSize:11,fontWeight:700,color:GRAY,textTransform:"uppercase",letterSpacing:0.6,marginBottom:10}}>Up Next</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {nextActions.map(q=>(
            <div key={q.num} style={{background:WHITE,borderRadius:12,padding:"12px 14px",border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:BLACK,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',cursive",fontSize:14,flexShrink:0}}>{q.num}</div>
              <span style={{flex:1,fontSize:13,fontWeight:500,lineHeight:1.4}}>{q.text}</span>
              <span style={{background:q.chipColor+"20",color:q.chipColor,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:700,flexShrink:0}}>{q.chip}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:16,textAlign:"center",color:GRAY,fontSize:12}}>
          6 people · <strong style={{color:RED}}>1 priority</strong>
        </div>
      </div>

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
