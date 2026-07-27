import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { FiButton } from "@/app/components/button/FiButton";
import { AddArtworkSlotDialog } from "@/app/components/studio/AddArtworkSlotDialog";
import { ArtworkSlotSection } from "@/app/components/studio/ArtworkSlotSection";
import { useStudioCollectionDetail } from "@/app/studio/hooks/useStudioCollectionDetail";
import { useStudioArtworkSlots } from "@/app/studio/hooks/useStudioArtworkSlots";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import {
  STUDIO_OCCASION_LABELS,
  STUDIO_RELATIONSHIP_LABELS,
  STUDIO_STATUS_LABELS,
  STUDIO_STYLE_LABELS,
  studioCollectionsDefaults,
} from "@/app/studio/collectionsDomain";
import { artworkSlotsDefaults } from "@/app/studio/artworkSlotsDomain";
import { PB } from "@/lib/personal-brand";

export interface FiStudioCollectionDetailPageProps {
  collectionId: string | undefined;
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: `1px solid ${PB.border}`,
        borderRadius: 10,
        padding: "14px 16px",
        background: PB.white,
        minWidth: 120,
        flex: "1 1 120px",
      }}
    >
      <div style={{ fontSize: "0.75rem", color: PB.mid, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export function FiStudioCollectionDetailPage({ collectionId }: FiStudioCollectionDetailPageProps) {
  const detail = useStudioCollectionDetail(collectionId);
  const slots = useStudioArtworkSlots(collectionId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [candidateCountsBySlot, setCandidateCountsBySlot] = useState<Record<string, number>>({});

  const handleCandidateCountChange = useCallback((slotId: string, count: number) => {
    setCandidateCountsBySlot((prev) => {
      if (prev[slotId] === count) return prev;
      return { ...prev, [slotId]: count };
    });
  }, []);

  const candidateCount = useMemo(
    () => Object.values(candidateCountsBySlot).reduce((total, count) => total + count, 0),
    [candidateCountsBySlot],
  );

  if (detail.loading) {
    return (
      <div
        role="status"
        style={{ display: "flex", alignItems: "center", gap: 8, color: PB.mid, padding: "24px 0" }}
      >
        <Loader2 className="animate-spin" size={18} aria-hidden />
        Loading collection…
      </div>
    );
  }

  if (detail.notFound) {
    return (
      <div>
        <FiButton asChild variant="secondary" leftIcon={<ArrowLeft size={16} aria-hidden />}>
          <Link href={ROUTE_PATHS.studio.collections}>Back to Collections</Link>
        </FiButton>
        <p style={{ marginTop: 24 }}>Collection not found.</p>
      </div>
    );
  }

  if (detail.error || !detail.collection) {
    return (
      <div>
        <FiButton asChild variant="secondary" leftIcon={<ArrowLeft size={16} aria-hidden />}>
          <Link href={ROUTE_PATHS.studio.collections}>Back to Collections</Link>
        </FiButton>
        <div role="alert" style={{ marginTop: 24 }}>
          <p>{detail.error ?? "Could not load collection."}</p>
          <FiButton variant="secondary" onClick={() => void detail.reload()}>
            Try again
          </FiButton>
        </div>
      </div>
    );
  }

  const collection = detail.collection;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <FiButton
        asChild
        variant="secondary"
        size="sm"
        leftIcon={<ArrowLeft size={16} aria-hidden />}
        style={{ alignSelf: "flex-start" }}
      >
        <Link href={ROUTE_PATHS.studio.collections}>Collections</Link>
      </FiButton>

      <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>{collection.name}</h1>
        <p style={{ margin: 0, color: PB.mid, fontSize: "1rem" }}>
          {STUDIO_OCCASION_LABELS[collection.occasion]} ·{" "}
          {STUDIO_RELATIONSHIP_LABELS[collection.relationship]}
          {collection.style ? ` · ${STUDIO_STYLE_LABELS[collection.style]}` : ""}
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          <strong>Status:</strong> {STUDIO_STATUS_LABELS[collection.status]}
        </p>
        {collection.description ? (
          <p style={{ margin: "8px 0 0", color: PB.mid, maxWidth: 560 }}>{collection.description}</p>
        ) : null}
      </header>

      <section aria-label="Collection summary">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <SummaryStat label="Artwork" value={0} />
          <SummaryStat label="Artwork Slots" value={slots.slotCount} />
          <SummaryStat label="Candidates" value={candidateCount} />
          <SummaryStat label="Approved Assets" value={0} />
        </div>
      </section>

      <section aria-label="Artwork plan">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Artwork Plan</h2>
          <FiButton variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            {artworkSlotsDefaults.addArtworkSlotLabel}
          </FiButton>
        </div>

        {slots.loading ? (
          <div
            role="status"
            style={{ display: "flex", alignItems: "center", gap: 8, color: PB.mid, padding: "12px 0" }}
          >
            <Loader2 className="animate-spin" size={16} aria-hidden />
            Loading artwork slots…
          </div>
        ) : null}

        {slots.error ? (
          <div
            role="alert"
            style={{
              border: `1px solid ${PB.border}`,
              borderRadius: 12,
              padding: 16,
              background: PB.white,
              marginBottom: 16,
            }}
          >
            <p style={{ margin: "0 0 12px" }}>{slots.error}</p>
            <FiButton variant="secondary" size="sm" onClick={() => void slots.reload()}>
              Try again
            </FiButton>
          </div>
        ) : null}

        {!slots.loading && !slots.error && slots.isEmpty ? (
          <div
            style={{
              border: `1px dashed ${PB.border}`,
              borderRadius: 12,
              padding: "32px 24px",
              background: PB.white,
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>
              {studioCollectionsDefaults.planningEmptyTitle}
            </h3>
            <p style={{ margin: "0 0 20px", color: PB.mid }}>
              {studioCollectionsDefaults.planningEmptyDescription}
            </p>
            <FiButton variant="primary" onClick={() => setDialogOpen(true)}>
              {artworkSlotsDefaults.addArtworkSlotLabel}
            </FiButton>
          </div>
        ) : null}

        {!slots.loading && !slots.error && slots.slots.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {slots.slots.map((slot, index) => (
              <ArtworkSlotSection
                key={slot.id}
                collectionId={collection.id}
                slot={slot}
                position={index + 1}
                onCandidateCountChange={handleCandidateCountChange}
              />
            ))}
          </div>
        ) : null}
      </section>

      <AddArtworkSlotDialog
        collectionId={collection.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={slots.addSlot}
      />
    </div>
  );
}
