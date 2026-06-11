import { useState } from "react";
import AppNav from "@/components/layout/AppNav";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";

type Channel = "Text message" | "Email" | "Both";
type Timing = "30 days before" | "14 days before" | "7 days before" | "2 days before" | "Day of";

const TIMINGS: Timing[] = [
  "30 days before",
  "14 days before",
  "7 days before",
  "2 days before",
  "Day of",
];

const TIMING_DESCRIPTIONS: Record<Timing, string> = {
  "30 days before": "Maximum runway. You'll feel smug for weeks.",
  "14 days before": "The sweet spot. Plenty of time, still feels urgent.",
  "7 days before": "Cutting it close, but manageable.",
  "2 days before": "We're watching you.",
  "Day of": "Not recommended. But we're not your dad.",
};

export default function ReminderSettingsPage() {
  const [channel, setChannel] = useState<Channel>("Email");
  const [timings, setTimings] = useState<Set<Timing>>(new Set(["14 days before", "7 days before"]));
  const [saved, setSaved] = useState(false);

  function toggleTiming(t: Timing) {
    setTimings((prev) => {
      const next = new Set(prev);
      if (next.has(t)) {
        next.delete(t);
      } else {
        next.add(t);
      }
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F2E6D3" }}>
      <AppNav />
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[hsl(221,47%,20%)]">Reminder Settings</h1>
          <p className="text-[hsl(221,20%,50%)] mt-1">
            Two weeks before panic, we tap you on the shoulder. Configure how and when.
          </p>
        </div>

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-3 flex items-center gap-2 text-sm font-semibold">
            <Check size={16} className="text-green-600" /> Settings saved. We've got your back.
          </div>
        )}

        {/* Channel */}
        <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm mb-5">
          <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)] mb-1">Reminder channel</h2>
          <p className="text-sm text-[hsl(221,20%,50%)] mb-5">How do you want us to reach you?</p>
          <div className="space-y-3">
            {(["Text message", "Email", "Both"] as Channel[]).map((c) => (
              <button
                key={c}
                onClick={() => { setChannel(c); setSaved(false); }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  channel === c
                    ? "border-[hsl(221,47%,20%)] bg-[hsl(221,47%,97%)]"
                    : "border-[hsl(40,20%,85%)] hover:border-[hsl(221,47%,40%)]"
                }`}
                data-testid={`button-channel-${c.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${channel === c ? "bg-[hsl(221,47%,20%)]" : "bg-[hsl(40,20%,88%)]"}`}>
                  <Bell size={16} className={channel === c ? "text-white" : "text-[hsl(221,20%,50%)]"} />
                </div>
                <div>
                  <div className="font-semibold text-[hsl(221,47%,20%)]">{c}</div>
                  <div className="text-sm text-[hsl(221,20%,50%)]">
                    {c === "Text message" && "A nudge straight to your pocket."}
                    {c === "Email" && "For the men who still check their inbox."}
                    {c === "Both" && "Belt and suspenders. We respect it."}
                  </div>
                </div>
                {channel === c && <Check size={18} className="ml-auto text-[hsl(221,47%,20%)]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Timing */}
        <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm mb-6">
          <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)] mb-1">Reminder timing</h2>
          <p className="text-sm text-[hsl(221,20%,50%)] mb-5">
            Select one or more. We'll remind you at each chosen interval.
          </p>
          <div className="space-y-3">
            {TIMINGS.map((t) => {
              const active = timings.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTiming(t)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    active
                      ? "border-[hsl(221,47%,20%)] bg-[hsl(221,47%,97%)]"
                      : "border-[hsl(40,20%,85%)] hover:border-[hsl(221,47%,40%)]"
                  }`}
                  data-testid={`button-timing-${t.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    active ? "bg-[hsl(221,47%,20%)] border-[hsl(221,47%,20%)]" : "border-[hsl(40,20%,70%)]"
                  }`}>
                    {active && <Check size={12} className="text-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-[hsl(221,47%,20%)]">{t}</div>
                    <div className="text-sm text-[hsl(221,20%,50%)]">{TIMING_DESCRIPTIONS[t]}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[hsl(40,50%,90%)] rounded-xl p-5 border border-[hsl(40,20%,82%)] mb-6 text-sm text-[hsl(221,20%,45%)] italic">
          This is a demo — no real messages are sent. In the live version, you'd actually get the nudge. Until then, consider this a rehearsal.
        </div>

        <Button
          onClick={handleSave}
          className="w-full bg-[hsl(6,64%,46%)] hover:bg-[hsl(6,64%,40%)] text-white font-bold py-4 text-base rounded-xl"
          data-testid="button-save-settings"
        >
          Save reminder settings
        </Button>
      </div>
    </div>
  );
}
