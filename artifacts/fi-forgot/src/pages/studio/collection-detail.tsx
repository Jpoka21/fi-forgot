import { useParams } from "wouter";
import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { FiStudioCollectionDetailPage } from "@/app/components/studio/FiStudioCollectionDetailPage";

export default function StudioCollectionDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <AppShell>
      <PageShell>
        <FiStudioCollectionDetailPage collectionId={id} />
      </PageShell>
    </AppShell>
  );
}
