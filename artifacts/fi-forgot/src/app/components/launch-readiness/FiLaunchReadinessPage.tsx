import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { useLaunchReadiness } from "@/app/launch-readiness/hooks/useLaunchReadiness";
import { LAST_LAUNCH_BUILD_STATUS } from "@/app/launch-readiness/launchReadinessBuildStatus";
import type { LaunchReadinessCategory } from "@/app/launch-readiness/launchReadinessDomain";
import { ROUTE_PATHS } from "@/app/routes/routePaths";

const categoryTitles: Record<LaunchReadinessCategory, string> = {
  finalUi: "Final UI audit",
  production: "Production readiness",
  crossBrowser: "Cross-browser testing",
  uxReview: "Final user experience review",
};

export function FiLaunchReadinessPage() {
  const launch = useLaunchReadiness(LAST_LAUNCH_BUILD_STATUS);

  return (
    <div id="launch-readiness-main" className="fi-system-verification" tabIndex={-1}>
      <header className="fi-system-verification__header">
        <h1 className="fi-system-verification__title">{launch.defaults.title}</h1>
        <p className="fi-system-verification__subtitle">{launch.defaults.subtitle}</p>
      </header>

      <section className="fi-system-verification__panel" aria-labelledby="launch-summary-title">
        <h2 id="launch-summary-title" className="fi-system-verification__panel-title">
          {launch.defaults.summaryTitle}
        </h2>
        <p className="fi-system-verification__note">{launch.defaults.manualSignoffNote}</p>
        <div className="fi-system-verification__summary" aria-live="polite">
          <div className="fi-system-verification__summary-card">
            <p className="fi-system-verification__summary-label">Overall</p>
            <p className="fi-system-verification__summary-value">
              {launch.summary.passed} / {launch.summary.total}
            </p>
          </div>
          <div className="fi-system-verification__summary-card">
            <p className="fi-system-verification__summary-label">Automated</p>
            <p className="fi-system-verification__summary-value">
              {launch.summary.automatedPassed} / {launch.summary.automatedTotal}
            </p>
          </div>
          <div className="fi-system-verification__summary-card">
            <p className="fi-system-verification__summary-label">Manual remaining</p>
            <p className="fi-system-verification__summary-value">{launch.summary.manualRemaining}</p>
          </div>
          <div className="fi-system-verification__summary-card">
            <p className="fi-system-verification__summary-label">Launch ready</p>
            <p className="fi-system-verification__summary-value">
              {launch.summary.launchReady ? "Yes" : "Pending"}
            </p>
          </div>
        </div>
        <div className="fi-system-verification__toolbar">
          <Link href={ROUTE_PATHS.systemVerification}>
            <FiButton variant="secondary" size="sm">
              {launch.defaults.systemVerificationLabel}
            </FiButton>
          </Link>
        </div>
      </section>

      {launch.categories.map((category) => (
        <section
          key={category}
          className="fi-system-verification__panel"
          aria-labelledby={`launch-${category}-title`}
        >
          <h2 id={`launch-${category}-title`} className="fi-system-verification__panel-title">
            {categoryTitles[category]}
          </h2>
          <ul className="fi-system-verification__list">
            {launch.checksByCategory[category].map((check) => (
              <li key={check.id} className="fi-system-verification__item">
                <span
                  className={`fi-system-verification__status ${
                    check.passes
                      ? "fi-system-verification__status--pass"
                      : "fi-system-verification__status--fail"
                  }`}
                >
                  {check.passes ? "Pass" : check.manual ? "Manual" : "Review"}
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
        </section>
      ))}

      <section className="fi-system-verification__panel" aria-labelledby="launch-api-title">
        <h2 id="launch-api-title" className="fi-system-verification__panel-title">
          API preservation (read-only)
        </h2>
        <ul className="fi-system-verification__api-list">
          {launch.preservedIntegrations.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="fi-system-verification__note">
          Verify commands: {launch.defaults.buildCommand} · {launch.defaults.typecheckCommand} ·{" "}
          {launch.defaults.lintCommand}
        </p>
      </section>
    </div>
  );
}
