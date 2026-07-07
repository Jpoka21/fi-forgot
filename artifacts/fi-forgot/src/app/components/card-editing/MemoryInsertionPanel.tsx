import { BookHeart } from "lucide-react";

import {
  cardEditingDefaults,
  type CardMemoryItem,
} from "@/app/card-editing/cardEditingDomain";
import { FiButton } from "@/app/components/button/FiButton";

export interface MemoryInsertionPanelProps {
  memories: CardMemoryItem[];
  busy?: boolean;
  onInsert: (memoryText: string) => void;
}

export function MemoryInsertionPanel({
  memories,
  busy = false,
  onInsert,
}: MemoryInsertionPanelProps) {
  return (
    <section className="fi-card-editing__memory" aria-labelledby="fi-card-memory-title">
      <div className="fi-card-editing__memory-header">
        <BookHeart size={16} aria-hidden />
        <h3 id="fi-card-memory-title" className="fi-card-editing__memory-title">
          {cardEditingDefaults.memoryTitle}
        </h3>
      </div>

      {memories.length === 0 ? (
        <p className="fi-card-editing__memory-empty">{cardEditingDefaults.memoryEmpty}</p>
      ) : (
        <ul className="fi-card-editing__memory-list">
          {memories.map((memory) => (
            <li key={memory.id} className="fi-card-editing__memory-item">
              <div>
                <p className="fi-card-editing__memory-source">{memory.source}</p>
                <p className="fi-card-editing__memory-text">{memory.text}</p>
              </div>
              <FiButton
                variant="secondary"
                size="sm"
                onClick={() => onInsert(memory.text)}
                disabled={busy}
                aria-label={`${cardEditingDefaults.memoryInsertLabel}: ${memory.text}`}
              >
                {cardEditingDefaults.memoryInsertLabel}
              </FiButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
