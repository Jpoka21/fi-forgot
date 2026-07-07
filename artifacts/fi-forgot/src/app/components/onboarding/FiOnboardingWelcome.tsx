import { FiButton } from "@/app/components/button/FiButton";
import {
  FiCard,
  FiCardContent,
  FiCardDescription,
  FiCardHeader,
  FiCardTitle,
} from "@/app/components/card/FiCard";
import { useOnboardingWelcome } from "@/app/onboarding/hooks/useOnboardingWelcome";
import { getFiOnboardingClassName } from "@/app/components/onboarding/onboardingVariants";
import type { WelcomePhase } from "@/app/onboarding/onboardingDomain";

export interface FiOnboardingWelcomeProps {
  onComplete: () => void;
}

function WelcomeIllustration({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="fi-onboarding__illustration">
      <img src={src} alt={alt} className="fi-onboarding__illustration-image" />
    </div>
  );
}

function WelcomeStepCopy({
  title,
  subtitle,
  phase,
}: {
  title: string;
  subtitle: string;
  phase: WelcomePhase;
}) {
  return (
    <header className="fi-onboarding__header">
      <h1 id={`onboarding-${phase}-title`} className="fi-onboarding__title">
        {title}
      </h1>
      <p className="fi-onboarding__subtitle">{subtitle}</p>
    </header>
  );
}

export function FiOnboardingWelcome({ onComplete }: FiOnboardingWelcomeProps) {
  const welcome = useOnboardingWelcome(onComplete);
  const { defaults, phase } = welcome;

  const stepCopy =
    phase === "welcome"
      ? { title: defaults.welcomeTitle, subtitle: defaults.welcomeSubtitle }
      : phase === "product"
        ? { title: defaults.productTitle, subtitle: defaults.productSubtitle }
        : phase === "concierge"
          ? { title: defaults.conciergeTitle, subtitle: defaults.conciergeSubtitle }
          : phase === "dave"
            ? { title: defaults.daveTitle, subtitle: defaults.daveSubtitle }
            : { title: defaults.profileTitle, subtitle: defaults.profileSubtitle };

  return (
    <div className={getFiOnboardingClassName()}>
      {welcome.showResumePrompt ? (
        <FiCard variant="standard">
          <FiCardHeader>
            <FiCardTitle>{defaults.resumeLabel}</FiCardTitle>
            <FiCardDescription>We saved your place from last time.</FiCardDescription>
          </FiCardHeader>
          <FiCardContent className="fi-onboarding__actions">
            <FiButton onClick={welcome.resumeSession}>{defaults.continueLabel}</FiButton>
            <FiButton variant="ghost" onClick={welcome.startFresh}>
              Start over
            </FiButton>
          </FiCardContent>
        </FiCard>
      ) : null}

      <section className="fi-onboarding__panel" aria-labelledby={`onboarding-${phase}-title`}>
        {phase === "dave" || phase === "welcome" ? (
          <WelcomeIllustration
            src={defaults.daveWelcomeImage}
            alt="Doghouse Dave welcoming you beside a mailbox with a handwritten card"
          />
        ) : null}

        <WelcomeStepCopy title={stepCopy.title} subtitle={stepCopy.subtitle} phase={phase} />

        {phase === "profile" ? (
          <FiCard variant="standard">
            <FiCardContent>
              <p className="fi-onboarding__section-copy">
                Account creation is complete. Your concierge is ready for your first relationship.
              </p>
            </FiCardContent>
          </FiCard>
        ) : null}
      </section>

      <footer className="fi-onboarding__footer">
        {welcome.canGoBack ? (
          <FiButton variant="secondary" onClick={welcome.goBack}>
            {defaults.backLabel}
          </FiButton>
        ) : (
          <span />
        )}
        <FiButton onClick={welcome.goNext}>
          {phase === "welcome" ? defaults.getStartedLabel : defaults.continueLabel}
        </FiButton>
      </footer>
    </div>
  );
}
