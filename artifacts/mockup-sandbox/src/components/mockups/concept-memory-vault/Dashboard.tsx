// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const ACCENT_COLORS=[RED,SAGE,BLACK,RED,SAGE,BLACK];
const feed=[
  {emoji:"🧢",name:"Marcus",text:"Got promoted to VP of Sales — big deal for him",ago:"2 weeks ago",followUp:true,usedIn:"Used in Marcus's Birthday Card"},
  {emoji:"💛",name:"Mom",text:"Knee surgery went really well, recovering at home",ago:"1 week ago",followUp:false,usedIn:null},
  {emoji:"🤝",name:"Steve",text:"Started taking guitar lessons — always wanted to learn",ago:"3 weeks ago",followUp:true,usedIn:null},
  {emoji:"👩",name:"Sarah",text:"Her daughter just started kindergarten, emotional week",ago:"4 weeks ago",followUp:false,usedIn:null},
  {emoji:"👔",name:"Dad",text:"Officially retired last month, adjusting to the new rhythm",ago:"5 weeks ago",followUp:true,usedIn:null},
  {emoji:"💼",name:"Jenny",text:"Just closed her biggest deal of the year",ago:"1 week ago",followUp:false,usedIn:null},
];
const upcoming=[
  {name:"Steve",event:"Birthday",days:3,urgent:true},
  {name:"Sarah",event:"Anniversary",days:8,urgent:false},
  {name:"Mom",event:"Mother's Day",days:15,urgent:false},
];

export function Dashboard() {
  const [_,set]=useState(0);void set;
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",color:BLACK}}>
      {/* Nav */}
      <div style={{background:BLACK,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:56,position:"sticky",top:0,zIndex:10}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:WHITE,fontSize:28,letterSpacing:1}}>WHAT'S NEW</span>
        <span style={{fontFamily:"'Bebas Neue',cursive",color:RED,fontSize:18,letterSpacing:0.5}}>F.I. FORGOT</span>
      </div>

      {/* Warning strip */}
      <div style={{background:"#FEF3C7",borderBottom:"1px solid #FDE68A",padding:"10px 24px",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:14}}>↻</span>
        <span style={{fontSize:13,color:"#92400E",fontWeight:600}}>3 follow-ups waiting — answer them before cards are written</span>
        <button style={{marginLeft:"auto",background:"#D97706",color:WHITE,border:"none",borderRadius:6,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Review Now</button>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"22px 20px",display:"flex",gap:20}}>
        {/* Memory feed — 65% */}
        <div style={{flex:"0 0 63%"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:1,margin:0}}>MEMORY FEED</h2>
            <span style={{color:GRAY,fontSize:12}}>6 entries</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {feed.map((f,i)=>(
              <div key={i} style={{background:WHITE,borderRadius:14,padding:"16px 18px",border:`1px solid ${BORDER}`,boxShadow:"0 1px 5px rgba(0,0,0,0.04)",borderLeft:`3px solid ${ACCENT_COLORS[i]}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{background:CREAM,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4,border:`1px solid ${BORDER}`}}>
                    <span>{f.emoji}</span><span>{f.name}</span>
                  </span>
                  <span style={{color:GRAY,fontSize:12,marginLeft:"auto"}}>{f.ago}</span>
                </div>
                <div style={{fontFamily:"'Caveat',cursive",fontSize:17,color:BLACK,lineHeight:1.5,marginBottom:f.followUp||f.usedIn?10:0}}>"{f.text}"</div>
                {(f.followUp||f.usedIn)&&(
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {f.followUp&&<span style={{background:"#FEF3C7",color:"#92400E",border:"1px solid #FDE68A",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>↻ Follow-up due</span>}
                    {f.usedIn&&<span style={{background:SAGE+"18",color:SAGE,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>✓ {f.usedIn}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — 35% */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:WHITE,borderRadius:14,padding:"18px 18px",border:`1px solid ${BORDER}`,boxShadow:"0 1px 5px rgba(0,0,0,0.04)"}}>
            <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,letterSpacing:1,margin:"0 0 14px",color:GRAY}}>UPCOMING</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {upcoming.map(u=>(
                <div key={u.name} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{background:u.urgent?RED:CREAM,color:u.urgent?WHITE:BLACK,borderRadius:6,width:38,height:38,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,border:u.urgent?"none":`1px solid ${BORDER}`}}>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,lineHeight:1}}>{u.days}</div>
                    <div style={{fontSize:7,textTransform:"uppercase",fontWeight:700,opacity:0.75}}>d</div>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{u.name}</div>
                    <div style={{color:GRAY,fontSize:11}}>{u.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button style={{width:"100%",background:SAGE,color:WHITE,border:"none",borderRadius:12,padding:"14px 0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>＋ Log a Moment</button>

          <div style={{background:WHITE,borderRadius:14,padding:"16px 18px",border:`1px solid ${BORDER}`}}>
            <div style={{fontSize:12,fontWeight:700,color:GRAY,marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>This Month</div>
            {[{label:"Memories logged",val:"6"},{label:"Follow-ups answered",val:"3"},{label:"Cards written",val:"2"}].map(s=>(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${BORDER}`}}>
                <span style={{fontSize:12,color:GRAY}}>{s.label}</span>
                <span style={{fontWeight:700,fontSize:13}}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
