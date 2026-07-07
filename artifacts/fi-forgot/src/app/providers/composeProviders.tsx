import type { ReactNode } from "react";
import type { AppProviderComponent } from "@/app/providers/providerTypes";

export function composeProviders(providers: AppProviderComponent[]): AppProviderComponent {
  return function ComposedProviders({ children }: { children: ReactNode }) {
    return providers.reduceRight<ReactNode>(
      (childTree, Provider) => <Provider>{childTree}</Provider>,
      children,
    );
  };
}
