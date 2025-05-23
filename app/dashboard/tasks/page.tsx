"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import { TaskFilter, type TaskFilters } from "@/components/task-filter"

interface User {
  id: string
  name: string
  email: string
  role: string
  studentId?: string
}

interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  assignedTo: string
  createdBy: string
  createdAt: string
}

export default function TasksPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    status: [],
    assigneeId: "",
    startDate: null,
    endDate: null,
    searchTerm: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  useEffect(() => {
    // Load users and tasks from localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")

    setUsers(storedUsers)
    setTasks(storedTasks)
    setFilteredTasks(storedTasks)
  }, [])

  // Apply filters whenever tasks or filter settings change
  useEffect(() => {
    let result = [...tasks]

    // Filter by status
    if (taskFilters.status.length > 0) {
      result = result.filter((task) => taskFilters.status.includes(task.status))
    }

    // Filter by assignee
    if (taskFilters.assigneeId) {
      result = result.filter((task) => task.assignedTo === taskFilters.assigneeId)
    }

    // Filter by date range
    if (taskFilters.startDate) {
      result = result.filter((task) => new Date(task.createdAt) >= taskFilters.startDate!)
    }
    if (taskFilters.endDate) {
      // Add one day to include the end date fully
      const endDate = new Date(taskFilters.endDate)
      endDate.setDate(endDate.getDate() + 1)
      result = result.filter((task) => new Date(task.createdAt) <= endDate)
    }

    // Filter by search term
    if (taskFilters.searchTerm) {
      const searchLower = taskFilters.searchTerm.toLowerCase()
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) || task.description.toLowerCase().includes(searchLower),
      )
    }

    // Sort results
    result.sort((a, b) => {
      let valueA, valueB

      // Get the values to compare based on the sort field
      if (taskFilters.sortBy === "createdAt") {
        valueA = new Date(a.createdAt).getTime()
        valueB = new Date(b.createdAt).getTime()
      } else if (taskFilters.sortBy === "title") {
        valueA = a.title.toLowerCase()
        valueB = b.title.toLowerCase()
      } else if (taskFilters.sortBy === "status") {
        valueA = a.status
        valueB = b.status
      } else {
        valueA = a[taskFilters.sortBy as keyof Task]
        valueB = b[taskFilters.sortBy as keyof Task]
      }

      // Compare based on sort order
      if (taskFilters.sortOrder === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      }
    })

    setFilteredTasks(result)
  }, [tasks, taskFilters])

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400"
      case "in-progress":
        return "text-blue-400"
      case "completed":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <DashboardLayout title="Tasks Management" userRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <Button onClick={() => router.push("/dashboard/tasks/create")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>

        <TaskFilter users={users} onFilterChange={setTaskFilters} userRole="admin" currentUserId="" />

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Task ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Task Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Assigned Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      No tasks match your current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, index) => (
                    <tr key={task.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{task.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {users.find((u) => u.id === task.assignedTo)?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${getStatusClass(task.status)}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
