import { Controller } from "react-hook-form";

import type { PersonalAuthController } from "@/app/auth/hooks/usePersonalAuth";
import { passwordStrengthLabel, scorePasswordStrength } from "@/app/auth/authEngine";
import { FiAuthPasswordField } from "@/app/components/auth/FiAuthPasswordField";
import { FiButton } from "@/app/components/button/FiButton";
import { FiCard, FiCardContent } from "@/app/components/card/FiCard";
import { FiCheckbox } from "@/app/components/input/FiCheckbox";
import { FiEmailInput } from "@/app/components/input/FiAutocomplete";
import { FiField } from "@/app/components/input/FiField";
import { FiInput } from "@/app/components/input/FiInput";

export function FiSignupForm({ auth }: { auth: PersonalAuthController }) {
  const { signupForm, onSignup, switchMode, defaults, formError } = auth;
  const password = signupForm.watch("password") ?? "";
  const strength = scorePasswordStrength(password);
  const strengthClass = `fi-auth-strength__segment--${strength}`;

  return (
    <FiCard className="fi-auth-card">
      <FiCardContent>
        <header className="fi-auth-form__header">
          <h2 className="fi-auth-form__title">{defaults.signupTitle}</h2>
          <p className="fi-auth-form__subtitle">{defaults.signupSubtitle}</p>
        </header>

        {formError ? (
          <p className="fi-auth-form__error-banner" role="alert">
            {formError}
          </p>
        ) : null}

        <form className="fi-auth-form" onSubmit={signupForm.handleSubmit(onSignup)} noValidate>
          <FiField
            label="Your name"
            htmlFor="signup-name"
            errorText={signupForm.formState.errors.name?.message}
          >
            <FiInput
              id="signup-name"
              type="text"
              placeholder="Mike Thompson"
              data-testid="input-name"
              autoFocus
              state={signupForm.formState.errors.name ? "error" : "default"}
              {...signupForm.register("name")}
            />
          </FiField>

          <FiField
            label="Email"
            htmlFor="signup-email"
            errorText={signupForm.formState.errors.email?.message}
          >
            <FiEmailInput
              id="signup-email"
              placeholder="you@example.com"
              data-testid="input-email"
              state={signupForm.formState.errors.email ? "error" : "default"}
              {...signupForm.register("email")}
            />
          </FiField>

          <div>
            <FiAuthPasswordField
              id="signup-password"
              label="Password"
              autoComplete="new-password"
              data-testid="input-password"
              errorText={signupForm.formState.errors.password?.message}
              helperText="At least 6 characters — that's all we need to get started."
              {...signupForm.register("password")}
            />
            {password.length > 0 ? (
              <div className="fi-auth-strength" aria-live="polite">
                <div className="fi-auth-strength__bar" aria-hidden>
                  {[0, 1, 2, 3].map((index) => {
                    const active =
                      (strength === "weak" && index === 0) ||
                      (strength === "fair" && index <= 1) ||
                      (strength === "good" && index <= 2) ||
                      (strength === "strong" && index <= 3);
                    return (
                      <span
                        key={index}
                        className={`fi-auth-strength__segment${active ? ` ${strengthClass}` : ""}`}
                      />
                    );
                  })}
                </div>
                <p className="fi-auth-strength__label">
                  Password strength: {passwordStrengthLabel(strength)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="fi-auth-legal">
            <Controller
              control={signupForm.control}
              name="acceptTerms"
              render={({ field }) => (
                <FiCheckbox
                  id="signup-terms"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  label={
                    <>
                      I agree to the{" "}
                      <a href="#" className="fi-auth-legal__link">
                        Terms of Service
                      </a>
                    </>
                  }
                />
              )}
            />
            {signupForm.formState.errors.acceptTerms ? (
              <p className="fi-auth-form__error-banner" role="alert">
                {signupForm.formState.errors.acceptTerms.message}
              </p>
            ) : null}

            <Controller
              control={signupForm.control}
              name="acceptPrivacy"
              render={({ field }) => (
                <FiCheckbox
                  id="signup-privacy"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  label={
                    <>
                      I agree to the{" "}
                      <a href="#" className="fi-auth-legal__link">
                        Privacy Policy
                      </a>
                    </>
                  }
                />
              )}
            />
            {signupForm.formState.errors.acceptPrivacy ? (
              <p className="fi-auth-form__error-banner" role="alert">
                {signupForm.formState.errors.acceptPrivacy.message}
              </p>
            ) : null}
          </div>

          <p className="fi-auth-form__note">{defaults.emailVerificationNote}</p>

          <span data-testid="button-signup-submit">
            <FiButton type="submit" fullWidth>
              {defaults.createAccountLabel}
            </FiButton>
          </span>
        </form>

        <p className="fi-auth-form__note" style={{ marginTop: "1.25rem" }}>
          {defaults.privacyNote}
        </p>

        <p className="fi-auth-form__footer-text">
          Already have an account?{" "}
          <button
            type="button"
            className="fi-auth-form__link-btn"
            onClick={() => switchMode("signin")}
            data-testid="link-goto-login"
          >
            Sign in
          </button>
        </p>
      </FiCardContent>
    </FiCard>
  );
}
