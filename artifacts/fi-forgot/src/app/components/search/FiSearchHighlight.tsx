import type { ReactNode } from "react";

import { splitSearchHighlight } from "@/app/search/searchHighlight";

export interface FiSearchHighlightProps {
  text: string;
  query: string;
  className?: string;
}

export function FiSearchHighlight({ text, query, className }: FiSearchHighlightProps): ReactNode {
  const segments = splitSearchHighlight(text, query);

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <mark key={index} className="fi-search-highlight">
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
}
