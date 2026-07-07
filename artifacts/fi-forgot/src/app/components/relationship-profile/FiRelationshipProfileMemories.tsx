import { formatDaysAgo, type FreshUpdate } from "@/app/relationship-profile/relationshipProfileDomain";
import { FiButton } from "@/app/components/button/FiButton";
import { getFiRelationshipProfileSectionClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export interface FiRelationshipProfileMemoriesProps {
  firstName: string;
  memoryText: string;
  savingMemory: boolean;
  memorySaved: boolean;
  freshLoading: boolean;
  displayedMemories: FreshUpdate[];
  freshUpdatesCount: number;
  showAllMemories: boolean;
  onMemoryTextChange: (value: string) => void;
  onSaveMemory: () => void;
  onToggleShowAll: () => void;
}

export function FiRelationshipProfileMemories({
  firstName,
  memoryText,
  savingMemory,
  memorySaved,
  freshLoading,
  displayedMemories,
  freshUpdatesCount,
  showAllMemories,
  onMemoryTextChange,
  onSaveMemory,
  onToggleShowAll,
}: FiRelationshipProfileMemoriesProps) {
  return (
    <section className={getFiRelationshipProfileSectionClassName()} aria-labelledby="fi-profile-memories">
      <div>
        <h2 id="fi-profile-memories" className="fi-relationship-profile__section-title">
          Memories
        </h2>
        <p className="fi-relationship-profile__section-subtitle">
          Little details that make {firstName}'s cards feel personal.
        </p>
      </div>

      <div className="fi-relationship-profile__card">
        <textarea
          id="memory-input"
          className="fi-relationship-profile__memory-input"
          value={memoryText}
          onChange={(event) => onMemoryTextChange(event.target.value)}
          placeholder={`Something ${firstName} would love you remembered…`}
          rows={3}
        />
        <FiButton
          variant="primary"
          size="sm"
          disabled={savingMemory || !memoryText.trim()}
          onClick={onSaveMemory}
        >
          {savingMemory ? "Saving…" : memorySaved ? "Saved ✓" : "Save memory"}
        </FiButton>
      </div>

      {freshLoading ? (
        <p className="fi-relationship-profile__meta">Loading memories…</p>
      ) : displayedMemories.length === 0 ? (
        <div className="fi-relationship-profile__card">
          <p className="fi-relationship-profile__copy">
            Every great relationship has stories. Add one above — we'll weave it into the next card.
          </p>
        </div>
      ) : (
        <ul className="fi-relationship-profile__list">
          {displayedMemories.map((memory) => (
            <li key={memory.id} className="fi-relationship-profile__card">
              <p className="fi-relationship-profile__copy">{memory.answerText}</p>
              <p className="fi-relationship-profile__meta">{formatDaysAgo(memory.daysAgo)}</p>
            </li>
          ))}
        </ul>
      )}

      {freshUpdatesCount > 4 ? (
        <FiButton variant="ghost" size="sm" onClick={onToggleShowAll}>
          {showAllMemories ? "Show fewer" : `Show all ${freshUpdatesCount} memories`}
        </FiButton>
      ) : null}
    </section>
  );
}
