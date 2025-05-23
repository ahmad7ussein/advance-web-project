"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskFilter, type TaskFilters } from "@/components/task-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Chart from "chart.js/auto"
import { Clock } from "@/components/clock"

// Types
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
  projectId?: string | null
  hasProblem?: boolean
  problemDescription?: string
}

// Project interface
interface Project {
  id: string
  title: string
  description: string
  students: string[]
  category: string
  startDate: string
  endDate: string
  status: string
  progress: number
}

export default function StudentDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [studentProjects, setStudentProjects] = useState<Project[]>([])
  const statusChartRef = useRef<HTMLCanvasElement>(null)
  const projectsChartRef = useRef<HTMLCanvasElement>(null)
  const timelineChartRef = useRef<HTMLCanvasElement>(null)
  const statusChartInstance = useRef<Chart | null>(null)
  const projectsChartInstance = useRef<Chart | null>(null)
  const timelineChartInstance = useRef<Chart | null>(null)
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

    // Load users, tasks and projects from localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]")

    setUsers(storedUsers)
    setTasks(storedTasks)
    setProjects(storedProjects)

    // Filter projects for the current student
    if (user) {
      const userProjects = storedProjects.filter((project: Project) => project.students.includes(user.id))
      setStudentProjects(userProjects)
    }
  }, [router])

  // Filter tasks for the current student
  useEffect(() => {
    if (!currentUser) return

    // First filter tasks assigned to this student
    const studentTasks = tasks.filter((task) => task.assignedTo === currentUser.id)

    // Then apply additional filters
    let result = [...studentTasks]

    // Filter by status
    if (taskFilters.status.length > 0) {
      result = result.filter((task) => taskFilters.status.includes(task.status))
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

    // Initialize charts
    initializeCharts(studentTasks, studentProjects)
  }, [tasks, taskFilters, currentUser, studentProjects])

  const initializeCharts = (studentTasks: Task[], studentProjects: Project[]) => {
    // Initialize status chart (doughnut chart)
    initializeStatusChart(studentTasks)

    // Initialize projects chart (bar chart)
    initializeProjectsChart(studentProjects)

    // Initialize timeline chart (line chart)
    initializeTimelineChart(studentTasks)
  }

  const initializeStatusChart = (studentTasks: Task[]) => {
    if (statusChartRef.current) {
      // Destroy existing chart if it exists
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy()
      }

      // Count tasks by status
      const pendingCount = studentTasks.filter((task) => task.status === "pending").length
      const inProgressCount = studentTasks.filter((task) => task.status === "in-progress").length
      const completedCount = studentTasks.filter((task) => task.status === "completed").length

      const ctx = statusChartRef.current.getContext("2d")
      if (ctx) {
        statusChartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Pending", "In Progress", "Completed"],
            datasets: [
              {
                data: [pendingCount, inProgressCount, completedCount],
                backgroundColor: ["rgba(255, 193, 7, 0.7)", "rgba(13, 110, 253, 0.7)", "rgba(40, 167, 69, 0.7)"],
                borderColor: ["rgba(255, 193, 7, 1)", "rgba(13, 110, 253, 1)", "rgba(40, 167, 69, 1)"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              },
              title: {
                display: true,
                text: "Task Status Distribution",
                color: "rgba(255, 255, 255, 0.9)",
                font: {
                  size: 16,
                },
              },
            },
          },
        })
      }
    }
  }

  const initializeProjectsChart = (studentProjects: Project[]) => {
    if (projectsChartRef.current && studentProjects.length > 0) {
      // Destroy existing chart if it exists
      if (projectsChartInstance.current) {
        projectsChartInstance.current.destroy()
      }

      const ctx = projectsChartRef.current.getContext("2d")
      if (ctx) {
        projectsChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: studentProjects.map((project) => project.title),
            datasets: [
              {
                label: "Project Progress (%)",
                data: studentProjects.map((project) => project.progress),
                backgroundColor: studentProjects.map((project) => {
                  if (project.status === "completed") return "rgba(40, 167, 69, 0.7)"
                  if (project.status === "in-progress") return "rgba(13, 110, 253, 0.7)"
                  return "rgba(255, 193, 7, 0.7)"
                }),
                borderColor: studentProjects.map((project) => {
                  if (project.status === "completed") return "rgba(40, 167, 69, 1)"
                  if (project.status === "in-progress") return "rgba(13, 110, 253, 1)"
                  return "rgba(255, 193, 7, 1)"
                }),
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  color: "rgba(255, 255, 255, 0.7)",
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
              },
              x: {
                ticks: {
                  color: "rgba(255, 255, 255, 0.7)",
                  callback: function (value) {
                    // Truncate long project names
                    const label = this.getLabelForValue(value as number)
                    if (label.length > 15) {
                      return label.substring(0, 15) + "..."
                    }
                    return label
                  },
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: "My Projects Progress",
                color: "rgba(255, 255, 255, 0.9)",
                font: {
                  size: 16,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const project = studentProjects[context.dataIndex]
                    return [`Progress: ${context.parsed.y}%`, `Status: ${project.status}`, `Due: ${project.endDate}`]
                  },
                },
              },
            },
          },
        })
      }
    }
  }

  const initializeTimelineChart = (studentTasks: Task[]) => {
    if (timelineChartRef.current) {
      // Destroy existing chart if it exists
      if (timelineChartInstance.current) {
        timelineChartInstance.current.destroy()
      }

      // Group tasks by month
      const tasksByMonth: Record<string, number> = {}
      const completedByMonth: Record<string, number> = {}

      // Get last 6 months
      const months = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`
        months.push(monthKey)
        tasksByMonth[monthKey] = 0
        completedByMonth[monthKey] = 0
      }

      // Count tasks by month
      studentTasks.forEach((task) => {
        const taskDate = new Date(task.createdAt)
        const monthKey = `${taskDate.getFullYear()}-${taskDate.getMonth() + 1}`

        if (tasksByMonth[monthKey] !== undefined) {
          tasksByMonth[monthKey]++

          if (task.status === "completed") {
            completedByMonth[monthKey]++
          }
        }
      })

      const ctx = timelineChartRef.current.getContext("2d")
      if (ctx) {
        timelineChartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: months.map((month) => {
              const [year, monthNum] = month.split("-")
              return `${new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1).toLocaleString("default", { month: "short" })} ${year}`
            }),
            datasets: [
              {
                label: "Total Tasks",
                data: months.map((month) => tasksByMonth[month]),
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.3,
                fill: true,
              },
              {
                label: "Completed Tasks",
                data: months.map((month) => completedByMonth[month]),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: "rgba(255, 255, 255, 0.7)",
                  precision: 0,
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
              },
              x: {
                ticks: {
                  color: "rgba(255, 255, 255, 0.7)",
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)",
                },
              },
            },
            plugins: {
              legend: {
                labels: {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              },
              title: {
                display: true,
                text: "Task Timeline (Last 6 Months)",
                color: "rgba(255, 255, 255, 0.9)",
                font: {
                  size: 16,
                },
              },
            },
          },
        })
      }
    }
  }

  const handleUpdateTaskStatus = (taskId: string, status: "pending" | "in-progress" | "completed") => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
  }

  const getAdminName = (id: string) => {
    const admin = users.find((user) => user.id === id)
    return admin ? admin.name : "Unknown Admin"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-500">
            Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-500">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-500">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }
return (
  <DashboardLayout title="Student Dashboard" userRole="student">
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Welcome, {currentUser?.name}
            </h2>
            {currentUser?.studentId && (
              <p className="text-gray-400">Student ID: {currentUser.studentId}</p>
            )}
          </div>

          {/* الساعة على الجهة المقابلة */}
          <div className="mt-1">
            <Clock />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <canvas ref={statusChartRef} className="w-full h-full"></canvas>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {studentProjects.length > 0 ? (
                <canvas ref={projectsChartRef} className="w-full h-full"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No projects assigned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Task Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <h3 className="text-yellow-400 text-lg font-bold">Pending</h3>
                <p className="text-3xl font-bold">
                  {
                    tasks.filter(
                      (task) =>
                        task.assignedTo === currentUser?.id &&
                        task.status === "pending"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <h3 className="text-blue-400 text-lg font-bold">In Progress</h3>
                <p className="text-3xl font-bold">
                  {
                    tasks.filter(
                      (task) =>
                        task.assignedTo === currentUser?.id &&
                        task.status === "in-progress"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <h3 className="text-green-400 text-lg font-bold">Completed</h3>
                <p className="text-3xl font-bold">
                  {
                    tasks.filter(
                      (task) =>
                        task.assignedTo === currentUser?.id &&
                        task.status === "completed"
                    ).length
                  }
                </p>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Projects Overview</h3>
              <p className="text-gray-400">
                {studentProjects.length > 0
                  ? `You are assigned to ${studentProjects.length} project${
                      studentProjects.length > 1 ? "s" : ""
                    }.`
                  : "No projects assigned yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Task Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <canvas ref={timelineChartRef} className="w-full h-full"></canvas>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold">My Tasks</h2>

      <TaskFilter
        users={users}
        onFilterChange={setTaskFilters}
        userRole="student"
        currentUserId={currentUser?.id || ""}
      />

      {filteredTasks.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-center text-gray-400">
              You don't have any tasks matching your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  {getStatusBadge(task.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-300">{task.description}</p>
                  {task.hasProblem && (
                    <div className="bg-red-900/20 border border-red-700 rounded-md p-2 text-sm">
                      <p className="font-semibold text-red-400">Problem:</p>
                      <p className="text-gray-300">
                        {task.problemDescription}
                      </p>
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    <p>Created: {formatDate(task.createdAt)}</p>
                    <p>Created by: {getAdminName(task.createdBy)}</p>
                    {task.projectId && (
                      <p>
                        Project:{" "}
                        {
                          projects.find((p) => p.id === task.projectId)
                            ?.title || "Unknown Project"
                        }
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant={
                        task.status === "in-progress" ? "default" : "outline"
                      }
                      size="sm"
                      className={
                        task.status === "in-progress" ? "bg-blue-600" : ""
                      }
                      onClick={() =>
                        handleUpdateTaskStatus(task.id, "in-progress")
                      }
                    >
                      Start Working
                    </Button>
                    <Button
                      variant={
                        task.status === "completed" ? "default" : "outline"
                      }
                      size="sm"
                      className={
                        task.status === "completed" ? "bg-green-600" : ""
                      }
                      onClick={() =>
                        handleUpdateTaskStatus(task.id, "completed")
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  </DashboardLayout>
)
}