import { REMEMBER_SESSION_KEY, type PasswordStrength } from "@/app/auth/authDomain";

export function scorePasswordStrength(password: string): PasswordStrength {
  if (password.length < 6) return "weak";
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return "fair";
  if (score === 2) return "good";
  return "strong";
}

export function passwordStrengthLabel(strength: PasswordStrength): string {
  if (strength === "weak") return "Too short";
  if (strength === "fair") return "Fair";
  if (strength === "good") return "Good";
  return "Strong";
}

export function readRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBER_SESSION_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeRememberedEmail(email: string): void {
  localStorage.setItem(REMEMBER_SESSION_KEY, email.toLowerCase().trim());
}

export function clearRememberedEmail(): void {
  localStorage.removeItem(REMEMBER_SESSION_KEY);
}

export function parseAuthRecoveryReason(search: string): "session-expired" | "offline" | null {
  const params = new URLSearchParams(search);
  const reason = params.get("reason");
  if (reason === "session-expired") return "session-expired";
  if (reason === "offline") return "offline";
  return null;
}
