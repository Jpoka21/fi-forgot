// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF", CREAM="#FDF7EF";

const moments = [
  { name:"Steve",  emoji:"🤝", event:"Birthday",     days:3,  date:"Jun 14", urgent:true  },
  { name:"Sarah",  emoji:"👯", event:"Anniversary",  days:8,  date:"Jun 19", urgent:false },
  { name:"Mom",    emoji:"🌷", event:"Mother's Day", days:15, date:"Jun 26", urgent:false },
  { name:"Marcus", emoji:"🧢", event:"Just Because", days:22, date:"Jul 3",  urgent:false },
  { name:"Dad",    emoji:"👔", event:"Father's Day", days:28, date:"Jul 9",  urgent:false },
];

const people = [
  { name:"Steve",  rel:"Friend",  emoji:"🤝", days:3,  event:"Birthday"     },
  { name:"Sarah",  rel:"Sister",  emoji:"👯", days:8,  event:"Anniversary"  },
  { name:"Mom",    rel:"Mother",  emoji:"🌷", days:15, event:"Mother's Day" },
  { name:"Marcus", rel:"Friend",  emoji:"🧢", days:22, event:"Just Because" },
  { name:"Dad",    rel:"Father",  emoji:"👔", days:28, event:"Father's Day" },
  { name:"Jenny",  rel:"Client",  emoji:"💼", days:45, event:"Work Anniv"   },
];

export function Mobile() {
  const [tab, setTab] = useState<"moments"|"people"|"cards"|"settings">("moments");

  return (
    <div style={{ width:390, minHeight:"100vh", background:BG, fontFamily:"'Plus Jakarta Sans', sans-serif", position:"relative" as const, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ background:BLACK, padding:"14px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.5rem", color:RED }}>F.I. FORGOT</span>
        <span style={{ background:RED, color:WHITE, fontSize:"0.65rem", fontWeight:700, padding:"3px 10px", borderRadius:10, letterSpacing:"0.06em" }}>30 DAYS</span>
      </div>

      <div style={{ overflowY:"auto" as const, paddingBottom:72, maxHeight:"calc(100vh - 116px)" }}>
        {tab === "moments" && (
          <div style={{ padding:"16px 16px 0" }}>
            <h2 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.4rem", color:BLACK, margin:"0 0 12px" }}>Upcoming Moments</h2>

            {/* Horizontal scroll cards */}
            <div style={{ display:"flex", gap:12, overflowX:"auto" as const, paddingBottom:12, marginRight:-16, paddingRight:16, scrollbarWidth:"none" as const }}>
              {moments.map(m => (
                <div key={m.name+m.event} style={{ minWidth:240, background:WHITE, borderRadius:14, padding:"16px", border:`1px solid ${m.urgent ? `${RED}45` : BORDER}`, flexShrink:0 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:9, background:m.urgent ? RED : CREAM, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.2rem", color:m.urgent ? WHITE : BLACK, lineHeight:1 }}>{m.days}</span>
                      <span style={{ fontSize:"0.42rem", fontWeight:700, color:m.urgent ? "#ffffff80" : GRAY }}>DAYS</span>
                    </div>
                    <span style={{ fontSize:"0.7rem", fontWeight:700, color:m.urgent ? RED : GRAY }}>{m.urgent ? "⚠ Urgent" : "On track"}</span>
                  </div>
                  <div style={{ fontSize:"2rem", marginBottom:6 }}>{m.emoji}</div>
                  <div style={{ fontWeight:800, fontSize:"0.95rem", color:BLACK, marginBottom:2 }}>{m.name}</div>
                  <div style={{ fontSize:"0.78rem", color:GRAY, marginBottom:12 }}>{m.event} · {m.date}</div>
                  <button style={{ width:"100%", padding:"8px", borderRadius:9, background:m.urgent ? RED : `${BLACK}08`, color:m.urgent ? WHITE : BLACK, border:"none", fontWeight:700, fontSize:"0.78rem", cursor:"pointer" }}>
                    {m.urgent ? "Review Draft →" : "View"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "people" && (
          <div style={{ padding:"16px" }}>
            <h2 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.4rem", color:BLACK, margin:"0 0 12px" }}>Your People</h2>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
              {people.map(p => (
                <div key={p.name} style={{ background:WHITE, borderRadius:12, padding:"12px 14px", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:"1.6rem", flexShrink:0 }}>{p.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"0.88rem", color:BLACK }}>{p.name}</div>
                    <div style={{ fontSize:"0.7rem", color:GRAY }}>{p.rel}</div>
                  </div>
                  <span style={{ fontSize:"0.68rem", fontWeight:700, padding:"3px 9px", borderRadius:10, background:p.days<=7 ? `${RED}15` : `${BLACK}07`, color:p.days<=7 ? RED : GRAY, whiteSpace:"nowrap" as const }}>
                    {p.event} · {p.days}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed" as const, bottom:0, left:0, right:0, width:390, background:BLACK, display:"flex", borderTop:`1px solid #333` }}>
        {([["moments","🗓","Moments"],["people","👥","People"],["cards","💌","Cards"],["settings","⚙️","Settings"]] as const).map(([key,icon,label]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)} style={{ flex:1, padding:"10px 4px 8px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column" as const, alignItems:"center", gap:3 }}>
            <span style={{ fontSize:"1.1rem" }}>{icon}</span>
            <span style={{ fontSize:"0.6rem", fontWeight:700, color:tab===key ? RED : "#ffffff50", letterSpacing:"0.04em" }}>{label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
