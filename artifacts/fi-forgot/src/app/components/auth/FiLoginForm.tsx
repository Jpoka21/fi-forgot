import { Controller } from "react-hook-form";

import type { PersonalAuthController } from "@/app/auth/hooks/usePersonalAuth";
import { FiAuthPasswordField } from "@/app/components/auth/FiAuthPasswordField";
import { FiButton } from "@/app/components/button/FiButton";
import { FiCard, FiCardContent } from "@/app/components/card/FiCard";
import { FiCheckbox } from "@/app/components/input/FiCheckbox";
import { FiEmailInput } from "@/app/components/input/FiAutocomplete";
import { FiField } from "@/app/components/input/FiField";

export function FiLoginForm({ auth }: { auth: PersonalAuthController }) {
  const { signinForm, onSignin, switchMode, openForgotPassword, defaults, formError } = auth;

  return (
    <FiCard className="fi-auth-card">
      <FiCardContent>
        <header className="fi-auth-form__header">
          <h2 className="fi-auth-form__title">{defaults.signinTitle}</h2>
          <p className="fi-auth-form__subtitle">{defaults.signinSubtitle}</p>
        </header>

        {formError ? (
          <p className="fi-auth-form__error-banner" role="alert">
            {formError}
          </p>
        ) : null}

        <form className="fi-auth-form" onSubmit={signinForm.handleSubmit(onSignin)} noValidate>
          <FiField
            label="Email"
            htmlFor="signin-email"
            errorText={signinForm.formState.errors.email?.message}
          >
            <FiEmailInput
              id="signin-email"
              placeholder="you@example.com"
              data-testid="input-email"
              autoFocus
              state={signinForm.formState.errors.email ? "error" : "default"}
              {...signinForm.register("email")}
            />
          </FiField>

          <FiAuthPasswordField
            id="signin-password"
            label="Password"
            data-testid="input-password"
            errorText={signinForm.formState.errors.password?.message}
            {...signinForm.register("password")}
          />

          <div className="fi-auth-form__row">
            <Controller
              control={signinForm.control}
              name="rememberMe"
              render={({ field }) => (
                <FiCheckbox
                  id="signin-remember"
                  checked={Boolean(field.value)}
                  onChange={(event) => field.onChange(event.target.checked)}
                  label={defaults.rememberMeLabel}
                />
              )}
            />
            <button
              type="button"
              className="fi-auth-form__link-btn"
              onClick={openForgotPassword}
            >
              {defaults.forgotPasswordLabel}
            </button>
          </div>

          <span data-testid="button-login-submit">
            <FiButton type="submit" fullWidth>
              {defaults.signInLabel}
            </FiButton>
          </span>
        </form>

        {import.meta.env.DEV ? <p className="fi-auth-form__note">{defaults.devHint}</p> : null}

        <p className="fi-auth-form__footer-text">
          New here?{" "}
          <button
            type="button"
            className="fi-auth-form__link-btn"
            onClick={() => switchMode("signup")}
            data-testid="link-goto-signup"
          >
            Get started
          </button>
        </p>
      </FiCardContent>
    </FiCard>
  );
}
