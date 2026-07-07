import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiAiConciergePage } from "@/app/components/ai-concierge/FiAiConciergePage";

export default function ConciergePage() {
  return (
    <AppShell>
      <PageShell>
        <FiAiConciergePage />
      </PageShell>
    </AppShell>
  );
}
