import { z } from "zod";
import { Check, Heart, Mail, Shield, type LucideIcon } from "lucide-react";

import { illustrationPaths } from "@/app/design/assets/illustrationPaths";

export const REMEMBER_SESSION_KEY = "fi_forgot_remember_session";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "Please accept the terms to continue",
  }),
  acceptPrivacy: z.boolean().refine((value) => value, {
    message: "Please accept the privacy policy to continue",
  }),
});

export const signinSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;

export type AuthView =
  | "form"
  | "forgot-password"
  | "reset-sent"
  | "session-expired"
  | "network-error"
  | "signup-success";

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface AuthPerk {
  icon: LucideIcon;
  text: string;
}

export const AUTH_PERKS: AuthPerk[] = [
  { icon: Mail, text: "Handwritten cards, written and mailed for you" },
  { icon: Heart, text: "Gentle reminders before the moments that matter" },
  { icon: Shield, text: "You stay in control before anything is sent" },
  { icon: Check, text: "Cancel anytime — no contracts, no pressure" },
];

export const authDefaults = {
  brandTitle: "F.I. FORGOT",
  brandSubtitle: "RELATIONSHIP CONCIERGE",
  pitchTitle: "Everything important is about to be taken care of.",
  pitchSubtitle:
    "Start with one person who matters. We'll help you remember the moments, write the cards, and handle the rest — calmly, in the background.",
  pitchImage: illustrationPaths.auth.relationshipHero,
  pitchImageAlt:
    "A warm still life of tied letters, a leather journal, and a framed photograph in soft afternoon light",
  signupTitle: "Start with one person",
  signupSubtitle: "We'll help you from there. No pressure, no complicated setup.",
  signinTitle: "Welcome back",
  signinSubtitle: "Your people are waiting. Pick up where you left off.",
  forgotTitle: "Reset your password",
  forgotSubtitle: "Enter your email and we'll send calm, clear instructions if an account exists.",
  resetSentTitle: "Check your email",
  resetSentSubtitle:
    "If we find an account for that address, you'll receive a link to reset your password shortly.",
  sessionExpiredTitle: "Your session expired",
  sessionExpiredSubtitle: "Sign in again to return to your people and card drafts.",
  networkErrorTitle: "You're offline",
  networkErrorSubtitle: "We'll reconnect automatically. Try again when you're back online.",
  signupSuccessTitle: "Account created",
  signupSuccessSubtitle: "Let's add your first person — onboarding takes just a few minutes.",
  createAccountLabel: "Create my account",
  signInLabel: "Sign in",
  forgotPasswordLabel: "Forgot password?",
  rememberMeLabel: "Remember me on this device",
  backToSignInLabel: "Back to sign in",
  backToHomeLabel: "← Back to home",
  devHint: "Development build — any email and password will work.",
  privacyNote:
    "Your information stays private. You control every card — nothing is sent without your approval.",
  emailVerificationNote:
    "We'll send a verification email when email confirmation is enabled for your account.",
  accountRecoveryNote:
    "Need help accessing your account? Use the same email you signed up with, or contact support from the home page.",
  termsLabel: "I agree to the Terms of Service",
  privacyLabel: "I agree to the Privacy Policy",
} as const;
