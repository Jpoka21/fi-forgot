import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiStudioCollectionsPage } from "@/app/components/studio/FiStudioCollectionsPage";

export default function StudioCollectionsPage() {
  return (
    <AppShell>
      <PageShell>
        <FiStudioCollectionsPage />
      </PageShell>
    </AppShell>
  );
}
