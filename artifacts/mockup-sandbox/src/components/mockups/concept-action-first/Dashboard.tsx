// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";

const queue = [
  { num:1, name:"Marcus", action:"Send Marcus a Birthday Card",    detail:"Birthday · June 14 · 3 days away", cta:"Write His Card →", urgent:true  },
  { num:2, name:"Steve",  action:"Answer follow-up about Steve's guitar lessons", detail:"2 min",  cta:"Answer →",       urgent:false },
  { num:3, name:"Sarah",  action:"Review Sarah's anniversary card draft",         detail:"Draft ready", cta:"Review →",   urgent:false },
  { num:4, name:"Mom",    action:"Add details for Mom's Mother's Day card",        detail:"15 days", cta:"Add Details →", urgent:false },
];

function HealthRing({ pct, color }: { pct: number; color: string }) {
  const r = 20, circ = 2 * Math.PI * r;
  return (
    <svg width={48} height={48}>
      <circle cx={24} cy={24} r={r} fill="none" stroke={`${color}20`} strokeWidth={4} />
      <circle cx={24} cy={24} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round"
        transform="rotate(-90 24 24)" />
      <text x={24} y={28} textAnchor="middle" style={{ fontSize:"0.52rem", fontWeight:700, fill:color, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [activeIdx, setActiveIdx] = useState(0);
  const hero = queue[activeIdx] ?? queue[0];
  const rest = queue.filter((_,i) => i !== activeIdx).slice(0, 3);

  return (
    <div style={{ background:BG, minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background:BLACK, padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.6rem", color:RED }}>F.I. FORGOT</span>
        <span style={{ fontFamily:"'Caveat', cursive", fontSize:"0.9rem", color:"#ffffff70" }}>We got your important people</span>
      </div>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"24px 16px 48px" }}>
        {/* Hero action card */}
        <div style={{ background:BLACK, borderRadius:24, padding:"28px 28px 24px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <span style={{ background:RED, color:WHITE, fontSize:"0.65rem", fontWeight:700, padding:"3px 10px", borderRadius:8, letterSpacing:"0.06em" }}>TODAY · ACTION {activeIdx+1} OF {queue.length}</span>
            <HealthRing pct={76} color={SAGE} />
          </div>
          <h2 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2.6rem", color:WHITE, margin:"0 0 8px", lineHeight:1.05, letterSpacing:"0.02em" }}>
            {hero.action.toUpperCase()}
          </h2>
          <p style={{ fontFamily:"'Caveat', cursive", fontSize:"1rem", color:"#ffffff70", margin:"0 0 24px" }}>{hero.detail}</p>
          <button style={{ width:"100%", padding:"16px", borderRadius:12, border:"none", background:RED, color:WHITE, fontFamily:"'Bebas Neue', cursive", fontSize:"1.25rem", letterSpacing:"0.06em", cursor:"pointer" }}>
            {hero.cta}
          </button>
        </div>

        {/* Next 3 actions */}
        <div style={{ display:"flex", flexDirection:"column" as const, gap:8, marginBottom:16 }}>
          {rest.map((a, i) => (
            <div key={a.num} onClick={() => setActiveIdx(queue.indexOf(a))} style={{ background:WHITE, borderRadius:12, padding:"13px 16px", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:BLACK, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue', cursive", fontSize:"0.9rem", color:WHITE }}>
                {i + 2}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <span style={{ fontWeight:700, fontSize:"0.85rem", color:BLACK }}>{a.action}</span>
              </div>
              <span style={{ fontSize:"0.68rem", fontWeight:700, padding:"2px 9px", borderRadius:10, background:`${BLACK}08`, color:GRAY, whiteSpace:"nowrap" as const }}>{a.detail}</span>
              <span style={{ color:GRAY, fontWeight:700, fontSize:"0.9rem" }}>→</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center" as const }}>
          <span style={{ fontSize:"0.72rem", color:GRAY }}>6 people · 5 healthy · 1 priority</span>
        </div>
      </div>
    </div>
  );
}
