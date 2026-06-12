// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const DARK_SAGE="#3d6b4f";

type RingProps={pct:number;size:number;color:string;trackColor?:string};
function Ring({pct,size,color,trackColor=BORDER}:RingProps){
  const r=(size-10)/2;
  const c=2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={7}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${c*pct/100} ${c}`} strokeLinecap="round"/>
    </svg>
  );
}

const persons=[
  {emoji:"👩",name:"Sarah",rel:"Sister",health:82,ring:DARK_SAGE,ringLabel:"Excellent",next:"Anniversary in 8 days",action:"Review Draft →",priority:false},
  {emoji:"💛",name:"Mom",rel:"Mother",health:54,ring:"#D97706",ringLabel:"Needs Attention",next:"Mother's Day in 15 days",action:"Add Details →",priority:false},
  {emoji:"🤝",name:"Steve",rel:"Friend",health:76,ring:SAGE,ringLabel:"Healthy",next:"Birthday in 3 days",action:"Review Draft →",priority:false},
  {emoji:"🧢",name:"Marcus",rel:"Friend",health:42,ring:RED,ringLabel:"Priority",next:"Birthday in 3 days",action:"Write Card →",priority:true},
  {emoji:"👔",name:"Dad",rel:"Father",health:78,ring:SAGE,ringLabel:"Healthy",next:"Father's Day in 28 days",action:"View →",priority:false},
  {emoji:"💼",name:"Jenny",rel:"Client",health:88,ring:DARK_SAGE,ringLabel:"Excellent",next:"Work Anniv in 45 days",action:"View →",priority:false},
];

export function Dashboard() {
  const [_,set]=useState(0);void set;
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",color:BLACK}}>
      {/* Nav */}
      <div style={{background:BLACK,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:56,position:"sticky",top:0,zIndex:10}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:WHITE,fontSize:28,letterSpacing:1}}>YOUR PEOPLE</span>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:RED,fontSize:18,letterSpacing:0.5}}>F.I. FORGOT</span>
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"22px 20px"}}>
        {/* Summary strip */}
        <div style={{background:WHITE,borderRadius:12,padding:"12px 20px",border:`1px solid ${BORDER}`,marginBottom:22,display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {[DARK_SAGE,SAGE,SAGE,SAGE,"#D97706",RED].map((c,i)=>(
              <div key={i} style={{width:10,height:10,borderRadius:"50%",background:c}}/>
            ))}
          </div>
          <span style={{fontSize:13,color:GRAY}}>5 people healthy · <strong style={{color:RED}}>1 needs attention</strong></span>
          <button style={{marginLeft:"auto",background:SAGE,color:WHITE,border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>+ Add Person</button>
        </div>

        {/* Person cards grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {persons.map(p=>(
            <div key={p.name} style={{
              background:WHITE,borderRadius:16,padding:"20px 20px 16px",
              border:p.priority?`2px solid ${RED}`:`1px solid ${BORDER}`,
              boxShadow:p.priority?"0 3px 16px rgba(226,59,46,0.1)":"0 1px 5px rgba(0,0,0,0.04)",
              position:"relative",overflow:"hidden",cursor:"pointer",
            }}>
              {p.priority&&<div style={{position:"absolute",top:0,left:0,width:4,height:"100%",background:RED,borderRadius:"0 0 0 0"}}/>}
              <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:CREAM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,border:`2px solid ${BORDER}`}}>{p.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,lineHeight:1,letterSpacing:0.5}}>{p.name}</div>
                  <span style={{background:BLACK,color:WHITE,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>{p.rel}</span>
                </div>
                <div style={{position:"relative",flexShrink:0}}>
                  <Ring pct={p.health} size={52} color={p.ring}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",transform:"rotate(0deg)"}}>
                    <span style={{fontSize:10,fontWeight:800,color:p.ring}}>{p.health}%</span>
                  </div>
                </div>
              </div>
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
                <div style={{fontSize:12,color:GRAY,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{background:p.ring+"18",color:p.ring,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>{p.ringLabel}</span>
                </div>
                <div style={{fontSize:12,color:GRAY}}>{p.next}</div>
                <div style={{fontSize:11,color:GRAY,opacity:0.7}}>Last updated 4 days ago</div>
              </div>
              <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${BORDER}`}}>
                <button style={{width:"100%",background:p.priority?RED:CREAM,color:p.priority?WHITE:BLACK,border:"none",borderRadius:8,padding:"9px 0",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{p.action}</button>
              </div>
            </div>
          ))}
          <div style={{border:`2px dashed ${SAGE}`,borderRadius:16,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,color:SAGE,cursor:"pointer",minHeight:180}}>
            <span style={{fontSize:32}}>+</span>
            <span style={{fontWeight:700,fontSize:14}}>Add Person</span>
          </div>
        </div>
      </div>
    </div>
  );
}
