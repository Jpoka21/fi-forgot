import type { ReactNode } from "react";
import { Link } from "wouter";

import { authDefaults } from "@/app/auth/authDomain";
import { FiAuthPitch } from "@/app/components/auth/FiAuthPitch";

export interface FiAuthShellProps {
  children: ReactNode;
}

export function FiAuthShell({ children }: FiAuthShellProps) {
  return (
    <div className="fi-auth-shell">
      <div className="fi-auth-shell__inner">
        <div className="fi-auth-shell__grid">
          <FiAuthPitch />

          <div className="fi-auth-shell__form-column">
            <div className="fi-auth-shell__mobile-brand">
              <Link href="/" className="fi-auth-shell__brand-link">
                <p className="fi-auth-shell__brand-title">{authDefaults.brandTitle}</p>
                <p className="fi-auth-shell__brand-subtitle">{authDefaults.brandSubtitle}</p>
              </Link>
            </div>

            {children}

            <Link href="/" className="fi-auth-shell__back-home">
              {authDefaults.backToHomeLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
