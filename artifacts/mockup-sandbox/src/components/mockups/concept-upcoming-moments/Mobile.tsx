import React from "react";
import { Plus, Home, Users, Settings, Bell, Calendar } from "lucide-react";

const BRAND = {
  BG: "#F2E6D3",
  RED: "#E23B2E",
  BLACK: "#111111",
  SAGE: "#5B8C6B",
  GRAY: "#6B6B6B",
  BORDER: "#E5E0D8"
};

const DATA_VERSION = "5";

const MOMENTS = [
  { id: 1, name: "Mom", event: "Birthday", date: "Oct 12", days: 3, urgent: true, avatar: "👩‍🦳" },
  { id: 2, name: "Steve", event: "Anniversary", date: "Oct 15", days: 6, urgent: true, avatar: "👨" },
  { id: 3, name: "Sarah", event: "New Job", date: "Oct 28", days: 19, urgent: false, avatar: "👱‍♀️" },
];

export function Mobile() {
  return (
    <div className="relative mx-auto border-8 border-black rounded-[3rem] overflow-hidden shadow-2xl bg-white flex flex-col" style={{ width: "390px", height: "844px", backgroundColor: BRAND.BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BRAND.BLACK }}>
      
      {/* Mobile Status Bar area */}
      <div className="h-12 w-full flex items-center justify-between px-6 text-xs font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 bg-black rounded-[2px]"></div>
          <div className="w-3 h-3 rounded-full bg-black"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        
        <header className="py-6 flex justify-between items-center">
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", lineHeight: 1, letterSpacing: "0.02em" }}>
            UPCOMING
          </h1>
          <button className="w-10 h-10 rounded-full border-2 flex items-center justify-center relative" style={{ borderColor: BRAND.BLACK }}>
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: BRAND.RED }}></span>
          </button>
        </header>

        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", color: BRAND.RED, marginBottom: "1rem", transform: "rotate(-2deg)" }}>
          Next 30 days...
        </p>

        <div className="flex flex-col gap-4">
          {MOMENTS.map(moment => (
            <div key={moment.id} className="rounded-2xl p-5 border-2 relative bg-white" style={{ borderColor: moment.urgent ? BRAND.RED : BRAND.BORDER, boxShadow: `4px 4px 0 ${moment.urgent ? BRAND.RED : BRAND.BLACK}` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl border border-black/10" style={{ backgroundColor: BRAND.BG }}>
                  {moment.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{moment.name}</h3>
                    {moment.urgent && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: BRAND.RED }}>Urgent</span>
                    )}
                  </div>
                  <p className="text-sm opacity-60 font-medium">{moment.event}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end border-t pt-4" style={{ borderColor: BRAND.BORDER }}>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.75rem", lineHeight: 1 }}>{moment.date}</p>
                </div>
                <button className="px-4 py-2 rounded border-2 font-bold uppercase text-xs tracking-wider" style={{ borderColor: BRAND.BLACK }}>
                  Send Card
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm hover:opacity-70">
            <Plus size={18} /> View All Months
          </button>
        </div>

        <div className="hidden" data-version={DATA_VERSION} />
      </div>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 w-full bg-white border-t-2 flex items-center justify-between px-8 py-5 pb-8" style={{ borderColor: BRAND.BORDER }}>
        <button className="flex flex-col items-center gap-1" style={{ color: BRAND.BLACK }}>
          <Calendar size={24} strokeWidth={2.5} />
        </button>
        <button className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100" style={{ color: BRAND.BLACK }}>
          <Users size={24} strokeWidth={2.5} />
        </button>
        
        <div className="relative -top-8">
          <button className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg" style={{ backgroundColor: BRAND.RED }}>
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        <button className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100" style={{ color: BRAND.BLACK }}>
          <Home size={24} strokeWidth={2.5} />
        </button>
        <button className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100" style={{ color: BRAND.BLACK }}>
          <Settings size={24} strokeWidth={2.5} />
        </button>
      </nav>
    </div>
  );
}
