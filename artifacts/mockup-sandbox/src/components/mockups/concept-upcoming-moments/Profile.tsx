import React from "react";
import { ArrowLeft, Edit3, Mail, Heart, CalendarPlus, Clock } from "lucide-react";

const BRAND = {
  BG: "#F2E6D3",
  RED: "#E23B2E",
  BLACK: "#111111",
  SAGE: "#5B8C6B",
  GRAY: "#6B6B6B",
  BORDER: "#E5E0D8"
};

const DATA_VERSION = "5";

const PAST_CARDS = [
  { id: 1, type: "Birthday", date: "Oct 15, 2023", cover: "🎂", status: "Delivered" },
  { id: 2, type: "Just Because", date: "May 2, 2023", cover: "🍺", status: "Delivered" },
  { id: 3, type: "Holiday", date: "Dec 20, 2022", cover: "🎄", status: "Delivered" },
];

const UPCOMING = [
  { id: 1, event: "Anniversary", date: "Oct 15", days: 6, urgent: true },
  { id: 2, event: "Birthday", date: "Mar 10", days: 145, urgent: false },
];

export function Profile() {
  return (
    <div style={{ backgroundColor: BRAND.BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BRAND.BLACK }}>
      {/* Top Nav */}
      <nav className="px-8 py-6 flex items-center justify-between">
        <button className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm hover:opacity-70 transition-opacity">
          <ArrowLeft size={18} /> Back
        </button>
        <button className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm hover:opacity-70 transition-opacity">
          <Edit3 size={18} /> Edit Profile
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-4">
        
        {/* Person Header */}
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 text-center md:text-left">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-6xl border-4 shadow-lg bg-white relative" style={{ borderColor: BRAND.BLACK }}>
            👨
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white" style={{ borderColor: BRAND.BLACK }}>
              <Heart size={20} fill={BRAND.RED} color={BRAND.RED} />
            </div>
          </div>
          <div className="pt-2">
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", color: BRAND.SAGE, transform: "rotate(-2deg)", marginBottom: "-0.5rem" }}>
              Known for 12 yearsTogther
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "5rem", lineHeight: 0.9, letterSpacing: "0.02em" }}>
              STEVE
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              <span className="px-4 py-1.5 rounded-full border-2 font-bold uppercase tracking-wider text-xs" style={{ borderColor: BRAND.BLACK }}>Friend</span>
              <span className="px-4 py-1.5 rounded-full border-2 font-bold uppercase tracking-wider text-xs" style={{ borderColor: BRAND.BLACK }}>Austin, TX</span>
            </div>
          </div>
          <div className="md:ml-auto pt-4">
            <button className="px-8 py-4 rounded-full text-white font-bold uppercase tracking-wide flex items-center gap-2 shadow-[4px_4px_0_#111111] hover:translate-y-1 hover:shadow-[2px_2px_0_#111111] transition-all" style={{ backgroundColor: BRAND.RED, fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem" }}>
              <Mail size={24} />
              Send Card
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Upcoming Section */}
          <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem" }}>Upcoming</h2>
              <button className="w-8 h-8 rounded-full border-2 flex items-center justify-center hover:bg-black/5" style={{ borderColor: BRAND.BLACK }}>
                <CalendarPlus size={16} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {UPCOMING.map(item => (
                <div key={item.id} className="p-4 rounded-xl border-2 bg-white" style={{ borderColor: item.urgent ? BRAND.RED : BRAND.BORDER }}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{item.event}</h3>
                    {item.urgent && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: BRAND.RED }}>Soon</span>}
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem" }}>{item.date}</span>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">In {item.days} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History Section */}
          <div className="md:col-span-2">
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem" }} className="mb-6">Card History</h2>
            
            <div className="relative border-l-2 ml-6 pl-8 pb-8" style={{ borderColor: BRAND.BORDER }}>
              {PAST_CARDS.map((card, i) => (
                <div key={card.id} className="mb-10 relative">
                  <div className="absolute -left-[43px] top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center" style={{ borderColor: BRAND.BLACK }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND.BLACK }}></div>
                  </div>
                  
                  <p className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BRAND.SAGE }}>
                    <Clock size={14} />
                    {card.date}
                  </p>
                  
                  <div className="flex gap-6 items-center p-4 rounded-xl border-2 bg-white/50" style={{ borderColor: BRAND.BORDER }}>
                    <div className="w-20 h-24 rounded shadow-sm border flex items-center justify-center text-3xl bg-white" style={{ borderColor: BRAND.BORDER }}>
                      {card.cover}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{card.type}</h3>
                      <p className="text-sm font-medium opacity-60 mb-3">Sent via automated schedule</p>
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded bg-black/5">
                        {card.status}
                      </span>
                    </div>
                    <div className="ml-auto">
                      <button className="text-sm font-bold underline underline-offset-4 hover:opacity-70">View</button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="absolute -left-[43px] bottom-0 w-5 h-5 rounded-full border-2 bg-white" style={{ borderColor: BRAND.BORDER }}></div>
            </div>
          </div>
          
        </div>
        <div className="hidden" data-version={DATA_VERSION} />
      </main>
    </div>
  );
}
