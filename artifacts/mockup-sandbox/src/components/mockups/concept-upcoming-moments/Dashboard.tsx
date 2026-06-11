import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF",CREAM="#FAF4EC",AMBER="#D97706";

const moments=[
  {p:"Marcus",e:"👦",ev:"Birthday",date:"Jun 14",d:3, rel:"Friend", urgent:true },
  {p:"Dad",   e:"👨",ev:"Father's Day",date:"Jun 21",d:10,rel:"Father",urgent:false},
  {p:"Mom",   e:"👩",ev:"Birthday",date:"Jun 22",d:11,rel:"Mother",urgent:false},
  {p:"Sarah", e:"👧",ev:"Anniversary",date:"Jun 28",d:17,rel:"Sister",urgent:false},
  {p:"Steve", e:"🧔",ev:"Birthday",date:"Jul 5", d:24,rel:"Friend",urgent:false},
  {p:"Emily", e:"💑",ev:"Anniversary",date:"Jul 9", d:28,rel:"Wife",  urgent:false},
];
const people=[
  {n:"Marcus",e:"👦",r:"Friend", h:92,next:"Birthday · 3 days"},
  {n:"Sarah", e:"👧",r:"Sister", h:78,next:"Anniversary · 17 days"},
  {n:"Mom",   e:"👩",r:"Mother", h:87,next:"Birthday · 11 days"},
  {n:"Steve", e:"🧔",r:"Friend", h:64,next:"Birthday · 24 days"},
  {n:"Dad",   e:"👨",r:"Father", h:71,next:"Father's Day · 10 days"},
  {n:"Emily", e:"💑",r:"Wife",   h:95,next:"Anniversary · 28 days"},
];
const calEvents:{[k:number]:string}={14:RED,21:SAGE,22:SAGE,28:SAGE};
const accent=(d:number)=>d<=7?RED:d<=14?AMBER:SAGE;

export default function Dashboard(){
  const [hov,setHov]=useState("");
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
            <span key={t} style={{padding:"5px 13px",borderRadius:6,fontSize:"0.76rem",color:t==="Moments"?WHITE:"#888",background:t==="Moments"?RED:"transparent",cursor:"pointer",fontWeight:t==="Moments"?700:400}}>{t}</span>
          ))}
          <div style={{width:30,height:30,borderRadius:"50%",background:RED,color:WHITE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,marginLeft:6}}>JM</div>
        </div>
      </div>

      {/* HERO */}
      <div style={{background:CREAM,borderBottom:`1px solid ${BORDER}`,padding:"26px 32px 20px"}}>
        <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.8rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>YOUR NEXT 30 DAYS</p>
        <p style={{color:GRAY,fontSize:"0.84rem",margin:"6px 0 0"}}>6 moments coming up — <strong style={{color:RED}}>1 needs your attention today</strong></p>
      </div>

      <div style={{padding:"22px 32px",maxWidth:1060,margin:"0 auto"}}>
        {/* URGENT */}
        <div style={{background:RED,borderRadius:14,padding:"15px 22px",marginBottom:24,display:"flex",alignItems:"center",gap:16,boxShadow:"0 4px 20px rgba(226,59,46,0.22)"}}>
          <div style={{width:42,height:42,borderRadius:10,background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem"}}>⚡</div>
          <div>
            <p style={{color:WHITE,fontWeight:700,fontSize:"0.97rem",margin:0}}>Marcus's birthday is in 3 days</p>
            <p style={{color:"rgba(255,255,255,0.72)",fontSize:"0.78rem",margin:"3px 0 0"}}>Order a handwritten card today — guaranteed delivery by Jun 14</p>
          </div>
          <button style={{marginLeft:"auto",background:WHITE,color:RED,border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,fontSize:"0.84rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:"nowrap" as const}}>Send Card Now →</button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:22}}>
          {/* TIMELINE */}
          <div>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",letterSpacing:"0.08em",margin:"0 0 13px",display:"flex",alignItems:"center",gap:8}}>
              UPCOMING MOMENTS
              <span style={{background:RED,color:WHITE,borderRadius:20,padding:"2px 9px",fontSize:"0.68rem",letterSpacing:0,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700}}>6</span>
            </h2>
            <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
              {moments.map((m,i)=>(
                <div key={i} onMouseEnter={()=>setHov(m.p)} onMouseLeave={()=>setHov("")}
                  style={{background:WHITE,border:`1px solid ${hov===m.p?accent(m.d):BORDER}`,borderRadius:12,padding:"11px 16px",display:"flex",alignItems:"center",gap:13,borderLeft:`4px solid ${accent(m.d)}`,cursor:"pointer",boxShadow:hov===m.p?"0 2px 12px rgba(0,0,0,0.07)":"none",transition:"all 0.12s"}}>
                  <div style={{minWidth:46,height:46,borderRadius:9,background:m.urgent?"#FEE2E2":m.d<=14?"#FEF9EE":"#EDF5F0",display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.2rem",color:accent(m.d),lineHeight:1}}>{m.date.split(" ")[1]}</span>
                    <span style={{fontSize:"0.58rem",color:GRAY,textTransform:"uppercase" as const,letterSpacing:"0.07em"}}>{m.date.split(" ")[0]}</span>
                  </div>
                  <span style={{fontSize:"1.5rem"}}>{m.e}</span>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:"0.88rem",margin:0}}>{m.p}</p>
                    <p style={{fontSize:"0.73rem",color:GRAY,margin:"2px 0 0"}}>{m.ev} · {m.rel}</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column" as const,alignItems:"flex-end",gap:4}}>
                    <span style={{padding:"3px 9px",borderRadius:20,background:m.urgent?"#FEE2E2":m.d<=14?"#FEF3C7":"#EDF5F0",color:accent(m.d),fontSize:"0.7rem",fontWeight:700}}>
                      {m.urgent?"🔴 ":""}{m.d}d
                    </span>
                    <button style={{background:"none",border:`1px solid ${BORDER}`,borderRadius:6,padding:"3px 9px",fontSize:"0.68rem",color:GRAY,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Send card</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COL */}
          <div style={{display:"flex",flexDirection:"column" as const,gap:18}}>
            {/* People list */}
            <div>
              <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.25rem",letterSpacing:"0.08em",margin:"0 0 12px"}}>YOUR PEOPLE</h2>
              <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
                {people.map((p,i)=>(
                  <div key={i} style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"9px 13px",display:"flex",alignItems:"center",gap:9,cursor:"pointer"}}>
                    <span style={{fontSize:"1.2rem"}}>{p.e}</span>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:700,fontSize:"0.82rem",margin:0}}>{p.n}</p>
                      <p style={{fontSize:"0.68rem",color:GRAY,margin:"1px 0 0"}}>📅 {p.next}</p>
                    </div>
                    <div style={{fontSize:"0.76rem",fontWeight:700,color:p.h>=80?SAGE:p.h>=65?AMBER:RED}}>{p.h}%</div>
                  </div>
                ))}
              </div>
              <button style={{marginTop:10,width:"100%",background:"none",border:`2px dashed ${BORDER}`,borderRadius:10,padding:"9px",fontSize:"0.77rem",color:GRAY,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>+ Add Person</button>
            </div>

            {/* Mini calendar */}
            <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderRadius:12,padding:"14px 16px"}}>
              <p style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1rem",letterSpacing:"0.07em",margin:"0 0 10px"}}>JUNE 2026</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                {["M","T","W","T","F","S","S"].map((d,i)=>(
                  <div key={i} style={{textAlign:"center" as const,fontSize:"0.6rem",color:GRAY,fontWeight:700,paddingBottom:4}}>{d}</div>
                ))}
                {[...Array(2)].map((_,i)=><div key={`e${i}`}/>)}
                {[...Array(30)].map((_,i)=>{
                  const day=i+1;
                  const today=day===11;
                  const ev=calEvents[day];
                  return(
                    <div key={day} style={{textAlign:"center" as const,padding:"4px 1px",borderRadius:5,background:today?BLACK:ev?ev:"transparent",color:today||ev?WHITE:BLACK,fontSize:"0.7rem",fontWeight:ev||today?700:400}}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
