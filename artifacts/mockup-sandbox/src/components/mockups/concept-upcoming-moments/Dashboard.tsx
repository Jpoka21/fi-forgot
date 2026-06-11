// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF", CREAM="#FDF7EF";

const events = [
  { name:"Steve",  rel:"Friend",  emoji:"🤝", event:"Birthday",     days:3,  date:"Jun 14", status:"Draft ready",  urgent:true  },
  { name:"Sarah",  rel:"Sister",  emoji:"👯", event:"Anniversary",  days:8,  date:"Jun 19", status:"On track",     urgent:false },
  { name:"Mom",    rel:"Mother",  emoji:"🌷", event:"Mother's Day", days:15, date:"Jun 26", status:"Add details",  urgent:false },
  { name:"Marcus", rel:"Friend",  emoji:"🧢", event:"Just Because", days:22, date:"Jul 3",  status:"On track",     urgent:false },
  { name:"Dad",    rel:"Father",  emoji:"👔", event:"Father's Day", days:28, date:"Jul 9",  status:"On track",     urgent:false },
];

const people = [
  { name:"Steve",  rel:"Friend",  emoji:"🤝" },
  { name:"Sarah",  rel:"Sister",  emoji:"👯" },
  { name:"Mom",    rel:"Mother",  emoji:"🌷" },
  { name:"Marcus", rel:"Friend",  emoji:"🧢" },
  { name:"Dad",    rel:"Father",  emoji:"👔" },
  { name:"Jenny",  rel:"Client",  emoji:"💼" },
];

export function Dashboard() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? events : events.slice(0, 3);

  return (
    <div style={{ background:BG, minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background:BLACK, padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.6rem", color:RED, letterSpacing:"0.04em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily:"'Caveat', cursive", fontSize:"0.95rem", color:"#ffffff70", marginRight:"auto", marginLeft:16 }}>your next 30 days</span>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button style={{ background:RED, color:WHITE, border:"none", borderRadius:8, padding:"6px 14px", fontFamily:"'Bebas Neue', cursive", fontSize:"0.85rem", letterSpacing:"0.06em", cursor:"pointer" }}>+ ADD MOMENT</button>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"#ffffff20", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue', cursive", color:WHITE, fontSize:"0.85rem" }}>JD</div>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 20px 48px" }}>
        <div style={{ background:BLACK, borderRadius:16, padding:"18px 24px", marginBottom:28, display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, flexWrap:"wrap" as const }}>
          <div style={{ display:"flex", gap:28 }}>
            <div style={{ textAlign:"center" as const }}>
              <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2.8rem", color:RED, lineHeight:1 }}>5</div>
              <div style={{ fontSize:"0.65rem", fontWeight:700, color:"#ffffff50", letterSpacing:"0.1em", textTransform:"uppercase" as const }}>Events</div>
            </div>
            <div style={{ textAlign:"center" as const }}>
              <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2.8rem", color:WHITE, lineHeight:1 }}>3</div>
              <div style={{ fontSize:"0.65rem", fontWeight:700, color:"#ffffff50", letterSpacing:"0.1em", textTransform:"uppercase" as const }}>Days Away</div>
            </div>
            <div style={{ textAlign:"center" as const }}>
              <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2.8rem", color:SAGE, lineHeight:1 }}>1</div>
              <div style={{ fontSize:"0.65rem", fontWeight:700, color:"#ffffff50", letterSpacing:"0.1em", textTransform:"uppercase" as const }}>Draft Ready</div>
            </div>
          </div>
          <span style={{ fontFamily:"'Caveat', cursive", fontSize:"1.05rem", color:"#ffffff55" }}>We've got it handled.</span>
        </div>

        <div style={{ marginBottom:32 }}>
          <h2 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.7rem", letterSpacing:"0.02em", color:BLACK, margin:"0 0 14px" }}>Upcoming Moments</h2>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
            {visible.map(ev => (
              <div key={ev.name+ev.event} style={{ background:WHITE, borderRadius:12, padding:"13px 16px", border:`1px solid ${ev.urgent ? `${RED}45` : BORDER}`, boxShadow:ev.urgent ? `0 2px 12px ${RED}12` : "none", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:10, flexShrink:0, background:ev.urgent ? RED : CREAM, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.4rem", color:ev.urgent ? WHITE : BLACK, lineHeight:1 }}>{ev.days}</span>
                  <span style={{ fontSize:"0.48rem", fontWeight:700, color:ev.urgent ? "#ffffff80" : GRAY, letterSpacing:"0.08em" }}>DAYS</span>
                </div>
                <span style={{ fontSize:"1.5rem", flexShrink:0 }}>{ev.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:2 }}>
                    <span style={{ fontWeight:800, fontSize:"0.92rem", color:BLACK }}>{ev.name}</span>
                    <span style={{ fontSize:"0.7rem", color:GRAY }}>{ev.rel}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontWeight:600, fontSize:"0.8rem", color:BLACK }}>{ev.event}</span>
                    <span style={{ fontSize:"0.72rem", color:GRAY }}>· {ev.date}</span>
                  </div>
                </div>
                <span style={{ fontSize:"0.7rem", fontWeight:700, padding:"3px 10px", borderRadius:12, background:ev.status==="Draft ready" ? "#1d4ed820" : ev.status==="Add details" ? "#D9770620" : `${SAGE}20`, color:ev.status==="Draft ready" ? "#1d4ed8" : ev.status==="Add details" ? "#D97706" : SAGE, whiteSpace:"nowrap" as const }}>
                  {ev.status}
                </span>
                <button style={{ padding:"7px 14px", borderRadius:8, border:"none", cursor:"pointer", background:ev.urgent || ev.status==="Draft ready" ? RED : `${BLACK}08`, color:ev.urgent || ev.status==="Draft ready" ? WHITE : BLACK, fontWeight:700, fontSize:"0.75rem", whiteSpace:"nowrap" as const, flexShrink:0 }}>
                  {ev.status==="Draft ready" ? "Review Draft" : ev.status==="Add details" ? "Add Details" : "View"}
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setExpanded(e=>!e)} style={{ marginTop:10, width:"100%", padding:"9px", background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, fontSize:"0.82rem", color:GRAY, fontWeight:600, cursor:"pointer" }}>
            {expanded ? "Show fewer" : `${events.length-3} more upcoming →`}
          </button>
        </div>

        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <h2 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.4rem", letterSpacing:"0.02em", color:BLACK, margin:0 }}>Your People</h2>
            <span style={{ fontSize:"0.78rem", color:GRAY, fontWeight:600, cursor:"pointer" }}>View all →</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {people.map(p => (
              <div key={p.name} style={{ background:WHITE, borderRadius:12, padding:"14px 12px", border:`1px solid ${BORDER}`, cursor:"pointer", textAlign:"center" as const }}>
                <div style={{ fontSize:"1.8rem", marginBottom:6 }}>{p.emoji}</div>
                <div style={{ fontWeight:700, fontSize:"0.88rem", color:BLACK, marginBottom:2 }}>{p.name}</div>
                <div style={{ fontSize:"0.7rem", color:GRAY }}>{p.rel}</div>
              </div>
            ))}
            <div style={{ borderRadius:12, padding:"14px 12px", border:`2px dashed ${BORDER}`, cursor:"pointer", textAlign:"center" as const, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", gap:4 }}>
              <span style={{ fontSize:"1.5rem", color:SAGE }}>+</span>
              <span style={{ fontSize:"0.75rem", fontWeight:600, color:SAGE }}>Add Person</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
