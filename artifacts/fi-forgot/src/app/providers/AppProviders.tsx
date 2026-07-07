import { composeProviders } from "@/app/providers/composeProviders";
import { globalProviderStack } from "@/app/providers/globalProviderStack";
import type { AppProviderProps } from "@/app/providers/providerTypes";

const ComposedGlobalProviders = composeProviders(globalProviderStack);

export function AppProviders({ children }: AppProviderProps) {
  return <ComposedGlobalProviders>{children}</ComposedGlobalProviders>;
}
