import { AppLayout } from "@/app/layouts/AppLayout";
import { RootNavigation } from "@/app/navigation/RootNavigation";
import { AppProviders } from "@/app/providers";
import { ErrorBoundary } from "@/app/providers/ErrorBoundary";
import { ShellSuspense } from "@/app/suspense/ShellSuspense";

export default function ApplicationShell() {
  return (
    <AppProviders>
      <ErrorBoundary>
        <AppLayout>
          <ShellSuspense>
            <RootNavigation />
          </ShellSuspense>
        </AppLayout>
      </ErrorBoundary>
    </AppProviders>
  );
}
