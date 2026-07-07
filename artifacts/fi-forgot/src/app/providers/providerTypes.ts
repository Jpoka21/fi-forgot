import type { ComponentType, ReactNode } from "react";

export interface AppProviderProps {
  children: ReactNode;
}

export type AppProviderComponent = ComponentType<AppProviderProps>;
