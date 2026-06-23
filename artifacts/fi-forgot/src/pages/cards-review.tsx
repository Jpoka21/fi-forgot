import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  getCards, getRecipients, getServerUserId, getApiHeaders, CardOrder, Recipient, RecipientAddress,
  saveCard, deleteCard, updateCard,
} from "@/lib/data";
import {
  getCustomerPendingApprovals, customerApproveCard,
  updateDraftApprovedMessage, QueueItem, MessageDraft,
} from "@/lib/admin-data";
import { useAuth } from "@/lib/auth-context";
import {
  ThumbsUp, Loader2, Sparkles, ArrowLeft, CheckCircle2,
  RefreshCw, Share2, ChevronLeft, ChevronRight,
} from "lucide-react";

/* ── Brand ───────────────────────────────────────────────────────────────── */
const BEIGE = "#F2E6D3";
const RED   = "#E23B2E";
const BLACK = "#111111";
const WHITE = "#FFFFFF";
const GRAY  = "#6B6B6B";

interface HwFont { id: string; name: string; previewUrl?: string; }
interface CardDesign { id: string; name: string; category?: string; imageUrl?: string; }
type PendingApproval = QueueItem & { message?: MessageDraft };

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function cardTimestamp(card: CardOrder): number {
  const m = card.id.match(/personal-(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

/* ── Progress indicator ──────────────────────────────────────────────────── */
function ProgressDots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 7, height: 7,
          borderRadius: 4, transition: "all 0.25s",
          background: i === current ? RED : `${BLACK}20`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function CardsReviewPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Read ?id= param to jump straight to a specific card
  const highlightId = new URLSearchParams(window.location.search).get("id") ?? null;

  const [cards, setCards]               = useState<CardOrder[]>([]);
  const [pendingApprovals, setPending]  = useState<PendingApproval[]>([]);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < 768);
  const [done, setDone]                 = useState(false);

  /* Per-card editing state */
  const [editedMessages, setEditedMessages]   = useState<Record<string, string>>({});
  const [refinedMessages, setRefinedMessages] = useState<Record<string, string>>({});
  const [editActionId, setEditActionId]       = useState<string | null>(null);
  const [approvingId, setApprovingId]         = useState<string | null>(null);

  /* Address override */
  const [showAddrOverride, setShowAddrOverride] = useState<Record<string, boolean>>({});
  const [addrOverride, setAddrOverride]         = useState<Record<string, Partial<RecipientAddress>>>({});

  /* Card designs */
  const [cardDesignMap, setCardDesignMap]           = useState<Record<string, CardDesign>>({});
  const [regenLoadingIds, setRegenLoadingIds]       = useState<Record<string, boolean>>({});
  const [excludedDesignIds, setExcludedDesignIds]   = useState<Record<string, string[]>>({});
  const [lightboxDesignCard, setLightboxDesignCard] = useState<string | null>(null);

  /* Share */
  const [shareLoadingIds, setShareLoadingIds] = useState<Record<string, boolean>>({});
  const [shareCopiedIds, setShareCopiedIds]   = useState<Record<string, boolean>>({});
  const [shareUrlIds, setShareUrlIds]         = useState<Record<string, string>>({});

  useEffect(() => {
    const serverUserId = getServerUserId();
    const recipientIds = new Set(getRecipients().map(r => r.id));
    const allCards = getCards();

    // Debug: log every card in storage so stale/wrong cards are visible
    console.group("[cards-review] All cards in localStorage");
    allCards.forEach(c => {
      console.log({
        id: c.id,
        recipientId: c.recipientId,
        recipientName: c.recipientName,
        holiday: c.holiday,
        status: c.status,
        userId: c.userId,
        deliveryPreference: c.deliveryPreference,
        approvedMessagePreview: (c.approvedMessage ?? "").slice(0, 60),
      });
    });
    console.groupEnd();

    // Filter: Ready for approval + valid recipient.
    // When authenticated: also require card.userId matches the current user —
    // this excludes stale pre-auth cards (Test, old sessions) that have no userId stamp.
    const cs = allCards.filter(c =>
      c.status === "Ready for approval" &&
      recipientIds.has(c.recipientId) &&
      (serverUserId ? c.userId === serverUserId : true)
    );

    // Sort newest-first: timestamp is embedded in the card ID ("personal-TIMESTAMP")
    cs.sort((a, b) => cardTimestamp(b) - cardTimestamp(a));

    console.group("[cards-review] Cards shown in review queue (newest first)");
    cs.forEach((c, i) => console.log({ idx: i, id: c.id, recipientName: c.recipientName, holiday: c.holiday, userId: c.userId }));
    console.groupEnd();

    setCards(cs);
    if (user?.email) setPending(getCustomerPendingApprovals(user.email));

    // ?id= jump: find the target card in the already-sorted list and jump to it.
    // Without ?id=, currentIdx stays at 0, which is always the newest card after sorting.
    if (highlightId) {
      const paCount = user?.email ? getCustomerPendingApprovals(user.email).length : 0;
      const targetCardIdx = cs.findIndex(c => c.id === highlightId);
      if (targetCardIdx >= 0) {
        setCurrentIdx(paCount + targetCardIdx);
      }
      // If card not in filtered list, stay at 0 (newest)
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  /* Load card designs for personal cards */
  useEffect(() => {
    for (const card of cards) {
      if (cardDesignMap[card.id] || regenLoadingIds[card.id]) continue;
      setRegenLoadingIds(prev => ({ ...prev, [card.id]: true }));
      const params = new URLSearchParams({ eventType: card.holiday });
      if (card.approvedMessage) params.set("cardMessage", card.approvedMessage);
      fetch(`/api/personal-cards/pick-card?${params.toString()}`)
        .then(r => r.json())
        .then((d: { card?: CardDesign }) => {
          if (d.card) setCardDesignMap(prev => ({ ...prev, [card.id]: d.card! }));
        })
        .catch(() => {})
        .finally(() => setRegenLoadingIds(prev => ({ ...prev, [card.id]: false })));
    }
  }, [cards]);

  /* All items = pendingApprovals + personal cards */
  const allItems: Array<{ type: "admin"; pa: PendingApproval } | { type: "personal"; card: CardOrder }> = [
    ...pendingApprovals.map(pa => ({ type: "admin" as const, pa })),
    ...cards.map(card => ({ type: "personal" as const, card })),
  ];

  const total = allItems.length;

  function reload() {
    const recipientIds = new Set(getRecipients().map(r => r.id));
    const cs = getCards().filter(c => c.status === "Ready for approval" && recipientIds.has(c.recipientId));
    setCards(cs);
    if (user?.email) setPending(getCustomerPendingApprovals(user.email));
  }

  function advance() {
    reload();
    const nextTotal = allItems.length - 1;
    if (nextTotal <= 0) {
      setDone(true);
    } else {
      setCurrentIdx(i => Math.min(i, nextTotal - 1));
    }
  }

  /* ── Personal card actions ── */
  function approvePersonalCard(card: CardOrder) {
    const message = editedMessages[card.id] ?? card.approvedMessage ?? "";
    const override = addrOverride[card.id];
    const hasOverride = showAddrOverride[card.id] &&
      override?.line1?.trim() && override?.city?.trim() && override?.state?.trim() && override?.zip?.trim();
    const overrideAddress: RecipientAddress | undefined = hasOverride
      ? { line1: override!.line1!, line2: override!.line2, city: override!.city!, state: override!.state!, zip: override!.zip! }
      : undefined;
    updateCard({ ...card, status: "Approved", approvedMessage: message, overrideAddress });
    setApprovingId(null);
    advance();
  }

  function rejectPersonalCard(card: CardOrder) {
    deleteCard(card.id);
    advance();
  }

  async function quickEditPersonalCard(card: CardOrder, instruction: string, label: string) {
    const currentText = editedMessages[card.id] ?? card.approvedMessage ?? "";
    const actionKey = `${card.id}-${label}`;
    setEditActionId(actionKey);
    const recipient = getRecipients().find(r => r.id === card.recipientId);
    const relationship = recipient?.relationship ?? "friend";
    try {
      const res = await fetch("/api/edit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName: card.recipientName, holiday: card.holiday, relationship, currentCardText: currentText, instruction }),
      });
      if (res.ok) {
        const data = await res.json() as { card?: string };
        if (data.card) setEditedMessages(prev => ({ ...prev, [card.id]: data.card! }));
      }
    } catch { /* non-blocking */ }
    finally { setEditActionId(null); }
  }

  async function regenCardDesign(cardId: string, holiday: string, message: string) {
    const current = cardDesignMap[cardId];
    const prevExcluded = excludedDesignIds[cardId] ?? [];
    const newExcluded = current ? [...prevExcluded, String(current.id)] : prevExcluded;
    setExcludedDesignIds(prev => ({ ...prev, [cardId]: newExcluded }));
    setRegenLoadingIds(prev => ({ ...prev, [cardId]: true }));
    setCardDesignMap(prev => { const n = { ...prev }; delete n[cardId]; return n; });
    try {
      const params = new URLSearchParams({ eventType: holiday });
      if (message) params.set("cardMessage", message);
      if (newExcluded.length) params.set("excludeIds", newExcluded.join(","));
      const r = await fetch(`/api/personal-cards/pick-card?${params.toString()}`);
      const d = await r.json() as { card?: CardDesign };
      if (d.card) setCardDesignMap(prev => ({ ...prev, [cardId]: d.card! }));
    } catch {}
    setRegenLoadingIds(prev => ({ ...prev, [cardId]: false }));
  }

  async function shareCardPreview(card: CardOrder) {
    const design = cardDesignMap[card.id];
    if (!design?.imageUrl) return;
    const message = editedMessages[card.id] ?? card.approvedMessage ?? "";
    setShareLoadingIds(prev => ({ ...prev, [card.id]: true }));
    try {
      const res = await fetch("/api/card-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl:      design.imageUrl,
          cardName:      design.name ?? "",
          messageText:   message,
          recipientName: card.recipientName,
          eventType:     card.holiday,
        }),
      });
      const data = await res.json() as { url: string };
      setShareUrlIds(prev => ({ ...prev, [card.id]: data.url }));
    } catch {}
    finally { setShareLoadingIds(prev => ({ ...prev, [card.id]: false })); }
  }

  /* ── Admin queue actions ── */
  function approveAdminCard(pa: PendingApproval) {
    const t = refinedMessages[pa.id];
    if (t) updateDraftApprovedMessage(pa.id, t);
    customerApproveCard(pa.id);
    advance();
  }

  /* ── Done screen ── */
  if (done || total === 0) {
    return (
      <div style={{ minHeight: "100vh", background: BEIGE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: 24 }}>
        <div style={{ textAlign: "center" as const, maxWidth: 360 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #22c55e30", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={32} style={{ color: "#16a34a" }} />
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 8 }}>
            {total === 0 ? "Nothing to Review" : "All Done!"}
          </div>
          <p style={{ fontSize: "0.88rem", color: GRAY, margin: "0 0 28px", lineHeight: 1.6 }}>
            {total === 0
              ? "No cards are waiting for your review right now."
              : "Every card has been handled. Your relationships are covered."}
          </p>
          <button
            onClick={() => setLocation("/dashboard")}
            style={{
              background: RED, color: WHITE, border: "none", borderRadius: 10,
              padding: "12px 28px", fontFamily: "'Bebas Neue', cursive",
              fontSize: "1rem", letterSpacing: "0.1em", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const item = allItems[Math.min(currentIdx, allItems.length - 1)];
  const px = isMobile ? 16 : 24;

  return (
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: BEIGE, borderBottom: `1px solid ${BLACK}18`,
        padding: `0 ${px}px`,
        height: isMobile ? 58 : 68,
        display: "flex", alignItems: "center", justifyContent: "space-between" as const,
      }}>
        <button
          onClick={() => setLocation("/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem",
            letterSpacing: "0.1em", color: `${BLACK}70`, padding: 0,
          }}>
          <ArrowLeft size={15} /> Dashboard
        </button>

        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.12em", color: BLACK }}>
            REVIEW CARDS
          </span>
          <ProgressDots total={total} current={currentIdx} />
        </div>

        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: GRAY, minWidth: 48, textAlign: "right" as const }}>
          {currentIdx + 1} / {total}
        </div>
      </header>

      {/* ── Card content ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: `28px ${px}px 64px`, boxSizing: "border-box" as const }}>

        {item.type === "admin" ? (
          /* ── Admin pending approval ── */
          <AdminCard
            pa={item.pa}
            refinedMessages={refinedMessages}
            setRefinedMessages={setRefinedMessages}
            onApprove={() => approveAdminCard(item.pa)}
            onSkip={() => { setCurrentIdx(i => (i + 1) % total); }}
            isMobile={isMobile}
          />
        ) : (
          /* ── Personal card ── */
          <PersonalCard
            card={item.card}
            user={user}
            editedMessages={editedMessages}
            setEditedMessages={setEditedMessages}
            editActionId={editActionId}
            approvingId={approvingId}
            setApprovingId={setApprovingId}
            cardDesignMap={cardDesignMap}
            regenLoadingIds={regenLoadingIds}
            lightboxDesignCard={lightboxDesignCard}
            setLightboxDesignCard={setLightboxDesignCard}
            shareLoadingIds={shareLoadingIds}
            shareCopiedIds={shareCopiedIds}
            shareUrlIds={shareUrlIds}
            showAddrOverride={showAddrOverride}
            setShowAddrOverride={setShowAddrOverride}
            addrOverride={addrOverride}
            setAddrOverride={setAddrOverride}
            onApprove={() => { setApprovingId(item.card.id); approvePersonalCard(item.card); }}
            onReject={() => rejectPersonalCard(item.card)}
            onQuickEdit={(instruction, label) => quickEditPersonalCard(item.card, instruction, label)}
            onRegenDesign={() => regenCardDesign(item.card.id, item.card.holiday, editedMessages[item.card.id] ?? item.card.approvedMessage ?? "")}
            onShare={() => shareCardPreview(item.card)}
            onShareCopy={async () => {
              await navigator.clipboard.writeText(shareUrlIds[item.card.id]);
              setShareCopiedIds(prev => ({ ...prev, [item.card.id]: true }));
              setTimeout(() => setShareCopiedIds(prev => ({ ...prev, [item.card.id]: false })), 2500);
            }}
            onShareClose={() => setShareUrlIds(prev => { const n = { ...prev }; delete n[item.card.id]; return n; })}
            isMobile={isMobile}
          />
        )}

        {/* ── Navigation ── */}
        {total > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, gap: 10 }}>
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 8, border: `1.5px solid ${BLACK}14`,
                background: WHITE, color: currentIdx === 0 ? `${GRAY}60` : GRAY,
                cursor: currentIdx === 0 ? "default" : "pointer",
                fontSize: "0.78rem", fontWeight: 600,
              }}>
              <ChevronLeft size={14} /> Previous
            </button>
            <ProgressDots total={total} current={currentIdx} />
            <button
              onClick={() => setCurrentIdx(i => Math.min(total - 1, i + 1))}
              disabled={currentIdx === total - 1}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 8, border: `1.5px solid ${BLACK}14`,
                background: WHITE, color: currentIdx === total - 1 ? `${GRAY}60` : GRAY,
                cursor: currentIdx === total - 1 ? "default" : "pointer",
                fontSize: "0.78rem", fontWeight: 600,
              }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* Quick Edits Block                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */
function QuickEditsBlock({
  cardId, editActionId, onQuickEdit,
}: {
  cardId: string;
  editActionId: string | null;
  onQuickEdit: (instruction: string, label: string) => void;
}) {
  const [customVal, setCustomVal] = useState("");

  const EDITS = [
    { label: "Shorter",    instruction: "Make it significantly shorter and more punchy." },
    { label: "Funnier",    instruction: "Add genuine humor without losing the heart." },
    { label: "More heart", instruction: "Make it warmer and more emotionally resonant." },
    { label: "Go deeper",  instruction: "Make this more emotionally raw and vulnerable — really go there." },
    { label: "Rewrite",    instruction: "Completely rewrite in a fresh way — different opening, different structure." },
  ] as const;

  return (
    <div style={{ marginTop: 12 }}>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: GRAY, display: "block", marginBottom: 6 }}>AI EDITS</span>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 8 }}>
        {EDITS.map(({ label, instruction }) => {
          const actionKey = `${cardId}-${label}`;
          const isLoading = editActionId === actionKey;
          return (
            <button key={label}
              onClick={() => onQuickEdit(instruction, label)}
              disabled={!!editActionId}
              style={{
                fontSize: "0.72rem", fontWeight: 700, padding: "6px 12px", borderRadius: 8,
                border: `1px solid ${BLACK}16`,
                background: isLoading ? `${BLACK}06` : WHITE,
                color: isLoading ? GRAY : BLACK,
                cursor: editActionId ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
              {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} style={{ color: RED }} />}
              {label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={customVal}
          onChange={e => setCustomVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && customVal.trim() && !editActionId) {
              onQuickEdit(customVal.trim(), "Custom");
              setCustomVal("");
            }
          }}
          placeholder="Or type your own instruction…"
          disabled={!!editActionId}
          style={{
            flex: 1, padding: "7px 12px", borderRadius: 8,
            border: `1px solid ${BLACK}16`, background: WHITE,
            fontFamily: "'Inter', sans-serif", fontSize: "0.72rem",
            color: BLACK, outline: "none", boxSizing: "border-box" as const,
          }}
        />
        <button
          onClick={() => { if (customVal.trim() && !editActionId) { onQuickEdit(customVal.trim(), "Custom"); setCustomVal(""); } }}
          disabled={!customVal.trim() || !!editActionId}
          style={{
            padding: "7px 14px", borderRadius: 8, border: "none",
            background: customVal.trim() && !editActionId ? RED : `${BLACK}12`,
            color: customVal.trim() && !editActionId ? WHITE : GRAY,
            fontSize: "0.72rem", fontWeight: 700,
            cursor: customVal.trim() && !editActionId ? "pointer" : "default",
            display: "flex", alignItems: "center", gap: 5,
          }}>
          <Sparkles size={11} /> Apply
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* Admin Card Component                                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */
function AdminCard({
  pa, refinedMessages, setRefinedMessages, onApprove, onSkip, isMobile,
}: {
  pa: PendingApproval;
  refinedMessages: Record<string, string>;
  setRefinedMessages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onApprove: () => void;
  onSkip: () => void;
  isMobile: boolean;
}) {
  const msgText = refinedMessages[pa.id] ?? pa.message?.approvedMessage ?? pa.message?.generatedMessage ?? "";
  return (
    <div style={{ background: WHITE, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
      {/* Header */}
      <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${BLACK}0E`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: WHITE, fontSize: "1rem" }}>✉</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{pa.eventType} · {pa.recipientName}</div>
          {pa.eventDate && (
            <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 2 }}>
              {new Date(pa.eventDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </div>
          )}
        </div>
        <span style={{ fontSize: "0.65rem", fontWeight: 700, background: `${RED}10`, color: RED, borderRadius: 20, padding: "4px 12px" }}>
          NEEDS REVIEW
        </span>
      </div>

      {/* Message */}
      <div style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 8 }}>CARD MESSAGE</div>
        <textarea
          value={msgText}
          onChange={e => setRefinedMessages(prev => ({ ...prev, [pa.id]: e.target.value }))}
          style={{
            width: "100%", minHeight: 140, border: `1.5px solid ${BLACK}14`,
            borderRadius: 12, padding: "14px 16px", fontSize: "0.92rem",
            fontFamily: "Georgia, serif", lineHeight: 1.75, color: BLACK,
            background: BEIGE, resize: "vertical" as const,
            boxSizing: "border-box" as const, outline: "none",
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ padding: "0 22px 22px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onSkip}
          style={{ padding: "10px 20px", borderRadius: 9, border: `1.5px solid ${BLACK}14`, background: WHITE, color: GRAY, cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" }}>
          Skip for now
        </button>
        <button
          onClick={onApprove}
          style={{ padding: "10px 26px", borderRadius: 9, border: "none", background: RED, color: WHITE, cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 7 }}>
          <ThumbsUp size={14} /> Approve &amp; Send
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* Personal Card Component                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
function PersonalCard({
  card, user,
  editedMessages, setEditedMessages,
  editActionId, approvingId, setApprovingId,
  cardDesignMap, regenLoadingIds,
  lightboxDesignCard, setLightboxDesignCard,
  shareLoadingIds, shareCopiedIds, shareUrlIds,
  showAddrOverride, setShowAddrOverride,
  addrOverride, setAddrOverride,
  onApprove, onReject, onQuickEdit, onRegenDesign,
  onShare, onShareCopy, onShareClose,
  isMobile,
}: {
  card: CardOrder;
  user: { mailingAddress?: RecipientAddress } | null;
  editedMessages: Record<string, string>;
  setEditedMessages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  editActionId: string | null;
  approvingId: string | null;
  setApprovingId: React.Dispatch<React.SetStateAction<string | null>>;
  cardDesignMap: Record<string, CardDesign>;
  regenLoadingIds: Record<string, boolean>;
  lightboxDesignCard: string | null;
  setLightboxDesignCard: React.Dispatch<React.SetStateAction<string | null>>;
  shareLoadingIds: Record<string, boolean>;
  shareCopiedIds: Record<string, boolean>;
  shareUrlIds: Record<string, string>;
  showAddrOverride: Record<string, boolean>;
  setShowAddrOverride: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  addrOverride: Record<string, Partial<RecipientAddress>>;
  setAddrOverride: React.Dispatch<React.SetStateAction<Record<string, Partial<RecipientAddress>>>>;
  onApprove: () => void;
  onReject: () => void;
  onQuickEdit: (instruction: string, label: string) => void;
  onRegenDesign: () => void;
  onShare: () => void;
  onShareCopy: () => void;
  onShareClose: () => void;
  isMobile: boolean;
}) {
  const text = editedMessages[card.id] ?? card.approvedMessage ?? "";
  const design = cardDesignMap[card.id];
  const isRegenning = regenLoadingIds[card.id];
  const isApproving = approvingId === card.id;

  const [improveText, setImproveText] = useState("");
  const [improveSaving, setImproveSaving] = useState(false);
  const [improveError, setImproveError] = useState(false);

  async function saveAndImprove() {
    if (!improveText.trim() || improveSaving) return;
    setImproveSaving(true);
    setImproveError(false);
    try {
      const headers = { ...(getApiHeaders() as Record<string, string>), "Content-Type": "application/json" };
      const res = await fetch(`/api/v2/recipients/${card.recipientId}/answer-question`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fieldKey:     "fresh_update_quick",
          questionText: `What is something recent that happened with ${card.recipientName}?`,
          answerText:   improveText.trim(),
          triggerType:  "fresh_update",
        }),
      });
      if (res.ok) {
        const detail = improveText.trim();
        setImproveText("");
        onQuickEdit(
          `Rewrite this card to weave in the following personal detail about ${card.recipientName}: "${detail}". Make the card feel genuinely personal while keeping the same tone and occasion.`,
          "Improve"
        );
      } else {
        setImproveError(true);
      }
    } catch {
      setImproveError(true);
    } finally {
      setImproveSaving(false);
    }
  }

  return (
    <>
    <div style={{ background: WHITE, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>

      {/* Header */}
      <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${BLACK}0E`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${RED}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: RED, fontSize: "1rem" }}>✦</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{card.holiday} · {card.recipientName}</div>
          {card.dueDate && (
            <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 2 }}>
              Mailing {new Date(card.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </div>
          )}
        </div>
        <span style={{ fontSize: "0.65rem", fontWeight: 700, background: `${RED}10`, color: RED, borderRadius: 20, padding: "4px 12px" }}>
          NEEDS REVIEW
        </span>
      </div>

      {/* Card design preview */}
      {(design || isRegenning) && (
        <div style={{ position: "relative", background: BEIGE }}>
          {isRegenning ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Loader2 size={20} className="animate-spin" style={{ color: GRAY }} />
              <span style={{ fontSize: "0.85rem", color: GRAY }}>Finding a card design…</span>
            </div>
          ) : design?.imageUrl ? (
            <>
              <img
                src={design.imageUrl}
                alt={design.name}
                onClick={() => setLightboxDesignCard(card.id)}
                style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "contain", background: BEIGE, cursor: "zoom-in" }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.5))", padding: "20px 14px 10px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <span style={{ color: WHITE, fontWeight: 600, fontSize: "0.78rem" }}>{design.name}</span>
                <button
                  onClick={onRegenDesign}
                  style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.14)", color: WHITE, fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <RefreshCw size={11} /> Change design
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Message + AI edits */}
      <div style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 8 }}>CARD MESSAGE</div>
        <textarea
          value={text}
          onChange={e => setEditedMessages(prev => ({ ...prev, [card.id]: e.target.value }))}
          style={{
            width: "100%", minHeight: 150,
            border: `1.5px solid ${BLACK}14`, borderRadius: 12,
            padding: "14px 16px", fontSize: "0.92rem",
            fontFamily: "Georgia, serif", lineHeight: 1.75, color: BLACK,
            background: BEIGE, resize: "vertical" as const,
            boxSizing: "border-box" as const, outline: "none",
          }}
        />

        {/* Quick AI edits */}
        <QuickEditsBlock
          cardId={card.id}
          editActionId={editActionId}
          onQuickEdit={onQuickEdit}
        />
      </div>

      {/* Mailing address */}
      {(() => {
        const addr = user?.mailingAddress;
        const isOverriding = showAddrOverride[card.id] ?? false;
        const ov = addrOverride[card.id] ?? {};
        const setOv = (patch: Partial<RecipientAddress>) =>
          setAddrOverride(prev => ({ ...prev, [card.id]: { ...prev[card.id], ...patch } }));
        return (
          <div style={{ margin: "0 22px 20px", borderRadius: 10, border: `1px solid ${BLACK}10`, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: `${BLACK}03`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: "0.9rem" }}>📬</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: BLACK }}>
                  {isOverriding
                    ? "Sending to a custom address"
                    : addr
                      ? `Mailing to: ${addr.line1}${addr.line2 ? ` ${addr.line2}` : ""}, ${addr.city}, ${addr.state} ${addr.zip}`
                      : "No mailing address on file"}
                </span>
              </div>
              <button
                onClick={() => setShowAddrOverride(prev => ({ ...prev, [card.id]: !isOverriding }))}
                style={{ fontSize: "0.7rem", fontWeight: 600, color: isOverriding ? GRAY : RED, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                {isOverriding ? "← Use my address" : addr ? "Send somewhere else" : "Add my address"}
              </button>
            </div>
            {isOverriding && (
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
                <input placeholder="Street address" value={ov.line1 ?? ""} onChange={e => setOv({ line1: e.target.value })} style={{ width: "100%", border: `1.5px solid ${BLACK}16`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none", boxSizing: "border-box" as const }} />
                <input placeholder="Apt / Suite (optional)" value={ov.line2 ?? ""} onChange={e => setOv({ line2: e.target.value })} style={{ width: "100%", border: `1.5px solid ${BLACK}16`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none", boxSizing: "border-box" as const }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 58px 84px", gap: 8 }}>
                  <input placeholder="City" value={ov.city ?? ""} onChange={e => setOv({ city: e.target.value })} style={{ border: `1.5px solid ${BLACK}16`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none" }} />
                  <input placeholder="ST" maxLength={2} value={ov.state ?? ""} onChange={e => setOv({ state: e.target.value.toUpperCase() })} style={{ border: `1.5px solid ${BLACK}16`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none" }} />
                  <input placeholder="Zip" maxLength={10} value={ov.zip ?? ""} onChange={e => setOv({ zip: e.target.value })} style={{ border: `1.5px solid ${BLACK}16`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none" }} />
                </div>
              </div>
            )}
            {!addr && !isOverriding && (
              <div style={{ padding: "8px 14px", fontSize: "0.72rem", color: "#b45309", background: "#fffbeb", borderTop: `1px solid #fde68a` }}>
                Cards will still be queued — add your address so we know where to mail them.
              </div>
            )}
          </div>
        );
      })()}

      {/* Share preview */}
      {design?.imageUrl && (
        <div style={{ margin: "0 22px 20px" }}>
          {!shareUrlIds[card.id] ? (
            <button
              onClick={onShare}
              disabled={shareLoadingIds[card.id]}
              style={{
                width: "100%", fontSize: "0.78rem", fontWeight: 600, padding: "10px 16px",
                borderRadius: 9, border: `1.5px solid ${BLACK}14`,
                background: WHITE, color: BLACK,
                cursor: shareLoadingIds[card.id] ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}>
              {shareLoadingIds[card.id] ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
              {shareLoadingIds[card.id] ? "Creating link…" : "Share preview via text"}
            </button>
          ) : (
            <div style={{ borderRadius: 9, border: `1.5px solid ${BLACK}14`, background: WHITE, padding: "12px 14px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: BLACK, textTransform: "uppercase" as const }}>📬 Copy &amp; text this link to {card.recipientName}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input readOnly value={shareUrlIds[card.id]} onFocus={e => e.target.select()} style={{ flex: 1, fontSize: "0.72rem", padding: "6px 8px", borderRadius: 6, border: `1px solid ${BLACK}14`, background: "#f8f5f0", color: BLACK, outline: "none", minWidth: 0 }} />
                <button
                  onClick={onShareCopy}
                  style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 6, border: "none", background: shareCopiedIds[card.id] ? "#22c55e" : BLACK, color: WHITE, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
                  {shareCopiedIds[card.id] ? "Copied!" : "Copy"}
                </button>
              </div>
              <button onClick={onShareClose} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#aaa", fontSize: "0.68rem", cursor: "pointer", padding: 0 }}>
                ✕ Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Make this card more personal */}
      <div style={{ margin: "0 22px 20px", borderTop: `1px solid ${BLACK}08`, paddingTop: 20 }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK, marginBottom: 2 }}>
            ✨ Make this card more personal
          </div>
          <div style={{ fontSize: "0.75rem", color: GRAY, lineHeight: 1.5 }}>
            Tell us one real thing about {card.recipientName}, and we'll rewrite the card around it.
          </div>
        </div>
        <textarea
          value={improveText}
          onChange={e => setImproveText(e.target.value)}
          placeholder={`Something they did recently, a favorite memory, an inside joke, or what's going on in their life…`}
          rows={3}
          disabled={improveSaving || !!editActionId}
          style={{
            width: "100%", borderRadius: 10, border: `1.5px solid ${BLACK}14`,
            padding: "10px 12px", fontSize: "0.82rem",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.6, color: BLACK,
            background: improveSaving ? `${BLACK}04` : BEIGE,
            resize: "none" as const, outline: "none",
            boxSizing: "border-box" as const,
            opacity: improveSaving ? 0.7 : 1,
          }}
        />
        {improveError && (
          <div style={{
            marginTop: 6, padding: "7px 10px", borderRadius: 8,
            background: `${RED}10`, border: `1px solid ${RED}25`,
            fontSize: "0.72rem", fontWeight: 600, color: RED,
          }}>
            Something went wrong — please try again.
          </div>
        )}
        <button
          onClick={saveAndImprove}
          disabled={!improveText.trim() || improveSaving || !!editActionId}
          style={{
            marginTop: 8, width: "100%", padding: "11px",
            borderRadius: 10, border: "none",
            background: (!improveText.trim() || improveSaving || !!editActionId) ? `${BLACK}12` : "#5B8C6B",
            color: (!improveText.trim() || improveSaving || !!editActionId) ? GRAY : WHITE,
            fontWeight: 700, fontSize: "0.82rem",
            cursor: (!improveText.trim() || improveSaving || !!editActionId) ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
          {improveSaving
            ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
            : editActionId === `${card.id}-Improve`
              ? <><Loader2 size={13} className="animate-spin" /> Rewriting…</>
              : "Improve This Card"}
        </button>
      </div>


      {/* Approve / Reject */}
      <div style={{ padding: "0 22px 22px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onReject}
          style={{ fontSize: "0.82rem", fontWeight: 600, padding: "10px 20px", borderRadius: 9, border: `1.5px solid ${BLACK}14`, background: WHITE, color: GRAY, cursor: "pointer" }}>
          Reject &amp; regenerate
        </button>
        <button
          onClick={onApprove}
          disabled={isApproving}
          style={{
            fontSize: "0.82rem", fontWeight: 700, padding: "10px 28px",
            borderRadius: 9, border: "none",
            background: RED, color: WHITE,
            cursor: isApproving ? "default" : "pointer",
            display: "flex", alignItems: "center", gap: 7,
          }}>
          {isApproving ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
          Approve &amp; Send
        </button>
      </div>
    </div>

    {/* Lightbox */}
    {lightboxDesignCard === card.id && design?.imageUrl && (
      <div
        onClick={() => setLightboxDesignCard(null)}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}
      >
        <img src={design.imageUrl} alt={design.name} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 0 60px rgba(0,0,0,0.8)" }} />
        <button onClick={e => { e.stopPropagation(); setLightboxDesignCard(null); }} style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: WHITE, fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        <div style={{ position: "absolute", bottom: 20, color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>Click anywhere to close</div>
      </div>
    )}
    </>
  );
}
