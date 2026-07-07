import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiAutopilotPage } from "@/app/components/autopilot/FiAutopilotPage";

export default function AutopilotPage() {
  return (
    <AppShell>
      <PageShell>
        <FiAutopilotPage />
      </PageShell>
    </AppShell>
  );
}
