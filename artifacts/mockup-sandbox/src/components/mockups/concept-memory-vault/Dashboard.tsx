import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const feed=[
  {
    emoji:"🧢",name:"Marcus",rel:"Friend",
    date:"2 days ago",
    text:"Marcus just got promoted to Senior Engineer. He texted me about it — said it's been a long time coming.",
    followUp:{label:"💌 Send congrats card",urgent:true},
    tag:"Life Update",tagColor:SAGE,
  },
  {
    emoji:"💛",name:"Mom",rel:"Mom",
    date:"4 days ago",
    text:"Mom's knee surgery went well. She's home and in PT twice a week. Says the pain is manageable but she gets tired fast.",
    followUp:{label:"📞 Check in this week",urgent:true},
    tag:"Health",tagColor:"#ef4444",
  },
  {
    emoji:"🤝",name:"Steve",rel:"Friend",
    date:"1 week ago",
    text:"Steve started guitar lessons — finally following through on that resolution he's had for 3 years. Apparently he's terrible but loves it.",
    followUp:{label:"💬 Ask how it's going",urgent:false},
    tag:"Hobby",tagColor:"#8b5cf6",
  },
  {
    emoji:"👩",name:"Sarah",rel:"Sister",
    date:"2 weeks ago",
    text:"Sarah's daughter Lily started kindergarten. She posted a picture of Lily in her backpack — adorable. Sarah seemed emotional about it.",
    followUp:null,
    tag:"Family",tagColor:"#f59e0b",
  },
  {
    emoji:"👔",name:"Dad",rel:"Dad",
    date:"3 weeks ago",
    text:"Dad mentioned he's been reading a lot more since retiring. Got into historical fiction — specifically a series about Rome. Totally his vibe.",
    followUp:{label:"📚 Note for next card",urgent:false},
    tag:"Interest",tagColor:"#3b82f6",
  },
];

const recentPeople=[
  {emoji:"💛",name:"Mom",last:"4d"},
  {emoji:"🧢",name:"Marcus",last:"2d"},
  {emoji:"🤝",name:"Steve",last:"1w"},
  {emoji:"👩",name:"Sarah",last:"2w"},
  {emoji:"👔",name:"Dad",last:"3w"},
];

export function Dashboard() {
  const [logText,setLogText]=useState("");
  return (
    <div style={{background:BG,minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      <div style={{background:BLACK,height:54,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",position:"sticky",top:0,zIndex:10}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.45rem",color:RED,letterSpacing:"0.08em"}}>F.I. FORGOT</span>
        <div style={{width:30,height:30,borderRadius:"50%",background:RED,display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:700,fontSize:"0.78rem"}}>M</div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 22px 48px",display:"grid",gridTemplateColumns:"1fr 260px",gap:24,alignItems:"start"}}>
        {/* Main feed */}
        <div>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:18}}>
            <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.4rem",letterSpacing:"0.04em",color:BLACK,margin:0}}>What's New</h1>
            <span style={{fontFamily:"'Caveat',cursive",fontSize:"1rem",color:GRAY}}>5 recent updates</span>
          </div>

          {/* Log a moment */}
          <div style={{background:WHITE,borderRadius:14,padding:"16px 18px",border:`1px solid ${BORDER}`,marginBottom:18}}>
            <input
              value={logText}
              onChange={e=>setLogText(e.target.value)}
              placeholder="Log a moment... (e.g. 'Mom just got back from Florida')"
              style={{width:"100%",border:"none",background:"none",fontSize:"0.9rem",color:BLACK,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",boxSizing:"border-box" as const}}
            />
            {logText && (
              <div style={{marginTop:12,display:"flex",gap:6,justifyContent:"flex-end"}}>
                <button onClick={()=>setLogText("")} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${BORDER}`,background:"none",color:GRAY,fontSize:"0.8rem",cursor:"pointer"}}>Cancel</button>
                <button style={{padding:"6px 14px",borderRadius:8,border:"none",background:BLACK,color:WHITE,fontSize:"0.8rem",fontWeight:700,cursor:"pointer"}}>Save Moment →</button>
              </div>
            )}
          </div>

          {/* Feed */}
          <div style={{display:"flex",flexDirection:"column" as const,gap:12}}>
            {feed.map((item,i)=>(
              <div key={i} style={{background:WHITE,borderRadius:14,padding:"18px 20px",border:`1px solid ${BORDER}`,boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
                  <div style={{fontSize:"1.5rem",lineHeight:1,marginTop:2}}>{item.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                      <span style={{fontWeight:700,fontSize:"0.95rem"}}>{item.name}</span>
                      <span style={{fontSize:"0.78rem",color:GRAY}}>{item.rel}</span>
                      <span style={{fontSize:"0.72rem",fontWeight:700,padding:"2px 8px",borderRadius:99,background:`${item.tagColor}18`,color:item.tagColor}}>{item.tag}</span>
                      <span style={{marginLeft:"auto",fontSize:"0.75rem",color:GRAY}}>{item.date}</span>
                    </div>
                    <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.08rem",color:BLACK,lineHeight:1.6,margin:0}}>{item.text}</p>
                  </div>
                </div>
                {item.followUp && (
                  <div style={{
                    marginTop:2,padding:"8px 12px",borderRadius:9,
                    background:item.followUp.urgent?`${RED}08`:`${BLACK}04`,
                    border:`1px solid ${item.followUp.urgent?`${RED}25`:`${BLACK}10`}`,
                    display:"flex",alignItems:"center",justifyContent:"space-between",
                  }}>
                    <span style={{fontSize:"0.82rem",fontWeight:600,color:item.followUp.urgent?RED:BLACK}}>{item.followUp.label}</span>
                    <button style={{background:item.followUp.urgent?RED:"transparent",color:item.followUp.urgent?WHITE:GRAY,border:`1px solid ${item.followUp.urgent?RED:BORDER}`,borderRadius:7,padding:"4px 12px",fontSize:"0.76rem",fontWeight:600,cursor:"pointer"}}>Do it →</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
          <div style={{background:WHITE,borderRadius:14,padding:"18px",border:`1px solid ${BORDER}`}}>
            <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.1rem",letterSpacing:"0.05em",color:BLACK,margin:"0 0 14px"}}>Your People</h3>
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {recentPeople.map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"4px 0"}}>
                  <span style={{fontSize:"1.3rem"}}>{p.emoji}</span>
                  <span style={{fontWeight:600,fontSize:"0.88rem",flex:1}}>{p.name}</span>
                  <span style={{fontSize:"0.74rem",color:GRAY}}>updated {p.last}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:`${SAGE}0d`,borderRadius:14,padding:"16px",border:`1.5px dashed ${SAGE}45`,textAlign:"center" as const}}>
            <div style={{fontFamily:"'Caveat',cursive",fontSize:"1.05rem",color:SAGE,marginBottom:8}}>2 follow-ups waiting</div>
            <button style={{background:SAGE,color:WHITE,border:"none",borderRadius:9,padding:"8px 18px",fontWeight:700,fontSize:"0.82rem",cursor:"pointer"}}>Review Now →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
