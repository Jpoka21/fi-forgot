// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";

const chips = ["Got promoted to VP", "Loves craft beer", "College roommate 10 yrs", "Prefers humor in cards"];
const pastCards = [
  { event:"Birthday 2023",    excerpt:"Happy birthday man, another year wiser…" },
  { event:"Just Because 2022",excerpt:"Thinking of you — hope all is well…"    },
];

export function Profile() {
  const [answerOpen, setAnswerOpen] = useState(false);
  const [answer, setAnswer] = useState("");

  return (
    <div style={{ background:BG, minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background:BLACK, padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.6rem", color:RED }}>F.I. FORGOT</span>
        <span style={{ fontSize:"0.78rem", color:"#ffffff70", cursor:"pointer" }}>← Dashboard</span>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"24px 20px 48px" }}>
        {/* Person header */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:BLACK, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", flexShrink:0 }}>🧢</div>
          <div>
            <h1 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2.2rem", color:BLACK, margin:"0 0 4px", lineHeight:1 }}>MARCUS</h1>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ padding:"3px 12px", borderRadius:20, background:`${BLACK}08`, fontSize:"0.78rem", fontWeight:600, color:GRAY }}>Friend</span>
              <span style={{ padding:"3px 10px", borderRadius:20, background:`${RED}12`, fontSize:"0.72rem", fontWeight:700, color:RED }}>🔴 Birthday in 3 days</span>
            </div>
          </div>
        </div>

        {/* Action queue */}
        <div style={{ display:"flex", flexDirection:"column" as const, gap:8, marginBottom:20 }}>
          <button style={{ width:"100%", padding:"16px 20px", borderRadius:14, border:"none", background:RED, color:WHITE, fontFamily:"'Bebas Neue', cursive", fontSize:"1.1rem", letterSpacing:"0.06em", cursor:"pointer", textAlign:"left" as const }}>
            1. Write Birthday Card →
          </button>
          <button onClick={() => setAnswerOpen(true)} style={{ width:"100%", padding:"13px 20px", borderRadius:14, border:`2px solid #D97706`, background:"none", color:"#D97706", fontWeight:700, fontSize:"0.88rem", cursor:"pointer", textAlign:"left" as const }}>
            2. Answer: How's the new VP role going? →
          </button>
          <button style={{ width:"100%", padding:"13px 20px", borderRadius:14, border:`1px solid ${BORDER}`, background:WHITE, color:GRAY, fontWeight:700, fontSize:"0.88rem", cursor:"pointer", textAlign:"left" as const }}>
            3. Update mailing address →
          </button>
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:BORDER }} />
          <span style={{ fontFamily:"'Caveat', cursive", fontSize:"1rem", color:GRAY }}>— Context —</span>
          <div style={{ flex:1, height:1, background:BORDER }} />
        </div>

        {/* Memory chips */}
        <div style={{ display:"flex", flexWrap:"wrap" as const, gap:6, marginBottom:16 }}>
          {chips.map(c => (
            <span key={c} style={{ padding:"5px 12px", borderRadius:20, background:WHITE, border:`1px solid ${BORDER}`, fontSize:"0.78rem", fontWeight:600, color:BLACK }}>
              {c}
            </span>
          ))}
        </div>

        {/* Notes box */}
        <div style={{ background:"#FDF7EF", borderRadius:12, padding:"13px 16px", marginBottom:20, border:`1px solid ${BORDER}` }}>
          <p style={{ fontFamily:"'Caveat', cursive", fontSize:"0.95rem", color:GRAY, margin:0, fontStyle:"italic", lineHeight:1.6 }}>
            "Don't mention the divorce. Keep it upbeat and celebratory."
          </p>
        </div>

        {/* Past cards */}
        <div style={{ marginBottom:20 }}>
          <h3 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.05rem", color:BLACK, margin:"0 0 8px", letterSpacing:"0.04em" }}>Past Cards</h3>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:0, background:WHITE, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
            {pastCards.map((c,i) => (
              <div key={c.event} style={{ padding:"10px 14px", borderTop:i>0 ? `1px solid ${BORDER}` : "none", display:"flex", gap:10 }}>
                <div style={{ fontSize:"0.7rem", fontWeight:700, color:GRAY, minWidth:120 }}>{c.event}</div>
                <div style={{ fontFamily:"'Caveat', cursive", fontSize:"0.88rem", color:BLACK }}>{c.excerpt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile completeness */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:"0.72rem", color:GRAY, fontWeight:600, flexShrink:0 }}>Profile 72%</span>
          <div style={{ flex:1, height:4, background:`${BLACK}08`, borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:"72%", background:GRAY, borderRadius:2 }} />
          </div>
        </div>
      </div>

      {answerOpen && (
        <div onClick={() => setAnswerOpen(false)} style={{ position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200, padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:WHITE, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:520, padding:"24px 24px 36px" }}>
            <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.3rem", color:BLACK, marginBottom:4 }}>Follow-up Answer</div>
            <p style={{ fontSize:"0.82rem", color:GRAY, marginBottom:14 }}>How's the new VP role going for Marcus?</p>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={3} placeholder="He's settling in, still getting used to the new responsibilities…" style={{ width:"100%", borderRadius:10, border:`1.5px solid ${BORDER}`, padding:"10px 14px", fontSize:"0.88rem", fontFamily:"'Plus Jakarta Sans', sans-serif", resize:"none" as const, boxSizing:"border-box" as const }} />
            <button onClick={() => { setAnswerOpen(false); setAnswer(""); }} style={{ width:"100%", marginTop:12, padding:"12px", borderRadius:10, border:"none", background:BLACK, color:WHITE, fontWeight:700, cursor:"pointer" }}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
