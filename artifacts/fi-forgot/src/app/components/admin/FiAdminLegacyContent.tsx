import type { AdminTab } from "@/app/admin/adminDomain";
import { AdminAudit } from "@/pages/admin/AdminAudit";
import { AdminBriefings } from "@/pages/admin/AdminBriefings";
import { AdminCardLibrary } from "@/pages/admin/AdminCardLibrary";
import { AdminCardMetadata } from "@/pages/admin/AdminCardMetadata";
import { AdminCustomers } from "@/pages/admin/AdminCustomers";
import { AdminEvents } from "@/pages/admin/AdminEvents";
import { AdminLeads } from "@/pages/admin/AdminLeads";
import { AdminMessages } from "@/pages/admin/AdminMessages";
import { AdminPrintAudit } from "@/pages/admin/AdminPrintAudit";
import { AdminQueue } from "@/pages/admin/AdminQueue";
import { AdminRecipients } from "@/pages/admin/AdminRecipients";
import { AdminTemplates } from "@/pages/admin/AdminTemplates";
import { FiAdminCopyManagement } from "@/app/components/admin/FiAdminCopyManagement";
import { FiAiAdminPage } from "@/app/components/ai-automation/FiAiAdminPage";
import { FiAutomationAdminPage } from "@/app/components/ai-automation/FiAutomationAdminPage";
import { FiAdminDashboardPanel } from "@/app/components/admin/FiAdminDashboardPanel";
import { FiAdminIllustrationLibrary } from "@/app/components/admin/FiAdminIllustrationLibrary";
import { FiAdminTools } from "@/app/components/admin/FiAdminTools";

export function FiAdminLegacyContent({
  activeTab,
  onNavigate,
}: {
  activeTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
}) {
  switch (activeTab) {
    case "dashboard":
      return <FiAdminDashboardPanel onNavigate={onNavigate} />;
    case "tools":
      return <FiAdminTools onNavigate={onNavigate} />;
    case "illustrations":
      return <FiAdminIllustrationLibrary />;
    case "copy":
      return <FiAdminCopyManagement />;
    case "ai":
      return <FiAiAdminPage onNavigate={onNavigate} />;
    case "automation":
      return <FiAutomationAdminPage onNavigate={onNavigate} />;
    case "customers":
      return <AdminCustomers />;
    case "recipients":
      return <AdminRecipients />;
    case "events":
      return <AdminEvents />;
    case "templates":
      return <AdminTemplates />;
    case "messages":
      return <AdminMessages />;
    case "queue":
      return <AdminQueue />;
    case "briefings":
      return <AdminBriefings />;
    case "audit":
      return <AdminAudit />;
    case "card-library":
      return <AdminCardLibrary />;
    case "card-metadata":
      return <AdminCardMetadata />;
    case "print-audit":
      return <AdminPrintAudit />;
    case "leads":
      return <AdminLeads />;
    default:
      return null;
  }
}
