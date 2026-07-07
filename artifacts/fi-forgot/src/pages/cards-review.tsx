import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  getCards, getRecipients, getServerUserId, CardOrder, RecipientAddress,
  updateCard, deleteCard,
} from "@/lib/data";
import {
  getCustomerPendingApprovals, customerApproveCard,
  updateDraftApprovedMessage, QueueItem, MessageDraft,
} from "@/lib/admin-data";
import { useAuth } from "@/lib/auth-context";
import { resolveUserPlan, shouldShowMemberCardSavings } from "@/lib/plan";
import { FiCardCheckoutPricing } from "@/app/components/pricing";
import { FiMemberCardSavingsPrompt } from "@/app/components/upgrade/FiMemberCardSavingsPrompt";
import { PB } from "@/lib/personal-brand";
import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import { FiCardEditingWorkspace } from "@/app/components/card-editing";
import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { PersonAvatar, SoftCard, PrimaryBtn, SecondaryBtn } from "@/components/personal-ui";
import {
  ThumbsUp, Loader2, ArrowLeft,
  Share2, ChevronLeft, ChevronRight,
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

function LoadingSuccessIllustration() {
  return (
    <div style={{ width: "100%", maxWidth: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src={illustrationPaths.loading.success}
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
        src={illustrationPaths.loading.mailbox}
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
  const [savingsPromptCardId, setSavingsPromptCardId] = useState<string | null>(null);

  const plan = resolveUserPlan(user?.plan);
  const mailedCardCount = getCards().filter((card) =>
    ["Approved", "Mailed to me", "Mailed to her", "Delivered", "Given"].includes(card.status),
  ).length;

  useEffect(() => {
    const serverUserId = getServerUserId();
    const recipientIds = new Set(getRecipients().map(r => r.id));
    const allCards = getCards();

    const cs = allCards.filter(c =>
      c.status === "Ready for approval" &&
      recipientIds.has(c.recipientId) &&
      (serverUserId ? c.userId === serverUserId : true)
    );

    cs.sort((a, b) => cardTimestamp(b) - cardTimestamp(a));

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
    setSavingsPromptCardId(null);
    advance();
  }

  function requestApprovePersonalCard(card: CardOrder) {
    if (shouldShowMemberCardSavings(plan, mailedCardCount)) {
      setSavingsPromptCardId(card.id);
      return;
    }
    setApprovingId(card.id);
    approvePersonalCard(card);
  }

  function rejectPersonalCard(card: CardOrder) {
    deleteCard(card.id);
    advance();
  }

  function savePersonalDraft(card: CardOrder) {
    const message = editedMessages[card.id] ?? card.approvedMessage ?? "";
    updateCard({ ...card, status: "Card being drafted", approvedMessage: message });
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
            approvingId={approvingId}
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
            onApprove={() => requestApprovePersonalCard(item.card)}
            onReject={() => rejectPersonalCard(item.card)}
            onSaveDraft={() => savePersonalDraft(item.card)}
            onRegenDesign={() => regenCardDesign(item.card.id, item.card.holiday, editedMessages[item.card.id] ?? item.card.approvedMessage ?? "")}
            onShare={() => shareCardPreview(item.card)}
            onShareCopy={async () => {
              await navigator.clipboard.writeText(shareUrlIds[item.card.id]);
              setShareCopiedIds(prev => ({ ...prev, [item.card.id]: true }));
              setTimeout(() => setShareCopiedIds(prev => ({ ...prev, [item.card.id]: false })), 2500);
            }}
            onShareClose={() => setShareUrlIds(prev => { const n = { ...prev }; delete n[item.card.id]; return n; })}
            isMobile={isMobile}
            showSavingsPrompt={savingsPromptCardId === item.card.id}
            onContinueAtFreePrice={() => { setApprovingId(item.card.id); approvePersonalCard(item.card); }}
            onDismissSavings={() => setSavingsPromptCardId(null)}
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
                minHeight: 44,
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
                minHeight: 44,
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

      <div style={{ padding: isMobile ? "0 16px 24px" : "0 24px 24px", display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" as const }}>
        <SecondaryBtn onClick={onSkip} style={isMobile ? { flex: 1, minHeight: 44 } : undefined}>Save for later</SecondaryBtn>
        <PrimaryBtn onClick={onApprove} style={{ display: "inline-flex", alignItems: "center", gap: 8, ...(isMobile ? { flex: 1, minHeight: 44, justifyContent: "center" } : {}) }}>
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
  approvingId,
  cardDesignMap, regenLoadingIds,
  lightboxDesignCard, setLightboxDesignCard,
  shareLoadingIds, shareCopiedIds, shareUrlIds,
  showAddrOverride, setShowAddrOverride,
  addrOverride, setAddrOverride,
  onApprove, onReject, onSaveDraft, onRegenDesign,
  onShare, onShareCopy, onShareClose,
  isMobile,
  showSavingsPrompt = false,
  onContinueAtFreePrice,
  onDismissSavings,
}: {
  card: CardOrder;
  user: { mailingAddress?: RecipientAddress; plan?: import("@/lib/plan").Plan } | null;
  editedMessages: Record<string, string>;
  setEditedMessages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  approvingId: string | null;
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
  onSaveDraft: () => void;
  onRegenDesign: () => void;
  onShare: () => void;
  onShareCopy: () => void;
  onShareClose: () => void;
  isMobile: boolean;
  showSavingsPrompt?: boolean;
  onContinueAtFreePrice?: () => void;
  onDismissSavings?: () => void;
}) {
  const text = editedMessages[card.id] ?? card.approvedMessage ?? "";
  const originalMessage = card.approvedMessage ?? "";
  const design = cardDesignMap[card.id];
  const isRegenning = regenLoadingIds[card.id];
  const isApproving = approvingId === card.id;
  const recipient = getRecipients().find(r => r.id === card.recipientId);

  const pad = isMobile ? "18px 16px" : "22px 24px";
  const deliveryLabel = card.dueDate
    ? `Mailing ${new Date(card.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
    : undefined;

  return (
    <>
    <SoftCard style={{ overflow: "hidden" }}>
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
        </div>
      </div>

      <div style={{ padding: pad }}>
        {showSavingsPrompt && onContinueAtFreePrice && onDismissSavings ? (
          <FiMemberCardSavingsPrompt
            plan={resolveUserPlan(user?.plan)}
            onContinue={onContinueAtFreePrice}
            onDismiss={onDismissSavings}
          />
        ) : (
          <FiCardCheckoutPricing plan={resolveUserPlan(user?.plan)} />
        )}
        <FiCardEditingWorkspace
          recipientName={card.recipientName}
          occasion={card.holiday}
          relationship={recipient?.relationship}
          deliveryLabel={deliveryLabel}
          statusLabel="Ready for you"
          message={text}
          originalMessage={originalMessage}
          onMessageChange={(value) => setEditedMessages(prev => ({ ...prev, [card.id]: value }))}
          recipient={recipient}
          design={design}
          designLoading={isRegenning}
          onChangeArtwork={onRegenDesign}
          onZoomArtwork={design?.imageUrl ? () => setLightboxDesignCard(card.id) : undefined}
          onSaveDraft={onSaveDraft}
          onApprove={onApprove}
          onReject={onReject}
          approving={isApproving}
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
                style={{ fontSize: "0.78rem", fontWeight: 600, color: isOverriding ? GRAY : RED, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: "8px 0", minHeight: 44, fontFamily: sans }}>
                {isOverriding ? "← Use my address" : addr ? "Send somewhere else" : "Add my address"}
              </button>
            </div>
            {isOverriding && (
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
                <input placeholder="Street address" value={ov.line1 ?? ""} onChange={e => setOv({ line1: e.target.value })} style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 12px", fontSize: "1rem", color: INK, outline: "none", boxSizing: "border-box" as const, fontFamily: sans }} />
                <input placeholder="Apt / Suite (optional)" value={ov.line2 ?? ""} onChange={e => setOv({ line2: e.target.value })} style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 12px", fontSize: "1rem", color: INK, outline: "none", boxSizing: "border-box" as const, fontFamily: sans }} />
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 58px 84px", gap: 8 }}>
                  <input placeholder="City" value={ov.city ?? ""} onChange={e => setOv({ city: e.target.value })} style={{ gridColumn: isMobile ? "1 / -1" : undefined, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 12px", fontSize: "1rem", color: INK, outline: "none", fontFamily: sans }} />
                  <input placeholder="ST" maxLength={2} value={ov.state ?? ""} onChange={e => setOv({ state: e.target.value.toUpperCase() })} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 12px", fontSize: "1rem", color: INK, outline: "none", fontFamily: sans }} />
                  <input placeholder="Zip" maxLength={10} value={ov.zip ?? ""} onChange={e => setOv({ zip: e.target.value })} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 12px", fontSize: "1rem", color: INK, outline: "none", fontFamily: sans }} />
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
                width: "100%", fontSize: "0.84rem", fontWeight: 600, minHeight: 44, padding: "12px 16px",
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

      {isApproving && (
        <div style={{
          padding: `16px ${isMobile ? 16 : 24}px 24px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
          <LoadingMailboxIllustration />
        </div>
      )}
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
