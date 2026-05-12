import { useState, useEffect } from "react";
import { Link } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import { getCards, getRecipients, STATUS_COLORS, CardOrder, Recipient } from "@/lib/data";
import { CalendarDays, Users, CreditCard, Clock, Plus, CheckCircle2, Sparkles } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function StatusBadge({ status }: { status: CardOrder["status"] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[hsl(40,20%,85%)] shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-serif font-bold text-[hsl(221,47%,20%)]">{value}</div>
        <div className="text-xs text-[hsl(221,20%,50%)]">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [cards, setCards] = useState<CardOrder[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  useEffect(() => {
    setCards(getCards());
    setRecipients(getRecipients());
  }, []);

  const upcoming = cards.filter(
    (c) => !["Delivered", "Given"].includes(c.status)
  );

  const awaitingApproval = cards.filter(
    (c) => c.status === "Ready for approval"
  );

  const today = new Date();
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  const cardDates = new Set(cards.map((c) => c.dueDate));

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[hsl(221,47%,20%)]">Dashboard</h1>
          <p className="text-[hsl(221,20%,50%)] mt-1">
            Your relationship disaster prevention command center.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Upcoming occasions" value={upcoming.length} icon={CreditCard} color="bg-[hsl(221,47%,20%)]" />
          <StatCard label="Recipients" value={recipients.length} icon={Users} color="bg-[hsl(46,65%,52%)]" />
          <StatCard label="Awaiting your pick" value={awaitingApproval.length} icon={Clock} color="bg-[hsl(6,64%,46%)]" />
          <StatCard label="Approved" value={cards.filter(c => c.status === "Approved" || c.status === "Mailed to me" || c.status === "Mailed to her").length} icon={CalendarDays} color="bg-emerald-500" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Upcoming cards */}
          <div className="md:col-span-2">

            {/* Action needed banner */}
            {awaitingApproval.length > 0 && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
                <CheckCircle2 size={22} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-amber-900">
                    {awaitingApproval.length === 1
                      ? "1 card is ready for your review"
                      : `${awaitingApproval.length} cards are ready for your review`}
                  </div>
                  <p className="text-sm text-amber-700 mt-0.5">
                    We wrote 3 versions. Pick the one that sounds like you.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)]">Your Cards</h2>
            </div>

            {upcoming.length === 0 ? (
              <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-10 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="font-semibold text-[hsl(221,47%,20%)]">Nothing in the pipeline yet.</p>
                <p className="text-sm text-[hsl(221,20%,50%)] mt-1 mb-4">
                  Add someone and we'll handle the rest — we'll send you 3 options to pick from before every occasion.
                </p>
                <Link
                  href="/recipients/new"
                  className="inline-block mt-2 bg-[hsl(221,47%,20%)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90"
                  data-testid="link-add-recipient-empty"
                >
                  Add a recipient
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                    data-testid={`card-order-${card.id}`}
                  >
                    <div>
                      <div className="font-semibold text-[hsl(221,47%,20%)]">
                        {card.holiday} card for {card.recipientName}
                      </div>
                      <div className="text-sm text-[hsl(221,20%,50%)] mt-0.5">
                        Due {card.dueDate} · {card.deliveryPreference}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={card.status} />
                      {card.status === "Ready for approval" && (
                        <span className="text-xs font-semibold text-[hsl(6,64%,46%)] bg-red-50 border border-red-100 px-2 py-1 rounded-lg">
                          Pick yours →
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recipients */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)]">Recipients</h2>
                <Link
                  href="/recipients/new"
                  className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(6,64%,46%)] hover:underline"
                  data-testid="link-add-recipient"
                >
                  <Plus size={14} /> Add recipient
                </Link>
              </div>
              {recipients.length === 0 ? (
                <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-8 text-center">
                  <p className="text-[hsl(221,20%,50%)]">Gas station cards are not a strategy.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {recipients.map((r) => (
                    <Link
                      key={r.id}
                      href={`/recipients/${r.id}`}
                      data-testid={`card-recipient-${r.id}`}
                    >
                      <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-5 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-[hsl(221,47%,20%)] flex items-center justify-center text-white font-bold text-sm">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[hsl(221,47%,20%)]">{r.name}</div>
                            <div className="text-xs text-[hsl(221,20%,50%)]">{r.relationship}</div>
                          </div>
                        </div>
                        <div className="text-xs text-[hsl(221,20%,50%)]">
                          {r.birthday ? `Birthday: ${r.birthday}` : "No birthday set"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendar + How it works */}
          <div>
            <h2 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)] mb-4">
              {MONTHS[today.getMonth()]} {today.getFullYear()}
            </h2>
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-5 shadow-sm">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                  <div key={d} className="text-xs font-semibold text-[hsl(221,20%,60%)]">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, i) => {
                  const iso = d.toISOString().split("T")[0];
                  const hasCard = cardDates.has(iso);
                  const isToday = iso === today.toISOString().split("T")[0];
                  const isCurrentMonth = d.getMonth() === today.getMonth();
                  return (
                    <div
                      key={i}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs relative ${
                        isToday
                          ? "bg-[hsl(221,47%,20%)] text-white font-bold"
                          : isCurrentMonth
                          ? "text-[hsl(221,47%,20%)]"
                          : "text-[hsl(221,20%,70%)]"
                      }`}
                      data-testid={`calendar-day-${iso}`}
                    >
                      {d.getDate()}
                      {hasCard && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(6,64%,46%)]" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-[hsl(40,20%,85%)]">
                <div className="flex items-center gap-2 text-xs text-[hsl(221,20%,50%)]">
                  <span className="w-2 h-2 rounded-full bg-[hsl(6,64%,46%)]" />
                  Card due
                </div>
              </div>
            </div>

            <div className="mt-4 bg-[hsl(221,47%,20%)] rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[hsl(46,65%,52%)]" />
                <div className="font-serif font-bold text-base">How it works</div>
              </div>
              <ul className="space-y-2.5 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(46,65%,52%)] font-bold mt-0.5">1.</span>
                  You add your recipients and tell us about them.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(46,65%,52%)] font-bold mt-0.5">2.</span>
                  Two weeks before each occasion, we write 3 versions of a card.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(46,65%,52%)] font-bold mt-0.5">3.</span>
                  You pick the one that sounds like you. We send it.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
