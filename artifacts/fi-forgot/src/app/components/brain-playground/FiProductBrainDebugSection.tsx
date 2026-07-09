import { brainPlaygroundDefaults } from "@/app/brain-playground/brainPlaygroundDomain";
import type { ProductBrainDecisionDebug } from "@/app/product-brain/productBrainDecisionTypes";
import { FiBrainPlaygroundFieldGrid } from "./FiBrainPlaygroundFieldGrid";

export interface FiProductBrainDebugSectionProps {
  debug: ProductBrainDecisionDebug;
}

export function FiProductBrainDebugSection({ debug }: FiProductBrainDebugSectionProps) {
  return (
    <details className="fi-brain-playground__debug">
      <summary className="fi-brain-playground__debug-summary">
        {brainPlaygroundDefaults.sections.debug}
      </summary>
      <div className="fi-brain-playground__debug-body">
        <FiBrainPlaygroundFieldGrid
          fields={[
            { label: "generatedAt", value: debug.generatedAt, mono: true },
            { label: "confidence", value: debug.confidence },
            { label: "brainContextVersion", value: debug.brainContextVersion },
          ]}
        />
        <div className="fi-brain-playground__debug-block">
          <p className="fi-brain-playground__debug-block-label">reasons</p>
          <pre className="fi-brain-playground__debug-pre">
            {JSON.stringify(debug.reasons, null, 2)}
          </pre>
        </div>
        <div className="fi-brain-playground__debug-block">
          <p className="fi-brain-playground__debug-block-label">ruleEvaluation</p>
          <pre className="fi-brain-playground__debug-pre">
            {JSON.stringify(debug.ruleEvaluation, null, 2)}
          </pre>
        </div>
      </div>
    </details>
  );
}
