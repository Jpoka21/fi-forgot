import type { PositiveSurpriseMoment } from "@/app/concierge/conciergeDomain";

export interface FiConciergePositiveSurpriseProps {
  surprise: PositiveSurpriseMoment;
}

/** Rare warm moment from existing memories — no action required */
export function FiConciergePositiveSurprise({ surprise }: FiConciergePositiveSurpriseProps) {
  return (
    <aside className="fi-concierge-surprise" aria-label="A memory worth remembering">
      <p className="fi-concierge-surprise__message">{surprise.message}</p>
      <blockquote className="fi-concierge-surprise__excerpt">"{surprise.memoryExcerpt}…"</blockquote>
    </aside>
  );
}
