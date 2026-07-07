import type { ReactNode } from "react";

import { getFiCardCreationClassName } from "@/app/components/card-creation/cardCreationVariants";

export interface FiCardCreationShellProps {
  children: ReactNode;
}

export function FiCardCreationShell({ children }: FiCardCreationShellProps) {
  return <div className={getFiCardCreationClassName()}>{children}</div>;
}
