// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";

type Status = "Excellent"|"Healthy"|"NeedsAttention"|"Priority";
const DOT: Record<Status,string> = { Excellent:"#166534", Healthy:SAGE, NeedsAttention:"#D97706", Priority:RED };

const people = [
  { name:"Steve",  rel:"Friend",  emoji:"🤝", status:"Healthy"        as Status, days:3,  event:"Birthday",     nextAction:"Review Draft" },
  { name:"Sarah",  rel:"Sister",  emoji:"👯", status:"Excellent"      as Status, days:8,  event:"Anniversary",  nextAction:"Review Draft" },
  { name:"Mom",    rel:"Mother",  emoji:"🌷", status:"NeedsAttention" as Status, days:15, event:"Mother's Day", nextAction:"Add Details"  },
  { name:"Marcus", rel:"Friend",  emoji:"🧢", status:"Priority"       as Status, days:3,  event:"Birthday",     nextAction:"Write Card"   },
  { name:"Dad",    rel:"Father",  emoji:"👔", status:"Healthy"        as Status, days:28, event:"Father's Day", nextAction:"View"         },
  { name:"Jenny",  rel:"Client",  emoji:"💼", status:"Excellent"      as Status, days:45, event:"Work Anniv",   nextAction:"View"         },
];

export function Mobile() {
  const [expanded, setExpanded] = useState<string|null>(null);
  const [tab, setTab] = useState<"people"|"moments"|"cards"|"settings">("people");

  return (
    <div style={{ width:390, minHeight:"100vh", background:BG, fontFamily:"'Plus Jakarta Sans', sans-serif", position:"relative" as const }}>
      <div style={{ background:BLACK, padding:"14px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.5rem", color:WHITE, letterSpacing:"0.04em" }}>YOUR PEOPLE</span>
      </div>

      <div style={{ overflowY:"auto" as const, paddingBottom:72, maxHeight:"calc(100vh - 116px)" }}>
        {tab === "people" && (
          <div style={{ padding:16 }}>
            {people.map(p => (
              <div key={p.name} style={{ marginBottom:8 }}>
                {/* Person row */}
                <div
                  onClick={() => setExpanded(expanded===p.name ? null : p.name)}
                  style={{ background:WHITE, borderRadius:12, padding:"12px 14px", border:`1px solid ${p.status==="Priority" ? `${RED}40` : BORDER}`, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
                >
                  <span style={{ fontSize:"1.5rem", flexShrink:0 }}>{p.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"0.88rem", color:BLACK }}>{p.name}</div>
                    <div style={{ fontSize:"0.7rem", color:GRAY }}>{p.rel}</div>
                  </div>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:DOT[p.status], flexShrink:0 }} />
                  <span style={{ fontSize:"0.68rem", fontWeight:700, padding:"2px 8px", borderRadius:9, background:p.days<=7 ? `${RED}12` : `${BLACK}07`, color:p.days<=7 ? RED : GRAY, whiteSpace:"nowrap" as const }}>
                    {p.event} · {p.days}d
                  </span>
                </div>

                {/* Expanded detail */}
                {expanded === p.name && (
                  <div style={{ background:`${WHITE}dd`, borderRadius:"0 0 12px 12px", padding:"14px 14px 12px", border:`1px solid ${BORDER}`, borderTop:"none", marginTop:-4 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"0.72rem", color:GRAY, marginBottom:3 }}>Next: {p.event} in {p.days} days</div>
                        <div style={{ fontSize:"0.72rem", color:GRAY }}>Status: <span style={{ fontWeight:700, color:DOT[p.status] }}>{p.status === "NeedsAttention" ? "Needs Attention" : p.status}</span></div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button style={{ flex:1, padding:"8px", borderRadius:9, border:`1.5px solid ${SAGE}`, background:"none", color:SAGE, fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>+ Memory</button>
                      <button style={{ flex:2, padding:"8px", borderRadius:9, border:"none", background:p.status==="Priority" ? RED : SAGE, color:WHITE, fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>
                        {p.nextAction} →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed" as const, bottom:0, left:0, right:0, width:390, background:BLACK, display:"flex" }}>
        {([["people","👥","People"],["moments","🗓","Moments"],["cards","💌","Cards"],["settings","⚙️","Settings"]] as const).map(([key,icon,label]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)} style={{ flex:1, padding:"10px 4px 8px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column" as const, alignItems:"center", gap:3 }}>
            <span style={{ fontSize:"1.1rem" }}>{icon}</span>
            <span style={{ fontSize:"0.6rem", fontWeight:700, color:tab===key ? RED : "#ffffff50", letterSpacing:"0.04em" }}>{label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
