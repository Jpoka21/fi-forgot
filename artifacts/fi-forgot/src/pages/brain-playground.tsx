import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiBrainPlaygroundPage } from "@/app/components/brain-playground/FiBrainPlaygroundPage";

export default function BrainPlaygroundPage() {
  return (
    <AppShell>
      <PageShell style={{ maxWidth: "56rem" }}>
        <FiBrainPlaygroundPage />
      </PageShell>
    </AppShell>
  );
}
