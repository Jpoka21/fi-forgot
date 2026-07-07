import { useEffect } from "react";

import { usePersonalAuth } from "@/app/auth/hooks/usePersonalAuth";
import { FiAuthModeToggle } from "@/app/components/auth/FiAuthModeToggle";
import { FiAuthRecoveryPanels } from "@/app/components/auth/FiAuthRecoveryPanels";
import { FiAuthShell } from "@/app/components/auth/FiAuthShell";
import { FiLoginForm } from "@/app/components/auth/FiLoginForm";
import { FiSignupForm } from "@/app/components/auth/FiSignupForm";

export interface FiAuthPageProps {
  initialMode?: "signup" | "signin";
}

export function FiAuthPage({ initialMode = "signup" }: FiAuthPageProps) {
  const auth = usePersonalAuth({ initialMode });

  useEffect(() => {
    const main = document.getElementById("auth-main");
    main?.focus();
  }, [auth.view, auth.mode]);

  const showModeToggle = auth.view === "form";
  const isSignup = auth.mode === "signup";

  return (
    <FiAuthShell>
      <div id="auth-main" tabIndex={-1}>
        {showModeToggle ? <FiAuthModeToggle mode={auth.mode} onChange={auth.switchMode} /> : null}

        {auth.view !== "form" ? (
          <FiAuthRecoveryPanels auth={auth} />
        ) : isSignup ? (
          <FiSignupForm auth={auth} />
        ) : (
          <FiLoginForm auth={auth} />
        )}
      </div>
    </FiAuthShell>
  );
}
