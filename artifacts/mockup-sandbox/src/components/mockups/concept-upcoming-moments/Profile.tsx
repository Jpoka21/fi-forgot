// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const upcomingEvents=[
  {event:"Birthday",date:"Jun 14",days:3,urgent:true},
  {event:"Just Because",date:"Jul 3",days:22,urgent:false},
];
const pastCards=[
  {label:"Christmas 2023",excerpt:"Merry Christmas brother, this year you really showed up…"},
  {label:"Birthday 2023",excerpt:"Wishing you the absolute best on your big day…"},
  {label:"Just Because · Feb 2024",excerpt:"Thinking of you and all the stuff we never say…"},
];
const stats=[
  {label:"Cards Sent",val:"5"},
  {label:"Upcoming Events",val:"2"},
  {label:"Years Known",val:"4"},
];

export function Profile() {
  const [_,set]=useState(0);
  void set;
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",color:BLACK}}>
      {/* Nav */}
      <div style={{background:BLACK,display:"flex",alignItems:"center",padding:"0 24px",height:56,gap:16}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:RED,fontSize:24,letterSpacing:1}}>F.I. FORGOT</span>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"24px 20px"}}>
        {/* Back */}
        <div style={{color:GRAY,fontSize:13,marginBottom:20,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
          <span>←</span><span>Dashboard</span>
        </div>

        {/* Hero */}
        <div style={{background:WHITE,borderRadius:20,padding:"28px 28px 24px",border:`1px solid ${BORDER}`,marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:24}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:BLACK,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>🤝</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,letterSpacing:1,lineHeight:1,marginBottom:8}}>STEVE</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{background:BLACK,color:WHITE,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700}}>Friend</span>
                <span style={{background:SAGE+"22",color:SAGE,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>Active</span>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div style={{display:"flex",gap:12,marginTop:24,paddingTop:20,borderTop:`1px solid ${BORDER}`}}>
            {stats.map(s=>(
              <div key={s.label} style={{flex:1,textAlign:"center",background:CREAM,borderRadius:12,padding:"14px 8px",border:`1px solid ${BORDER}`}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:BLACK,lineHeight:1}}>{s.val}</div>
                <div style={{color:GRAY,fontSize:11,marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div style={{background:WHITE,borderRadius:16,padding:"20px 24px",border:`1px solid ${BORDER}`,marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:1,margin:"0 0 14px",color:GRAY}}>UPCOMING MOMENTS</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {upcomingEvents.map(e=>(
              <div key={e.event} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",background:e.urgent?RED+"08":CREAM,borderRadius:12,border:e.urgent?`1.5px solid ${RED}`:`1px solid ${BORDER}`}}>
                <div style={{background:e.urgent?RED:CREAM,color:e.urgent?WHITE:BLACK,borderRadius:8,width:48,height:48,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,border:e.urgent?"none":`1px solid ${BORDER}`}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,lineHeight:1}}>{e.days}</div>
                  <div style={{fontSize:8,textTransform:"uppercase",fontWeight:700,opacity:0.75}}>days</div>
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{e.event}</div>
                  <div style={{color:GRAY,fontSize:12,marginTop:1}}>{e.date}</div>
                </div>
                <button style={{marginLeft:"auto",background:e.urgent?RED:"transparent",color:e.urgent?WHITE:BLACK,border:e.urgent?"none":`1.5px solid ${BORDER}`,borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  {e.urgent?"Review Draft":"View"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Cards */}
        <div style={{background:WHITE,borderRadius:16,padding:"20px 24px",border:`1px solid ${BORDER}`,marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:1,margin:"0 0 16px",color:GRAY}}>PAST CARDS SENT</h3>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {pastCards.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:16,paddingBottom:i<pastCards.length-1?16:0,marginBottom:i<pastCards.length-1?16:0,borderBottom:i<pastCards.length-1?`1px solid ${BORDER}`:"none"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:BLACK,marginTop:4,flexShrink:0}}/>
                  {i<pastCards.length-1&&<div style={{width:2,flex:1,background:BORDER,marginTop:4}}/>}
                </div>
                <div style={{paddingBottom:i<pastCards.length-1?4:0}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{c.label}</div>
                  <div style={{fontFamily:"'Caveat',cursive",color:GRAY,fontSize:15,fontStyle:"italic"}}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{display:"flex",gap:10}}>
          <button style={{flex:1,background:"transparent",color:SAGE,border:`2px solid ${SAGE}`,borderRadius:10,padding:"12px 0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add a Moment</button>
          <button style={{flex:1,background:"transparent",color:BLACK,border:`1.5px solid ${BORDER}`,borderRadius:10,padding:"12px 0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
