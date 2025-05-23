"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderKanban, CheckSquare, MessageSquare, SettingsIcon } from "lucide-react"

interface SidebarProps {
  userRole: "admin" | "student"
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const getBasePath = () => {
    return userRole === "admin" ? "/dashboard" : "/student-dashboard"
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    {
      name: "Home",
      path: getBasePath(),
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      name: "Projects",
      path: `${getBasePath()}/projects`,
      icon: <FolderKanban className="mr-2 h-4 w-4" />,
    },
    {
      name: "Tasks",
      path: `${getBasePath()}/tasks`,
      icon: <CheckSquare className="mr-2 h-4 w-4" />,
    },
    {
      name: "Chat",
      path: `${getBasePath()}/chat`,
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
  ]
if (userRole === "admin") {
  navItems.push({
    name: "Settings",
    path: "/dashboard/settings",
    icon: <SettingsIcon className="mr-2 h-4 w-4" />,
  })
}
  return (
<div className="w-64 bg-gray-900 min-h-screen h-screen border-r border-gray-800 sticky top-0">
      <div className="p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-4 py-3 rounded-md transition-colors mb-2 ${
              isActive(item.path) ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
