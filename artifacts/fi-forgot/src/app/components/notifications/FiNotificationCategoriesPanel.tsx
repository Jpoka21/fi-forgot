import {
  fiNotificationCategories,
  notificationCategoryLabels,
} from "@/app/notification/notificationDomain";
import type { NotificationsPageController } from "@/app/notification/hooks/useNotificationsPage";

export function FiNotificationCategoriesPanel({ page }: { page: NotificationsPageController }) {
  return (
    <section className="fi-notifications-page__panel" aria-labelledby="notifications-categories-title">
      <header className="fi-notifications-page__panel-header">
        <h2 id="notifications-categories-title" className="fi-notifications-page__panel-title">
          {page.defaults.categoriesTitle}
        </h2>
        <p className="fi-notifications-page__panel-copy">{page.defaults.categoriesDescription}</p>
      </header>

      <ul className="fi-notifications-page__categories" aria-label="Notification categories">
        {fiNotificationCategories.map((category) => (
          <li key={category} className="fi-notifications-page__category-chip">
            {notificationCategoryLabels[category]}
          </li>
        ))}
      </ul>
    </section>
  );
}
