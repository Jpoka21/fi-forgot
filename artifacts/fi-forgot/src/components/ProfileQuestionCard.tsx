/**
 * ProfileQuestionCard
 *
 * Shows the next profile-gap question for a recipient.
 * Fetches from GET /api/v2/recipients/:id/next-question on mount.
 * Saves answers via POST /api/v2/recipients/:id/answer-question.
 *
 * Rules:
 * - Renders nothing while loading, when nextQuestion === null, or when skipped.
 * - Skip is session-only (page-load local state — not persisted).
 * - Save failure is surfaced inline; never crashes the parent.
 * - Does not duplicate a save or pollute the main form in any way.
 */

import { useState, useEffect, useCallback } from "react";
import { getApiHeaders } from "@/lib/data";

const RED   = "#E23B2E";
const BLACK = "#111111";
const GRAY  = "#6B6B6B";

interface SuggestedQuestion {
  fieldKey:   string;
  fieldLabel: string;
  category:   string;
  priority:   string;
  question:   string;
  reason:     string;
}

export default function ProfileQuestionCard({ recipientId }: { recipientId: string }) {
  const [question, setQuestion]   = useState<SuggestedQuestion | null | "loading">("loading");
  const [answer,   setAnswer]     = useState("");
  const [saving,   setSaving]     = useState(false);
  const [skipped,  setSkipped]    = useState(false);
  const [saveError, setSaveError] = useState(false);

  const fetchQuestion = useCallback(async () => {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) {
      setQuestion(null);
      return;
    }
    try {
      const res = await fetch(`/api/v2/recipients/${recipientId}/next-question`, { headers });
      if (!res.ok) { setQuestion(null); return; }
      const data = await res.json() as { nextQuestion: SuggestedQuestion | null };
      setQuestion(data.nextQuestion ?? null);
      setAnswer("");
    } catch {
      setQuestion(null);
    }
  }, [recipientId]);

  useEffect(() => { fetchQuestion(); }, [fetchQuestion]);

  async function handleSave() {
    if (question === null || question === "loading" || !answer.trim()) return;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;

    setSaving(true);
    setSaveError(false);
    try {
      const res = await fetch(`/api/v2/recipients/${recipientId}/answer-question`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fieldKey:     question.fieldKey,
          questionText: question.question,
          answerText:   answer.trim(),
        }),
      });
      if (res.ok) {
        await fetchQuestion();
      } else {
        setSaveError(true);
      }
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  if (question === "loading" || question === null || skipped) return null;

  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{
        background:   "#fff",
        border:       `1.5px solid ${BLACK}15`,
        boxShadow:    "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div>
        <h2
          style={{
            fontFamily:    "'Bebas Neue', cursive",
            fontSize:      "1.1rem",
            letterSpacing: "0.06em",
            color:         BLACK,
          }}
        >
          Help us write better cards
        </h2>
        <p className="text-xs mt-0.5" style={{ color: GRAY }}>
          {question.reason}
        </p>
      </div>

      <p className="text-sm font-medium" style={{ color: BLACK }}>
        {question.question}
      </p>

      <textarea
        className="w-full rounded-xl border text-sm resize-none px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-300"
        style={{
          borderColor: `${BLACK}20`,
          color:       BLACK,
          background:  "#fafafa",
          minHeight:   "80px",
        }}
        placeholder="Type your answer…"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        data-testid="profile-question-answer"
      />

      {saveError && (
        <p className="text-xs" style={{ color: RED }}>
          Couldn't save — please try again.
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !answer.trim()}
          data-testid="profile-question-save"
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: !answer.trim() ? `${BLACK}12` : RED,
            color:      !answer.trim() ? GRAY         : "#fff",
            cursor:     !answer.trim() || saving ? "not-allowed" : "pointer",
            opacity:    saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Save answer"}
        </button>

        <button
          type="button"
          onClick={() => setSkipped(true)}
          data-testid="profile-question-skip"
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-gray-100"
          style={{ color: GRAY }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
