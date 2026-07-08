/**
 * Relationship timeline signal contributor.
 *
 * Emits read-only activity timeline inventory signals from
 * relationshipContext.relationshipTimeline.events.
 * Metadata and counts only — no message text, no recommendations.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

type TimelineDepth = "none" | "light" | "moderate" | "rich";

function depthFromEventCount(eventCount: number): TimelineDepth {
  if (eventCount === 0) return "none";
  if (eventCount <= 3) return "light";
  if (eventCount <= 8) return "moderate";
  return "rich";
}

export function contributeRelationshipTimelineSignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const events = context.relationshipContext.relationshipTimeline.events;

  const totalEventCount = events.length;
  const latestEventDaysAgo = events[0]?.daysAgo ?? null;
  const eventsLast90Days = events.filter((event) => event.daysAgo <= 90).length;
  const eventsLast365Days = events.filter((event) => event.daysAgo <= 365).length;

  const freshUpdateEventCount = events.filter(
    (event) => event.type === "fresh_update",
  ).length;
  const followUpAnswerEventCount = events.filter(
    (event) => event.type === "follow_up_answer",
  ).length;
  const cardEventCount = events.filter((event) => event.type === "card").length;
  const briefingEventCount = events.filter(
    (event) => event.type === "event_briefing",
  ).length;
  const profileGapEventCount = events.filter(
    (event) => event.type === "profile_gap",
  ).length;

  return [
    {
      source: "relationship_timeline",
      label: "total_event_count",
      value: totalEventCount,
    },
    {
      source: "relationship_timeline",
      label: "latest_event_days_ago",
      value: latestEventDaysAgo,
    },
    {
      source: "relationship_timeline",
      label: "events_last_90_days",
      value: eventsLast90Days,
    },
    {
      source: "relationship_timeline",
      label: "events_last_365_days",
      value: eventsLast365Days,
    },
    {
      source: "relationship_timeline",
      label: "fresh_update_event_count",
      value: freshUpdateEventCount,
    },
    {
      source: "relationship_timeline",
      label: "follow_up_answer_event_count",
      value: followUpAnswerEventCount,
    },
    {
      source: "relationship_timeline",
      label: "card_event_count",
      value: cardEventCount,
    },
    {
      source: "relationship_timeline",
      label: "briefing_event_count",
      value: briefingEventCount,
    },
    {
      source: "relationship_timeline",
      label: "profile_gap_event_count",
      value: profileGapEventCount,
    },
    {
      source: "relationship_timeline",
      label: "timeline_depth",
      value: depthFromEventCount(totalEventCount),
    },
  ];
}
