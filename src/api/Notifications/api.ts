import type { ApiResponse, Meta } from "../../types.ts";
import type {
  MarkAllReadData,
  NotificationItem,
  NotificationsData,
  UnreadCountData,
} from "./types.ts";
import { api } from "../client.ts";
// ================= Notifications =================
// GET /notifications — your notifications, newest first
// Live-verified 2026-11-11: the API returns
// data: { notifications: [...] } + pagination meta — unwrap it here
// so callers get a plain list (same pattern as getSuggestions).
export async function getNotifications(page = 1, limit = 10): Promise<ApiResponse<NotificationItem[]>> {
  const { data } = await api.get<{
    success: boolean;
    message: string;
    meta?: Meta;
    data: NotificationsData;
  }>("/notifications", { params: { page, limit, sort: "-createdAt" } });
  return { success: data.success, message: data.message, meta: data.meta, data: data.data.notifications };
}
// GET /notifications/unread-count — how many are unread
export async function getUnreadCount(): Promise<ApiResponse<UnreadCountData>> {
  const { data } = await api.get<ApiResponse<UnreadCountData>>("/notifications/unread-count");
  return data;
}
// PATCH /notifications/:id/read — mark one notification read
export async function markNotificationRead(
  notificationId: string,
): Promise<ApiResponse<{ notification: NotificationItem }>> {
  const { data } = await api.patch<ApiResponse<{ notification: NotificationItem }>>(
    `/notifications/${notificationId}/read`,
  );
  return data;
}
// PATCH /notifications/read-all — mark every notification read
export async function markAllNotificationsRead(): Promise<ApiResponse<MarkAllReadData>> {
  const { data } = await api.patch<ApiResponse<MarkAllReadData>>("/notifications/read-all");
  return data;
}
