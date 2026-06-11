import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF";

const feed=[
  {emoji:"🧢",name:"Marcus",tag:"Life Update",tagColor:"#22c55e",date:"2d",text:"Marcus just got promoted to Senior Engineer. Long time coming.",followUp:"💌 Send congrats card",urgent:true},
  {emoji:"💛",name:"Mom",tag:"Health",tagColor:"#ef4444",date:"4d",text:"Knee surgery went well. Home now, doing PT. Gets tired faster.",followUp:"📞 Check in this week",urgent:true},
  {emoji:"🤝",name:"Steve",tag:"Hobby",tagColor:"#8b5cf6",date:"1w",text:"Steve started guitar lessons. Says he's terrible but loves it.",followUp:"💬 Ask how it's going",urgent:false},
  {emoji:"👩",name:"Sarah",tag:"Family",tagColor:"#f59e0b",date:"2w",text:"Lily started kindergarten. Sarah seemed emotional about it.",followUp:null,urgent:false},
];

const navItems=[
  {icon:"🏠",label:"Home"},
  {icon:"👥",label:"People"},
  {icon:"",label:"",fab:true},
  {icon:"💌",label:"Cards"},
  {icon:"⚙️",label:"Settings"},
];

export function Mobile() {
  const [activeNav,setActiveNav]=useState(0);
  return (
    <div style={{width:390,height:844,background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK,display:"flex",flexDirection:"column" as const,overflow:"hidden",position:"relative" as const,borderRadius:40,boxShadow:"0 8px 48px rgba(0,0,0,0.18)"}}>
      <div style={{background:BLACK,padding:"14px 22px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.2rem",color:RED,letterSpacing:"0.08em"}}>F.I. FORGOT</span>
        <span style={{fontSize:"0.72rem",color:"#ffffff55"}}>9:41 AM</span>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"18px 16px 80px"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:16}}>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",letterSpacing:"0.04em",color:BLACK,margin:0}}>What's New</h2>
          <span style={{fontFamily:"'Caveat',cursive",fontSize:"0.9rem",color:GRAY}}>2 follow-ups</span>
        </div>

        <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
          {feed.map((item,i)=>(
            <div key={i} style={{background:WHITE,borderRadius:14,padding:"15px 16px",border:`1px solid ${BORDER}`,boxShadow:"0 1px 5px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
                <div style={{fontSize:"1.45rem",lineHeight:1,marginTop:1}}>{item.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontWeight:700,fontSize:"0.88rem"}}>{item.name}</span>
                    <span style={{fontSize:"0.68rem",fontWeight:600,padding:"2px 7px",borderRadius:99,background:`${item.tagColor}18`,color:item.tagColor}}>{item.tag}</span>
                    <span style={{marginLeft:"auto",fontSize:"0.7rem",color:GRAY}}>{item.date}</span>
                  </div>
                  <p style={{fontFamily:"'Caveat',cursive",fontSize:"1rem",color:BLACK,lineHeight:1.55,margin:0}}>{item.text}</p>
                </div>
              </div>
              {item.followUp && (
                <div style={{
                  padding:"7px 10px",borderRadius:8,
                  background:item.urgent?`${RED}08`:`${BLACK}04`,
                  border:`1px solid ${item.urgent?`${RED}25`:`${BLACK}10`}`,
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                }}>
                  <span style={{fontSize:"0.78rem",fontWeight:600,color:item.urgent?RED:BLACK}}>{item.followUp}</span>
                  <span style={{fontSize:"0.76rem",color:item.urgent?RED:GRAY,cursor:"pointer",fontWeight:700}}>→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button style={{
        position:"absolute" as const,right:20,bottom:82,
        width:52,height:52,borderRadius:"50%",
        background:RED,border:"none",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:"1.5rem",color:WHITE,cursor:"pointer",
        boxShadow:`0 4px 18px ${RED}55`,
      }}>+</button>

      <div style={{background:WHITE,borderTop:`1px solid ${BORDER}`,padding:"8px 6px 16px",display:"flex",justifyContent:"space-around",alignItems:"center",position:"absolute" as const,bottom:0,left:0,right:0}}>
        {navItems.map((n,i)=>
          n.fab
            ? <div key={i} style={{width:48}}/>
            : <button key={i} onClick={()=>setActiveNav(i)} style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",opacity:activeNav===i?1:0.4}}>
                <span style={{fontSize:"1.2rem"}}>{n.icon}</span>
                <span style={{fontSize:"0.6rem",fontWeight:700,color:activeNav===i?RED:GRAY}}>{n.label}</span>
              </button>
        )}
      </div>
    </div>
  );
}
