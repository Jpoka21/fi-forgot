import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiSearchPage } from "@/app/components/search/FiSearchPage";

export default function SearchPage() {
  return (
    <AppShell>
      <PageShell>
        <FiSearchPage />
      </PageShell>
    </AppShell>
  );
}
