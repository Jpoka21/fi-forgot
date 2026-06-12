// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

function AmbientRing(){
  const r=19;const c=2*Math.PI*r;
  return (
    <svg width={48} height={48} style={{transform:"rotate(-90deg)"}}>
      <circle cx={24} cy={24} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={5}/>
      <circle cx={24} cy={24} r={r} fill="none" stroke={SAGE} strokeWidth={5}
        strokeDasharray={`${c*0.76} ${c}`} strokeLinecap="round"/>
    </svg>
  );
}

const queue=[
  {num:2,text:"Answer follow-up about Steve's guitar lessons",chip:"2 min",chipColor:SAGE},
  {num:3,text:"Review Sarah's anniversary card draft",chip:"Draft ready",chipColor:"#D97706"},
  {num:4,text:"Add details for Mom's Mother's Day card",chip:"15 days",chipColor:GRAY},
];

export function Dashboard() {
  const [_,set]=useState(0);void set;
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",color:BLACK}}>
      {/* Nav */}
      <div style={{background:BLACK,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:56,position:"sticky",top:0,zIndex:10}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:RED,fontSize:26,letterSpacing:1}}>F.I. FORGOT</span>
        <span style={{fontFamily:"'Caveat',cursive",color:"rgba(255,255,255,0.45)",fontSize:15}}>We got your important people</span>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"24px 20px"}}>
        {/* Hero action card */}
        <div style={{background:BLACK,borderRadius:24,padding:"28px 28px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
          {/* subtle texture */}
          <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 80% 20%, rgba(91,140,107,0.12) 0%, transparent 60%)",pointerEvents:"none"}}/>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,position:"relative"}}>
            <span style={{background:RED,color:WHITE,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:800,letterSpacing:0.5}}>TODAY · ACTION 1 OF 4</span>
            <div style={{position:"relative"}}>
              <AmbientRing/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",transform:"rotate(90deg)"}}>
                <span style={{fontSize:9,fontWeight:800,color:SAGE}}>76%</span>
              </div>
            </div>
          </div>
          <div style={{position:"relative",marginBottom:8}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",color:WHITE,fontSize:42,lineHeight:1.05,letterSpacing:0.5}}>
              SEND MARCUS<br/>A BIRTHDAY CARD
            </div>
          </div>
          <div style={{fontFamily:"'Caveat',cursive",color:"rgba(255,255,255,0.55)",fontSize:17,marginBottom:24}}>Birthday · June 14 · 3 days away</div>
          <button style={{width:"100%",background:RED,color:WHITE,border:"none",borderRadius:14,padding:"16px 0",fontFamily:"'Bebas Neue',cursive",fontSize:22,letterSpacing:1,cursor:"pointer"}}>
            Write His Card →
          </button>
        </div>

        {/* Action queue */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {queue.map(q=>(
            <div key={q.num} style={{background:WHITE,borderRadius:14,padding:"14px 18px",border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:14,cursor:"pointer",boxShadow:"0 1px 5px rgba(0,0,0,0.04)"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:BLACK,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',cursive",fontSize:16,flexShrink:0}}>{q.num}</div>
              <span style={{flex:1,fontSize:14,fontWeight:500}}>{q.text}</span>
              <span style={{background:q.chipColor+"20",color:q.chipColor,borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:700,flexShrink:0}}>{q.chip}</span>
              <span style={{color:GRAY,fontSize:18,fontWeight:300,flexShrink:0}}>→</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",color:GRAY,fontSize:12}}>
          6 people · 5 healthy · <strong style={{color:RED}}>1 priority</strong>
        </div>
      </div>
    </div>
  );
}
