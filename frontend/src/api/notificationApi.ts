import api from "./client";
import { ApiSuccess, PaginatedData } from "../types/api";
import { Notification } from "../types/notification";

export const listNotifications = async (page = 1, pageSize = 20): Promise<PaginatedData<Notification>> => {
  const { data } = await api.get<ApiSuccess<PaginatedData<Notification>>>("/notifications", {
    params: { page, page_size: pageSize },
  });
  return data.data;
};

export const markNotificationRead = async (notificationId: number): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async (): Promise<number> => {
  const { data } = await api.patch<ApiSuccess<{ updated: number }>>("/notifications/read-all");
  return data.data.updated;
};
