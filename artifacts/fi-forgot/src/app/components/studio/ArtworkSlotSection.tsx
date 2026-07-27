import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { FiButton } from "@/app/components/button/FiButton";
import { AddArtworkCandidateDialog } from "@/app/components/studio/AddArtworkCandidateDialog";
import { artworkCandidatesDefaults } from "@/app/studio/artworkCandidatesDomain";
import { artworkSlotsDefaults } from "@/app/studio/artworkSlotsDomain";
import type { StudioArtworkSlot } from "@/app/studio/artworkSlotsDomain";
import { useStudioArtworkCandidates } from "@/app/studio/hooks/useStudioArtworkCandidates";
import { PB } from "@/lib/personal-brand";

export interface ArtworkSlotSectionProps {
  collectionId: string;
  slot: StudioArtworkSlot;
  position: number;
  onCandidateCountChange?: (slotId: string, count: number) => void;
}

function ArtworkCandidateRow({
  name,
  brief,
  position,
}: {
  name: string;
  brief: string | null;
  position: number;
}) {
  return (
    <article
      style={{
        border: `1px solid ${PB.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        background: PB.white,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ fontSize: "0.75rem", color: PB.mid }}>
        {artworkCandidatesDefaults.candidatePositionLabel(position)}
      </div>
      <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>{name}</div>
      {brief ? (
        <p style={{ margin: 0, color: PB.mid, fontSize: "0.85rem" }}>{brief}</p>
      ) : null}
    </article>
  );
}

export function ArtworkSlotSection({
  collectionId,
  slot,
  position,
  onCandidateCountChange,
}: ArtworkSlotSectionProps) {
  const candidates = useStudioArtworkCandidates(collectionId, slot.id);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    onCandidateCountChange?.(slot.id, candidates.candidateCount);
  }, [candidates.candidateCount, onCandidateCountChange, slot.id]);

  return (
    <section
      style={{
        border: `1px solid ${PB.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        background: PB.white,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: PB.mid, marginBottom: 4 }}>
            {artworkSlotsDefaults.slotPositionLabel(position)}
          </div>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>{slot.name}</h3>
        </div>
        <span style={{ fontSize: "0.85rem", color: PB.mid, whiteSpace: "nowrap" }}>
          Qty {slot.quantity}
        </span>
      </div>

      {slot.brief ? (
        <p style={{ margin: 0, color: PB.mid, fontSize: "0.9rem" }}>{slot.brief}</p>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>Artwork Candidates</h4>
          <FiButton variant="secondary" size="sm" onClick={() => setDialogOpen(true)}>
            {artworkCandidatesDefaults.addArtworkCandidateLabel}
          </FiButton>
        </div>

        {candidates.loading ? (
          <div
            role="status"
            style={{ display: "flex", alignItems: "center", gap: 8, color: PB.mid, padding: "8px 0" }}
          >
            <Loader2 className="animate-spin" size={14} aria-hidden />
            Loading artwork candidates…
          </div>
        ) : null}

        {candidates.error ? (
          <div
            role="alert"
            style={{
              border: `1px solid ${PB.border}`,
              borderRadius: 10,
              padding: 12,
              background: PB.white,
            }}
          >
            <p style={{ margin: "0 0 10px" }}>{candidates.error}</p>
            <FiButton variant="secondary" size="sm" onClick={() => void candidates.reload()}>
              Try again
            </FiButton>
          </div>
        ) : null}

        {!candidates.loading && !candidates.error && candidates.isEmpty ? (
          <p style={{ margin: 0, color: PB.mid, fontSize: "0.9rem" }}>
            {artworkCandidatesDefaults.emptyCandidatesLabel}
          </p>
        ) : null}

        {!candidates.loading && !candidates.error && candidates.candidates.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {candidates.candidates.map((candidate, index) => (
              <ArtworkCandidateRow
                key={candidate.id}
                name={candidate.name}
                brief={candidate.brief}
                position={index + 1}
              />
            ))}
          </div>
        ) : null}
      </div>

      <AddArtworkCandidateDialog
        collectionId={collectionId}
        slotId={slot.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={candidates.addCandidate}
      />
    </section>
  );
}
