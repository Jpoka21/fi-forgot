// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";

const pastCards = [
  { event:"Christmas 2023",   excerpt:"Merry Christmas brother, here's to another year of being your friend…" },
  { event:"Birthday 2023",    excerpt:"Wishing you the absolute best this birthday and always, Steve…" },
  { event:"Just Because 2024",excerpt:"Thinking of you and hope this finds you well, my friend…" },
];

export function Profile() {
  const [logOpen, setLogOpen] = useState(false);
  const [logText, setLogText] = useState("");

  return (
    <div style={{ background:BG, minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background:BLACK, padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.6rem", color:RED }}>F.I. FORGOT</span>
        <span style={{ fontSize:"0.78rem", color:"#ffffff70", cursor:"pointer" }}>← Dashboard</span>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"24px 20px 48px" }}>
        {/* Person header */}
        <div style={{ background:WHITE, borderRadius:16, padding:"24px", marginBottom:20, border:`1px solid ${BORDER}`, textAlign:"center" as const }}>
          <div style={{ width:68, height:68, borderRadius:"50%", background:BLACK, margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>🤝</div>
          <h1 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2.5rem", color:BLACK, margin:"0 0 6px", letterSpacing:"0.02em" }}>STEVE</h1>
          <span style={{ padding:"4px 14px", borderRadius:20, background:`${BLACK}08`, fontSize:"0.82rem", fontWeight:600, color:GRAY }}>Friend</span>
          <span style={{ marginLeft:8, padding:"3px 10px", borderRadius:20, background:`${SAGE}12`, fontSize:"0.72rem", fontWeight:700, color:SAGE }}>Active</span>

          {/* Stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20, paddingTop:16, borderTop:`1px solid ${BORDER}` }}>
            {[["5","Cards Sent"],["2","Upcoming"],["4","Yrs Known"]].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.8rem", color:BLACK, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:"0.68rem", color:GRAY, fontWeight:600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Moments for this person */}
        <div style={{ marginBottom:20 }}>
          <h3 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.15rem", color:BLACK, margin:"0 0 10px", letterSpacing:"0.04em" }}>Upcoming Moments</h3>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:8 }}>
            <div style={{ background:WHITE, borderRadius:12, padding:"12px 16px", border:`1px solid ${RED}40`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:9, background:RED, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.2rem", color:WHITE, lineHeight:1 }}>3</span>
                <span style={{ fontSize:"0.45rem", fontWeight:700, color:"#ffffff80" }}>DAYS</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:"0.88rem", color:BLACK }}>🎂 Birthday · Jun 14</div>
                <div style={{ fontSize:"0.72rem", color:RED, fontWeight:600, marginTop:2 }}>Draft ready to review</div>
              </div>
              <button style={{ padding:"6px 12px", borderRadius:8, background:RED, color:WHITE, border:"none", fontWeight:700, fontSize:"0.74rem", cursor:"pointer" }}>Review →</button>
            </div>
            <div style={{ background:WHITE, borderRadius:12, padding:"12px 16px", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:9, background:`${BLACK}08`, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.2rem", color:BLACK, lineHeight:1 }}>22</span>
                <span style={{ fontSize:"0.45rem", fontWeight:700, color:GRAY }}>DAYS</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:"0.88rem", color:BLACK }}>✉️ Just Because · Jul 3</div>
                <div style={{ fontSize:"0.72rem", color:GRAY, marginTop:2 }}>On track</div>
              </div>
              <button style={{ padding:"6px 12px", borderRadius:8, background:`${BLACK}08`, color:BLACK, border:"none", fontWeight:700, fontSize:"0.74rem", cursor:"pointer" }}>View</button>
            </div>
          </div>
        </div>

        {/* Past Cards */}
        <div style={{ marginBottom:20 }}>
          <h3 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.15rem", color:BLACK, margin:"0 0 10px", letterSpacing:"0.04em" }}>Past Cards Sent</h3>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:0, background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
            {pastCards.map((c,i) => (
              <div key={c.event} style={{ padding:"12px 16px", borderTop:i>0 ? `1px solid ${BORDER}` : "none", display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:RED, flexShrink:0, marginTop:6 }} />
                <div>
                  <div style={{ fontSize:"0.72rem", fontWeight:700, color:GRAY, marginBottom:4 }}>{c.event}</div>
                  <div style={{ fontFamily:"'Caveat', cursive", fontSize:"0.95rem", color:BLACK, lineHeight:1.5 }}>"{c.excerpt}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setLogOpen(true)} style={{ flex:1, padding:"11px", borderRadius:10, border:`2px solid ${SAGE}`, background:"none", color:SAGE, fontWeight:700, fontSize:"0.85rem", cursor:"pointer" }}>
            + Add a Moment
          </button>
          <button style={{ flex:1, padding:"11px", borderRadius:10, border:`1px solid ${BORDER}`, background:WHITE, color:BLACK, fontWeight:700, fontSize:"0.85rem", cursor:"pointer" }}>
            Edit Profile
          </button>
        </div>

        {/* Log moment modal */}
        {logOpen && (
          <div onClick={() => setLogOpen(false)} style={{ position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200, padding:16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background:WHITE, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:520, padding:"24px 24px 36px" }}>
              <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.4rem", color:BLACK, marginBottom:4 }}>Add a Moment</div>
              <p style={{ fontSize:"0.84rem", color:GRAY, marginBottom:14 }}>What's something recent that happened with Steve?</p>
              <textarea value={logText} onChange={e => setLogText(e.target.value)} placeholder="He just started a new job, got a promotion…" rows={4} style={{ width:"100%", borderRadius:10, border:`1.5px solid ${BORDER}`, padding:"10px 14px", fontSize:"0.88rem", fontFamily:"'Plus Jakarta Sans', sans-serif", resize:"none" as const, boxSizing:"border-box" as const }} />
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <button onClick={() => setLogOpen(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:`1px solid ${BORDER}`, background:"none", color:GRAY, fontWeight:600, fontSize:"0.84rem", cursor:"pointer" }}>Cancel</button>
                <button onClick={() => { setLogOpen(false); setLogText(""); }} style={{ flex:2, padding:"11px", borderRadius:10, border:"none", background:SAGE, color:WHITE, fontWeight:700, fontSize:"0.84rem", cursor:"pointer" }}>Save Memory</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
