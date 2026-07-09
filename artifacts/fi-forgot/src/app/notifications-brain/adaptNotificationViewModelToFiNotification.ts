import type { FiNotification } from "@/app/notification/notificationDomain";
import type { NotificationViewModel } from "@/app/notifications-brain/notificationViewModel";

export function adaptNotificationViewModelToFiNotification(
  viewModel: NotificationViewModel,
): FiNotification {
  return {
    id: viewModel.id,
    title: viewModel.title,
    body: viewModel.body,
    category: "relationship",
    readState: viewModel.readState,
    createdAt: viewModel.createdAt,
    href: viewModel.href,
    actions: [
      {
        id: "primary",
        label: viewModel.actionLabel,
        href: viewModel.href,
      },
    ],
  };
}
