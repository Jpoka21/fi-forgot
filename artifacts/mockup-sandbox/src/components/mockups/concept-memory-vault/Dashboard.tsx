import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Bell } from 'lucide-react';

export function Dashboard() {
  const memories = [
    { id: 1, person: 'Mom', avatar: '👩', type: 'health', text: "Knee surgery went well, resting at home now. Needs meals next week.", date: 'Today', followUp: "Ask about physical therapy schedule" },
    { id: 2, person: 'Marcus', avatar: '👨🏾', type: 'career', text: "Got the promotion to Senior Director! Finally happened after 2 years.", date: 'Yesterday', followUp: "Send congratulatory card" },
    { id: 3, person: 'Steve', avatar: '👱🏻‍♂️', type: 'hobby', text: "Started guitar lessons, fingers are bleeding but he loves it.", date: 'Oct 12', followUp: null },
    { id: 4, person: 'Sarah', avatar: '👩🏼‍🦰', type: 'family', text: "Kids started soccer. Weekends are chaotic now.", date: 'Oct 10', followUp: null }
  ];

  return (
    <div className="min-h-screen bg-[#F2E6D3] p-12 font-['Plus_Jakarta_Sans'] text-[#111111]">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-['Bebas_Neue'] tracking-wider mb-2">WHAT'S NEW</h1>
            <p className="text-[#6B6B6B]">Recent memories and updates from your people.</p>
          </div>
          <button className="bg-[#E23B2E] text-white px-6 py-3 rounded-full font-bold tracking-wide uppercase hover:bg-[#c93226] transition flex items-center gap-2">
            <Plus size={20} /> Log Memory
          </button>
        </header>

        <div className="space-y-6">
          {memories.map((m) => (
            <Card key={m.id} className="bg-white border-[#E5E0D8] shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-[#E5E0D8] bg-[#F2E6D3] flex items-center justify-center text-xl">
                        {m.avatar}
                      </Avatar>
                      <span className="font-bold text-lg">{m.person}</span>
                    </div>
                    <span className="text-sm font-medium text-[#6B6B6B] uppercase tracking-wider">{m.date}</span>
                  </div>
                  
                  <div className="pl-13">
                    <p className="text-3xl font-['Caveat'] leading-relaxed text-[#111111] mb-4">
                      "{m.text}"
                    </p>
                    
                    {m.followUp && (
                      <div className="bg-[#fcf8f2] border border-[#E5E0D8] rounded-xl p-4 mt-4 flex items-start gap-3">
                        <div className="bg-[#E23B2E]/10 p-2 rounded-full text-[#E23B2E]">
                          <Bell size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#E23B2E] mb-1">Follow-up Idea</p>
                          <p className="text-sm font-medium">{m.followUp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
