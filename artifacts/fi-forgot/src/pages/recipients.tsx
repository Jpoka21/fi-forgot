import { useState, useEffect } from "react";
import { Link } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import { getRecipients, deleteRecipient, Recipient } from "@/lib/data";
import { Plus, Trash2, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  useEffect(() => {
    setRecipients(getRecipients());
  }, []);

  function handleDelete(id: string) {
    if (confirm("Remove this recipient? This cannot be undone.")) {
      deleteRecipient(id);
      setRecipients(getRecipients());
    }
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[hsl(221,47%,20%)]">Recipients</h1>
            <p className="text-[hsl(221,20%,50%)] mt-1">
              The women in your life who deserve better than a last-minute gas station run.
            </p>
          </div>
          <Link href="/recipients/new">
            <Button
              className="bg-[hsl(6,64%,46%)] hover:bg-[hsl(6,64%,40%)] text-white font-semibold flex items-center gap-2"
              data-testid="button-add-recipient"
            >
              <Plus size={16} /> Add recipient
            </Button>
          </Link>
        </div>

        {recipients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[hsl(40,20%,85%)] p-16 text-center shadow-sm">
            <Heart size={40} className="mx-auto mb-4 text-[hsl(221,20%,75%)]" />
            <h2 className="font-serif text-xl font-bold text-[hsl(221,47%,20%)] mb-2">
              Add someone before future you ruins everything.
            </h2>
            <p className="text-[hsl(221,20%,50%)] mb-6">
              Gas station cards are not a strategy. Add a recipient to get started.
            </p>
            <Link href="/recipients/new">
              <Button
                className="bg-[hsl(221,47%,20%)] text-white font-semibold"
                data-testid="button-add-first-recipient"
              >
                Add your first recipient
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recipients.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-5 shadow-sm hover:shadow-md transition-shadow"
                data-testid={`card-recipient-${r.id}`}
              >
                <div className="flex items-center justify-between">
                  <Link href={`/recipients/${r.id}`} className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[hsl(221,47%,20%)] flex items-center justify-center text-white font-bold text-lg font-serif">
                      {r.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-serif font-bold text-lg text-[hsl(221,47%,20%)]">{r.name}</div>
                      <div className="text-sm text-[hsl(221,20%,50%)]">{r.relationship}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {r.birthday && (
                          <span className="text-xs bg-[hsl(40,50%,92%)] text-[hsl(221,47%,20%)] px-2 py-0.5 rounded-full border border-[hsl(40,20%,85%)]">
                            Birthday: {r.birthday}
                          </span>
                        )}
                        {r.anniversaryDate && (
                          <span className="text-xs bg-[hsl(40,50%,92%)] text-[hsl(221,47%,20%)] px-2 py-0.5 rounded-full border border-[hsl(40,20%,85%)]">
                            Anniversary: {r.anniversaryDate}
                          </span>
                        )}
                        {r.needsMothersDay && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">
                            Mother's Day
                          </span>
                        )}
                        {r.needsValentinesDay && (
                          <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
                            Valentine's Day
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[hsl(221,20%,60%)]" />
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="ml-4 p-2 text-[hsl(221,20%,70%)] hover:text-[hsl(6,64%,46%)] hover:bg-red-50 rounded-lg transition-colors"
                    data-testid={`button-delete-recipient-${r.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
