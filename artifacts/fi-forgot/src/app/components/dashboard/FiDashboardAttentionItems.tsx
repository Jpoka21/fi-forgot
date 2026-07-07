import { Link } from "wouter";

import type { FiDashboardAttentionItem } from "@/app/dashboard/dashboardDomain";
import { FiDashboardCard } from "@/app/components/card/FiCard";
import { FiButton } from "@/app/components/button/FiButton";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";

export interface FiDashboardAttentionItemsProps {
  items: FiDashboardAttentionItem[];
  onUpgrade?: () => void;
}

export function FiDashboardAttentionItems({
  items,
  onUpgrade,
}: FiDashboardAttentionItemsProps) {
  if (items.length === 0) return null;

  return (
    <section className={getFiDashboardSectionClassName()} aria-labelledby="fi-dashboard-attention">
      <div className="fi-dashboard__section-header">
        <div>
          <h2 id="fi-dashboard-attention" className="fi-dashboard__section-title">
            Before we send
          </h2>
          <p className="fi-dashboard__section-subtitle">A small detail helps us take care of it.</p>
        </div>
      </div>

      <ul className="fi-dashboard__list">
        {items.map((item) => (
          <li key={item.id}>
            <FiDashboardCard className="fi-dashboard__attention-item">
              <div className="fi-dashboard__section-header">
                <div>
                  <h3 className="fi-dashboard__upcoming-name">{item.title}</h3>
                  {item.detail ? <p className="fi-dashboard__meta">{item.detail}</p> : null}
                </div>
                {item.href === "#upgrade" ? (
                  <FiButton variant="link" size="sm" onClick={onUpgrade}>
                    {item.actionLabel}
                  </FiButton>
                ) : (
                  <FiButton asChild variant="link" size="sm">
                    <Link href={item.href}>{item.actionLabel}</Link>
                  </FiButton>
                )}
              </div>
            </FiDashboardCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
