import { LoadingOverlayProvider } from "@/app/loading/LoadingOverlay";
import { AccessibilityProvider } from "@/app/providers/AccessibilityProvider";
import { ApiProvider } from "@/app/providers/ApiProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { DialogProvider } from "@/app/providers/DialogProvider";
import { NotificationProvider } from "@/app/providers/NotificationProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { ToastProvider } from "@/app/providers/ToastProvider";
import type { AppProviderComponent } from "@/app/providers/providerTypes";
import { AppStateProvider } from "@/app/state/AppStateProvider";
import { SearchProvider } from "@/app/search/SearchProvider";
import { NotificationCenterProvider } from "@/app/notification/NotificationCenterProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowniePointsProvider } from "@/lib/brownie-points-context";

/**
 * Global provider order (outermost → innermost).
 *
 * Dependency notes:
 * - ApiProvider composes React Query without changing client defaults.
 * - BrowniePointsProvider must remain inside AuthProvider (uses useAuth).
 * - AppStateProvider derives from auth/theme/notifications but does not replace them.
 */
export const globalProviderStack: AppProviderComponent[] = [
  ApiProvider,
  ThemeProvider,
  AccessibilityProvider,
  AuthProvider,
  BrowniePointsProvider,
  NotificationProvider,
  AppStateProvider,
  SearchProvider,
  NotificationCenterProvider,
  TooltipProvider,
  ToastProvider,
  DialogProvider,
  LoadingOverlayProvider,
];
