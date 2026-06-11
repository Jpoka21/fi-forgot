import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FAF4EC";

const feed=[
  {id:1,p:"Steve",  e:"👦",color:"#DBEAFE",text:"Started guitar lessons — working on chord progressions in his garage after work.",date:"4 days ago",type:"memory",   follow:"Ask how the lessons are going"},
  {id:2,p:"Mom",    e:"👩",color:"#FCE7F3",text:"Knee surgery went well — says she's already walking better than before.",date:"1 week ago",type:"memory",  follow:null},
  {id:3,p:"Marcus", e:"👦",color:"#FEE2E2",text:"Birthday in 3 days! You sent him a card last year that he still has on his fridge.",date:"3 days away",type:"upcoming",follow:"Send birthday card"},
  {id:4,p:"Dad",    e:"👨",color:"#FEF3C7",text:"Mentioned he's been stress-eating. Joked about wanting to get back into fishing.",date:"2 weeks ago",type:"memory",  follow:"Ask if he's been fishing yet"},
  {id:5,p:"Sarah",  e:"👧",color:"#D1FAE5",text:"New job at Fidelity going really well — already got a good review at 90 days.",date:"3 weeks ago",type:"memory",  follow:null},
  {id:6,p:"Emily",  e:"💑",color:"#EDE9FE",text:"Planned a surprise anniversary dinner at a vineyard. Loves Italian food.",date:"1 month ago",type:"memory",  follow:null},
];

export default function Dashboard(){
  const [filter,setFilter]=useState("all");
  const filtered=filter==="all"?feed:filter==="followup"?feed.filter(f=>f.follow):feed.filter(f=>f.type==="upcoming");
  const [hov,setHov]=useState(0);
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* NAV */}
      <div style={{background:BLACK,padding:"13px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
          <span style={{color:"#555",fontSize:"0.7rem",letterSpacing:"0.1em"}}>RELATIONSHIP AUTOPILOT</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {["Home","People","Moments","Points"].map(t=>(
            <span key={t} style={{padding:"5px 13px",borderRadius:6,fontSize:"0.76rem",color:t==="Home"?WHITE:"#888",background:t==="Home"?RED:"transparent",cursor:"pointer",fontWeight:t==="Home"?700:400}}>{t}</span>
          ))}
          <div style={{width:30,height:30,borderRadius:"50%",background:RED,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,marginLeft:6}}>JM</div>
        </div>
      </div>

      {/* HERO */}
      <div style={{background:CREAM,borderBottom:`1px solid ${BORDER}`,padding:"24px 32px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.8rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>WHAT'S NEW</p>
          <p style={{color:GRAY,fontSize:"0.84rem",margin:"5px 0 0"}}>6 updates from your people · <span style={{color:RED,fontWeight:700}}>3 follow-ups waiting</span></p>
        </div>
        <button style={{background:BLACK,color:WHITE,border:"none",borderRadius:10,padding:"11px 20px",fontWeight:700,fontSize:"0.84rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",gap:8}}>
          <span>📝</span> Log a Moment
        </button>
      </div>

      <div style={{padding:"22px 32px",maxWidth:1040,margin:"0 auto"}}>
        {/* FILTER */}
        <div style={{display:"flex",gap:6,marginBottom:18}}>
          {[["all","All Updates"],["followup","Follow-ups 🎯"],["upcoming","Upcoming ⚡"]].map(([id,label])=>(
            <button key={id} onClick={()=>setFilter(id)} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${filter===id?BLACK:BORDER}`,background:filter===id?BLACK:WHITE,color:filter===id?WHITE:GRAY,fontSize:"0.77rem",fontWeight:filter===id?700:400,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{label}</button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:22}}>
          {/* FEED */}
          <div style={{display:"flex",flexDirection:"column" as const,gap:12}}>
            {filtered.map((item,i)=>(
              <div key={item.id} onMouseEnter={()=>setHov(item.id)} onMouseLeave={()=>setHov(0)}
                style={{background:WHITE,border:`1px solid ${hov===item.id?GRAY:BORDER}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",boxShadow:hov===item.id?"0 3px 16px rgba(0,0,0,0.07)":"none",transition:"all 0.12s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:34,height:34,borderRadius:9,background:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>{item.e}</div>
                  <div>
                    <p style={{fontWeight:700,fontSize:"0.86rem",margin:0}}>{item.p}</p>
                    <p style={{fontSize:"0.68rem",color:GRAY,margin:"1px 0 0"}}>{item.date}</p>
                  </div>
                  {item.type==="upcoming"&&<span style={{marginLeft:"auto",background:"#FEE2E2",color:RED,borderRadius:20,padding:"2px 10px",fontSize:"0.68rem",fontWeight:700}}>⚡ Upcoming</span>}
                </div>
                <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.15rem",color:BLACK,margin:"0 0 10px",lineHeight:1.5,paddingLeft:4}}>{item.text}</p>
                {item.follow&&(
                  <div style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:"0.85rem"}}>🎯</span>
                      <span style={{fontSize:"0.77rem",color:BLACK}}>{item.follow}</span>
                    </div>
                    <button style={{background:item.type==="upcoming"?RED:SAGE,color:WHITE,border:"none",borderRadius:7,padding:"5px 12px",fontWeight:700,fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                      {item.type==="upcoming"?"Send Card →":"Do it →"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* SIDEBAR */}
          <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
            <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:14,padding:"16px 18px"}}>
              <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.1rem",letterSpacing:"0.07em",margin:"0 0 12px"}}>YOUR PEOPLE</h3>
              {[
                {n:"Marcus",e:"👦",col:"#FEE2E2",status:"Birthday in 3 days"},
                {n:"Steve",  e:"👦",col:"#DBEAFE",status:"Guitar lesson update"},
                {n:"Mom",    e:"👩",col:"#FCE7F3",status:"Knee surgery recovery"},
                {n:"Dad",    e:"👨",col:"#FEF3C7",status:"Follow-up waiting"},
                {n:"Sarah",  e:"👧",col:"#D1FAE5",status:"New job milestone"},
                {n:"Emily",  e:"💑",col:"#EDE9FE",status:"Anniversary in 28 days"},
              ].map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:9,marginBottom:8,cursor:"pointer"}}>
                  <div style={{width:30,height:30,borderRadius:8,background:p.col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem"}}>{p.e}</div>
                  <div>
                    <p style={{fontWeight:700,fontSize:"0.8rem",margin:0}}>{p.n}</p>
                    <p style={{fontSize:"0.67rem",color:GRAY,margin:"1px 0 0"}}>{p.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:BLACK,border:`1px solid ${BORDER}`,borderRadius:14,padding:"16px 18px"}}>
              <h3 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.05rem",letterSpacing:"0.07em",margin:"0 0 4px",color:WHITE}}>MEMORY VAULT</h3>
              <p style={{fontSize:"0.74rem",color:"#888",margin:"0 0 12px"}}>Everything your people have told you</p>
              {[{v:"38",l:"Memories logged"},{v:"14",l:"Cards sent"},{v:"3",l:"Follow-ups due"}].map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<2?`1px solid #333`:"none"}}>
                  <span style={{fontSize:"0.76rem",color:"#aaa"}}>{s.l}</span>
                  <span style={{fontSize:"0.76rem",fontWeight:700,color:WHITE}}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
