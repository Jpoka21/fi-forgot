import type { AdminTab } from "@/app/admin/adminDomain";
import { useAutomationAdmin } from "@/app/ai-automation/hooks/useAutomationAdmin";
import { FiAutomationAdminPanel } from "@/app/components/ai-automation/FiAutomationAdminPanel";

export function FiAutomationAdminPage({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const automation = useAutomationAdmin({ onNavigate });
  return <FiAutomationAdminPanel automation={automation} />;
}
