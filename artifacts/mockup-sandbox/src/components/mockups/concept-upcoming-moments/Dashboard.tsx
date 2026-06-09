import React from "react";
import { Calendar, Clock, ArrowRight, User, Plus } from "lucide-react";

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
  { id: 4, name: "Marcus", event: "Moving", date: "Nov 2", days: 24, urgent: false, avatar: "🧔" },
];

const PEOPLE = [
  { id: 1, name: "Mom", relation: "Mother", avatar: "👩‍🦳", lastContact: "2 weeks ago" },
  { id: 2, name: "Steve", relation: "Friend", avatar: "👨", lastContact: "1 month ago" },
  { id: 3, name: "Sarah", relation: "Sister", avatar: "👱‍♀️", lastContact: "3 days ago" },
  { id: 4, name: "Marcus", relation: "Friend", avatar: "🧔", lastContact: "2 months ago" },
];

export function Dashboard() {
  return (
    <div style={{ backgroundColor: BRAND.BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BRAND.BLACK, paddingBottom: "4rem" }}>
      {/* Header */}
      <header className="px-8 py-10 border-b border-black/10 flex justify-between items-end">
        <div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", color: BRAND.RED, marginBottom: "-0.5rem", transform: "rotate(-2deg)" }}>Welcome back,</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "4rem", lineHeight: 1, letterSpacing: "0.02em" }}>
            F*I FORGOT — YOUR NEXT 30 DAYS
          </h1>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold tracking-wide uppercase text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: BRAND.BLACK, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em", fontSize: "1.25rem" }}>
          <Plus size={20} />
          Add Moment
        </button>
      </header>

      <main className="px-8 py-12 max-w-7xl mx-auto">
        
        {/* Timeline */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem" }} className="flex items-center gap-3">
              <Calendar className="text-black" size={28} />
              Upcoming Moments
            </h2>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {MOMENTS.map(moment => (
              <div key={moment.id} className="min-w-[300px] flex-shrink-0 snap-start rounded-2xl p-6 relative border-2 transition-transform hover:-translate-y-1 cursor-pointer bg-white" style={{ borderColor: moment.urgent ? BRAND.RED : BRAND.BORDER, boxShadow: `4px 4px 0 ${BRAND.BLACK}` }}>
                {moment.urgent && (
                  <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-white font-bold text-xs uppercase tracking-wider" style={{ backgroundColor: BRAND.RED }}>
                    Urgent
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-black/10" style={{ backgroundColor: BRAND.BG }}>
                      {moment.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{moment.name}</h3>
                      <p className="text-sm opacity-60 font-medium">{moment.event}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold opacity-50 uppercase tracking-wider mb-1">Date</p>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", lineHeight: 1 }}>{moment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: moment.urgent ? BRAND.RED : BRAND.GRAY }}>In {moment.days} days</p>
                    <button className="flex items-center gap-1 text-sm font-bold group">
                      Send Card <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* People Grid */}
        <section>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem" }} className="mb-8 flex items-center gap-3">
            <User className="text-black" size={28} />
            Your People
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PEOPLE.map(person => (
              <div key={person.id} className="rounded-2xl p-6 border-2 flex flex-col items-center text-center cursor-pointer hover:bg-black/[0.02] transition-colors" style={{ borderColor: BRAND.BORDER, backgroundColor: "transparent" }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 border-black/10 mb-4 bg-white shadow-sm">
                  {person.avatar}
                </div>
                <h3 className="font-bold text-xl mb-1">{person.name}</h3>
                <p className="text-sm uppercase tracking-wider font-bold mb-4" style={{ color: BRAND.SAGE }}>{person.relation}</p>
                <div className="mt-auto pt-4 border-t border-black/10 w-full flex items-center justify-center gap-2 text-xs font-medium opacity-60">
                  <Clock size={14} />
                  Last card: {person.lastContact}
                </div>
              </div>
            ))}
            
            <div className="rounded-2xl p-6 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-black/[0.02] transition-colors min-h-[240px]" style={{ borderColor: BRAND.BLACK }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 mb-4" style={{ borderColor: BRAND.BLACK }}>
                <Plus size={24} />
              </div>
              <h3 className="font-bold text-lg">Add Person</h3>
            </div>
          </div>
        </section>

        <div className="hidden" data-version={DATA_VERSION} />
      </main>
    </div>
  );
}
