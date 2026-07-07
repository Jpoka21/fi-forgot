import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { launchReadinessDefaults } from "@/app/launch-readiness/launchReadinessDomain";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { trackVerificationEvent } from "@/app/verification/systemVerificationAnalytics";
import { useSystemVerification } from "@/app/verification/hooks/useSystemVerification";
import type { VerificationCategory } from "@/app/verification/systemVerificationDomain";

const categoryTitles: Record<VerificationCategory, string> = {
  responsive: "Responsive design audit",
  accessibility: "Accessibility audit",
  motion: "Motion audit",
  design: "Design consistency audit",
  api: "API integration preservation",
  performance: "Performance verification",
  security: "Security verification",
};

function VerificationSection({
  category,
  title,
  children,
}: {
  category: VerificationCategory;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="fi-system-verification__panel"
      aria-labelledby={`verification-${category}-title`}
      onFocus={() => trackVerificationEvent("verification_section_opened", { section: category })}
    >
      <h2 id={`verification-${category}-title`} className="fi-system-verification__panel-title">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function FiSystemVerificationPage() {
  const verification = useSystemVerification();

  return (
    <div id="verification-main" className="fi-system-verification" tabIndex={-1}>
      <header className="fi-system-verification__header">
        <h1 className="fi-system-verification__title">{verification.defaults.title}</h1>
        <p className="fi-system-verification__subtitle">{verification.defaults.subtitle}</p>
      </header>

      <section className="fi-system-verification__panel" aria-labelledby="verification-summary-title">
        <h2 id="verification-summary-title" className="fi-system-verification__panel-title">
          {verification.defaults.summaryTitle}
        </h2>
        <p className="fi-system-verification__note">{verification.defaults.manualQaNote}</p>
        <div className="fi-system-verification__summary" aria-live="polite">
          <div className="fi-system-verification__summary-card">
            <p className="fi-system-verification__summary-label">Overall</p>
            <p className="fi-system-verification__summary-value">
              {verification.summary.passed} / {verification.summary.total}
            </p>
          </div>
          {verification.categories.map((category) => (
            <div key={category} className="fi-system-verification__summary-card">
              <p className="fi-system-verification__summary-label">{category}</p>
              <p className="fi-system-verification__summary-value">
                {verification.summary.byCategory[category].passed} /{" "}
                {verification.summary.byCategory[category].total}
              </p>
            </div>
          ))}
        </div>
        <div className="fi-system-verification__toolbar">
          <Link href={ROUTE_PATHS.launchReadiness}>
            <FiButton variant="secondary" size="sm">
              {launchReadinessDefaults.launchReadinessLabel}
            </FiButton>
          </Link>
        </div>
      </section>

      {verification.categories.map((category) => (
        <VerificationSection key={category} category={category} title={categoryTitles[category]}>
          <ul className="fi-system-verification__list">
            {verification.checksByCategory[category].map((check) => (
              <li key={check.id} className="fi-system-verification__item">
                <span
                  className={`fi-system-verification__status ${
                    check.passes
                      ? "fi-system-verification__status--pass"
                      : "fi-system-verification__status--fail"
                  }`}
                  aria-hidden
                >
                  {check.passes ? "Pass" : "Review"}
                </span>
                <span>
                  {check.description}
                  {check.note ? (
                    <>
                      <br />
                      <span className="fi-system-verification__note">{check.note}</span>
                    </>
                  ) : null}
                </span>
                {check.href ? (
                  <Link href={check.href} className="fi-system-verification__note">
                    Open
                  </Link>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ul>
        </VerificationSection>
      ))}

      <section className="fi-system-verification__panel" aria-labelledby="verification-api-title">
        <h2 id="verification-api-title" className="fi-system-verification__panel-title">
          {verification.defaults.apiTitle}
        </h2>
        <ul className="fi-system-verification__api-list">
          {verification.apiIntegrationPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
