// Live-verified 2026-11-11 (Phase 3 prep, STAGELOG):
// GET /notifications → data: { notifications: [...] } + pagination meta
// GET /notifications/unread-count → data: { unreadCount }
// PATCH /notifications/:id/read → data: { notification }
// PATCH /notifications/read-all → data: { modifiedCount }
// Entry: { _id, recipient, actor, type, entityType, entityId, isRead,
// createdAt, entity: { _id, unavailable? } }

export interface NotificationUser {
  _id: string;
  name: string;
  photo?: string | null;
}

export interface NotificationEntity {
  _id: string;
  unavailable?: boolean;
}

export interface NotificationItem {
  _id: string;
  recipient: NotificationUser;
  actor: NotificationUser;
  type: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  entity: NotificationEntity;
}

// Raw data payloads as the API returns them (before unwrapping).
export interface NotificationsData {
  notifications: NotificationItem[];
}

export interface UnreadCountData {
  unreadCount: number;
}

export interface MarkAllReadData {
  modifiedCount: number;
}
