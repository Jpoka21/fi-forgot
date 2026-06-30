import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  getCards, getRecipients, getServerUserId, getApiHeaders, CardOrder, RecipientAddress,
  updateCard, deleteCard,
} from "@/lib/data";
import {
  getCustomerPendingApprovals, customerApproveCard,
  updateDraftApprovedMessage, QueueItem, MessageDraft,
} from "@/lib/admin-data";
import { useAuth } from "@/lib/auth-context";
import { PB } from "@/lib/personal-brand";
import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { PersonAvatar, SoftCard, PrimaryBtn, SecondaryBtn } from "@/components/personal-ui";
import {
  ThumbsUp, Loader2, Sparkles, ArrowLeft,
  RefreshCw, Share2, ChevronLeft, ChevronRight,
} from "lucide-react";

const CREAM  = PB.cream;
const RED    = PB.red;
const INK    = PB.ink;
const WHITE  = PB.white;
const GRAY   = PB.mid;
const SAGE   = PB.sage;
const BORDER = PB.border;
const AMBER  = PB.amber;

const serif = "'Lora', Georgia, serif";
const sans  = "'Plus Jakarta Sans', sans-serif";

function LoadingPreparingIllustration() {
  return (
    <div style={{ width: "100%", maxWidth: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src="/assets/illustrations/loading/013_loading_preparing.webp"
        alt="Dave carefully preparing a handwritten card for your review"
        style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

function LoadingSuccessIllustration() {
  return (
    <div style={{ width: "100%", maxWidth: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src="/assets/illustrations/loading/015_loading_success.webp"
        alt="Dave finished taking care of everything, looking calm and satisfied"
        style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

function LoadingMailboxIllustration() {
  return (
    <div style={{ width: "100%", maxWidth: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src="/assets/illustrations/loading/014_loading_mailbox.webp"
        alt="Dave placing a handwritten card in the mailbox to send on your behalf"
        style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

interface HwFont { id: string; name: string; previewUrl?: string; }
interface CardDesign { id: string; name: string; category?: string; imageUrl?: string; }
type PendingApproval = QueueItem & { message?: MessageDraft };

function cardTimestamp(card: CardOrder): number {
  const m = card.id.match(/personal-(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  if (total <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }} aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 22 : 8, height: 8,
          borderRadius: 4, transition: "all 0.25s ease",
          background: i === current ? RED : `${INK}18`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function CardsReviewPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const highlightId = new URLSearchParams(window.location.search).get("id") ?? null;

  const [cards, setCards]               = useState<CardOrder[]>([]);
  const [pendingApprovals, setPending]  = useState<PendingApproval[]>([]);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < 768);
  const [done, setDone]                 = useState(false);

  const [editedMessages, setEditedMessages]   = useState<Record<string, string>>({});
  const [refinedMessages, setRefinedMessages] = useState<Record<string, string>>({});
  const [editActionId, setEditActionId]       = useState<string | null>(null);
  const [approvingId, setApprovingId]         = useState<string | null>(null);

  const [showAddrOverride, setShowAddrOverride] = useState<Record<string, boolean>>({});
  const [addrOverride, setAddrOverride]         = useState<Record<string, Partial<RecipientAddress>>>({});

  const [cardDesignMap, setCardDesignMap]           = useState<Record<string, CardDesign>>({});
  const [regenLoadingIds, setRegenLoadingIds]       = useState<Record<string, boolean>>({});
  const [excludedDesignIds, setExcludedDesignIds]   = useState<Record<string, string[]>>({});
  const [lightboxDesignCard, setLightboxDesignCard] = useState<string | null>(null);

  const [shareLoadingIds, setShareLoadingIds] = useState<Record<string, boolean>>({});
  const [shareCopiedIds, setShareCopiedIds]   = useState<Record<string, boolean>>({});
  const [shareUrlIds, setShareUrlIds]         = useState<Record<string, string>>({});

  useEffect(() => {
    const serverUserId = getServerUserId();
    const recipientIds = new Set(getRecipients().map(r => r.id));
    const allCards = getCards();

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

    const cs = allCards.filter(c =>
      c.status === "Ready for approval" &&
      recipientIds.has(c.recipientId) &&
      (serverUserId ? c.userId === serverUserId : true)
    );

    cs.sort((a, b) => cardTimestamp(b) - cardTimestamp(a));

    console.group("[cards-review] Cards shown in review queue (newest first)");
    cs.forEach((c, i) => console.log({ idx: i, id: c.id, recipientName: c.recipientName, holiday: c.holiday, userId: c.userId }));
    console.groupEnd();

    setCards(cs);
    if (user?.email) setPending(getCustomerPendingApprovals(user.email));

    if (highlightId) {
      const paCount = user?.email ? getCustomerPendingApprovals(user.email).length : 0;
      const targetCardIdx = cs.findIndex(c => c.id === highlightId);
      if (targetCardIdx >= 0) {
        setCurrentIdx(paCount + targetCardIdx);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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

  function approveAdminCard(pa: PendingApproval) {
    const t = refinedMessages[pa.id];
    if (t) updateDraftApprovedMessage(pa.id, t);
    customerApproveCard(pa.id);
    advance();
  }

  if (done || total === 0) {
    return (
      <AppShell>
        <PageShell style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <SoftCard style={{ textAlign: "center" as const, maxWidth: 400, padding: isMobile ? "40px 24px" : "48px 36px" }}>
            <div style={{ margin: "0 auto 20px" }}>
              <LoadingSuccessIllustration />
            </div>
            <h1 style={{ fontFamily: serif, fontSize: "1.65rem", fontWeight: 600, color: INK, margin: "0 0 12px" }}>
              {total === 0 ? "You're all caught up" : "All done"}
            </h1>
            <p style={{ fontSize: "0.95rem", color: GRAY, margin: "0 0 28px", lineHeight: 1.6 }}>
              {total === 0
                ? "Nothing needs your review right now. We're quietly preparing future cards for the people who matter."
                : "Every card has been handled. Your people are covered."}
            </p>
            <PrimaryBtn onClick={() => setLocation("/dashboard")} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <ArrowLeft size={16} /> Back to home
            </PrimaryBtn>
          </SoftCard>
        </PageShell>
      </AppShell>
    );
  }

  const item = allItems[Math.min(currentIdx, allItems.length - 1)];

  return (
    <AppShell>
      <PageShell>

        {/* Page intro */}
        <header style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div>
              <h1 style={{ fontFamily: serif, fontSize: isMobile ? "1.5rem" : "1.65rem", fontWeight: 600, color: INK, margin: 0, lineHeight: 1.25 }}>
                Ready for your review
              </h1>
              <p style={{ fontSize: "0.9rem", color: GRAY, margin: "8px 0 0", lineHeight: 1.5 }}>
                {total === 1
                  ? "One thoughtful card is waiting for you."
                  : `${total} cards waiting — take your time.`}
              </p>
            </div>
            {total > 1 && (
              <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: INK }}>
                  {currentIdx + 1} of {total}
                </div>
                <div style={{ marginTop: 8 }}>
                  <ProgressDots total={total} current={currentIdx} />
                </div>
              </div>
            )}
          </div>
        </header>

        {item.type === "admin" ? (
          <AdminCard
            pa={item.pa}
            refinedMessages={refinedMessages}
            setRefinedMessages={setRefinedMessages}
            onApprove={() => approveAdminCard(item.pa)}
            onSkip={() => { setCurrentIdx(i => (i + 1) % total); }}
            isMobile={isMobile}
          />
        ) : (
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

        {total > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, gap: 10 }}>
            <button
              type="button"
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 16px", borderRadius: 24, border: `1px solid ${BORDER}`,
                background: WHITE, color: currentIdx === 0 ? `${GRAY}50` : GRAY,
                cursor: currentIdx === 0 ? "default" : "pointer",
                fontSize: "0.82rem", fontWeight: 600, fontFamily: sans,
              }}>
              <ChevronLeft size={16} /> Previous
            </button>
            <ProgressDots total={total} current={currentIdx} />
            <button
              type="button"
              onClick={() => setCurrentIdx(i => Math.min(total - 1, i + 1))}
              disabled={currentIdx === total - 1}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 16px", borderRadius: 24, border: `1px solid ${BORDER}`,
                background: WHITE, color: currentIdx === total - 1 ? `${GRAY}50` : GRAY,
                cursor: currentIdx === total - 1 ? "default" : "pointer",
                fontSize: "0.82rem", fontWeight: 600, fontFamily: sans,
              }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </PageShell>
    </AppShell>
  );
}

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
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: GRAY, margin: "0 0 10px" }}>
        Quick adjustments
      </p>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 10 }}>
        {EDITS.map(({ label, instruction }) => {
          const actionKey = `${cardId}-${label}`;
          const isLoading = editActionId === actionKey;
          return (
            <button key={label} type="button"
              onClick={() => onQuickEdit(instruction, label)}
              disabled={!!editActionId}
              style={{
                fontSize: "0.78rem", fontWeight: 600, padding: "8px 14px", borderRadius: 20,
                border: `1px solid ${BORDER}`,
                background: isLoading ? `${INK}06` : WHITE,
                color: isLoading ? GRAY : INK,
                cursor: editActionId ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 6, fontFamily: sans,
              }}>
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} style={{ color: RED }} />}
              {label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={customVal}
          onChange={e => setCustomVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && customVal.trim() && !editActionId) {
              onQuickEdit(customVal.trim(), "Custom");
              setCustomVal("");
            }
          }}
          placeholder="Or describe a small change…"
          disabled={!!editActionId}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 12,
            border: `1px solid ${BORDER}`, background: CREAM,
            fontFamily: sans, fontSize: "0.82rem",
            color: INK, outline: "none", boxSizing: "border-box" as const,
          }}
        />
        <PrimaryBtn
          onClick={() => { if (customVal.trim() && !editActionId) { onQuickEdit(customVal.trim(), "Custom"); setCustomVal(""); } }}
          disabled={!customVal.trim() || !!editActionId}
          style={{ padding: "10px 16px", borderRadius: 20, fontSize: "0.8rem", fontFamily: sans, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Sparkles size={12} /> Apply
        </PrimaryBtn>
      </div>
    </div>
  );
}

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
    <SoftCard style={{ overflow: "hidden" }}>
      <div style={{ padding: isMobile ? "18px 16px" : "22px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14 }}>
        <PersonAvatar name={pa.recipientName} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: "1.15rem", color: INK, lineHeight: 1.25 }}>
            {pa.recipientName}
          </div>
          <div style={{ fontSize: "0.88rem", color: GRAY, marginTop: 4 }}>
            {pa.eventType}
            {pa.eventDate && (
              <> · {new Date(pa.eventDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}</>
            )}
          </div>
        </div>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, background: `${RED}10`, color: RED, borderRadius: 20, padding: "5px 12px", flexShrink: 0 }}>
          Ready for you
        </span>
      </div>

      <div style={{ padding: isMobile ? "18px 16px" : "22px 24px" }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: GRAY, margin: "0 0 10px" }}>
          Handwritten message
        </p>
        <textarea
          value={msgText}
          onChange={e => setRefinedMessages(prev => ({ ...prev, [pa.id]: e.target.value }))}
          style={{
            width: "100%", minHeight: 160, border: `1px solid ${BORDER}`,
            borderRadius: 14, padding: "16px 18px", fontSize: "1rem",
            fontFamily: serif, lineHeight: 1.75, color: INK,
            background: CREAM, resize: "vertical" as const,
            boxSizing: "border-box" as const, outline: "none",
          }}
        />
      </div>

      <div style={{ padding: "0 24px 24px", display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" as const }}>
        <SecondaryBtn onClick={onSkip}>Save for later</SecondaryBtn>
        <PrimaryBtn onClick={onApprove} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ThumbsUp size={16} /> Approve &amp; send
        </PrimaryBtn>
      </div>
    </SoftCard>
  );
}

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
  const recipient = getRecipients().find(r => r.id === card.recipientId);

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

  const pad = isMobile ? "18px 16px" : "22px 24px";

  return (
    <>
    <SoftCard style={{ overflow: "hidden" }}>
      {/* Recipient summary */}
      <div style={{ padding: pad, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14 }}>
        <PersonAvatar name={card.recipientName} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: "1.2rem", color: INK, lineHeight: 1.25 }}>
            {card.recipientName}
          </div>
          <div style={{ fontSize: "0.88rem", color: GRAY, marginTop: 4 }}>
            {recipient?.relationship && <span>{recipient.relationship} · </span>}
            {card.holiday}
          </div>
          {card.dueDate && (
            <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 6 }}>
              Mailing {new Date(card.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </div>
          )}
        </div>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, background: `${RED}10`, color: RED, borderRadius: 20, padding: "5px 12px", flexShrink: 0 }}>
          Ready for you
        </span>
      </div>

      {/* Card design preview */}
      {(design || isRegenning) && (
        <div style={{ position: "relative", background: CREAM }}>
          {isRegenning ? (
            <div style={{ minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "32px 16px" }}>
              <LoadingPreparingIllustration />
              <span style={{ fontSize: "0.9rem", color: GRAY }}>Finding a card design…</span>
            </div>
          ) : design?.imageUrl ? (
            <>
              <img
                src={design.imageUrl}
                alt={design.name}
                onClick={() => setLightboxDesignCard(card.id)}
                style={{ width: "100%", display: "block", maxHeight: 280, objectFit: "contain", background: CREAM, cursor: "zoom-in" }}
              />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(transparent, rgba(31,31,31,0.55))",
                padding: "24px 16px 12px", display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              }}>
                <span style={{ color: WHITE, fontWeight: 500, fontSize: "0.82rem" }}>{design.name}</span>
                <button type="button" onClick={onRegenDesign}
                  style={{
                    padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.15)", color: WHITE, fontSize: "0.75rem", fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: sans,
                  }}>
                  <RefreshCw size={12} /> Change design
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Message */}
      <div style={{ padding: pad }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: GRAY, margin: "0 0 10px" }}>
          Handwritten message
        </p>
        <textarea
          value={text}
          onChange={e => setEditedMessages(prev => ({ ...prev, [card.id]: e.target.value }))}
          style={{
            width: "100%", minHeight: 170,
            border: `1px solid ${BORDER}`, borderRadius: 14,
            padding: "16px 18px", fontSize: "1rem",
            fontFamily: serif, lineHeight: 1.75, color: INK,
            background: CREAM, resize: "vertical" as const,
            boxSizing: "border-box" as const, outline: "none",
          }}
        />
        <QuickEditsBlock cardId={card.id} editActionId={editActionId} onQuickEdit={onQuickEdit} />
      </div>

      {/* Mailing address */}
      {(() => {
        const addr = user?.mailingAddress;
        const isOverriding = showAddrOverride[card.id] ?? false;
        const ov = addrOverride[card.id] ?? {};
        const setOv = (patch: Partial<RecipientAddress>) =>
          setAddrOverride(prev => ({ ...prev, [card.id]: { ...prev[card.id], ...patch } }));
        return (
          <div style={{ margin: `0 ${isMobile ? 16 : 24}px 20px`, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: `${INK}03`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 8 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 500, color: INK, lineHeight: 1.45 }}>
                {isOverriding
                  ? "Sending to a custom address"
                  : addr
                    ? `Mailing to: ${addr.line1}${addr.line2 ? ` ${addr.line2}` : ""}, ${addr.city}, ${addr.state} ${addr.zip}`
                    : "No mailing address on file"}
              </span>
              <button type="button"
                onClick={() => setShowAddrOverride(prev => ({ ...prev, [card.id]: !isOverriding }))}
                style={{ fontSize: "0.78rem", fontWeight: 600, color: isOverriding ? GRAY : RED, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: sans }}>
                {isOverriding ? "← Use my address" : addr ? "Send somewhere else" : "Add my address"}
              </button>
            </div>
            {isOverriding && (
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
                <input placeholder="Street address" value={ov.line1 ?? ""} onChange={e => setOv({ line1: e.target.value })} style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: "0.86rem", color: INK, outline: "none", boxSizing: "border-box" as const, fontFamily: sans }} />
                <input placeholder="Apt / Suite (optional)" value={ov.line2 ?? ""} onChange={e => setOv({ line2: e.target.value })} style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: "0.86rem", color: INK, outline: "none", boxSizing: "border-box" as const, fontFamily: sans }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 58px 84px", gap: 8 }}>
                  <input placeholder="City" value={ov.city ?? ""} onChange={e => setOv({ city: e.target.value })} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: "0.86rem", color: INK, outline: "none", fontFamily: sans }} />
                  <input placeholder="ST" maxLength={2} value={ov.state ?? ""} onChange={e => setOv({ state: e.target.value.toUpperCase() })} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: "0.86rem", color: INK, outline: "none", fontFamily: sans }} />
                  <input placeholder="Zip" maxLength={10} value={ov.zip ?? ""} onChange={e => setOv({ zip: e.target.value })} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: "0.86rem", color: INK, outline: "none", fontFamily: sans }} />
                </div>
              </div>
            )}
            {!addr && !isOverriding && (
              <div style={{ padding: "10px 16px", fontSize: "0.8rem", color: AMBER, background: `${AMBER}08`, borderTop: `1px solid ${AMBER}20` }}>
                Add your address when you're ready — we'll hold this card for you.
              </div>
            )}
          </div>
        );
      })()}

      {/* Share preview */}
      {design?.imageUrl && (
        <div style={{ margin: `0 ${isMobile ? 16 : 24}px 20px` }}>
          {!shareUrlIds[card.id] ? (
            <button type="button" onClick={onShare} disabled={shareLoadingIds[card.id]}
              style={{
                width: "100%", fontSize: "0.84rem", fontWeight: 600, padding: "12px 16px",
                borderRadius: 24, border: `1px solid ${BORDER}`,
                background: WHITE, color: INK,
                cursor: shareLoadingIds[card.id] ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: sans,
              }}>
              {shareLoadingIds[card.id] ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
              {shareLoadingIds[card.id] ? "Creating link…" : "Share preview"}
            </button>
          ) : (
            <SoftCard style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: INK, margin: "0 0 10px" }}>
                Copy and text this link to {card.recipientName}
              </p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input readOnly value={shareUrlIds[card.id]} onFocus={e => e.target.select()} style={{ flex: 1, fontSize: "0.78rem", padding: "8px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: CREAM, color: INK, outline: "none", minWidth: 0, fontFamily: sans }} />
                <PrimaryBtn onClick={onShareCopy} accent={shareCopiedIds[card.id] ? SAGE : INK}
                  style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 20, fontSize: "0.78rem", fontFamily: sans }}>
                  {shareCopiedIds[card.id] ? "Copied!" : "Copy"}
                </PrimaryBtn>
              </div>
              <button type="button" onClick={onShareClose} style={{ marginTop: 10, background: "none", border: "none", color: GRAY, fontSize: "0.78rem", cursor: "pointer", padding: 0, fontFamily: sans }}>
                Close
              </button>
            </SoftCard>
          )}
        </div>
      )}

      {/* Make more personal */}
      <div style={{ margin: `0 ${isMobile ? 16 : 24}px 20px`, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
        <h3 style={{ fontFamily: serif, fontSize: "1.05rem", fontWeight: 600, color: INK, margin: "0 0 6px" }}>
          Make it more personal
        </h3>
        <p style={{ fontSize: "0.84rem", color: GRAY, lineHeight: 1.5, margin: "0 0 12px" }}>
          Share one real detail about {card.recipientName}, and we'll weave it into the message.
        </p>
        <textarea
          value={improveText}
          onChange={e => setImproveText(e.target.value)}
          placeholder="A recent moment, favorite memory, inside joke, or life update…"
          rows={3}
          disabled={improveSaving || !!editActionId}
          style={{
            width: "100%", borderRadius: 12, border: `1px solid ${BORDER}`,
            padding: "12px 14px", fontSize: "0.88rem",
            fontFamily: sans, lineHeight: 1.6, color: INK,
            background: improveSaving ? `${INK}04` : CREAM,
            resize: "none" as const, outline: "none",
            boxSizing: "border-box" as const,
            opacity: improveSaving ? 0.7 : 1,
          }}
        />
        {improveError && (
          <p style={{ marginTop: 8, padding: "8px 12px", borderRadius: 10, background: `${RED}08`, border: `1px solid ${RED}20`, fontSize: "0.8rem", fontWeight: 500, color: RED }}>
            Something went wrong — please try again.
          </p>
        )}
        <PrimaryBtn
          onClick={saveAndImprove}
          disabled={!improveText.trim() || improveSaving || !!editActionId}
          accent={SAGE}
          style={{
            marginTop: 10, width: "100%", padding: "12px", borderRadius: 24,
            fontSize: "0.88rem", fontFamily: sans,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          {improveSaving
            ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
            : editActionId === `${card.id}-Improve`
              ? <><Loader2 size={14} className="animate-spin" /> Rewriting…</>
              : "Improve this card"}
        </PrimaryBtn>
      </div>

      {/* Approve / Reject */}
      {isApproving && (
        <div style={{
          padding: `16px ${isMobile ? 16 : 24}px 0`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
          <LoadingMailboxIllustration />
        </div>
      )}
      <div style={{ padding: `0 ${isMobile ? 16 : 24}px 24px`, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" as const }}>
        <SecondaryBtn onClick={onReject}>Start over</SecondaryBtn>
        <PrimaryBtn onClick={onApprove} disabled={isApproving}
          style={{ fontSize: "0.88rem", padding: "11px 28px", borderRadius: 24, fontFamily: sans, display: "inline-flex", alignItems: "center", gap: 8 }}>
          {isApproving ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
          Approve &amp; send
        </PrimaryBtn>
      </div>
    </SoftCard>

    {lightboxDesignCard === card.id && design?.imageUrl && (
      <div
        onClick={() => setLightboxDesignCard(null)}
        style={{ position: "fixed", inset: 0, background: "rgba(31,31,31,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}
      >
        <img src={design.imageUrl} alt={design.name} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 0 60px rgba(0,0,0,0.5)" }} />
        <button type="button" onClick={e => { e.stopPropagation(); setLightboxDesignCard(null); }} style={{ position: "absolute", top: 20, right: 20, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: WHITE, fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
    )}
    </>
  );
}
