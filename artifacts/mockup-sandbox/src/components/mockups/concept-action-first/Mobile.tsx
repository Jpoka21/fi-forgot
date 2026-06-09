import React, { useState } from "react";
import { Check, X, Send, Menu, Bell, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const BRAND = {
  BG: "#F2E6D3",
  RED: "#E23B2E",
  BLACK: "#111111",
  SAGE: "#5B8C6B",
  GRAY: "#6B6B6B",
  BORDER: "#E5E0D8",
};

export function Mobile() {
  const [swiped, setSwiped] = useState(false);
  
  return (
    <div
      className="h-screen w-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: BRAND.BG, color: BRAND.BLACK, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <header className="flex justify-between items-center p-6 pb-2 z-10">
        <Button variant="ghost" size="icon" className="rounded-full -ml-2">
          <Menu className="h-6 w-6" />
        </Button>
        <h1
          className="text-3xl uppercase tracking-wider mt-1"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          F*I FORGOT
        </h1>
        <Button variant="ghost" size="icon" className="rounded-full relative -mr-2">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{ backgroundColor: BRAND.RED }}></span>
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <p
          className="text-xl uppercase tracking-wider mb-6 self-start w-full text-center"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: BRAND.GRAY }}
        >
          {swiped ? "YOU'RE ALL CAUGHT UP." : "NEXT ACTION"}
        </p>

        {!swiped ? (
          <div 
            className="w-full bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center relative border-t-8 transition-transform duration-300"
            style={{ borderColor: BRAND.RED }}
          >
            <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Due in 6 Days
            </div>
            
            <Avatar className="h-32 w-32 mb-6 border-4 shadow-md mt-6" style={{ borderColor: BRAND.BG }}>
              <AvatarFallback>MC</AvatarFallback>
              <AvatarImage src="https://i.pravatar.cc/150?u=marcus" />
            </Avatar>
            
            <h2 className="text-3xl font-bold mb-3">Marcus's Birthday</h2>
            <p className="text-lg mb-10" style={{ color: BRAND.GRAY }}>
              Send a card now so it arrives right on time for his 32nd.
            </p>
            
            <div className="w-full space-y-4">
              <Button
                className="w-full py-8 text-lg rounded-2xl hover:opacity-90 transition-opacity"
                style={{ backgroundColor: BRAND.RED, color: "#FFFFFF" }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Draft AI Card
              </Button>
              <Button
                variant="outline"
                className="w-full py-6 text-md rounded-2xl"
                style={{ borderColor: BRAND.BORDER, color: BRAND.GRAY }}
                onClick={() => setSwiped(true)}
              >
                Skip for now
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 w-full animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 rounded-full mb-6 flex items-center justify-center" style={{ backgroundColor: `${BRAND.SAGE}20` }}>
              <Check className="h-12 w-12" style={{ color: BRAND.SAGE }} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Queue Empty!</h2>
            <p className="text-center text-lg mb-8" style={{ color: BRAND.GRAY }}>
              You're an amazing friend today.
            </p>
            <Button
              variant="outline"
              className="py-6 px-8 rounded-full"
              onClick={() => setSwiped(false)}
            >
              Reset Demo
            </Button>
          </div>
        )}
      </main>

      {/* Ambient background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: BRAND.RED }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: BRAND.SAGE }}></div>
    </div>
  );
}
