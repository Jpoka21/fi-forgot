// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const actions=[
  {label:"Write Birthday Card",style:"primary",desc:"Birthday · Jun 14 · 3 days"},
  {label:"Answer: How's the new VP role going?",style:"amber",desc:"Follow-up due"},
  {label:"Update mailing address",style:"outline",desc:"Profile gap"},
];
const chips=["Got promoted to VP","Loves craft beer","College roommate 10 yrs","Prefers humor in cards","No small talk"];
const pastCards=[
  {label:"Birthday 2023",date:"Jun 2023"},
  {label:"Just Because",date:"Mar 2022"},
];

export function Profile() {
  const [_,set]=useState(0);void set;
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",color:BLACK}}>
      <div style={{background:BLACK,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:56}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:RED,fontSize:24,letterSpacing:1}}>F.I. FORGOT</span>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"24px 20px"}}>
        <div style={{color:GRAY,fontSize:13,marginBottom:20,cursor:"pointer"}}>← Back</div>

        {/* Hero */}
        <div style={{background:WHITE,borderRadius:20,padding:"24px 28px",border:`1px solid ${BORDER}`,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{width:68,height:68,borderRadius:"50%",background:BLACK,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>🧢</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,letterSpacing:1,lineHeight:1}}>MARCUS</div>
              <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                <span style={{background:BLACK,color:WHITE,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700}}>Friend</span>
                <span style={{background:RED,color:WHITE,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",gap:4}}>
                  🔴 Birthday in 3 days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {actions.map((a,i)=>{
            const isP=a.style==="primary";const isA=a.style==="amber";
            return (
              <div key={i} style={{background:WHITE,borderRadius:14,padding:"16px 18px",border:isP?`2px solid ${RED}`:isA?"1.5px solid #D97706":`1px solid ${BORDER}`,boxShadow:isP?"0 3px 14px rgba(226,59,46,0.12)":"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:isP?RED:isA?"#D97706":GRAY,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',cursive",fontSize:15,flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{a.label}</div>
                    <div style={{color:GRAY,fontSize:12,marginTop:2}}>{a.desc}</div>
                  </div>
                  <button style={{
                    background:isP?RED:isA?"#D97706":"transparent",
                    color:isP||isA?WHITE:BLACK,
                    border:isP||isA?"none":`1.5px solid ${BORDER}`,
                    borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700,
                    cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",flexShrink:0,
                  }}>Go →</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Context divider */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{flex:1,height:1,background:BORDER}}/>
          <span style={{fontFamily:"'Caveat',cursive",color:GRAY,fontSize:17}}>— Context —</span>
          <div style={{flex:1,height:1,background:BORDER}}/>
        </div>

        {/* Memory chips */}
        <div style={{background:WHITE,borderRadius:14,padding:"16px 18px",border:`1px solid ${BORDER}`,marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:11,fontWeight:700,color:GRAY,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>What We Know</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {chips.map(c=>(
              <span key={c} style={{background:CREAM,color:BLACK,border:`1px solid ${BORDER}`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:600}}>{c}</span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{background:CREAM,borderRadius:14,padding:"16px 18px",border:`1px solid ${BORDER}`,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:GRAY,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Notes</div>
          <div style={{fontFamily:"'Caveat',cursive",fontSize:16,color:BLACK,fontStyle:"italic",lineHeight:1.5}}>
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </div>
        </div>

        {/* Past cards */}
        <div style={{background:WHITE,borderRadius:14,padding:"16px 18px",border:`1px solid ${BORDER}`,marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:11,fontWeight:700,color:GRAY,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Past Cards</div>
          {pastCards.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:i<pastCards.length-1?`1px solid ${BORDER}`:"none"}}>
              <span style={{fontSize:13,fontWeight:600}}>{c.label}</span>
              <span style={{color:GRAY,fontSize:12}}>{c.date}</span>
            </div>
          ))}
        </div>

        {/* Completeness */}
        <div style={{padding:"14px 18px",background:WHITE,borderRadius:14,border:`1px solid ${BORDER}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,color:GRAY}}>Profile completeness</span>
            <span style={{fontSize:12,fontWeight:700,color:"#D97706"}}>72%</span>
          </div>
          <div style={{height:6,background:BORDER,borderRadius:4,overflow:"hidden"}}>
            <div style={{width:"72%",height:"100%",background:"#D97706",borderRadius:4}}/>
          </div>
          <div style={{fontSize:11,color:GRAY,marginTop:6}}>Missing: mailing address, interests</div>
        </div>
      </div>
    </div>
  );
}
