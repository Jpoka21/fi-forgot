import type { ReactNode } from "react";

import { brainPlaygroundDefaults } from "@/app/brain-playground/brainPlaygroundDomain";
import type { ProductBrainDecision } from "@/app/product-brain/productBrainDecisionTypes";
import { FiBrainPlaygroundFieldGrid } from "./FiBrainPlaygroundFieldGrid";
import { FiProductBrainDebugSection } from "./FiProductBrainDebugSection";

export interface FiProductBrainDecisionPanelProps {
  decision: ProductBrainDecision;
}

function PlaygroundSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="fi-brain-playground__panel" aria-labelledby={`brain-${title}`}>
      <h2 id={`brain-${title}`} className="fi-brain-playground__panel-title">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function FiProductBrainDecisionPanel({ decision }: FiProductBrainDecisionPanelProps) {
  const question = decision.selectedFollowUpQuestion;

  return (
    <div className="fi-brain-playground__decision">
      <PlaygroundSection title={brainPlaygroundDefaults.sections.contract}>
        <FiBrainPlaygroundFieldGrid
          fields={[
            { label: "version", value: decision.version },
            { label: "recipientId", value: decision.recipientId, mono: true },
          ]}
        />
      </PlaygroundSection>

      <PlaygroundSection title={brainPlaygroundDefaults.sections.decision}>
        <FiBrainPlaygroundFieldGrid
          fields={[
            { label: "outcome", value: decision.decision.outcome },
            { label: "sourceRuleId", value: decision.sourceRuleId, mono: true },
          ]}
        />
      </PlaygroundSection>

      <PlaygroundSection title={brainPlaygroundDefaults.sections.actionPlan}>
        <FiBrainPlaygroundFieldGrid
          fields={[
            { label: "type", value: decision.actionPlan.type },
            { label: "category", value: decision.actionPlan.category },
            { label: "priority", value: decision.actionPlan.priority },
            { label: "primaryReason", value: decision.actionPlan.primaryReason, mono: true },
          ]}
        />
      </PlaygroundSection>

      <PlaygroundSection title={brainPlaygroundDefaults.sections.display}>
        <FiBrainPlaygroundFieldGrid
          fields={[
            { label: "title", value: decision.display.title },
            { label: "explanation", value: decision.display.explanation },
          ]}
        />
      </PlaygroundSection>

      <PlaygroundSection title={brainPlaygroundDefaults.sections.question}>
        {question ? (
          <FiBrainPlaygroundFieldGrid
            fields={[
              { label: "questionId", value: question.questionId, mono: true },
              { label: "category", value: question.category },
              { label: "questionText", value: question.questionText },
              { label: "sensitivity", value: question.sensitivity },
            ]}
          />
        ) : (
          <p className="fi-brain-playground__empty-question">
            {brainPlaygroundDefaults.noQuestionMessage}
          </p>
        )}
      </PlaygroundSection>

      {decision.debug ? <FiProductBrainDebugSection debug={decision.debug} /> : null}
    </div>
  );
}
