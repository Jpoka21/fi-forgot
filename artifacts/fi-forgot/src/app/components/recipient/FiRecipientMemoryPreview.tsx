import { getFiRecipientSectionClassName } from "@/app/components/recipient/recipientVariants";
import { recipientDefaults, type FiRecipientMemoryPreviewItem } from "@/app/recipient/recipientDomain";
import type { FiTimelineItem } from "@/app/timeline/timelineDomain";

export interface FiRecipientMemoryPreviewProps {
  items: FiRecipientMemoryPreviewItem[];
  timelinePreview?: FiTimelineItem[];
}

export function FiRecipientMemoryPreview({
  items,
  timelinePreview = [],
}: FiRecipientMemoryPreviewProps) {
  const hasContent = items.length > 0 || timelinePreview.length > 0;

  return (
    <section className={getFiRecipientSectionClassName()} aria-labelledby="fi-recipient-memory-preview">
      <h3 id="fi-recipient-memory-preview" className="fi-recipient__section-title">
        {recipientDefaults.memoryPreviewTitle}
      </h3>

      {!hasContent ? (
        <p className="fi-recipient__copy">Add a memory or fresh update to enrich future cards.</p>
      ) : (
        <>
          {items.length > 0 ? (
            <ul className="fi-recipient__memory-list">
              {items.map((item) => (
                <li key={item.id} className="fi-recipient__memory-item">
                  <div>
                    <p className="fi-recipient__status-label">{item.label}</p>
                    <p className="fi-recipient__copy">{item.excerpt}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {timelinePreview.length > 0 ? (
            <ul className="fi-recipient__timeline-preview" aria-label="Recent timeline moments">
              {timelinePreview.map((item) => (
                <li key={item.id} className="fi-recipient__timeline-item">
                  <div>
                    <p className="fi-recipient__status-label">{item.label}</p>
                    <p className="fi-recipient__copy">{item.summary}</p>
                  </div>
                  <span className="fi-recipient__meta">{item.date}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}
