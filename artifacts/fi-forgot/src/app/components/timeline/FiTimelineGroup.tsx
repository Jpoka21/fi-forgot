import type { ReactNode } from "react";

export interface FiTimelineGroupProps {
  title: string;
  children: ReactNode;
}

export function FiTimelineGroup({ title, children }: FiTimelineGroupProps) {
  return (
    <section className="fi-timeline-group" aria-label={title}>
      <div className="fi-timeline-group__header">
        <h3 className="fi-timeline-group__title">{title}</h3>
        <div className="fi-timeline-group__divider" aria-hidden />
      </div>
      {children}
    </section>
  );
}
