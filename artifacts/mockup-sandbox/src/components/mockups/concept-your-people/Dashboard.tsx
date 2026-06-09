import React from 'react';

export function Dashboard() {
  const people = [
    { name: 'Sarah', relationship: 'Sister', health: 92, nextEvent: 'Birthday in 12 days', lastContact: '2 days ago', initials: 'S', color: 'bg-orange-200' },
    { name: 'Mom', relationship: 'Mother', health: 85, nextEvent: 'Anniversary in 2 mos', lastContact: '1 week ago', initials: 'M', color: 'bg-blue-200' },
    { name: 'Marcus', relationship: 'Friend', health: 45, nextEvent: 'Promotion soon', lastContact: '3 months ago', initials: 'M', color: 'bg-green-200' },
    { name: 'Dave', relationship: 'Husband', health: 70, nextEvent: 'Birthday in 4 mos', lastContact: '1 day ago', initials: 'D', color: 'bg-yellow-200' },
    { name: 'Jessica', relationship: 'Colleague', health: 30, nextEvent: 'None upcoming', lastContact: '6 months ago', initials: 'J', color: 'bg-purple-200' },
  ];

  return (
    <div style={{ backgroundColor: '#F2E6D3', color: '#111111', fontFamily: '"Plus Jakarta Sans", sans-serif' }} className="min-h-screen p-8">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', color: '#111111' }} className="text-6xl tracking-wider">YOUR PEOPLE</h1>
          <p style={{ color: '#6B6B6B' }} className="text-lg mt-2 font-medium">3 needs attention • 12 healthy</p>
        </div>
        <button style={{ backgroundColor: '#111111', color: '#F2E6D3' }} className="px-6 py-3 rounded-full font-bold">
          + Add Person
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map(p => (
          <div key={p.name} style={{ borderColor: '#E5E0D8', backgroundColor: '#fff' }} className="border rounded-2xl p-6 relative shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
             <div className="flex items-start justify-between mb-6">
               <div className="flex items-center gap-4">
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${p.color}`}>
                   {p.initials}
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{p.name}</h2>
                   <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#6B6B6B' }}>{p.relationship}</p>
                 </div>
               </div>
               <div className="flex flex-col items-center">
                 <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-4" style={{ borderColor: p.health > 80 ? '#5B8C6B' : p.health > 50 ? '#E23B2E' : '#E23B2E' }}>
                    <span className="font-bold text-sm">{p.health}</span>
                 </div>
                 <span className="text-[10px] font-bold mt-1 uppercase" style={{ color: '#6B6B6B' }}>Health</span>
               </div>
             </div>
             
             <div className="space-y-3 pt-4 border-t" style={{ borderColor: '#E5E0D8' }}>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>Next Event</span>
                 <span className="text-sm font-bold">{p.nextEvent}</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>Last Contact</span>
                 <span className="text-sm font-bold">{p.lastContact}</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
