import type { Notification } from "@/components/notifications-dropdown"

// Function to add a new notification
export function addNotification(
  userId: string,
  type: "task" | "project" | "message",
  message: string,
  relatedId: string,
) {
  // Create new notification
  const newNotification: Notification = {
    id: Date.now().toString(),
    userId,
    type,
    message,
    relatedId,
    read: false,
    timestamp: new Date().toISOString(),
  }

  // Get existing notifications
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  // Add new notification
  notifications.push(newNotification)

  // Save to localStorage
  localStorage.setItem("notifications", JSON.stringify(notifications))

  return newNotification
}

// Function to mark a notification as read
export function markNotificationAsRead(notificationId: string) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  const updatedNotifications = notifications.map((notif: Notification) =>
    notif.id === notificationId ? { ...notif, read: true } : notif,
  )

  localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
}

// Function to mark all notifications as read for a user
export function markAllNotificationsAsRead(userId: string) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  const updatedNotifications = notifications.map((notif: Notification) =>
    notif.userId === userId ? { ...notif, read: true } : notif,
  )

  localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
}

// Function to get unread notifications count for a user
export function getUnreadNotificationsCount(userId: string) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  return notifications.filter((notif: Notification) => notif.userId === userId && !notif.read).length
}

// Function to get all notifications for a user
export function getUserNotifications(userId: string) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  return notifications
    .filter((notif: Notification) => notif.userId === userId)
    .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
