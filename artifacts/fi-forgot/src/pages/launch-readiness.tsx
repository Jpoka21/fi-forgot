import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiLaunchReadinessPage } from "@/app/components/launch-readiness/FiLaunchReadinessPage";

export default function LaunchReadinessPage() {
  return (
    <AppShell>
      <PageShell style={{ maxWidth: "56rem" }}>
        <FiLaunchReadinessPage />
      </PageShell>
    </AppShell>
  );
}
