// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";

const feed = [
  { person:"Marcus", emoji:"🧢", text:"Got promoted to VP of Sales — big deal for him", age:"2 wks ago", followUp:true,  usedIn:"Birthday Card"  },
  { person:"Mom",    emoji:"🌷", text:"Knee surgery went really well, recovering at home", age:"1 wk ago",  followUp:false, usedIn:null             },
  { person:"Steve",  emoji:"🤝", text:"Started taking guitar lessons — always wanted to learn", age:"3 wks ago", followUp:true,  usedIn:null         },
  { person:"Sarah",  emoji:"👯", text:"Her daughter just started kindergarten, emotional week", age:"4 wks ago", followUp:false, usedIn:null         },
  { person:"Dad",    emoji:"👔", text:"Officially retired last month, adjusting to the new rhythm", age:"5 wks ago", followUp:true,  usedIn:null    },
  { person:"Jenny",  emoji:"💼", text:"Just closed her biggest deal of the year", age:"1 wk ago",  followUp:false, usedIn:null             },
];

const upcoming = [
  { name:"Steve",  emoji:"🤝", event:"Birthday",    days:3  },
  { name:"Sarah",  emoji:"👯", event:"Anniversary", days:8  },
  { name:"Mom",    emoji:"🌷", event:"Mother's Day",days:15 },
];

const borderColors = [RED, SAGE, BLACK, RED, SAGE, BLACK];

export function Dashboard() {
  const [logOpen, setLogOpen] = useState(false);
  const [logText, setLogText] = useState("");

  return (
    <div style={{ background:BG, minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background:BLACK, padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.4rem", color:WHITE, letterSpacing:"0.04em" }}>WHAT'S NEW</span>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"0.95rem", color:RED }}>F.I. FORGOT</span>
      </div>

      {/* Follow-up warning strip */}
      <div style={{ background:"#FFFBEB", borderBottom:`1px solid #D9770630`, padding:"9px 24px", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:"0.78rem" }}>↻</span>
        <span style={{ fontSize:"0.82rem", fontWeight:600, color:"#D97706" }}>3 follow-ups waiting — answer them before cards are written</span>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"20px 16px 48px", display:"grid", gridTemplateColumns:"1fr 300px", gap:20 }}>
        {/* Memory feed */}
        <div>
          <h2 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.5rem", color:BLACK, margin:"0 0 14px", letterSpacing:"0.02em" }}>Recent Memories</h2>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
            {feed.map((f,i) => (
              <div key={f.person+f.text} style={{ background:WHITE, borderRadius:12, padding:"14px 16px", border:`1px solid ${BORDER}`, borderLeft:`3px solid ${borderColors[i%borderColors.length]}` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:`${BLACK}06`, fontSize:"0.75rem", fontWeight:700, color:BLACK }}>
                    {f.emoji} {f.person}
                  </span>
                  <span style={{ fontSize:"0.7rem", color:GRAY }}>{f.age}</span>
                </div>
                <p style={{ fontFamily:"'Caveat', cursive", fontSize:"1.05rem", color:BLACK, margin:"0 0 8px", lineHeight:1.5 }}>"{f.text}"</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const }}>
                  {f.followUp && (
                    <span style={{ fontSize:"0.68rem", fontWeight:700, padding:"2px 9px", borderRadius:10, background:"#FFFBEB", color:"#D97706", border:"1px solid #D9770625" }}>↻ Follow-up due</span>
                  )}
                  {f.usedIn && (
                    <span style={{ fontSize:"0.68rem", fontWeight:700, padding:"2px 9px", borderRadius:10, background:`${SAGE}12`, color:SAGE, border:`1px solid ${SAGE}25` }}>✓ Used in {f.usedIn}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          <button onClick={() => setLogOpen(true)} style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background:SAGE, color:WHITE, fontFamily:"'Bebas Neue', cursive", fontSize:"1.05rem", letterSpacing:"0.06em", cursor:"pointer", marginBottom:20 }}>
            + Log a Moment
          </button>
          <h3 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.1rem", color:BLACK, margin:"0 0 10px", letterSpacing:"0.04em" }}>Upcoming</h3>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
            {upcoming.map(u => (
              <div key={u.name} style={{ background:WHITE, borderRadius:10, padding:"10px 12px", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:"1.2rem" }}>{u.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:"0.82rem", color:BLACK }}>{u.name}</div>
                  <div style={{ fontSize:"0.7rem", color:GRAY }}>{u.event}</div>
                </div>
                <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.3rem", color:u.days<=7 ? RED : GRAY, lineHeight:1 }}>{u.days}d</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {logOpen && (
        <div onClick={() => setLogOpen(false)} style={{ position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:WHITE, borderRadius:20, width:"100%", maxWidth:480, padding:"28px 28px 24px" }}>
            <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.5rem", color:BLACK, marginBottom:6 }}>Log a Moment</div>
            <p style={{ fontSize:"0.84rem", color:GRAY, marginBottom:14 }}>Who is this about and what happened?</p>
            <textarea value={logText} onChange={e => setLogText(e.target.value)} rows={4} placeholder="Steve just got promoted to manager at his company…" style={{ width:"100%", borderRadius:10, border:`1.5px solid ${BORDER}`, padding:"10px 14px", fontSize:"0.88rem", fontFamily:"'Plus Jakarta Sans', sans-serif", resize:"none" as const, boxSizing:"border-box" as const }} />
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              <button onClick={() => setLogOpen(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:`1px solid ${BORDER}`, background:"none", color:GRAY, fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => setLogOpen(false)} style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:SAGE, color:WHITE, fontWeight:700, cursor:"pointer" }}>Save Memory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
