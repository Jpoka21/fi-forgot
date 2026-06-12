// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";
const DARK_SAGE="#3d6b4f";

function Ring({pct,size,color}:{pct:number;size:number;color:string}){
  const r=(size-6)/2;
  const c=2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BORDER} strokeWidth={4}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${c*pct/100} ${c}`} strokeLinecap="round"/>
    </svg>
  );
}

const people=[
  {emoji:"👩",name:"Sarah",rel:"Sister",health:82,ring:DARK_SAGE,next:"Anniversary · 8 days",action:"Review Draft →"},
  {emoji:"🧢",name:"Marcus",rel:"Friend",health:42,ring:RED,next:"Birthday · 3 days",action:"Write Card →"},
  {emoji:"🤝",name:"Steve",rel:"Friend",health:76,ring:SAGE,next:"Birthday · 3 days",action:"Review Draft →"},
  {emoji:"💛",name:"Mom",rel:"Mother",health:54,ring:"#D97706",next:"Mother's Day · 15 days",action:"Add Details →"},
  {emoji:"👔",name:"Dad",rel:"Father",health:78,ring:SAGE,next:"Father's Day · 28 days",action:"View →"},
  {emoji:"💼",name:"Jenny",rel:"Client",health:88,ring:DARK_SAGE,next:"Work Anniv · 45 days",action:"View →"},
];

const navItems=[
  {icon:"👥",label:"People",active:true},
  {icon:"🗓",label:"Moments",active:false},
  {icon:"💌",label:"Cards",active:false},
  {icon:"⚙️",label:"Settings",active:false},
];

export function Mobile() {
  const [expanded,setExpanded]=useState<string|null>(null);
  const [activeTab,setActiveTab]=useState(0);
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",maxWidth:390,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:BLACK,padding:"14px 20px",flexShrink:0}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",color:WHITE,fontSize:26,letterSpacing:1}}>YOUR PEOPLE</div>
        <div style={{color:"rgba(255,255,255,0.45)",fontSize:12,marginTop:2}}>6 people · 1 needs attention</div>
      </div>

      {/* People list */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {people.map(p=>{
            const isOpen=expanded===p.name;
            return (
              <div key={p.name} style={{background:WHITE,borderRadius:14,border:`1px solid ${BORDER}`,overflow:"hidden",boxShadow:"0 1px 5px rgba(0,0,0,0.04)"}}>
                <div onClick={()=>setExpanded(isOpen?null:p.name)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer"}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:CREAM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`2px solid ${BORDER}`,flexShrink:0}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15}}>{p.name}</div>
                    <div style={{color:GRAY,fontSize:12}}>{p.rel}</div>
                  </div>
                  <div style={{width:12,height:12,borderRadius:"50%",background:p.ring,flexShrink:0}}/>
                  <div style={{color:GRAY,fontSize:14,marginLeft:4}}>{isOpen?"▲":"▼"}</div>
                </div>
                {isOpen&&(
                  <div style={{borderTop:`1px solid ${BORDER}`,padding:"16px 16px 14px",background:CREAM}}>
                    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
                      <div style={{position:"relative",flexShrink:0}}>
                        <Ring pct={p.health} size={56} color={p.ring}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:9,fontWeight:800,color:p.ring}}>{p.health}%</span>
                        </div>
                      </div>
                      <div>
                        <div style={{fontWeight:600,fontSize:13}}>{p.next}</div>
                        <div style={{color:GRAY,fontSize:11,marginTop:2}}>Last contact: 4 days ago</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button style={{flex:2,background:p.ring===RED?RED:SAGE,color:WHITE,border:"none",borderRadius:8,padding:"10px 0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>{p.action}</button>
                      <button style={{flex:1,background:"transparent",color:BLACK,border:`1.5px solid ${BORDER}`,borderRadius:8,padding:"10px 0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>Profile</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,background:BLACK,display:"flex",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        {navItems.map((t,i)=>(
          <button key={i} onClick={()=>setActiveTab(i)} style={{flex:1,background:"none",border:"none",padding:"10px 0 12px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:activeTab===i?RED:"rgba(255,255,255,0.4)",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
