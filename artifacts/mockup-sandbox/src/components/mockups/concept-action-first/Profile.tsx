import React from "react";
import { ArrowLeft, Clock, MessageSquare, PenTool, CheckCircle, Edit3, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BRAND = {
  BG: "#F2E6D3",
  RED: "#E23B2E",
  BLACK: "#111111",
  SAGE: "#5B8C6B",
  GRAY: "#6B6B6B",
  BORDER: "#E5E0D8",
};

export function Profile() {
  return (
    <div
      className="min-h-screen p-8 lg:p-12"
      style={{ backgroundColor: BRAND.BG, color: BRAND.BLACK, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <header className="mb-12 max-w-4xl mx-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1
          className="text-4xl uppercase tracking-wider pt-2"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          BACK TO ACTION QUEUE
        </h1>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-[#E5E0D8]">
              <Avatar className="h-32 w-32 mx-auto mb-4 border-4 shadow-sm" style={{ borderColor: BRAND.BG }}>
                <AvatarFallback>MC</AvatarFallback>
                <AvatarImage src="https://i.pravatar.cc/150?u=marcus" />
              </Avatar>
              <h2 className="text-3xl font-bold mb-1">Marcus</h2>
              <p className="text-lg mb-4" style={{ color: BRAND.GRAY }}>Best Friend</p>
              
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${BRAND.SAGE}20`, color: BRAND.SAGE }}>
                <Heart className="h-5 w-5 fill-current" />
                <span className="font-bold">Health: 92/100</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button className="w-full justify-start" variant="outline">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" /> Add Note
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E0D8]">
              <h3 className="font-bold mb-4 uppercase tracking-wide text-sm" style={{ color: BRAND.GRAY }}>Key Dates</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center pb-2 border-b border-[#E5E0D8]">
                  <span>Birthday</span>
                  <span className="font-medium">Oct 12</span>
                </li>
                <li className="flex justify-between items-center pb-2 border-b border-[#E5E0D8]">
                  <span>Work Anniv.</span>
                  <span className="font-medium">Mar 4</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-8">
            <section>
              <p
                className="text-2xl uppercase tracking-wider mb-4"
                style={{ fontFamily: "'Bebas Neue', sans-serif", color: BRAND.RED }}
              >
                PENDING ACTIONS
              </p>
              <Card
                className="border-2 shadow-md overflow-hidden relative"
                style={{ backgroundColor: "#FFFFFF", borderColor: BRAND.RED }}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Send Birthday Card</h2>
                      <p style={{ color: BRAND.GRAY }}>
                        Due next week. His 32nd is coming up.
                      </p>
                    </div>
                    <Badge variant="destructive" className="uppercase text-xs tracking-wider font-bold bg-red-100 text-red-600 hover:bg-red-100">
                      High Priority
                    </Badge>
                  </div>
                  <Button
                    className="w-full text-lg py-6 mt-4 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: BRAND.RED, color: "#FFFFFF" }}
                  >
                    <PenTool className="mr-2 h-5 w-5" />
                    Draft Card Now
                  </Button>
                </div>
              </Card>
            </section>
            
            <section>
              <p
                className="text-2xl uppercase tracking-wider mb-4"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                RECENT CONTEXT
              </p>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-[#5B8C6B] border-y-[#E5E0D8] border-r-[#E5E0D8]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" style={{ color: BRAND.SAGE }} />
                    <span className="font-medium text-sm" style={{ color: BRAND.SAGE }}>Card Sent &bull; 2 months ago</span>
                  </div>
                  <h3 className="font-bold mb-2">Promotion Congrats</h3>
                  <p className="italic text-lg" style={{ fontFamily: "'Caveat', cursive", color: BRAND.GRAY }}>
                    "So proud of you for landing the Senior role! Drinks on me next time."
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E0D8]">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" style={{ color: BRAND.GRAY }} />
                    <span className="font-medium text-sm" style={{ color: BRAND.GRAY }}>Note Logged &bull; 4 months ago</span>
                  </div>
                  <p>
                    Mentioned he's getting really into pour-over coffee lately. Might be a good gift idea eventually.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
