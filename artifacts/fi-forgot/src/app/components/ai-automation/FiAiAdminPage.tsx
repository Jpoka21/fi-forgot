import type { AdminTab } from "@/app/admin/adminDomain";
import { useAiAdmin } from "@/app/ai-automation/hooks/useAiAdmin";
import { FiAiAdminPanel } from "@/app/components/ai-automation/FiAiAdminPanel";

export function FiAiAdminPage({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const ai = useAiAdmin({ onNavigate });
  return <FiAiAdminPanel ai={ai} />;
}
