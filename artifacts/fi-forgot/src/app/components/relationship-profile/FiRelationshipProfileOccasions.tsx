import type { Recipient } from "@/lib/data";
import {
  DATE_SENSITIVE_EVENTS,
  HOLIDAY_EVENTS,
} from "@/app/relationship-profile/relationshipProfileDomain";
import { getAllOccasionOptions, isTrackedEvent } from "@/app/relationship-profile/relationshipProfileEngine";
import { FiButton } from "@/app/components/button/FiButton";
import { getFiRelationshipProfileSectionClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export interface FiRelationshipProfileOccasionsProps {
  recipient: Recipient;
  showAddEvent: boolean;
  selectedEventChip: string | null;
  newEventDate: string;
  savingEvent: boolean;
  onToggleAddEvent: () => void;
  onSelectEventChip: (label: string | null) => void;
  onNewEventDateChange: (value: string) => void;
  onAddHolidayEvent: (label: string, flag: keyof Recipient) => void;
  onRemoveEvent: (label: string) => void;
  onAddDateEvent: () => void;
}

export function FiRelationshipProfileOccasions(props: FiRelationshipProfileOccasionsProps) {
  const {
    recipient,
    showAddEvent,
    selectedEventChip,
    newEventDate,
    savingEvent,
    onToggleAddEvent,
    onSelectEventChip,
    onNewEventDateChange,
    onAddHolidayEvent,
    onRemoveEvent,
    onAddDateEvent,
  } = props;

  const tracked = getAllOccasionOptions().filter((item) => isTrackedEvent(item.label, recipient));

  return (
    <section className={getFiRelationshipProfileSectionClassName()} aria-labelledby="fi-profile-occasions">
      <div className="fi-relationship-profile__section-header">
        <div>
          <h2 id="fi-profile-occasions" className="fi-relationship-profile__section-title">
            Occasions we remember
          </h2>
          <p className="fi-relationship-profile__section-subtitle">
            We'll watch the calendar so you don't have to.
          </p>
        </div>
        <FiButton variant="ghost" size="sm" onClick={onToggleAddEvent}>
          {showAddEvent ? "Done" : "+ Add occasion"}
        </FiButton>
      </div>

      <div className="fi-relationship-profile__card">
        {tracked.length === 0 && !showAddEvent ? (
          <p className="fi-relationship-profile__copy">
            Add a birthday, anniversary, or holiday when you're ready.
          </p>
        ) : (
          <div className="fi-relationship-profile__chip-row">
            {tracked.map((item) => (
              <span key={item.label} className="fi-relationship-profile__meta">
                {item.label}
              </span>
            ))}
          </div>
        )}

        {showAddEvent ? (
          <div style={{ marginTop: "1rem" }}>
            <div className="fi-relationship-profile__chip-row">
              {DATE_SENSITIVE_EVENTS.map((item) => {
                const isTracked = isTrackedEvent(item.label, recipient);
                const selecting = selectedEventChip === item.label;
                return (
                  <FiButton
                    key={item.label}
                    variant={isTracked || selecting ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => {
                      if (isTracked) onRemoveEvent(item.label);
                      else onSelectEventChip(selecting ? null : item.label);
                    }}
                  >
                    {item.label}
                    {isTracked ? " ✓" : ""}
                  </FiButton>
                );
              })}
              {HOLIDAY_EVENTS.map((item) => {
                const isTracked = isTrackedEvent(item.label, recipient);
                return (
                  <FiButton
                    key={item.label}
                    variant={isTracked ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => {
                      if (isTracked) onRemoveEvent(item.label);
                      else onAddHolidayEvent(item.label, item.flag);
                    }}
                  >
                    {item.label}
                    {isTracked ? " ✓" : ""}
                  </FiButton>
                );
              })}
            </div>
            {selectedEventChip ? (
              <div style={{ marginTop: "1rem" }}>
                <p className="fi-relationship-profile__meta">
                  When is their {selectedEventChip}?
                </p>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(event) => onNewEventDateChange(event.target.value)}
                  className="fi-relationship-profile__memory-input"
                />
                <FiButton
                  variant="primary"
                  size="sm"
                  disabled={!newEventDate || savingEvent}
                  onClick={onAddDateEvent}
                >
                  {savingEvent ? "Saving…" : `Add ${selectedEventChip}`}
                </FiButton>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
