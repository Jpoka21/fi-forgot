import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getCards, updateCard, CardOrder, CardStatus, ALL_STATUSES, STATUS_COLORS } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";

function StatusBadge({ status }: { status: CardStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const [cards, setCards] = useState<CardOrder[]>([]);

  useEffect(() => {
    setCards(getCards());
  }, []);

  function handleStatusChange(card: CardOrder, newStatus: CardStatus) {
    const updated = { ...card, status: newStatus };
    updateCard(updated);
    setCards(getCards());
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[hsl(221,47%,20%)] flex items-center justify-center">
            <ShieldCheck size={20} className="text-[hsl(46,65%,52%)]" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[hsl(221,47%,20%)]">Admin Dashboard</h1>
            <p className="text-[hsl(221,20%,50%)] text-sm mt-0.5">
              All card orders. Real power. Great responsibility.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="admin-table">
              <thead>
                <tr className="bg-[hsl(221,47%,20%)] text-white">
                  <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider">Recipient</th>
                  <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider">Holiday</th>
                  <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider">Due date</th>
                  <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider">Delivery</th>
                  <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider">Approved message</th>
                  <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider">Admin notes</th>
                  <th className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider">Change status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(40,20%,90%)]">
                {cards.map((card, i) => (
                  <tr
                    key={card.id}
                    className={`hover:bg-[hsl(40,20%,97%)] transition-colors ${i % 2 === 0 ? "" : "bg-[hsl(40,50%,98%)]"}`}
                    data-testid={`admin-row-${card.id}`}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[hsl(221,47%,20%)]">Mike Thompson</div>
                      <div className="text-xs text-[hsl(221,20%,60%)]">mike@example.com</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-[hsl(221,47%,20%)]">{card.recipientName}</td>
                    <td className="px-5 py-4 text-[hsl(221,20%,45%)]">{card.holiday}</td>
                    <td className="px-5 py-4 text-[hsl(221,20%,45%)] whitespace-nowrap">{card.dueDate}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-[hsl(221,20%,45%)] whitespace-nowrap">{card.deliveryPreference}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={card.status} />
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      {card.approvedMessage ? (
                        <p className="text-xs text-[hsl(221,20%,50%)] line-clamp-2 italic">
                          "{card.approvedMessage}"
                        </p>
                      ) : (
                        <span className="text-xs text-[hsl(221,20%,70%)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      {card.adminNotes ? (
                        <span className="text-xs text-[hsl(221,20%,50%)]">{card.adminNotes}</span>
                      ) : (
                        <span className="text-xs text-[hsl(221,20%,70%)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Select
                        value={card.status}
                        onValueChange={(v) => handleStatusChange(card, v as CardStatus)}
                      >
                        <SelectTrigger className="w-44 text-xs h-8" data-testid={`select-status-${card.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-xs text-[hsl(221,20%,60%)] italic text-right">
          {cards.length} total card orders · Demo data only
        </div>
      </div>
    </AppLayout>
  );
}
