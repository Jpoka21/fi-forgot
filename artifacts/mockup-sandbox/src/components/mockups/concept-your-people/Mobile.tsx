import React from 'react';

export function Mobile() {
  const people = [
    { name: 'Sarah', relationship: 'Sister', health: 92, nextEvent: 'B-Day (12d)', initials: 'S', color: 'bg-orange-200' },
    { name: 'Mom', relationship: 'Mother', health: 85, nextEvent: 'Anniv (2mo)', initials: 'M', color: 'bg-blue-200' },
    { name: 'Marcus', relationship: 'Friend', health: 45, nextEvent: 'Promotion', initials: 'M', color: 'bg-green-200' },
    { name: 'Dave', relationship: 'Husband', health: 70, nextEvent: 'B-Day (4mo)', initials: 'D', color: 'bg-yellow-200' },
    { name: 'Jessica', relationship: 'Colleague', health: 30, nextEvent: 'None', initials: 'J', color: 'bg-purple-200' },
    { name: 'Steve', relationship: 'Brother', health: 88, nextEvent: 'Graduation', initials: 'S', color: 'bg-teal-200' },
  ];

  return (
    <div style={{ backgroundColor: '#F2E6D3', color: '#111111', fontFamily: '"Plus Jakarta Sans", sans-serif' }} className="h-screen w-full flex flex-col relative overflow-hidden">
      <header className="px-6 pb-6 pt-16" style={{ backgroundColor: '#111111', color: '#F2E6D3' }}>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif' }} className="text-5xl tracking-wider">YOUR PEOPLE</h1>
        <p className="text-sm mt-1 opacity-80 font-bold tracking-wide">3 needs attention • 12 healthy</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {people.map(p => (
          <div key={p.name} style={{ backgroundColor: '#fff', borderColor: '#E5E0D8' }} className="p-4 rounded-2xl border flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${p.color}`}>
                  {p.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: p.health > 80 ? '#5B8C6B' : p.health > 50 ? '#E23B2E' : '#E23B2E' }}></div>
              </div>
              <div>
                <h3 style={{ fontFamily: '"Bebas Neue", sans-serif' }} className="text-2xl leading-none">{p.name}</h3>
                <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#6B6B6B' }}>{p.relationship}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{p.nextEvent}</div>
              <div className="text-[10px] font-bold uppercase mt-1 tracking-widest" style={{ color: '#6B6B6B' }}>{p.health} Health</div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t flex items-start pt-4 justify-around px-6" style={{ borderColor: '#E5E0D8' }}>
        <div className="flex flex-col items-center text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Timeline</span>
        </div>
        <div className="flex flex-col items-center" style={{ color: '#111111' }}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">People</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Settings</span>
        </div>
      </div>
    </div>
  );
}
