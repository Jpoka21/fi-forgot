// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";
const DARK_SAGE="#3d6b4f";

function Ring({pct,size,color}:{pct:number;size:number;color:string}){
  const r=(size-12)/2;
  const c=2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BORDER} strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${c*pct/100} ${c}`} strokeLinecap="round"/>
    </svg>
  );
}

const bars=[
  {label:"Recency",pct:90,color:DARK_SAGE},
  {label:"Consistency",pct:85,color:SAGE},
  {label:"Card Quality",pct:78,color:SAGE},
  {label:"Profile Depth",pct:82,color:SAGE},
];
const pastCards=[
  {label:"Anniversary 2023",excerpt:"Another year of watching you handle everything with grace…"},
  {label:"Birthday 2023",excerpt:"You somehow manage to be the funniest person in the room…"},
  {label:"Christmas 2022",excerpt:"Grateful for every loud family dinner you organize…"},
];

export function Profile() {
  const [_,set]=useState(0);void set;
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",color:BLACK}}>
      <div style={{background:BLACK,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:56}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:WHITE,fontSize:24,letterSpacing:1}}>YOUR PEOPLE</span>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:RED,fontSize:16}}>F.I. FORGOT</span>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"24px 20px"}}>
        <div style={{color:GRAY,fontSize:13,marginBottom:20,cursor:"pointer"}}>← Back</div>

        {/* Hero card */}
        <div style={{background:WHITE,borderRadius:20,padding:"28px",border:`1px solid ${BORDER}`,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:24}}>
            <div style={{position:"relative",flexShrink:0}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:BLACK,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}>👩</div>
              <Ring pct={82} size={96} color={DARK_SAGE}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:38,letterSpacing:1,lineHeight:1}}>SARAH</div>
              <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                <span style={{background:BLACK,color:WHITE,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700}}>Sister</span>
                <span style={{background:DARK_SAGE+"20",color:DARK_SAGE,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>82% Excellent</span>
              </div>
            </div>
          </div>

          {/* Health breakdown */}
          <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${BORDER}`}}>
            <div style={{fontSize:12,fontWeight:700,color:GRAY,textTransform:"uppercase",letterSpacing:0.8,marginBottom:12}}>Health Score Breakdown</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {bars.map(b=>(
                <div key={b.label} style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:13,color:GRAY,width:110,flexShrink:0}}>{b.label}</span>
                  <div style={{flex:1,height:8,background:BORDER,borderRadius:4,overflow:"hidden"}}>
                    <div style={{width:`${b.pct}%`,height:"100%",background:b.color,borderRadius:4}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:b.color,width:34,textAlign:"right"}}>{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Moment */}
        <div style={{background:WHITE,borderRadius:16,padding:"20px 24px",border:`1px solid ${BORDER}`,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,letterSpacing:1,margin:"0 0 12px",color:GRAY}}>NEXT MOMENT</h3>
          <div style={{display:"flex",alignItems:"center",gap:14,background:CREAM,borderRadius:12,padding:"14px 16px",border:`1px solid ${BORDER}`}}>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>Anniversary</div>
              <div style={{color:GRAY,fontSize:13,marginTop:2}}>Jun 19 · 8 days away</div>
            </div>
            <span style={{background:SAGE+"20",color:SAGE,borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:700,marginLeft:"auto"}}>On track</span>
            <button style={{background:SAGE,color:WHITE,border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Review Draft →</button>
          </div>
        </div>

        {/* Card history */}
        <div style={{background:WHITE,borderRadius:16,padding:"20px 24px",border:`1px solid ${BORDER}`,marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,letterSpacing:1,margin:"0 0 14px",color:GRAY}}>CARD HISTORY</h3>
          {pastCards.map((c,i)=>(
            <div key={i} style={{display:"flex",gap:14,paddingBottom:i<pastCards.length-1?14:0,marginBottom:i<pastCards.length-1?14:0,borderBottom:i<pastCards.length-1?`1px solid ${BORDER}`:"none"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:SAGE,marginTop:5,flexShrink:0}}/>
              <div>
                <div style={{fontWeight:700,fontSize:13}}>{c.label}</div>
                <div style={{fontFamily:"'Caveat',cursive",color:GRAY,fontSize:15,marginTop:2,fontStyle:"italic"}}>"{c.excerpt}"</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions + completeness */}
        <div style={{background:WHITE,borderRadius:16,padding:"18px 24px",border:`1px solid ${BORDER}`,marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <button style={{flex:1,background:RED,color:WHITE,border:"none",borderRadius:10,padding:"11px 0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>Send Card</button>
            <button style={{flex:1,background:"transparent",color:SAGE,border:`2px solid ${SAGE}`,borderRadius:10,padding:"11px 0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>Log Moment</button>
            <button style={{flex:1,background:"transparent",color:BLACK,border:`1.5px solid ${BORDER}`,borderRadius:10,padding:"11px 0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>Ask Question</button>
          </div>
          <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:GRAY}}>Profile completeness</span>
              <span style={{fontSize:12,fontWeight:700,color:SAGE}}>88%</span>
            </div>
            <div style={{height:6,background:BORDER,borderRadius:4,overflow:"hidden",marginBottom:6}}>
              <div style={{width:"88%",height:"100%",background:SAGE,borderRadius:4}}/>
            </div>
            <div style={{fontSize:11,color:"#D97706"}}>Missing: mailing address</div>
          </div>
        </div>
      </div>
    </div>
  );
}
