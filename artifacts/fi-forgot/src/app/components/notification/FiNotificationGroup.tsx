import type { ReactNode } from "react";

export interface FiNotificationGroupProps {
  title: string;
  children: ReactNode;
}

export function FiNotificationGroup({ title, children }: FiNotificationGroupProps) {
  return (
    <section className="fi-notification-group" aria-label={title}>
      <h3 className="fi-notification-group__title">{title}</h3>
      {children}
    </section>
  );
}
