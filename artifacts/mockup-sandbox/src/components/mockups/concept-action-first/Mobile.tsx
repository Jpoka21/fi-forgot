// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";

const actions = [
  { name:"Marcus", action:"Send Marcus a Birthday Card",        detail:"Birthday · June 14 · 3 days",     cta:"Write His Card →" },
  { name:"Steve",  action:"Answer follow-up about Steve",       detail:"Guitar lessons update",            cta:"Answer →"         },
  { name:"Sarah",  action:"Review Sarah's anniversary draft",   detail:"Card ready to review",             cta:"Review →"         },
  { name:"Mom",    action:"Add details for Mom's Mother's Day", detail:"15 days",                          cta:"Add Details →"    },
];

export function Mobile() {
  const [idx, setIdx] = useState(0);
  const [tab, setTab] = useState<"today"|"people"|"moments"|"settings">("today");
  const current = actions[idx];

  return (
    <div style={{ width:390, minHeight:"100vh", background:BG, fontFamily:"'Plus Jakarta Sans', sans-serif", position:"relative" as const }}>
      <div style={{ overflowY:"auto" as const, paddingBottom:72, maxHeight:"calc(100vh - 52px)" }}>
        {tab === "today" && (
          <>
            {/* Hero full-screen action */}
            <div style={{ background:BLACK, minHeight:480, padding:"36px 24px 28px", display:"flex", flexDirection:"column" as const, justifyContent:"flex-end" }}>
              <span style={{ background:RED, color:WHITE, fontSize:"0.65rem", fontWeight:700, padding:"3px 10px", borderRadius:8, letterSpacing:"0.06em", alignSelf:"flex-start" as const, marginBottom:"auto" }}>
                ACTION {idx+1} OF {actions.length}
              </span>
              <div>
                <h2 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2rem", color:WHITE, margin:"0 0 6px", lineHeight:1.1 }}>
                  {current.action.toUpperCase()}
                </h2>
                <p style={{ fontFamily:"'Caveat', cursive", fontSize:"0.95rem", color:"#ffffff70", margin:"0 0 20px" }}>{current.detail}</p>
                <button style={{ width:"100%", padding:"16px", borderRadius:12, border:"none", background:RED, color:WHITE, fontFamily:"'Bebas Neue', cursive", fontSize:"1.15rem", letterSpacing:"0.06em", cursor:"pointer" }}>
                  {current.cta}
                </button>
                {idx < actions.length - 1 && (
                  <button onClick={() => setIdx(i => i+1)} style={{ width:"100%", padding:"10px", marginTop:8, borderRadius:12, border:"none", background:"transparent", color:"#ffffff40", fontFamily:"'Caveat', cursive", fontSize:"0.9rem", cursor:"pointer" }}>
                    swipe for next →
                  </button>
                )}
              </div>
            </div>

            {/* Next actions list */}
            <div style={{ padding:"14px 16px 0" }}>
              <div style={{ fontSize:"0.72rem", fontWeight:700, color:GRAY, letterSpacing:"0.08em", marginBottom:8 }}>UP NEXT</div>
              <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
                {actions.filter((_,i) => i !== idx).slice(0,2).map((a,i) => (
                  <div key={a.name} style={{ background:WHITE, borderRadius:10, padding:"10px 14px", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:`${BLACK}10`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue', cursive", fontSize:"0.78rem", color:BLACK }}>{i+2}</div>
                    <span style={{ flex:1, fontSize:"0.82rem", fontWeight:600, color:BLACK }}>{a.action}</span>
                    <span style={{ fontSize:"0.68rem", color:GRAY }}>→</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab !== "today" && (
          <div style={{ padding:"24px 16px", textAlign:"center" as const }}>
            <div style={{ fontSize:"2rem", marginBottom:10 }}>👀</div>
            <p style={{ color:GRAY, fontSize:"0.88rem" }}>This section is shown in the Today tab mockup.</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed" as const, bottom:0, left:0, right:0, width:390, background:BLACK, display:"flex" }}>
        {([["today","⚡","Today"],["people","👥","People"],["moments","🗓","Moments"],["settings","⚙️","Settings"]] as const).map(([key,icon,label]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)} style={{ flex:1, padding:"10px 4px 8px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column" as const, alignItems:"center", gap:3 }}>
            <span style={{ fontSize:"1.1rem" }}>{icon}</span>
            <span style={{ fontSize:"0.6rem", fontWeight:700, color:tab===key ? RED : "#ffffff50", letterSpacing:"0.04em" }}>{label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
