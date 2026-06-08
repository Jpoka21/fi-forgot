/**
 * ProfileQuestionCard
 *
 * Shows the next profile-gap or fresh-update question for a recipient.
 * Fetches from GET /api/v2/recipients/:id/next-question on mount.
 * Saves answers via POST /api/v2/recipients/:id/answer-question.
 *
 * Modes:
 *   profile_gap   — permanent profile fields. Header: "Help us write better cards".
 *   fresh_update  — rotating recent-memory prompts shown once profile is complete.
 *                   Header: "Profile basics are complete."
 *
 * Rules:
 * - Renders nothing while loading or when skipped.
 * - Skip is session-only (page-load local state — not persisted).
 * - Save failure is surfaced inline; never crashes the parent.
 * - Does not duplicate a save or pollute the main form in any way.
 */

import { useState, useEffect, useCallback } from "react";
import { getApiHeaders } from "@/lib/data";

const RED   = "#E23B2E";
const BLACK = "#111111";
const GRAY  = "#6B6B6B";
const SAGE  = "#5B8C6B";

interface SuggestedQuestion {
  fieldKey:   string;
  fieldLabel: string;
  category:   string;
  priority:   string;
  question:   string;
  reason:     string;
  mode:       "profile_gap" | "fresh_update";
}

interface NextQuestionResponse {
  nextQuestion:    SuggestedQuestion;
  profileComplete: boolean;
  profileScore:    number;
}

function ProfileProgressBar({ score, complete }: { score: number; complete: boolean }) {
  return (
    <div className="space-y-1 mb-1">
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 5, background: `${BLACK}10` }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width:      `${complete ? 100 : score}%`,
            background: complete ? SAGE : RED,
          }}
        />
      </div>
      <p
        className="text-xs font-semibold"
        style={{ color: complete ? SAGE : GRAY }}
      >
        {complete ? "Profile Complete" : `${score}% complete`}
      </p>
    </div>
  );
}

export default function ProfileQuestionCard({ recipientId }: { recipientId: string }) {
  const [data,      setData]      = useState<NextQuestionResponse | null | "loading">("loading");
  const [answer,    setAnswer]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [skipped,   setSkipped]   = useState(false);
  const [saveError, setSaveError] = useState(false);

  const fetchQuestion = useCallback(async () => {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) {
      setData(null);
      return;
    }
    try {
      const res = await fetch(`/api/v2/recipients/${recipientId}/next-question`, { headers });
      if (!res.ok) { setData(null); return; }
      const json = await res.json() as NextQuestionResponse;
      setData(json);
      setAnswer("");
    } catch {
      setData(null);
    }
  }, [recipientId]);

  useEffect(() => { fetchQuestion(); }, [fetchQuestion]);

  async function handleSave() {
    if (data === null || data === "loading" || !answer.trim()) return;
    const { nextQuestion } = data;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;

    setSaving(true);
    setSaveError(false);
    try {
      const res = await fetch(`/api/v2/recipients/${recipientId}/answer-question`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fieldKey:     nextQuestion.fieldKey,
          questionText: nextQuestion.question,
          answerText:   answer.trim(),
          triggerType:  nextQuestion.mode,
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

  if (data === "loading" || data === null || skipped) return null;

  const { nextQuestion, profileComplete, profileScore } = data;
  const isFreshUpdate = profileComplete && nextQuestion.mode === "fresh_update";

  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{
        background: "#fff",
        border:     `1.5px solid ${isFreshUpdate ? SAGE + "40" : BLACK + "15"}`,
        boxShadow:  "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Progress bar */}
      <ProfileProgressBar score={profileScore} complete={profileComplete} />

      {/* Header */}
      <div>
        {isFreshUpdate ? (
          <>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span style={{ fontSize: "0.85rem" }}>🌱</span>
              <h2
                style={{
                  fontFamily:    "'Bebas Neue', cursive",
                  fontSize:      "1.05rem",
                  letterSpacing: "0.06em",
                  color:         SAGE,
                }}
              >
                Profile basics are complete
              </h2>
            </div>
            <p className="text-xs" style={{ color: GRAY }}>
              Add a recent update so your next card feels current.
            </p>
          </>
        ) : (
          <>
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
              {nextQuestion.reason}
            </p>
          </>
        )}
      </div>

      {/* Question */}
      <p className="text-sm font-medium" style={{ color: BLACK }}>
        {nextQuestion.question}
      </p>

      {/* Answer textarea */}
      <textarea
        className="w-full rounded-xl border text-sm resize-none px-3 py-2.5 focus:outline-none focus:ring-2"
        style={{
          borderColor: isFreshUpdate ? SAGE + "50" : BLACK + "20",
          color:       BLACK,
          background:  "#fafafa",
          minHeight:   "80px",
          "--tw-ring-color": isFreshUpdate ? SAGE : "#fca5a5",
        } as React.CSSProperties}
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
            background: !answer.trim()
              ? `${BLACK}12`
              : isFreshUpdate ? SAGE : RED,
            color:   !answer.trim() ? GRAY : "#fff",
            cursor:  !answer.trim() || saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : isFreshUpdate ? "Save update" : "Save answer"}
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
