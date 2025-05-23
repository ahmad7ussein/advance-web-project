"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock } from "@/components/clock"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { Menu, X, Home, FolderOpen, CheckSquare, MessageSquare, LogOut, Settings } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  userRole: "admin" | "student"
}

export function DashboardLayout({ children, title, userRole }: DashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/signin")
      return
    }

    const user = JSON.parse(userStr)
    setCurrentUser(user)

    if (userRole === "admin" && user.role !== "admin") {
      router.push("/student-dashboard")
    } else if (userRole === "student" && user.role !== "student") {
      router.push("/dashboard")
    }
  }, [router, userRole])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/signin")
  }

  const navLinks =
    userRole === "admin"
      ? [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/dashboard/projects", label: "Projects", icon: FolderOpen },
          { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
          { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
        ]
      : [
          { href: "/student-dashboard", label: "Dashboard", icon: Home },
          { href: "/student-dashboard/projects", label: "Projects", icon: FolderOpen },
          { href: "/student-dashboard/tasks", label: "Tasks", icon: CheckSquare },
          { href: "/student-dashboard/notifications", label: "Notifications", icon: MessageSquare },
          { href: "/student-dashboard/chat", label: "Chat", icon: MessageSquare },
        ]

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <h1 className="text-xl font-bold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {userRole === "student" && <NotificationsDropdown />}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-gray-300">{currentUser?.name || "User"}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={handleLogout}>
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

    
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile (Overlay) */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-200 ${
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        <aside
          className={`fixed md:block top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-800 border-r border-gray-700 z-30 overflow-y-auto transform transition-transform duration-200 ease-in-out ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold">Task Management</h2>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <link.icon className="h-5 w-5 text-blue-400" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            
              <li className="md:hidden">
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 text-red-400" />
                  <span>Logout</span>
                </Button>
              </li>
            </ul>
          </nav>
        </aside>
</div>
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 md:ml-64">
          <div className="container mx-auto">{children}</div>
           

        </main>
      </div>
    
  )
}
