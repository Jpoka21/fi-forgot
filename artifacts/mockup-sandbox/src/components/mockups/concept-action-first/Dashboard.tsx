import React from "react";
import { Check, ChevronRight, Send, ArrowRight, User } from "lucide-react";
import { Card } from "@/components/ui/card";
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

export function Dashboard() {
  return (
    <div
      className="min-h-screen p-8 lg:p-12"
      style={{ backgroundColor: BRAND.BG, color: BRAND.BLACK, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1
            className="text-6xl uppercase tracking-wider mb-2"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            F*I FORGOT
          </h1>
          <p style={{ color: BRAND.GRAY }} className="text-lg">
            We got your important people.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold">Steve</p>
            <p style={{ color: BRAND.GRAY }} className="text-sm">
              All good today
            </p>
          </div>
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarFallback>ST</AvatarFallback>
            <AvatarImage src="https://i.pravatar.cc/150?u=steve" />
          </Avatar>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-12">
        {/* HERO ACTION */}
        <section>
          <p
            className="text-2xl uppercase tracking-wider mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: BRAND.RED }}
          >
            TODAY'S ACTION
          </p>
          <Card
            className="border-none shadow-xl overflow-hidden relative"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="absolute top-6 right-6 w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{ borderColor: BRAND.SAGE }}>
              <span className="font-bold text-lg" style={{ color: BRAND.SAGE }}>92</span>
            </div>
            
            <div className="p-10">
              <div className="flex items-center gap-6 mb-8">
                <Avatar className="h-24 w-24 border-4 shadow-md" style={{ borderColor: BRAND.BG }}>
                  <AvatarFallback>MC</AvatarFallback>
                  <AvatarImage src="https://i.pravatar.cc/150?u=marcus" />
                </Avatar>
                <div>
                  <h2 className="text-4xl font-bold mb-1">Marcus is turning 32 next week.</h2>
                  <p className="text-xl" style={{ color: BRAND.GRAY }}>
                    Send him a birthday card so it arrives on time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 text-lg py-8 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: BRAND.RED, color: "#FFFFFF" }}
                >
                  <Send className="mr-2 h-6 w-6" />
                  Generate & Send Card Now
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-8 text-lg"
                  style={{ borderColor: BRAND.BORDER, color: BRAND.BLACK }}
                >
                  Skip for now
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* UP NEXT QUEUE */}
        <section>
          <p
            className="text-2xl uppercase tracking-wider mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            UP NEXT
          </p>
          <div className="space-y-4">
            {[
              { name: "Mom", event: "Mother's Day", date: "In 3 weeks", action: "Draft card" },
              { name: "Sarah", event: "Promotion follow-up", date: "In 1 month", action: "Send congrats" },
              { name: "Dave", event: "Anniversary", date: "In 2 months", action: "Plan dinner" },
            ].map((item, i) => (
              <Card
                key={i}
                className="p-6 border-none shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <div className="flex items-center gap-6">
                  <Avatar className="h-12 w-12 border-2" style={{ borderColor: BRAND.BG }}>
                    <AvatarFallback>{item.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{item.name} &bull; {item.event}</h3>
                    <p style={{ color: BRAND.GRAY }}>{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium" style={{ color: BRAND.RED }}>
                    {item.action}
                  </span>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-opacity-10"
                    style={{ backgroundColor: `${BRAND.BORDER}80` }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
