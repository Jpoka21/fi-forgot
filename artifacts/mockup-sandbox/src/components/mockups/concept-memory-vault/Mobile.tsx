// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";

const feed = [
  { person:"Marcus", emoji:"🧢", text:"Got promoted to VP of Sales — big deal for him",          age:"2 wks ago", followUp:true,  usedIn:"Birthday Card" },
  { person:"Mom",    emoji:"🌷", text:"Knee surgery went really well, recovering at home",         age:"1 wk ago",  followUp:false, usedIn:null            },
  { person:"Steve",  emoji:"🤝", text:"Started taking guitar lessons — always wanted to learn",    age:"3 wks ago", followUp:true,  usedIn:null            },
  { person:"Sarah",  emoji:"👯", text:"Her daughter just started kindergarten, emotional week",    age:"4 wks ago", followUp:false, usedIn:null            },
  { person:"Jenny",  emoji:"💼", text:"Just closed her biggest deal of the year",                 age:"1 wk ago",  followUp:false, usedIn:null            },
];

export function Mobile() {
  const [tab, setTab] = useState<"feed"|"people"|"moments"|"settings">("feed");
  const [logOpen, setLogOpen] = useState(false);
  const [logText, setLogText] = useState("");

  return (
    <div style={{ width:390, minHeight:"100vh", background:BG, fontFamily:"'Plus Jakarta Sans', sans-serif", position:"relative" as const }}>
      <div style={{ background:BLACK, padding:"14px 20px 12px" }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.5rem", color:WHITE, letterSpacing:"0.04em" }}>WHAT'S NEW</span>
      </div>

      <div style={{ overflowY:"auto" as const, paddingBottom:72, maxHeight:"calc(100vh - 110px)" }}>
        {tab === "feed" && (
          <div style={{ padding:"12px 14px 0" }}>
            {feed.map((f,i) => (
              <div key={f.person+i} style={{ background:WHITE, borderRadius:12, padding:"13px 14px", marginBottom:8, border:`1px solid ${BORDER}` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"2px 9px", borderRadius:20, background:`${BLACK}06`, fontSize:"0.72rem", fontWeight:700, color:BLACK }}>
                    {f.emoji} {f.person}
                  </span>
                  <span style={{ fontSize:"0.68rem", color:GRAY }}>{f.age}</span>
                </div>
                <p style={{ fontFamily:"'Caveat', cursive", fontSize:"1rem", color:BLACK, margin:"0 0 7px", lineHeight:1.5 }}>"{f.text}"</p>
                <div style={{ display:"flex", gap:5 }}>
                  {f.followUp && <span style={{ fontSize:"0.65rem", fontWeight:700, padding:"2px 8px", borderRadius:10, background:"#FFFBEB", color:"#D97706" }}>↻ Follow-up due</span>}
                  {f.usedIn  && <span style={{ fontSize:"0.65rem", fontWeight:700, padding:"2px 8px", borderRadius:10, background:`${SAGE}12`, color:SAGE }}>✓ {f.usedIn}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log FAB */}
      <button onClick={() => setLogOpen(true)} style={{ position:"fixed" as const, bottom:80, right:20, width:56, height:56, borderRadius:"50%", background:RED, color:WHITE, border:"none", fontSize:"1.5rem", fontWeight:700, cursor:"pointer", boxShadow:`0 4px 16px ${RED}50`, display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>＋</button>

      {/* Bottom nav */}
      <div style={{ position:"fixed" as const, bottom:0, left:0, right:0, width:390, background:BLACK, display:"flex" }}>
        {([["feed","📰","Feed"],["people","👥","People"],["moments","🗓","Moments"],["settings","⚙️","Settings"]] as const).map(([key,icon,label]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)} style={{ flex:1, padding:"10px 4px 8px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column" as const, alignItems:"center", gap:3 }}>
            <span style={{ fontSize:"1.1rem" }}>{icon}</span>
            <span style={{ fontSize:"0.6rem", fontWeight:700, color:tab===key ? RED : "#ffffff50", letterSpacing:"0.04em" }}>{label.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {logOpen && (
        <div onClick={() => setLogOpen(false)} style={{ position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200, padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:WHITE, borderRadius:"20px 20px 0 0", width:"100%", padding:"22px 22px 36px" }}>
            <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.4rem", color:BLACK, marginBottom:4 }}>Log a Moment</div>
            <textarea value={logText} onChange={e => setLogText(e.target.value)} rows={4} placeholder="Steve just got promoted to manager…" style={{ width:"100%", borderRadius:10, border:`1.5px solid ${BORDER}`, padding:"10px 14px", fontSize:"0.88rem", fontFamily:"'Plus Jakarta Sans', sans-serif", resize:"none" as const, boxSizing:"border-box" as const }} />
            <button onClick={() => { setLogOpen(false); setLogText(""); }} style={{ width:"100%", marginTop:10, padding:"12px", borderRadius:10, border:"none", background:SAGE, color:WHITE, fontWeight:700, cursor:"pointer" }}>Save Memory</button>
          </div>
        </div>
      )}
    </div>
  );
}
