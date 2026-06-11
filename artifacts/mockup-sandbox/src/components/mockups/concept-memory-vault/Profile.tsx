import { useState } from "react";

const BG="#F2E6D3",RED="#E23B2E",BLACK="#111111",SAGE="#5B8C6B",GRAY="#6B6B6B",BORDER="#E5E0D8",WHITE="#FFFFFF";

type FeedItem={type:"memory"|"card"|"question";date:string;text:string;tag?:string;answer?:string};

const timeline:FeedItem[]=[
  {type:"memory",  date:"May 28, 2026",text:"Knee surgery recovery going well. Says she's walking better than before the surgery.",tag:"Health"},
  {type:"question",date:"May 15, 2026",text:"How is the new physical therapist working out?",answer:"'She's wonderful — goes twice a week now.'"},
  {type:"card",    date:"May 10, 2026",text:"Sent Mother's Day card — 'Still your favorite child, right?' She called to say she laughed out loud."},
  {type:"memory",  date:"Apr 3, 2026", text:"Started baking again — making sourdough bread every Saturday. Loves it.",tag:"Hobby"},
  {type:"memory",  date:"Mar 12, 2026",text:"Mentioned she's been missing Dad more lately — March is always hard.",tag:"Personal"},
  {type:"question",date:"Feb 20, 2026",text:"Has she tried that Italian restaurant near her apartment yet?",answer:"'Went last week — loved the risotto.'"},
  {type:"card",    date:"Feb 14, 2026",text:"Sent Valentine's Day card — 'Best mom in the whole city.' She texted a heart."},
  {type:"memory",  date:"Jan 18, 2026",text:"New neighbor moved in next door. They've had coffee twice — seems like a good fit.",tag:"Life"},
];

const typeIcon=(t:string)=>t==="memory"?"📝":t==="card"?"💌":"🎯";
const typeColor=(t:string)=>t==="memory"?"#EDF5F0":t==="card"?"#EDE9FE":"#FEF3C7";
const typeBorder=(t:string)=>t==="memory"?SAGE:t==="card"?"#7C3AED":t==="question"?"#D97706":"#999";

export default function Profile(){
  const [hov,setHov]=useState("");
  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:BLACK}}>
      {/* NAV */}
      <div style={{background:BLACK,padding:"13px 32px",display:"flex",alignItems:"center",gap:12}}>
        <button style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:"0.82rem",padding:0}}>← What's New</button>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:"1.7rem",color:WHITE,letterSpacing:"0.08em"}}>F*I FORGOT</span>
      </div>

      {/* MOM HEADER */}
      <div style={{background:WHITE,borderBottom:`1px solid ${BORDER}`,padding:"24px 32px 20px"}}>
        <div style={{maxWidth:780,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:18,marginBottom:16}}>
            <div style={{width:64,height:64,borderRadius:16,background:"#FCE7F3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>👩</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
                <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"2.3rem",color:BLACK,margin:0,letterSpacing:"0.04em",lineHeight:1}}>MOM</h1>
                <span style={{background:"#FCE7F3",color:"#BE185D",borderRadius:20,padding:"3px 12px",fontSize:"0.73rem",fontWeight:700}}>MOTHER</span>
              </div>
              <p style={{color:GRAY,fontSize:"0.8rem",margin:"0 0 10px"}}>8 memories · 18 cards sent · Last contact May 2026</p>
              <div style={{display:"flex",gap:7}}>
                <button style={{background:RED,color:WHITE,border:"none",borderRadius:9,padding:"8px 16px",fontWeight:700,fontSize:"0.8rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Send a Card</button>
                <button style={{background:WHITE,color:BLACK,border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 14px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Log a Memory</button>
                <button style={{background:WHITE,color:BLACK,border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 14px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Ask Follow-up</button>
              </div>
            </div>
          </div>
          {/* upcoming birthday banner */}
          <div style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:"1.1rem"}}>📅</span>
              <p style={{fontWeight:700,fontSize:"0.82rem",margin:0}}>Mom's birthday is June 22 · <span style={{color:SAGE}}>11 days away</span></p>
            </div>
            <button style={{background:RED,color:WHITE,border:"none",borderRadius:8,padding:"7px 16px",fontWeight:700,fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Send Birthday Card</button>
          </div>
        </div>
      </div>

      <div style={{padding:"22px 32px",maxWidth:780,margin:"0 auto"}}>
        {/* LEGEND */}
        <div style={{display:"flex",gap:14,marginBottom:18,alignItems:"center"}}>
          <span style={{fontSize:"0.75rem",color:GRAY,fontWeight:600}}>TIMELINE</span>
          {[["memory","📝","Memory"],["card","💌","Card sent"],["question","🎯","Follow-up"]].map(([t,ic,label])=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:typeBorder(t)}}/>
              <span style={{fontSize:"0.72rem",color:GRAY}}>{label}</span>
            </div>
          ))}
        </div>

        {/* TIMELINE */}
        <div style={{position:"relative" as const}}>
          <div style={{position:"absolute" as const,left:19,top:0,bottom:0,width:2,background:BORDER}}/>
          <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
            {timeline.map((item,i)=>(
              <div key={i} onMouseEnter={()=>setHov(`${i}`)} onMouseLeave={()=>setHov("")}
                style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                {/* Icon */}
                <div style={{width:38,height:38,borderRadius:10,background:typeColor(item.type),display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0,border:`2px solid ${typeBorder(item.type)}`,position:"relative" as const,zIndex:1}}>
                  {typeIcon(item.type)}
                </div>
                {/* Card */}
                <div style={{flex:1,background:WHITE,border:`1px solid ${hov===`${i}`?GRAY:BORDER}`,borderRadius:12,padding:"13px 16px",transition:"all 0.12s",boxShadow:hov===`${i}`?"0 2px 12px rgba(0,0,0,0.07)":"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <span style={{fontSize:"0.68rem",color:GRAY}}>{item.date}</span>
                    {item.tag&&<span style={{background:BG,color:GRAY,borderRadius:20,padding:"1px 8px",fontSize:"0.64rem",fontWeight:600}}>{item.tag}</span>}
                    {item.type==="card"&&<span style={{background:"#EDE9FE",color:"#7C3AED",borderRadius:20,padding:"1px 8px",fontSize:"0.64rem",fontWeight:600}}>✓ Delivered</span>}
                  </div>
                  <p style={{fontFamily:"'Caveat',cursive",fontSize:"1.1rem",color:BLACK,margin:0,lineHeight:1.5}}>{item.text}</p>
                  {item.answer&&(
                    <div style={{marginTop:8,background:BG,borderRadius:8,padding:"7px 11px",borderLeft:`3px solid ${SAGE}`}}>
                      <p style={{fontSize:"0.72rem",color:GRAY,margin:"0 0 2px",fontWeight:600}}>HER ANSWER</p>
                      <p style={{fontFamily:"'Caveat',cursive",fontSize:"1rem",color:BLACK,margin:0}}>{item.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button style={{marginTop:18,width:"100%",background:"none",border:`2px dashed ${BORDER}`,borderRadius:12,padding:"12px",fontSize:"0.8rem",color:GRAY,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>+ Log something new about Mom</button>
      </div>
    </div>
  );
}
