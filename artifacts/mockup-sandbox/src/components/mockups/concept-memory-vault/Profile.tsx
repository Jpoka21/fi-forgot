// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

type TabKey="all"|"memories"|"cards"|"followups";
const TABS:Array<{key:TabKey;label:string}>=[
  {key:"all",label:"All"},
  {key:"memories",label:"Memories"},
  {key:"cards",label:"Cards"},
  {key:"followups",label:"Follow-ups"},
];

type EntryType="card"|"memory"|"followup";
const timeline:{type:EntryType;date:string;title:string;excerpt:string;badge?:string;actionLabel?:string}[]=[
  {type:"card",date:"May 2025",title:"Mother's Day Card 2025",excerpt:"You've always known exactly how to make a house feel like home — every room you've walked into is better for it."},
  {type:"memory",date:"May 2025",title:"Knee surgery — recovering well at home",excerpt:"",badge:"↻ Follow-up due"},
  {type:"followup",date:"May 2025",title:"You mentioned her recovery",excerpt:"How is she feeling now, a few weeks out from the surgery?",actionLabel:"Answer →"},
  {type:"memory",date:"Mar 2025",title:"Started her garden again after years away",excerpt:""},
  {type:"card",date:"Nov 2024",title:"Birthday Card 2024",excerpt:"The way you can make an ordinary Tuesday feel like a celebration is something I've never been able to explain."},
  {type:"memory",date:"Oct 2024",title:"Celebrated 40 years with Dad",excerpt:""},
];

const typeColor:Record<EntryType,string>={card:SAGE,memory:BLACK,followup:"#D97706"};
const typeIcon:Record<EntryType,string>={card:"💌",memory:"📝",followup:"↻"};

export function Profile() {
  const [activeTab,setActiveTab]=useState<TabKey>("all");
  const filtered=timeline.filter(e=>{
    if(activeTab==="all")return true;
    if(activeTab==="memories")return e.type==="memory";
    if(activeTab==="cards")return e.type==="card";
    if(activeTab==="followups")return e.type==="followup";
    return true;
  });
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",color:BLACK}}>
      <div style={{background:BLACK,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:56}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:WHITE,fontSize:24,letterSpacing:1}}>WHAT'S NEW</span>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:RED,fontSize:16}}>F.I. FORGOT</span>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"24px 20px"}}>
        <div style={{color:GRAY,fontSize:13,marginBottom:20,cursor:"pointer"}}>← Back</div>

        {/* Hero */}
        <div style={{background:WHITE,borderRadius:20,padding:"24px 28px",border:`1px solid ${BORDER}`,marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:BLACK,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>💛</div>
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:38,letterSpacing:1,lineHeight:1}}>MOM</div>
              <div style={{display:"flex",gap:8,marginTop:6}}>
                <span style={{background:BLACK,color:WHITE,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:700}}>Mother</span>
                <span style={{background:"#FEF3C7",color:"#92400E",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>↻ 1 follow-up due</span>
              </div>
            </div>
            <div style={{marginLeft:"auto",textAlign:"right"}}>
              <div style={{fontSize:11,color:GRAY}}>Memories logged</div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:SAGE}}>8</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,background:WHITE,borderRadius:12,padding:"4px",border:`1px solid ${BORDER}`,marginBottom:16}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{
              flex:1,border:"none",borderRadius:8,padding:"8px 0",cursor:"pointer",
              background:activeTab===t.key?BLACK:"transparent",
              color:activeTab===t.key?WHITE:GRAY,
              fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:13,
              transition:"background 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {filtered.map((e,i)=>(
            <div key={i} style={{display:"flex",gap:14,paddingBottom:16,marginBottom:0}}>
              {/* Timeline spine */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:28,flexShrink:0}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:typeColor[e.type],display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontSize:12,flexShrink:0}}>{typeIcon[e.type]}</div>
                {i<filtered.length-1&&<div style={{width:2,flex:1,background:BORDER,minHeight:16,marginTop:4}}/>}
              </div>
              {/* Content */}
              <div style={{flex:1,paddingBottom:i<filtered.length-1?4:0}}>
                {e.type==="followup"?(
                  <div style={{background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:14,padding:"14px 16px"}}>
                    <div style={{fontSize:11,color:"#92400E",fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>Follow-up · {e.date}</div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{e.title}</div>
                    <div style={{fontFamily:"'Caveat',cursive",fontSize:15,color:"#78350F",marginBottom:10}}>{e.excerpt}</div>
                    <button style={{background:"#D97706",color:WHITE,border:"none",borderRadius:7,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{e.actionLabel}</button>
                  </div>
                ):(
                  <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"14px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                    <div style={{fontSize:11,color:GRAY,fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:0.3}}>{e.date}</div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:e.excerpt?6:0}}>{e.title}</div>
                    {e.excerpt&&<div style={{fontFamily:"'Caveat',cursive",fontSize:15,color:GRAY,fontStyle:"italic"}}>"{e.excerpt}"</div>}
                    {e.badge&&<span style={{display:"inline-block",marginTop:8,background:"#FEF3C7",color:"#92400E",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{e.badge}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button style={{width:"100%",marginTop:8,background:SAGE,color:WHITE,border:"none",borderRadius:12,padding:"14px 0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>＋ Log a Moment</button>
      </div>
    </div>
  );
}
