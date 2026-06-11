// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";

type Status = "Excellent"|"Healthy"|"NeedsAttention"|"Priority";
const STATUS: Record<Status,{color:string,bg:string}> = {
  Excellent:      {color:"#166534",bg:"#F0FDF4"},
  Healthy:        {color:SAGE,      bg:"#EDF7F1"},
  NeedsAttention: {color:"#D97706", bg:"#FFF8EC"},
  Priority:       {color:RED,       bg:"#FFF0EF"},
};

const people = [
  { name:"Sarah",  rel:"Sister",  emoji:"👯", score:82, status:"Excellent"      as Status, event:"Anniversary",  days:8,  action:"Review Draft →" },
  { name:"Mom",    rel:"Mother",  emoji:"🌷", score:54, status:"NeedsAttention" as Status, event:"Mother's Day", days:15, action:"Add Details →"  },
  { name:"Steve",  rel:"Friend",  emoji:"🤝", score:71, status:"Healthy"        as Status, event:"Birthday",     days:3,  action:"Review Draft →" },
  { name:"Marcus", rel:"Friend",  emoji:"🧢", score:38, status:"Priority"       as Status, event:"Birthday",     days:3,  action:"Write Card →"   },
  { name:"Dad",    rel:"Father",  emoji:"👔", score:76, status:"Healthy"        as Status, event:"Father's Day", days:28, action:"View →"         },
  { name:"Jenny",  rel:"Client",  emoji:"💼", score:88, status:"Excellent"      as Status, event:"Work Anniv",  days:45, action:"View →"         },
];

function HealthRing({ score, color }: { score: number; color: string }) {
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <svg width={44} height={44}>
      <circle cx={22} cy={22} r={r} fill="none" stroke={`${color}20`} strokeWidth={4} />
      <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round"
        transform="rotate(-90 22 22)" />
      <text x={22} y={26} textAnchor="middle" style={{ fontSize:"0.5rem", fontWeight:700, fill:color, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
        {score}%
      </text>
    </svg>
  );
}

export function Dashboard() {
  const priority = people.filter(p => p.status === "Priority" || p.status === "NeedsAttention");
  const healthy  = people.filter(p => p.status === "Healthy" || p.status === "Excellent");

  return (
    <div style={{ background:BG, minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background:BLACK, padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.25rem", color:WHITE, letterSpacing:"0.05em" }}>YOUR PEOPLE</span>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1rem", color:RED, letterSpacing:"0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px 48px" }}>
        {/* Summary strip */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" as const }}>
          {[{color:SAGE,dot:true,label:`${healthy.length} people healthy`},{color:RED,dot:true,label:`${priority.length} need${priority.length===1?"s":""} attention`}].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:s.color }} />
              <span style={{ fontSize:"0.82rem", fontWeight:600, color:BLACK }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Person cards grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          {people.map(p => {
            const cfg = STATUS[p.status];
            return (
              <div key={p.name} style={{ background:WHITE, borderRadius:16, padding:"18px", border:`1.5px solid ${p.status==="Priority" ? `${RED}35` : BORDER}`, cursor:"pointer", borderLeft:p.status==="Priority" ? `4px solid ${RED}` : `1.5px solid ${BORDER}` }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:`${BLACK}08`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem" }}>{p.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.3rem", color:BLACK, lineHeight:1, marginBottom:3 }}>{p.name.toUpperCase()}</div>
                    <span style={{ fontSize:"0.68rem", fontWeight:700, padding:"2px 9px", borderRadius:10, background:cfg.bg, color:cfg.color }}>{p.status === "NeedsAttention" ? "Needs Attention" : p.status}</span>
                  </div>
                  <HealthRing score={p.score} color={cfg.color} />
                </div>
                <div style={{ fontSize:"0.72rem", color:GRAY, marginBottom:3 }}>{p.rel}</div>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                  <span style={{ fontSize:"0.75rem", fontWeight:600, color:p.days<=7 ? RED : GRAY }}>
                    {p.days <= 7 ? "⚠ " : ""}{p.event} in {p.days}d
                  </span>
                </div>
                <button style={{ width:"100%", padding:"7px", borderRadius:9, border:"none", background:p.status==="Priority" ? RED : p.status==="NeedsAttention" ? "#D97706" : `${BLACK}08`, color:p.status==="Priority"||p.status==="NeedsAttention" ? WHITE : BLACK, fontWeight:700, fontSize:"0.78rem", cursor:"pointer" }}>
                  {p.action}
                </button>
              </div>
            );
          })}
          <div style={{ borderRadius:16, padding:"18px", border:`2px dashed ${BORDER}`, cursor:"pointer", display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", gap:6, minHeight:120 }}>
            <span style={{ fontSize:"1.5rem", color:SAGE }}>+</span>
            <span style={{ fontSize:"0.8rem", fontWeight:600, color:SAGE }}>Add Person</span>
          </div>
        </div>
      </div>
    </div>
  );
}
