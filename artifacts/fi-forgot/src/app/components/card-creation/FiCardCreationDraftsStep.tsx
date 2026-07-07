import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

import { FiButton } from "@/app/components/button/FiButton";
import { FiCardEditingWorkspace } from "@/app/components/card-editing";
import {
  cardCreationDefaults,
  type GeneratedCardDraft,
} from "@/app/card-creation/cardCreationDomain";
import type { CardDesignPreview } from "@/app/card-editing/cardEditingDomain";
import { getFiCardCreationPanelClassName, getFiCardCreationSectionClassName } from "@/app/components/card-creation/cardCreationVariants";
import type { Recipient, Tone } from "@/lib/data";

export interface FiCardCreationDraftsStepProps {
  recipient?: Recipient;
  occasion: string;
  cards: GeneratedCardDraft[];
  editedTexts: Record<string, string>;
  selectedTone: Tone | null;
  onSelectTone: (tone: Tone) => void;
  onEditText: (tone: Tone, text: string) => void;
  onSaveDraft: () => void;
  onContinue: () => void;
  onBack: () => void;
  onStartOver: () => void;
}

export function FiCardCreationDraftsStep({
  recipient,
  occasion,
  cards,
  editedTexts,
  selectedTone,
  onSelectTone,
  onEditText,
  onSaveDraft,
  onContinue,
  onBack,
  onStartOver,
}: FiCardCreationDraftsStepProps) {
  const [design, setDesign] = useState<CardDesignPreview | null>(null);
  const [designLoading, setDesignLoading] = useState(false);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);

  const selectedDraft = selectedTone
    ? editedTexts[selectedTone] ?? cards.find((card) => card.tone === selectedTone)?.text ?? ""
    : "";
  const originalDraft = selectedTone
    ? cards.find((card) => card.tone === selectedTone)?.text ?? ""
    : "";

  useEffect(() => {
    if (!selectedTone) return;

    let cancelled = false;
    setDesignLoading(true);

    const params = new URLSearchParams({ eventType: occasion });
    if (selectedDraft) params.set("cardMessage", selectedDraft);
    if (excludedIds.length) params.set("excludeIds", excludedIds.join(","));

    fetch(`/api/personal-cards/pick-card?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { card?: CardDesignPreview } | null) => {
        if (!cancelled && data?.card) setDesign(data.card);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDesignLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTone, occasion, selectedDraft, excludedIds]);

  function changeArtwork() {
    if (!design) return;
    setExcludedIds((prev) => [...prev, String(design.id)]);
    setDesign(null);
  }

  return (
    <section className={getFiCardCreationSectionClassName()} aria-labelledby="card-creation-drafts-title">
      <div className="fi-card-creation__actions" style={{ justifyContent: "space-between" }}>
        <div>
          <h2 id="card-creation-drafts-title" className="fi-card-creation__panel-title">
            3 versions for {recipient?.name}
          </h2>
          <p className="fi-card-creation__panel-copy">
            <Sparkles size={13} aria-hidden="true" /> Written by ChatGPT · {occasion}
          </p>
        </div>
        <FiButton variant="secondary" size="sm" onClick={onStartOver} data-testid="button-start-over">
          {cardCreationDefaults.startOverLabel}
        </FiButton>
      </div>

      <div className="fi-card-creation__draft-list">
        {cards.map((card) => {
          const selected = selectedTone === card.tone;
          const text = editedTexts[card.tone] ?? card.text;

          return (
            <article
              key={card.tone}
              className={`fi-card-creation__draft-card${selected ? " fi-card-creation__draft-card--selected" : ""}`}
              data-testid={`card-version-${card.tone.toLowerCase()}`}
            >
              <div className="fi-card-creation__actions" style={{ justifyContent: "space-between" }}>
                <span className="fi-card-creation__draft-label">{card.tone}</span>
                {selected ? (
                  <span className="fi-card-creation__draft-label" style={{ color: "var(--fi-color-brand-primary)" }}>
                    Selected
                  </span>
                ) : null}
              </div>

              {!selected ? <p className="fi-card-creation__draft-text">{text}</p> : null}

              <FiButton
                variant={selected ? "primary" : "secondary"}
                size="sm"
                onClick={() => onSelectTone(card.tone)}
                leftIcon={selected ? <CheckCircle2 size={14} /> : undefined}
                data-testid={`button-select-${card.tone.toLowerCase()}`}
              >
                {selected ? "Selected version" : "Select this version"}
              </FiButton>
            </article>
          );
        })}
      </div>

      {selectedTone && recipient ? (
        <FiCardEditingWorkspace
          recipientName={recipient.name}
          occasion={occasion}
          relationship={recipient.relationship}
          tone={selectedTone}
          statusLabel="Draft"
          message={selectedDraft}
          originalMessage={originalDraft}
          onMessageChange={(value) => onEditText(selectedTone, value)}
          recipient={recipient}
          design={design}
          designLoading={designLoading}
          onChangeArtwork={changeArtwork}
          onSaveDraft={onSaveDraft}
          showApproveActions={false}
        />
      ) : null}

      <div className={getFiCardCreationPanelClassName()}>
        <div className="fi-card-creation__actions">
          <FiButton variant="secondary" onClick={onBack}>
            Back
          </FiButton>
          <FiButton variant="secondary" onClick={onSaveDraft} disabled={!selectedTone}>
            {cardCreationDefaults.saveDraftLabel}
          </FiButton>
          <FiButton variant="primary" onClick={onContinue} disabled={!selectedTone}>
            Continue to review
          </FiButton>
        </div>
      </div>
    </section>
  );
}
