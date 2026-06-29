import { apiRequest } from "./http";

export function fetchNotifications() {
  return apiRequest("/notifications");
}

export function fetchUnreadNotifications() {
  return apiRequest("/notifications/unread-count");
}

export function markNotificationRead(id) {
  return apiRequest(`/notifications/${id}/read`, {
    method: "PUT",
  });
}

export function markAllNotificationsRead() {
  return apiRequest("/notifications/read-all", {
    method: "PUT",
  });
}

export function deleteNotification(id) {
  return apiRequest(`/notifications/${id}`, {
    method: "DELETE",
  });
}

export function createNotification(data) {
  return apiRequest("/notifications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}