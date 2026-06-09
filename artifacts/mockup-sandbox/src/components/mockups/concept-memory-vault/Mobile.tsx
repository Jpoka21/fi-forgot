import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Home, Users, Bell, User } from 'lucide-react';

export function Mobile() {
  const memories = [
    { id: 1, person: 'Mom', avatar: '👩', text: "Knee surgery went well, resting at home now.", date: 'Today' },
    { id: 2, person: 'Marcus', avatar: '👨🏾', text: "Got the promotion to Senior Director!", date: 'Yesterday' },
    { id: 3, person: 'Steve', avatar: '👱🏻‍♂️', text: "Started guitar lessons, fingers are bleeding but he loves it.", date: 'Oct 12' }
  ];

  return (
    <div className="min-h-screen bg-[#F2E6D3] font-['Plus_Jakarta_Sans'] text-[#111111] pb-24 relative overflow-hidden">
      <header className="bg-white px-6 pt-14 pb-6 shadow-sm sticky top-0 z-20">
        <h1 className="text-4xl font-['Bebas_Neue'] tracking-wider">WHAT'S NEW</h1>
      </header>

      <div className="p-4 space-y-4">
        {memories.map((m) => (
          <Card key={m.id} className="bg-white border-0 shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{m.avatar}</div>
                  <span className="font-bold text-lg">{m.person}</span>
                </div>
                <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">{m.date}</span>
              </div>
              <p className="text-2xl font-['Caveat'] leading-snug text-[#111111]">
                "{m.text}"
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <button className="fixed bottom-24 right-6 w-16 h-16 bg-[#E23B2E] text-white rounded-full shadow-lg flex items-center justify-center z-30 hover:scale-105 transition-transform">
        <Plus size={32} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E0D8] px-6 py-4 flex justify-between items-center z-30 pb-safe">
        <button className="flex flex-col items-center gap-1 text-[#111111]">
          <Home size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Feed</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#6B6B6B]">
          <Users size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">People</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#6B6B6B]">
          <Bell size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Alerts</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#6B6B6B]">
          <User size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Me</span>
        </button>
      </nav>
    </div>
  );
}
