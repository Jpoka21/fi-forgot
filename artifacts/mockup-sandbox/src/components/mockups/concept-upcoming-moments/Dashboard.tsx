// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FDF7EF";

const moments=[
  {id:1,name:"Steve",rel:"Friend",event:"Birthday",date:"Jun 14",days:3,emoji:"🤝",status:"Draft ready",sc:SAGE},
  {id:2,name:"Sarah",rel:"Sister",event:"Anniversary",date:"Jun 19",days:8,emoji:"👩",status:"On track",sc:SAGE},
  {id:3,name:"Mom",rel:"Mother",event:"Mother's Day",date:"Jun 26",days:15,emoji:"💛",status:"Add details",sc:"#D97706"},
  {id:4,name:"Marcus",rel:"Friend",event:"Just Because",date:"Jul 3",days:22,emoji:"🧢",status:"On track",sc:SAGE},
  {id:5,name:"Dad",rel:"Father",event:"Father's Day",date:"Jul 9",days:28,emoji:"👔",status:"On track",sc:SAGE},
];
const people=[
  {emoji:"🤝",name:"Steve",rel:"Friend",n:3},
  {emoji:"👩",name:"Sarah",rel:"Sister",n:4},
  {emoji:"💛",name:"Mom",rel:"Mother",n:5},
  {emoji:"🧢",name:"Marcus",rel:"Friend",n:2},
  {emoji:"👔",name:"Dad",rel:"Father",n:4},
  {emoji:"💼",name:"Jenny",rel:"Client",n:2},
];

export function Dashboard() {
  const [_h,setH]=useState<number|null>(null);
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:BG,minHeight:"100vh",color:BLACK}}>
      {/* Nav */}
      <div style={{background:BLACK,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:56,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",color:RED,fontSize:26,letterSpacing:1}}>F.I. FORGOT</span>
          <span style={{fontFamily:"'Caveat',cursive",color:"rgba(255,255,255,0.55)",fontSize:16}}>your next 30 days</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button style={{background:RED,color:WHITE,border:"none",borderRadius:8,padding:"7px 16px",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>+ ADD MOMENT</button>
          <div style={{width:34,height:34,borderRadius:"50%",background:SAGE,display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:700,fontSize:13}}>M</div>
        </div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"24px 20px"}}>
        {/* Stat strip */}
        <div style={{background:BLACK,borderRadius:16,padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
          {[{val:"5",label:"Events ahead",color:RED},{val:"3",label:"Days to next",color:WHITE},{val:"1",label:"Draft waiting",color:SAGE}].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:i<2?16:0}}>
              {i>0&&<div style={{width:1,background:"rgba(255,255,255,0.1)",height:44,marginRight:32}}/>}
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",color:s.color,fontSize:50,lineHeight:1}}>{s.val}</div>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:10,marginTop:3,textTransform:"uppercase",letterSpacing:0.8}}>{s.label}</div>
              </div>
            </div>
          ))}
          <span style={{fontFamily:"'Caveat',cursive",color:"rgba(255,255,255,0.38)",fontSize:19,fontStyle:"italic"}}>We've got it handled.</span>
        </div>

        {/* Timeline */}
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:1,margin:0}}>UPCOMING MOMENTS</h2>
            <span style={{color:GRAY,fontSize:12}}>Next 30 days</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {moments.map(m=>{
              const urgent=m.days<=7;
              const label=m.status==="Draft ready"?"Review Draft":m.status==="Add details"?"Add Details →":"View";
              return (
                <div key={m.id} onMouseEnter={()=>setH(m.id)} onMouseLeave={()=>setH(null)} style={{
                  background:WHITE,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,
                  border:urgent?`2px solid ${RED}`:`1px solid ${BORDER}`,
                  boxShadow:urgent?"0 3px 16px rgba(226,59,46,0.13)":"0 1px 5px rgba(0,0,0,0.04)",cursor:"pointer",
                }}>
                  <div style={{background:urgent?RED:CREAM,color:urgent?WHITE:BLACK,borderRadius:10,width:56,height:56,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,lineHeight:1}}>{m.days}</div>
                    <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:0.4,fontWeight:700,opacity:0.75}}>days</div>
                  </div>
                  <div style={{fontSize:30}}>{m.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontWeight:700,fontSize:15}}>{m.name}</span>
                      <span style={{color:GRAY,fontSize:12}}>{m.rel}</span>
                    </div>
                    <div style={{color:GRAY,fontSize:13,marginTop:2}}>{m.event} · {m.date}</div>
                  </div>
                  <span style={{background:m.sc+"1e",color:m.sc,borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:700,flexShrink:0}}>{m.status}</span>
                  <button style={{background:urgent?RED:"transparent",color:urgent?WHITE:BLACK,border:urgent?"none":`1.5px solid ${BORDER}`,borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",flexShrink:0}}>{label}</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* People grid */}
        <div>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:1,margin:"0 0 14px"}}>YOUR PEOPLE</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {people.map(p=>(
              <div key={p.name} style={{background:WHITE,borderRadius:12,padding:"14px 16px",border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
                <div style={{fontSize:26}}>{p.emoji}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                  <div style={{color:GRAY,fontSize:12}}>{p.rel}</div>
                  <div style={{color:GRAY,fontSize:11,marginTop:1}}>{p.n} events / yr</div>
                </div>
              </div>
            ))}
            <div style={{border:`2px dashed ${SAGE}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:SAGE,cursor:"pointer"}}>
              <span style={{fontSize:20,fontWeight:700}}>+</span>
              <span style={{fontWeight:700,fontSize:13}}>Add Person</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
