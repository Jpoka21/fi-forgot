import type { FiAutopilotCoverageSummary } from "@/app/autopilot/autopilotDomain";
import { getFiAutopilotSectionClassName } from "@/app/components/autopilot/autopilotVariants";

export interface FiAutopilotCoverageSummaryProps {
  coverage: FiAutopilotCoverageSummary;
}

export function FiAutopilotCoverageSummaryPanel({ coverage }: FiAutopilotCoverageSummaryProps) {
  const metrics = [
    { label: "Active people", value: coverage.activeRecipients },
    { label: "Occasions tracked", value: coverage.trackedOccasions },
    { label: "Relationship confidence", value: coverage.averageHealthScore },
    { label: "Need attention", value: coverage.relationshipsNeedingAttention },
  ];

  return (
    <section className={getFiAutopilotSectionClassName()} aria-labelledby="fi-autopilot-coverage">
      <h2 id="fi-autopilot-coverage" className="fi-autopilot__section-title">
        Relationship coverage
      </h2>
      <p className="fi-autopilot__section-copy">
        How thoroughly your concierge is watching the people who matter.
      </p>
      <div className="fi-autopilot__grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="fi-autopilot__metric">
            <p className="fi-autopilot__metric-value">{metric.value}</p>
            <p className="fi-autopilot__metric-label">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
