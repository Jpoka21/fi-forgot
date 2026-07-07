import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";

import { trackAuthEvent } from "@/app/auth/authAnalytics";
import {
  authDefaults,
  signinSchema,
  signupSchema,
  type AuthView,
  type SigninFormData,
  type SignupFormData,
} from "@/app/auth/authDomain";
import {
  clearRememberedEmail,
  parseAuthRecoveryReason,
  readRememberedEmail,
  writeRememberedEmail,
} from "@/app/auth/authEngine";
import { useAppStateContext } from "@/app/state/AppStateProvider";
import { useAuth } from "@/lib/auth-context";

export interface UsePersonalAuthOptions {
  initialMode?: "signup" | "signin";
}

export function usePersonalAuth({ initialMode = "signup" }: UsePersonalAuthOptions = {}) {
  const { signup, login } = useAuth();
  const [, setLocation] = useLocation();
  const { connectivity } = useAppStateContext();
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [view, setView] = useState<AuthView>("form");
  const [formError, setFormError] = useState<string | null>(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const signupRedirectTimerRef = useRef<number | null>(null);

  const isOffline = !connectivity.isOnline;

  useEffect(() => {
    return () => {
      if (signupRedirectTimerRef.current !== null) {
        window.clearTimeout(signupRedirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    trackAuthEvent("auth_opened", { mode: initialMode });
  }, [initialMode]);

  useEffect(() => {
    setLocation(mode === "signup" ? "/signup" : "/login", { replace: true });
  }, [mode, setLocation]);

  useEffect(() => {
    const reason = parseAuthRecoveryReason(window.location.search);
    if (reason === "session-expired") {
      setView("session-expired");
      trackAuthEvent("auth_recovery_view", { reason: "session-expired" });
    } else if (reason === "offline") {
      setView("network-error");
      trackAuthEvent("auth_recovery_view", { reason: "offline" });
    }
  }, []);

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const signinForm = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: readRememberedEmail(),
      password: "",
      rememberMe: Boolean(readRememberedEmail()),
    },
  });

  const switchMode = useCallback((next: "signup" | "signin") => {
    setFormError(null);
    setView("form");
    setMode(next);
  }, []);

  const openForgotPassword = useCallback(() => {
    setForgotEmail(signinForm.getValues("email") ?? "");
    setView("forgot-password");
    trackAuthEvent("auth_forgot_password", { stage: "open" });
  }, [signinForm]);

  const returnToSignIn = useCallback(() => {
    setFormError(null);
    setView("form");
    setMode("signin");
  }, []);

  const handleOfflineBlock = useCallback((): boolean => {
    if (!isOffline) return false;
    setFormError(authDefaults.networkErrorSubtitle);
    setView("network-error");
    trackAuthEvent("auth_recovery_view", { reason: "offline" });
    return true;
  }, [isOffline]);

  const onSignup = useCallback(
    (data: SignupFormData) => {
      setFormError(null);
      if (handleOfflineBlock()) return;

      trackAuthEvent("auth_signup_submitted");
      try {
        signup(data.name, data.email);
        trackAuthEvent("auth_signup_success");
        setView("signup-success");
        if (signupRedirectTimerRef.current !== null) {
          window.clearTimeout(signupRedirectTimerRef.current);
        }
        signupRedirectTimerRef.current = window.setTimeout(() => setLocation("/onboarding"), 1800);
      } catch {
        setFormError("We couldn't create your account. Please try again.");
        trackAuthEvent("auth_login_error", { flow: "signup" });
      }
    },
    [handleOfflineBlock, setLocation, signup],
  );

  const onSignin = useCallback(
    (data: SigninFormData) => {
      setFormError(null);
      if (handleOfflineBlock()) return;

      trackAuthEvent("auth_login_submitted");
      try {
        if (data.rememberMe) {
          writeRememberedEmail(data.email);
        } else {
          clearRememberedEmail();
        }

        login(data.email);
        trackAuthEvent("auth_login_success");
        setLocation("/dashboard");
      } catch {
        setFormError("We couldn't sign you in. Check your email and try again.");
        trackAuthEvent("auth_login_error", { flow: "signin" });
      }
    },
    [handleOfflineBlock, login, setLocation],
  );

  const submitForgotPassword = useCallback(
    (email: string) => {
      setFormError(null);
      if (handleOfflineBlock()) return;

      const trimmed = email.trim();
      if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setFormError("Enter a valid email address.");
        return;
      }

      setForgotEmail(trimmed);
      trackAuthEvent("auth_forgot_password", { stage: "submit" });
      setView("reset-sent");
    },
    [handleOfflineBlock],
  );

  const retryAfterNetworkError = useCallback(() => {
    if (isOffline) return;
    setFormError(null);
    setView("form");
  }, [isOffline]);

  return {
    mode,
    view,
    formError,
    forgotEmail,
    isOffline,
    defaults: authDefaults,
    signupForm,
    signinForm,
    switchMode,
    openForgotPassword,
    returnToSignIn,
    onSignup,
    onSignin,
    submitForgotPassword,
    retryAfterNetworkError,
    setForgotEmail,
  };
}

export type PersonalAuthController = ReturnType<typeof usePersonalAuth>;
