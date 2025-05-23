"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  name: string
  email: string
  role: string
  studentId?: string
}

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

export default function StudentProjectsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [studentProjects, setStudentProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const statusCycle = ["pending", "in-progress", "completed", "on-hold", "cancelled"]

  useEffect(() => {
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

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]")

    setUsers(storedUsers)
    setProjects(storedProjects)

    const userProjects = storedProjects.filter((project: Project) => project.students.includes(user.id))
    setStudentProjects(userProjects)
    setFilteredProjects(userProjects)
  }, [router])

  useEffect(() => {
    let filtered = [...studentProjects]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (project) => project.title.toLowerCase().includes(term) || project.description.toLowerCase().includes(term),
      )
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((project) => project.category === categoryFilter)
    }
    setFilteredProjects(filtered)
  }, [searchTerm, statusFilter, categoryFilter, studentProjects])

  const handleUpdateProjectStatus = (projectId: string) => {
    const updatedProjects = projects.map((project) => {
      if (project.id === projectId) {
        const currentIndex = statusCycle.indexOf(project.status)
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length]

        const updatedProject = {
          ...project,
          status: nextStatus,
          progress:
            nextStatus === "completed" ? 100 :
            nextStatus === "in-progress" ? 50 :
            nextStatus === "pending" ? 0 :
            project.progress
        }

        return updatedProject
      }
      return project
    })

    setProjects(updatedProjects)
    localStorage.setItem("projects", JSON.stringify(updatedProjects))

    const userProjects = updatedProjects.filter((project) =>
      project.students.includes(currentUser?.id || "")
    )
    setStudentProjects(userProjects)
    setFilteredProjects(userProjects)
  }

  const getStatusBadge = (project: Project) => {
  const badgeColors: Record<Project["status"], string> = {
  pending: "bg-yellow-900/20 text-yellow-400 border-yellow-500",
  "in-progress": "bg-blue-900/20 text-blue-400 border-blue-500",
  completed: "bg-green-900/20 text-green-400 border-green-500",
  "on-hold": "bg-orange-900/20 text-orange-400 border-orange-500",
  cancelled: "bg-red-900/20 text-red-400 border-red-500",
}


    const nextStatus = statusCycle[(statusCycle.indexOf(project.status) + 1) % statusCycle.length]

    return (
      <Badge
        onClick={() => handleUpdateProjectStatus(project.id)}
        variant="outline"
        className={`${badgeColors[project.status]} cursor-pointer hover:opacity-80 transition`}
        title={`Click to change status to "${nextStatus}"`}
      >
        {project.status.replace("-", " ")}
      </Badge>
    )
  }

  const getUniqueCategories = () => {
    const categories = new Set<string>()
    studentProjects.forEach((project) => categories.add(project.category))
    return Array.from(categories)
  }

  const getTeamMembers = (studentIds: string[]) => {
    return studentIds
      .map((id) => {
        const student = users.find((user) => user.id === id)
        return student ? student.name : "Unknown"
      })
      .join(", ")
  }

  return (
    <DashboardLayout title="My Projects" userRole="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">My Projects</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-500">
              Total Projects: {studentProjects.length}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-700 border-gray-600"
          >
            <Filter size={18} />
          </Button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${showFilters ? "block" : "hidden md:grid"}`}>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Categories</SelectItem>
              {getUniqueCategories().map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredProjects.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <p className="text-center text-gray-400">
                {studentProjects.length === 0
                  ? "You don't have any projects assigned to you yet."
                  : "No projects match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-blue-500">{project.title}</CardTitle>
                    {getStatusBadge(project)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-300">{project.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-gray-200">{project.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Timeline:</span>
                        <span className="text-gray-200">
                          {project.startDate} to {project.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Team:</span>
                        <span className="text-gray-200">{getTeamMembers(project.students)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Progress:</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                      </div>
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
