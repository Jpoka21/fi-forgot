import { systemVerificationDefaults } from "@/app/verification/systemVerificationDomain";

export function FiSkipLink({ href = "#app-main-content" }: { href?: string }) {
  return (
    <a href={href} className="fi-skip-link">
      {systemVerificationDefaults.skipLinkLabel}
    </a>
  );
}
