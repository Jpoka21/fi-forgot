// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF";
const BLUE="#2E6BE2", BLUE_BG="#EEF3FD";

type Tab = "all"|"memories"|"cards"|"followups";

const timeline = [
  { type:"card",   date:"May 2024",  icon:"💌", title:"Mother's Day Card 2024", excerpt:"You've always known exactly how to make a house feel like home…", badge:null },
  { type:"memory", date:"Apr 2025",  icon:"💭", title:"Knee surgery — recovering well at home", excerpt:null, badge:"follow_up" },
  { type:"followup",date:"May 2025", icon:"🔁", title:"You mentioned her recovery — How is she feeling now?", excerpt:null, badge:null },
  { type:"memory", date:"Mar 2025",  icon:"💭", title:"Started her garden again after years away", excerpt:null, badge:null },
  { type:"card",   date:"Oct 2024",  icon:"💌", title:"Birthday Card 2024", excerpt:"Every year you show us what it means to lead with love…", badge:null },
  { type:"memory", date:"Oct 2024",  icon:"💭", title:"Celebrated 40 years with Dad", excerpt:null, badge:null },
];

export function Profile() {
  const [tab, setTab] = useState<Tab>("all");
  const [answerOpen, setAnswerOpen] = useState(false);
  const [answer, setAnswer] = useState("");

  const filtered = timeline.filter(t => {
    if (tab === "all") return true;
    if (tab === "memories") return t.type === "memory";
    if (tab === "cards") return t.type === "card";
    if (tab === "followups") return t.type === "followup";
    return true;
  });

  return (
    <div style={{ background:BG, minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ background:BLACK, padding:"0 24px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 }}>
        <span style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.6rem", color:RED }}>F.I. FORGOT</span>
        <span style={{ fontSize:"0.78rem", color:"#ffffff70", cursor:"pointer" }}>← What's New</span>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"24px 20px 80px" }}>
        {/* Person header */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          <div style={{ width:68, height:68, borderRadius:"50%", background:BLACK, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.2rem", flexShrink:0 }}>🌷</div>
          <div>
            <h1 style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"2.2rem", color:BLACK, margin:"0 0 4px", lineHeight:1 }}>MOM</h1>
            <span style={{ padding:"3px 12px", borderRadius:20, background:`${BLACK}08`, fontSize:"0.78rem", fontWeight:600, color:GRAY }}>Mother</span>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:"flex", background:WHITE, borderRadius:10, padding:3, gap:2, marginBottom:20, border:`1px solid ${BORDER}` }}>
          {([["all","All"],["memories","Memories"],["cards","Cards"],["followups","Follow-ups"]] as const).map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex:1, padding:"7px 4px", borderRadius:7, border:"none", background:tab===key ? BLACK : "transparent", color:tab===key ? WHITE : GRAY, fontWeight:700, fontSize:"0.72rem", cursor:"pointer" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position:"relative" as const }}>
          <div style={{ position:"absolute" as const, left:19, top:0, bottom:0, width:2, background:BORDER }} />
          <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
            {filtered.map((item,i) => (
              <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:40, height:40, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", zIndex:1, border:`2px solid ${WHITE}`, background:item.type==="card" ? `${RED}15` : item.type==="followup" ? BLUE_BG : `${SAGE}15` }}>
                  {item.icon}
                </div>
                <div style={{ flex:1, background:WHITE, borderRadius:12, padding:"12px 14px", border:`1px solid ${item.type==="followup" ? `${BLUE}30` : BORDER}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:item.excerpt||item.type==="followup" ? 6 : 0 }}>
                    <span style={{ fontWeight:700, fontSize:"0.85rem", color:item.type==="followup" ? BLUE : BLACK }}>{item.title}</span>
                    <span style={{ fontSize:"0.68rem", color:GRAY, flexShrink:0, marginLeft:8 }}>{item.date}</span>
                  </div>
                  {item.excerpt && (
                    <p style={{ fontFamily:"'Caveat', cursive", fontSize:"0.92rem", color:BLACK, margin:0, fontStyle:"italic", lineHeight:1.5 }}>"{item.excerpt}"</p>
                  )}
                  {item.badge === "follow_up" && (
                    <span style={{ fontSize:"0.67rem", fontWeight:700, padding:"2px 8px", borderRadius:10, background:"#FFFBEB", color:"#D97706" }}>↻ Follow-up due</span>
                  )}
                  {item.type === "followup" && (
                    <button onClick={() => setAnswerOpen(true)} style={{ marginTop:8, padding:"5px 12px", borderRadius:8, border:"none", background:BLUE, color:WHITE, fontWeight:700, fontSize:"0.74rem", cursor:"pointer" }}>Answer →</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log a Moment FAB-style button at bottom */}
        <button style={{ position:"fixed" as const, bottom:24, left:"50%", transform:"translateX(-50%)", padding:"13px 32px", borderRadius:24, border:"none", background:SAGE, color:WHITE, fontFamily:"'Bebas Neue', cursive", fontSize:"1.05rem", letterSpacing:"0.06em", cursor:"pointer", boxShadow:`0 4px 20px ${SAGE}50`, whiteSpace:"nowrap" as const }}>
          + Log a Moment
        </button>
      </div>

      {answerOpen && (
        <div onClick={() => setAnswerOpen(false)} style={{ position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200, padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:WHITE, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:520, padding:"24px 24px 36px" }}>
            <div style={{ fontFamily:"'Bebas Neue', cursive", fontSize:"1.3rem", color:BLUE, marginBottom:4 }}>Follow-up Answer</div>
            <p style={{ fontSize:"0.82rem", color:GRAY, marginBottom:14 }}>How is she feeling now after the surgery?</p>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={3} placeholder="She's doing much better now…" style={{ width:"100%", borderRadius:10, border:`1.5px solid ${BLUE}30`, padding:"10px 14px", fontSize:"0.88rem", fontFamily:"'Plus Jakarta Sans', sans-serif", resize:"none" as const, boxSizing:"border-box" as const }} />
            <button onClick={() => { setAnswerOpen(false); setAnswer(""); }} style={{ width:"100%", marginTop:12, padding:"12px", borderRadius:10, border:"none", background:BLUE, color:WHITE, fontWeight:700, cursor:"pointer" }}>Save Answer</button>
          </div>
        </div>
      )}
    </div>
  );
}
