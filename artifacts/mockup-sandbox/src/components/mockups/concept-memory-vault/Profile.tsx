import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Mail, MessageCircle, Heart, Calendar } from 'lucide-react';

export function Profile() {
  const events = [
    { id: 1, type: 'memory', text: "Knee surgery went well, resting at home now.", date: 'Today', icon: <Heart size={16} /> },
    { id: 2, type: 'action', text: "Added task: Ask about physical therapy", date: 'Today', icon: <Plus size={16} /> },
    { id: 3, type: 'card', text: "Sent 'Thinking of You' card before surgery", date: 'Oct 10', icon: <Mail size={16} /> },
    { id: 4, type: 'memory', text: "Nervous about upcoming procedure but staying positive.", date: 'Oct 5', icon: <MessageCircle size={16} /> },
    { id: 5, type: 'memory', text: "Had a great lunch at the new Italian place downtown.", date: 'Sep 22', icon: <Heart size={16} /> }
  ];

  return (
    <div className="min-h-screen bg-[#F2E6D3] font-['Plus_Jakarta_Sans'] text-[#111111]">
      <div className="max-w-2xl mx-auto pt-16 pb-24 px-8">
        <header className="mb-12 text-center">
          <div className="w-32 h-32 mx-auto bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-6xl mb-6">
            👩
          </div>
          <h1 className="text-7xl font-['Bebas_Neue'] tracking-wider mb-2">MOM</h1>
          <p className="text-xl text-[#6B6B6B] font-['Caveat']">Family • 34 yearsTogther</p>
        </header>

        <div className="flex gap-4 mb-12">
          <button className="flex-1 bg-[#111111] text-white py-4 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-[#333] transition">
            <Plus size={20} /> LOG MEMORY
          </button>
          <button className="flex-1 bg-white border-2 border-[#E5E0D8] text-[#111111] py-4 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-gray-50 transition">
            <Mail size={20} /> SEND CARD
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-4 bottom-0 w-px bg-[#E5E0D8]"></div>
          
          <div className="space-y-8 relative">
            {events.map((e, i) => (
              <div key={e.id} className="flex gap-6 relative">
                <div className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center z-10 border-4 border-[#F2E6D3]
                  ${e.type === 'memory' ? 'bg-[#5B8C6B] text-white' : 
                    e.type === 'card' ? 'bg-[#E23B2E] text-white' : 'bg-white text-[#111111] border-[#E5E0D8]'}`}>
                  {e.icon}
                </div>
                
                <div className="flex-1 pt-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-[#6B6B6B] uppercase tracking-wider">{e.date}</span>
                  </div>
                  <div className={`p-5 rounded-2xl ${e.type === 'memory' ? 'bg-white shadow-sm' : 'bg-transparent border border-[#E5E0D8]'}`}>
                    {e.type === 'memory' ? (
                      <p className="text-2xl font-['Caveat'] leading-relaxed text-[#111111]">
                        "{e.text}"
                      </p>
                    ) : (
                      <p className="font-medium text-[#111111]">{e.text}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
