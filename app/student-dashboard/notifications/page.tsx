"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, Filter } from "lucide-react"
import type { Notification } from "@/components/notifications-dropdown"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Check if user is logged in and is student
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/signin")
      return
    }

    const user = JSON.parse(userStr)
    if (user.role !== "student") {
      router.push("/dashboard")
      return
    }

    setCurrentUser(user)

    // Load notifications for this user
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const userNotifications = allNotifications.filter((notif: Notification) => notif.userId === user.id)

    // Sort by timestamp (newest first)
    userNotifications.sort(
      (a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    setNotifications(userNotifications)
    setFilteredNotifications(userNotifications)
  }, [router])

  useEffect(() => {
    // Filter notifications based on active tab
    if (activeTab === "all") {
      setFilteredNotifications(notifications)
    } else if (activeTab === "unread") {
      setFilteredNotifications(notifications.filter((notif) => !notif.read))
    } else {
      setFilteredNotifications(notifications.filter((notif) => notif.type === activeTab))
    }
  }, [activeTab, notifications])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      // Mark as read
      const updatedNotifications = notifications.map((notif) =>
        notif.id === notification.id ? { ...notif, read: true } : notif,
      )

      // Update local state
      setNotifications(updatedNotifications)

      // Update localStorage
      const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      const updatedAllNotifications = allNotifications.map((notif: Notification) =>
        notif.id === notification.id ? { ...notif, read: true } : notif,
      )
      localStorage.setItem("notifications", JSON.stringify(updatedAllNotifications))
    }

    // Navigate based on notification type
    if (notification.type === "task") {
      router.push("/student-dashboard/tasks")
    } else if (notification.type === "project") {
      router.push("/student-dashboard/projects")
    } else if (notification.type === "message") {
      router.push("/student-dashboard/chat")
    }
  }

  const markAllAsRead = () => {
    // Mark all as read in local state
    const updatedNotifications = notifications.map((notif) => ({ ...notif, read: true }))
    setNotifications(updatedNotifications)

    // Update localStorage
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const updatedAllNotifications = allNotifications.map((notif: Notification) =>
      notif.userId === currentUser?.id ? { ...notif, read: true } : notif,
    )
    localStorage.setItem("notifications", JSON.stringify(updatedAllNotifications))
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
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

  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.read).length
  }

  return (
    <DashboardLayout title="Notifications" userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Your Notifications</h2>
          <div className="flex items-center gap-2">
            {getUnreadCount() > 0 && (
              <Button variant="outline" onClick={markAllAsRead} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Mark all as read</span>
                <span className="sm:hidden">Mark all</span>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList className="bg-gray-800 w-full sm:w-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-gray-700">
                Unread
                {getUnreadCount() > 0 && <Badge className="ml-2 bg-red-500">{getUnreadCount()}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="task" className="data-[state=active]:bg-gray-700">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="project" className="data-[state=active]:bg-gray-700">
                Projects
              </TabsTrigger>
              <TabsTrigger value="message" className="data-[state=active]:bg-gray-700">
                Messages
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 text-sm text-gray-400 hidden sm:flex">
              <Filter className="h-4 w-4" />
              <span>Filter: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {filteredNotifications.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">No notifications found</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-700">
                    {filteredNotifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`p-4 cursor-pointer hover:bg-gray-700/50 ${!notification.read ? "bg-gray-700/30" : ""}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-4">
                          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <p className={`${!notification.read ? "font-medium" : "text-gray-300"}`}>
                              {notification.message}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(notification.timestamp)}</span>
                              <Badge
                                variant="outline"
                                className={
                                  notification.type === "task"
                                    ? "bg-blue-900/20 text-blue-400 border-blue-500"
                                    : notification.type === "project"
                                      ? "bg-green-900/20 text-green-400 border-green-500"
                                      : "bg-purple-900/20 text-purple-400 border-purple-500"
                                }
                              >
                                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                              </Badge>
                              {!notification.read && <Badge className="bg-red-500">New</Badge>}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
