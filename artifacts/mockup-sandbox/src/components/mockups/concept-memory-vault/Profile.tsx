import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

type TimelineItem={
  type:"memory"|"card"|"question";
  date:string;
  title:string;
  text:string;
  tag?:string;
  answered?:boolean;
};

const timeline:TimelineItem[]=[
  {type:"memory",date:"Jun 7, 2026",title:"Knee surgery recovery",text:"She's home and doing PT twice a week. Said the pain is manageable now. Getting tired faster than usual but her spirits are good.",tag:"Health"},
  {type:"card",date:"May 12, 2026",title:"Mother's Day card — sent ✓",text:"\"Every year I think I know how much I appreciate you, and every year you prove me wrong. Thank you for everything. Love you, Mom.\""},
  {type:"memory",date:"Apr 3, 2026",title:"Spring visit",text:"Spent the weekend. She made her famous lasagna. We watched an old movie she loves. She seemed really happy — more relaxed than usual.",tag:"Quality Time"},
  {type:"question",date:"Mar 15, 2026",title:"How did the book club go?",text:"She joined a new book club at the library. Asked her about it but never followed up.",answered:false},
  {type:"card",date:"Feb 5, 2026",title:"Birthday card — sent ✓",text:"\"80 years of being the warmest, most steady person in any room. That's not luck — that's who you are. Happy birthday, Mom.\""},
  {type:"card",date:"Dec 22, 2025",title:"Christmas card — sent ✓",text:"\"Christmas isn't Christmas without you. Thank you for always making it feel like home. Love you so much.\""},
];

const typeColor:Record<TimelineItem["type"],string>={memory:SAGE,card:"#3b82f6",question:"#f59e0b"};
const typeIcon:Record<TimelineItem["type"],string>={memory:"📝",card:"💌",question:"❓"};

export function Profile() {
  const [logText,setLogText]=useState("");
  const [showLog,setShowLog]=useState(false);

  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      <div style={{background:BLACK,height:54,display:"flex",alignItems:"center",gap:14,padding:"0 22px"}}>
        <button style={{background:"none",border:"none",color:"#ffffff80",fontSize:"1.1rem",cursor:"pointer",padding:0}}>←</button>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.35rem",color:RED,letterSpacing:"0.06em"}}>F.I. FORGOT</span>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"28px 22px 48px"}}>

        {/* Person header */}
        <div style={{background:WHITE,borderRadius:18,padding:"22px 24px",border:`1px solid ${BORDER}`,marginBottom:18,display:"flex",gap:18,alignItems:"center"}}>
          <div style={{width:62,height:62,borderRadius:16,background:"#fce7f3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",border:"2px solid #fbcfe855"}}>💛</div>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.9rem",letterSpacing:"0.03em",color:BLACK,margin:0,lineHeight:1}}>Mom</h1>
            <div style={{fontSize:"0.84rem",color:GRAY,marginTop:3}}>Mom · 5 events per year · Added Oct 2023</div>
            <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap" as const}}>
              <span style={{fontSize:"0.73rem",fontWeight:600,padding:"3px 10px",borderRadius:99,background:"#fef3c7",color:"#92400e"}}>🔔 Check in after surgery</span>
              <span style={{fontSize:"0.73rem",fontWeight:600,padding:"3px 10px",borderRadius:99,background:`${SAGE}15`,color:SAGE}}>🌸 Mother's Day ✓</span>
            </div>
          </div>
        </div>

        {/* Pending follow-up alert */}
        <div style={{background:"#fffbeb",borderRadius:12,padding:"13px 18px",marginBottom:18,border:"1.5px solid #fde68a",display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:"1.2rem"}}>❓</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:"0.9rem",color:"#92400e"}}>Follow-up waiting</div>
            <div style={{fontSize:"0.8rem",color:"#b45309",marginTop:1}}>How did the book club go? — last asked Mar 15</div>
          </div>
          <button style={{background:"#f59e0b",color:WHITE,border:"none",borderRadius:8,padding:"7px 14px",fontSize:"0.78rem",fontWeight:700,cursor:"pointer"}}>Ask →</button>
        </div>

        {/* Log a moment */}
        <div style={{background:WHITE,borderRadius:12,padding:"14px 18px",marginBottom:18,border:`1px solid ${BORDER}`}}>
          {!showLog
            ? <button onClick={()=>setShowLog(true)} style={{width:"100%",background:"none",border:"none",textAlign:"left" as const,cursor:"pointer",color:GRAY,fontSize:"0.88rem",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                + Log something new about Mom...
              </button>
            : <>
                <textarea
                  value={logText}
                  onChange={e=>setLogText(e.target.value)}
                  placeholder="What's going on with her? A health update, something she mentioned, a milestone..."
                  autoFocus
                  style={{width:"100%",border:"none",background:"none",fontSize:"0.88rem",color:BLACK,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",resize:"none",minHeight:72,boxSizing:"border-box" as const}}
                />
                <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:8}}>
                  <button onClick={()=>{setShowLog(false);setLogText("");}} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${BORDER}`,background:"none",color:GRAY,fontSize:"0.8rem",cursor:"pointer"}}>Cancel</button>
                  <button style={{padding:"6px 14px",borderRadius:8,border:"none",background:BLACK,color:WHITE,fontSize:"0.8rem",fontWeight:700,cursor:"pointer"}}>Save →</button>
                </div>
              </>
          }
        </div>

        {/* Timeline */}
        <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.4rem",letterSpacing:"0.04em",color:BLACK,margin:"0 0 16px"}}>Memory Timeline</h2>

        <div style={{position:"relative" as const}}>
          {/* Vertical line */}
          <div style={{position:"absolute" as const,left:20,top:0,bottom:0,width:2,background:`${BLACK}10`}}/>

          <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
            {timeline.map((item,i)=>(
              <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                {/* Icon dot */}
                <div style={{
                  minWidth:40,height:40,borderRadius:"50%",
                  background:typeColor[item.type],
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"1rem",zIndex:1,
                  boxShadow:`0 0 0 3px ${BG}`,
                }}>
                  {typeIcon[item.type]}
                </div>

                <div style={{flex:1,background:WHITE,borderRadius:12,padding:"14px 16px",border:`1px solid ${item.type==="question"&&!item.answered?"#fde68a":BORDER}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <span style={{fontWeight:700,fontSize:"0.9rem"}}>{item.title}</span>
                      {item.tag && <span style={{marginLeft:8,fontSize:"0.7rem",fontWeight:600,padding:"2px 7px",borderRadius:99,background:`${typeColor[item.type]}15`,color:typeColor[item.type]}}>{item.tag}</span>}
                    </div>
                    <span style={{fontSize:"0.73rem",color:GRAY,whiteSpace:"nowrap" as const,marginLeft:8}}>{item.date}</span>
                  </div>
                  <p style={{fontFamily:item.type==="card"?"'Caveat',cursive":"'Plus Jakarta Sans',sans-serif",fontSize:item.type==="card"?"1.05rem":"0.85rem",color:BLACK,lineHeight:1.6,margin:0,background:item.type==="card"?CREAM:"none",borderRadius:item.type==="card"?8:0,padding:item.type==="card"?"8px 12px":0}}>{item.text}</p>
                  {item.type==="question"&&!item.answered&&(
                    <button style={{marginTop:8,background:"#f59e0b",color:WHITE,border:"none",borderRadius:7,padding:"5px 12px",fontSize:"0.76rem",fontWeight:700,cursor:"pointer"}}>Log her answer →</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
