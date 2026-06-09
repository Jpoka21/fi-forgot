import React from 'react';

export function Profile() {
  return (
    <div style={{ backgroundColor: '#F2E6D3', color: '#111111', fontFamily: '"Plus Jakarta Sans", sans-serif' }} className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <div className="text-6xl mb-4">👩‍🦰</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', color: '#111111' }} className="text-7xl tracking-wider">SARAH</h1>
        <p style={{ color: '#6B6B6B' }} className="text-xl mt-2 font-bold uppercase tracking-widest">Sister • 92 Health Score</p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-12">
        <button style={{ backgroundColor: '#111111', color: '#F2E6D3' }} className="py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 hover:opacity-90">
          <span className="text-2xl">✉️</span> Send Card
        </button>
        <button style={{ backgroundColor: '#fff', color: '#111111', borderColor: '#E5E0D8' }} className="py-4 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
          <span className="text-2xl">📝</span> Log Moment
        </button>
        <button style={{ backgroundColor: '#fff', color: '#111111', borderColor: '#E5E0D8' }} className="py-4 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
          <span className="text-2xl">❓</span> Ask Question
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 space-y-6">
          <div style={{ backgroundColor: '#fff', borderColor: '#E5E0D8' }} className="p-6 rounded-2xl border">
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif' }} className="text-3xl mb-6">Health</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="font-bold uppercase tracking-wider" style={{ color: '#6B6B6B' }}>Recency</span><span className="font-bold">Good</span></div>
                <div className="h-2 rounded-full w-full" style={{ backgroundColor: '#E5E0D8' }}>
                  <div className="h-full rounded-full w-4/5" style={{ backgroundColor: '#5B8C6B' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="font-bold uppercase tracking-wider" style={{ color: '#6B6B6B' }}>Consistency</span><span className="font-bold">Great</span></div>
                <div className="h-2 rounded-full w-full" style={{ backgroundColor: '#E5E0D8' }}>
                  <div className="h-full rounded-full w-11/12" style={{ backgroundColor: '#5B8C6B' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="font-bold uppercase tracking-wider" style={{ color: '#6B6B6B' }}>Effort</span><span className="font-bold text-red-600">Needs work</span></div>
                <div className="h-2 rounded-full w-full" style={{ backgroundColor: '#E5E0D8' }}>
                  <div className="h-full rounded-full w-2/5" style={{ backgroundColor: '#E23B2E' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#fff', borderColor: '#E5E0D8' }} className="p-6 rounded-2xl border">
             <h3 style={{ fontFamily: '"Bebas Neue", sans-serif' }} className="text-3xl mb-4">Next Up</h3>
             <div className="font-bold text-lg">Birthday</div>
             <div className="text-sm font-bold uppercase mt-1" style={{ color: '#E23B2E' }}>In 12 days</div>
          </div>
        </div>
        
        <div className="col-span-2 space-y-6">
          <div style={{ backgroundColor: '#fff', borderColor: '#E5E0D8' }} className="p-8 rounded-2xl border">
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif' }} className="text-4xl mb-8">Card History</h3>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-16 h-24 rounded shadow bg-orange-100 flex-shrink-0 border" style={{ borderColor: '#E5E0D8' }}></div>
                <div>
                  <h4 className="font-bold text-xl">Birthday 2024</h4>
                  <p style={{ fontFamily: '"Caveat", cursive' }} className="text-2xl mt-2 text-gray-800 leading-tight">"Hope this year brings you as much joy as you give to others!"</p>
                  <p className="text-xs font-bold mt-3 uppercase tracking-widest" style={{ color: '#6B6B6B' }}>Sent March 12</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-16 h-24 rounded shadow bg-blue-100 flex-shrink-0 border" style={{ borderColor: '#E5E0D8' }}></div>
                <div>
                  <h4 className="font-bold text-xl">Just Because</h4>
                  <p style={{ fontFamily: '"Caveat", cursive' }} className="text-2xl mt-2 text-gray-800 leading-tight">"Thinking of you and that time we got lost in Kyoto. Miss you!"</p>
                  <p className="text-xs font-bold mt-3 uppercase tracking-widest" style={{ color: '#6B6B6B' }}>Sent Oct 4, 2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
