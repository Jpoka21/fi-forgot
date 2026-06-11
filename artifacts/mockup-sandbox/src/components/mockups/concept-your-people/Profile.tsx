// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";

const breakdown = [
  { label:"Recency",     pct:90 },
  { label:"Consistency", pct:85 },
  { label:"Card Quality",pct:78 },
  { label:"Profile Depth",pct:82 },
];

const cards = [
  { event:"Anniversary 2023", excerpt:"Happy anniversary! You two are such an inspiration…"         },
  { event:"Birthday 2023",    excerpt:"Wishing you the most wonderful birthday, Sarah…"              },
  { event:"Christmas 2022",   excerpt:"Merry Christmas! Hope this year brings you all the joy…"     },
];

function HealthRing({ score, color }: { score: number; color: string }) {
  const r = 42, circ = 2 * Math.PI * r;
  return (
    <svg width={96} height={96}>
      <circle cx={48} cy={48} r={r} fill="none" stroke={`${color}18`} strokeWidth={7} />
      <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round"
        transform="rotate(-90 48 48)" />
      <text x={48} y={44} textAnchor="middle" style={{ fontSize:"1rem", fontWeight:800, fill:color, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{score}%</text>
      <text x={48} y={58} textAnchor="middle" style={{ fontSize:"0.55rem", fontWeight:600, fill:color, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Excellent</text>
    </svg>
  );
}

export function Profile() {
  const [logText, setLogText] = useState("");
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div style={{ background:BG, minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background:BLACK, padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.6rem", color:RED }}>F.I. FORGOT</span>
        <span style={{ fontSize:"0.78rem", color:"#ffffff70", cursor:"pointer" }}>← Your People</span>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"24px 20px 48px" }}>
        {/* Person header */}
        <div style={{ background:WHITE, borderRadius:16, padding:"24px", marginBottom:16, border:`1px solid ${BORDER}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:BLACK, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.2rem", flexShrink:0 }}>👯</div>
            <div style={{ flex:1 }}>
              <h1 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2.2rem", color:BLACK, margin:"0 0 4px", lineHeight:1 }}>SARAH</h1>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const }}>
                <span style={{ padding:"3px 12px", borderRadius:20, background:`${BLACK}08`, fontSize:"0.78rem", fontWeight:600, color:GRAY }}>Sister</span>
                <span style={{ padding:"3px 10px", borderRadius:20, background:"#F0FDF4", fontSize:"0.72rem", fontWeight:700, color:"#166534" }}>Excellent</span>
              </div>
            </div>
            <HealthRing score={82} color="#166534" />
          </div>
        </div>

        {/* Health breakdown */}
        <div style={{ background:WHITE, borderRadius:16, padding:"18px 20px", marginBottom:16, border:`1px solid ${BORDER}` }}>
          <h3 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.1rem", color:BLACK, margin:"0 0 14px", letterSpacing:"0.04em" }}>Score Breakdown</h3>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
            {breakdown.map(b => (
              <div key={b.label}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:"0.78rem", fontWeight:600, color:BLACK }}>{b.label}</span>
                  <span style={{ fontSize:"0.78rem", fontWeight:700, color:SAGE }}>{b.pct}%</span>
                </div>
                <div style={{ height:5, background:`${BLACK}08`, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${b.pct}%`, background:SAGE, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Moment */}
        <div style={{ background:WHITE, borderRadius:16, padding:"18px 20px", marginBottom:16, border:`1px solid ${BORDER}` }}>
          <h3 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.1rem", color:BLACK, margin:"0 0 12px", letterSpacing:"0.04em" }}>Next Moment</h3>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:"0.9rem", color:BLACK }}>💕 Anniversary · Jun 19</div>
              <div style={{ fontSize:"0.72rem", color:GRAY, marginTop:3 }}>8 days away</div>
            </div>
            <span style={{ padding:"3px 10px", borderRadius:10, background:"#EDF7F1", fontSize:"0.7rem", fontWeight:700, color:SAGE }}>On track</span>
            <button style={{ padding:"7px 14px", borderRadius:9, background:SAGE, color:WHITE, border:"none", fontWeight:700, fontSize:"0.78rem", cursor:"pointer" }}>Review Draft →</button>
          </div>
        </div>

        {/* Card history */}
        <div style={{ background:WHITE, borderRadius:16, padding:"18px 20px", marginBottom:16, border:`1px solid ${BORDER}` }}>
          <h3 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.1rem", color:BLACK, margin:"0 0 12px", letterSpacing:"0.04em" }}>Card History</h3>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:0 }}>
            {cards.map((c,i) => (
              <div key={c.event} style={{ padding:"10px 0", borderTop:i>0 ? `1px solid ${BORDER}` : "none", display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:SAGE, flexShrink:0, marginTop:6 }} />
                <div>
                  <div style={{ fontSize:"0.7rem", fontWeight:700, color:GRAY, marginBottom:3 }}>{c.event}</div>
                  <div style={{ fontFamily:"'Caveat', cursive", fontSize:"0.92rem", color:BLACK, lineHeight:1.5 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ background:WHITE, borderRadius:12, padding:"14px 18px", marginBottom:16, border:`1px solid ${BORDER}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:"0.78rem", fontWeight:600, color:BLACK }}>Profile completeness</span>
            <span style={{ fontSize:"0.78rem", fontWeight:700, color:SAGE }}>88%</span>
          </div>
          <div style={{ height:4, background:`${BLACK}08`, borderRadius:2, overflow:"hidden", marginBottom:6 }}>
            <div style={{ height:"100%", width:"88%", background:SAGE, borderRadius:2 }} />
          </div>
          <div style={{ fontSize:"0.7rem", color:GRAY }}>Missing: mailing address</div>
        </div>

        {/* Quick actions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          <button style={{ padding:"11px 8px", borderRadius:10, background:RED, color:WHITE, border:"none", fontWeight:700, fontSize:"0.78rem", cursor:"pointer" }}>Send Card</button>
          <button onClick={() => setLogOpen(true)} style={{ padding:"11px 8px", borderRadius:10, border:`1.5px solid ${SAGE}`, background:"none", color:SAGE, fontWeight:700, fontSize:"0.78rem", cursor:"pointer" }}>Log Moment</button>
          <button style={{ padding:"11px 8px", borderRadius:10, border:`1px solid ${BORDER}`, background:WHITE, color:BLACK, fontWeight:700, fontSize:"0.78rem", cursor:"pointer" }}>Edit Profile</button>
        </div>

        {logOpen && (
          <div onClick={() => setLogOpen(false)} style={{ position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200, padding:16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background:WHITE, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:520, padding:"24px 24px 36px" }}>
              <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.4rem", color:BLACK, marginBottom:4 }}>Log a Moment</div>
              <p style={{ fontSize:"0.84rem", color:GRAY, marginBottom:14 }}>What's something recent with Sarah?</p>
              <textarea value={logText} onChange={e => setLogText(e.target.value)} rows={4} placeholder="Her daughter just started school, she got a new job…" style={{ width:"100%", borderRadius:10, border:`1.5px solid ${BORDER}`, padding:"10px 14px", fontSize:"0.88rem", fontFamily:"'Plus Jakarta Sans', sans-serif", resize:"none" as const, boxSizing:"border-box" as const }} />
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <button onClick={() => setLogOpen(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:`1px solid ${BORDER}`, background:"none", color:GRAY, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                <button onClick={() => setLogOpen(false)} style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:SAGE, color:WHITE, fontWeight:700, cursor:"pointer" }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
