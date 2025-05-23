"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Notification {
  id: string
  userId: string
  type: "task" | "project" | "message" | "system"
  message: string
  timestamp: string
  read: boolean
  relatedId?: string
}

export function NotificationsDropdown() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Get current user
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) return

    const user = JSON.parse(userStr)
    setCurrentUser(user)

    // Load notifications for this user
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const userNotifications = allNotifications.filter((notif: Notification) => notif.userId === user.id)

    // Sort by timestamp (newest first)
    userNotifications.sort(
      (a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    setNotifications(userNotifications)
    setUnreadCount(userNotifications.filter((notif: Notification) => !notif.read).length)
  }, [])

  // Check for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentUser) return

      const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      const userNotifications = allNotifications.filter((notif: Notification) => notif.userId === currentUser.id)

      // Sort by timestamp (newest first)
      userNotifications.sort(
        (a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      setNotifications(userNotifications)
      setUnreadCount(userNotifications.filter((notif: Notification) => !notif.read).length)
    }, 30000)

    return () => clearInterval(interval)
  }, [currentUser])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      // Mark as read
      const updatedNotifications = notifications.map((notif) =>
        notif.id === notification.id ? { ...notif, read: true } : notif,
      )

      // Update local state
      setNotifications(updatedNotifications)
      setUnreadCount((prev) => prev - 1)

      // Update localStorage
      const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      const updatedAllNotifications = allNotifications.map((notif: Notification) =>
        notif.id === notification.id ? { ...notif, read: true } : notif,
      )
      localStorage.setItem("notifications", JSON.stringify(updatedAllNotifications))
    }

    // Close dropdown
    setIsOpen(false)

    // Navigate based on notification type
    if (notification.type === "task") {
      router.push("/student-dashboard/tasks")
    } else if (notification.type === "project") {
      router.push("/student-dashboard/projects")
    } else if (notification.type === "message") {
      router.push("/student-dashboard/chat")
    }
  }

  const viewAllNotifications = () => {
    setIsOpen(false)
    router.push("/student-dashboard/notifications")
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task":
        return "📋"
      case "project":
        return "📁"
      case "message":
        return "💬"
      default:
        return "🔔"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-auto bg-gray-800 border-gray-700">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-500">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-gray-400 text-sm">No notifications</div>
        ) : (
          <>
            {notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`py-3 px-4 cursor-pointer ${!notification.read ? "bg-gray-700/30" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 items-start">
                  <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${!notification.read ? "font-medium" : "text-gray-300"}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{formatTime(notification.timestamp)}</span>
                      {!notification.read && <Badge className="bg-red-500 text-[10px] px-1.5 py-0">New</Badge>}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              className="py-2 px-4 cursor-pointer text-center text-blue-400 hover:text-blue-300"
              onClick={viewAllNotifications}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
