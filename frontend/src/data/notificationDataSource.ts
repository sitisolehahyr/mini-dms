import { PaginatedData } from "../types/api";
import { Notification } from "../types/dms";
import {
  listNotifications as listNotificationsApi,
  markAllNotificationsRead as markAllNotificationsReadApi,
  markNotificationRead as markNotificationReadApi,
} from "../api/notificationApi";
import { mapApiNotification, mapPaginated } from "./mappers";
import {
  mockListNotifications,
  mockMarkAllNotificationsAsRead,
  mockMarkNotificationAsRead,
} from "./mockStore";
import { runWithFallback } from "./dataSourceUtils";

export type ListNotificationsInput = {
  page?: number;
  pageSize?: number;
};

export async function listNotifications(input: ListNotificationsInput = {}): Promise<PaginatedData<Notification>> {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 20;

  return runWithFallback(
    async () => {
      const response = await listNotificationsApi(page, pageSize);
      return mapPaginated(response, mapApiNotification);
    },
    async () => mockListNotifications(page, pageSize),
  );
}

export async function markAsRead(notificationId: number): Promise<void> {
  return runWithFallback(
    async () => {
      await markNotificationReadApi(notificationId);
    },
    async () => {
      mockMarkNotificationAsRead(notificationId);
    },
  );
}

export async function markAllAsRead(): Promise<number> {
  return runWithFallback(
    async () => markAllNotificationsReadApi(),
    async () => mockMarkAllNotificationsAsRead(),
  );
}
