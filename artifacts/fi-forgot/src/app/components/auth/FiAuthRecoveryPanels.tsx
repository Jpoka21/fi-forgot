import { useState } from "react";
import { CheckCircle2, Mail, RefreshCw, ShieldAlert, WifiOff } from "lucide-react";

import type { PersonalAuthController } from "@/app/auth/hooks/usePersonalAuth";
import { FiButton } from "@/app/components/button/FiButton";
import { FiCard, FiCardContent } from "@/app/components/card/FiCard";
import { FiEmailInput } from "@/app/components/input/FiAutocomplete";
import { FiField } from "@/app/components/input/FiField";

function RecoveryHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <>
      <div className="fi-auth-recovery__icon-wrap" aria-hidden>
        {icon}
      </div>
      <header className="fi-auth-form__header">
        <h2 className="fi-auth-form__title">{title}</h2>
        <p className="fi-auth-form__subtitle">{subtitle}</p>
      </header>
    </>
  );
}

export function FiAuthRecoveryPanels({ auth }: { auth: PersonalAuthController }) {
  const {
    view,
    defaults,
    forgotEmail,
    setForgotEmail,
    submitForgotPassword,
    returnToSignIn,
    retryAfterNetworkError,
    isOffline,
    formError,
  } = auth;

  const [localError, setLocalError] = useState<string | null>(null);

  if (view === "forgot-password") {
    return (
      <FiCard className="fi-auth-card">
        <FiCardContent>
          <div className="fi-auth-recovery">
            <RecoveryHeader
              icon={<Mail size={22} />}
              title={defaults.forgotTitle}
              subtitle={defaults.forgotSubtitle}
            />

            {(formError || localError) && (
              <p className="fi-auth-form__error-banner" role="alert">
                {formError ?? localError}
              </p>
            )}

            <FiField label="Email" htmlFor="forgot-email">
              <FiEmailInput
                id="forgot-email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                placeholder="you@example.com"
                autoFocus
              />
            </FiField>

            <div className="fi-auth-recovery__actions">
              <FiButton
                type="button"
                fullWidth
                onClick={() => {
                  setLocalError(null);
                  submitForgotPassword(forgotEmail);
                }}
              >
                Send reset link
              </FiButton>
              <FiButton type="button" variant="ghost" fullWidth onClick={returnToSignIn}>
                {defaults.backToSignInLabel}
              </FiButton>
            </div>
          </div>
        </FiCardContent>
      </FiCard>
    );
  }

  if (view === "reset-sent") {
    return (
      <FiCard className="fi-auth-card">
        <FiCardContent>
          <div className="fi-auth-recovery" role="status" aria-live="polite">
            <RecoveryHeader
              icon={<CheckCircle2 size={22} />}
              title={defaults.resetSentTitle}
              subtitle={defaults.resetSentSubtitle}
            />
            <p className="fi-auth-form__note">
              {forgotEmail ? `We looked for ${forgotEmail}.` : null} {defaults.emailVerificationNote}
            </p>
            <p className="fi-auth-form__note">{defaults.accountRecoveryNote}</p>
            <div className="fi-auth-recovery__actions">
              <FiButton type="button" fullWidth onClick={returnToSignIn}>
                {defaults.backToSignInLabel}
              </FiButton>
            </div>
          </div>
        </FiCardContent>
      </FiCard>
    );
  }

  if (view === "session-expired") {
    return (
      <FiCard className="fi-auth-card">
        <FiCardContent>
          <div className="fi-auth-recovery" role="status">
            <RecoveryHeader
              icon={<ShieldAlert size={22} />}
              title={defaults.sessionExpiredTitle}
              subtitle={defaults.sessionExpiredSubtitle}
            />
            <div className="fi-auth-recovery__actions">
              <FiButton type="button" fullWidth onClick={returnToSignIn}>
                {defaults.signInLabel}
              </FiButton>
            </div>
          </div>
        </FiCardContent>
      </FiCard>
    );
  }

  if (view === "network-error") {
    return (
      <FiCard className="fi-auth-card">
        <FiCardContent>
          <div className="fi-auth-recovery" role="alert">
            <RecoveryHeader
              icon={<WifiOff size={22} />}
              title={defaults.networkErrorTitle}
              subtitle={defaults.networkErrorSubtitle}
            />
            <div className="fi-auth-recovery__actions">
              <FiButton
                type="button"
                fullWidth
                leftIcon={<RefreshCw size={16} aria-hidden />}
                onClick={retryAfterNetworkError}
                disabled={isOffline}
              >
                Try again
              </FiButton>
              <FiButton type="button" variant="ghost" fullWidth onClick={returnToSignIn}>
                {defaults.backToSignInLabel}
              </FiButton>
            </div>
          </div>
        </FiCardContent>
      </FiCard>
    );
  }

  if (view === "signup-success") {
    return (
      <FiCard className="fi-auth-card">
        <FiCardContent>
          <div className="fi-auth-recovery" role="status" aria-live="polite">
            <RecoveryHeader
              icon={<CheckCircle2 size={22} />}
              title={defaults.signupSuccessTitle}
              subtitle={defaults.signupSuccessSubtitle}
            />
          </div>
        </FiCardContent>
      </FiCard>
    );
  }

  return null;
}
