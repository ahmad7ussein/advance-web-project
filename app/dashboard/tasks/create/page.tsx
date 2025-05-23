"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { addNotification } from "@/lib/notifications"

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
  students: string[]
}

export default function CreateTaskPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [studentUsers, setStudentUsers] = useState<User[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [availableStudents, setAvailableStudents] = useState<User[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    projectId: "",
    hasProblem: false,
    problemDescription: "",
  })
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    // Load current user
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    } else {
      router.push("/signin")
    }

    // Load users and filter students
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    setUsers(storedUsers)
    const students = storedUsers.filter((user: User) => user.role === "student")
    setStudentUsers(students)
    setAvailableStudents(students)

    // Load projects
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]")
    setProjects(storedProjects)
  }, [router])

  // Update available students when project is selected
  useEffect(() => {
    if (selectedProject && selectedProject !== "none") {
      const project = projects.find((p) => p.id === selectedProject)
      if (project) {
        const projectStudents = studentUsers.filter((student) => project.students.includes(student.id))
        setAvailableStudents(projectStudents)
        // Reset assigned student if not in project
        if (formData.assignedTo && !project.students.includes(formData.assignedTo)) {
          setFormData({ ...formData, assignedTo: "" })
        }
      }
    } else {
      setAvailableStudents(studentUsers)
    }
  }, [selectedProject, projects, studentUsers, formData])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleProjectChange = (value: string) => {
    setSelectedProject(value)
    setFormData({ ...formData, projectId: value === "none" ? "" : value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    // Validate form
    if (!formData.title || !formData.description || !formData.assignedTo) {
      setFormError("Please fill in all required fields")
      return
    }

    if (!currentUser) {
      setFormError("You must be logged in to create a task")
      return
    }

    // Create new task
    const newTask = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      status: "pending",
      assignedTo: formData.assignedTo,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      projectId: formData.projectId || null,
      hasProblem: formData.hasProblem,
      problemDescription: formData.hasProblem ? formData.problemDescription : "",
    }

    // Add to tasks list
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    tasks.push(newTask)
    localStorage.setItem("tasks", JSON.stringify(tasks))

    // Create notification for the assigned student
    const assignedStudent = users.find((user) => user.id === formData.assignedTo)
    if (assignedStudent) {
      const projectInfo = formData.projectId
        ? ` for project "${projects.find((p) => p.id === formData.projectId)?.title}"`
        : ""

      addNotification(
        formData.assignedTo,
        "task",
        `New task assigned to you: "${formData.title}"${projectInfo}`,
        newTask.id,
      )
    }

    // Redirect back to tasks page
    router.push("/dashboard/tasks")
  }

  return (
    <DashboardLayout title="Create New Task" userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard/tasks")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
          <h1 className="text-2xl font-bold">Create New Task</h1>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            {formError && <div className="bg-red-900/50 text-red-200 p-3 rounded-md mb-4">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Related Project (Optional)</Label>
                  <Select value={formData.projectId || "none"} onValueChange={handleProjectChange}>
                    <SelectTrigger id="project" className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="none">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Task Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter task description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="bg-gray-700 border-gray-600 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => handleChange("assignedTo", value)}>
                  <SelectTrigger id="assignedTo" className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {availableStudents.length === 0 ? (
                      <SelectItem value="no-students" disabled>
                        No students available
                      </SelectItem>
                    ) : (
                      availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} {student.studentId ? `(${student.studentId})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedProject && availableStudents.length === 0 && (
                  <p className="text-yellow-400 text-sm mt-1">No students assigned to this project</p>
                )}
              </div>

              <div className="space-y-2 border-t border-gray-700 pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasProblem"
                    checked={formData.hasProblem}
                    onChange={(e) => handleChange("hasProblem", e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600"
                  />
                  <Label htmlFor="hasProblem">This task has a problem that needs attention</Label>
                </div>

                {formData.hasProblem && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="problemDescription">Problem Description</Label>
                    <Textarea
                      id="problemDescription"
                      placeholder="Describe the problem..."
                      value={formData.problemDescription}
                      onChange={(e) => handleChange("problemDescription", e.target.value)}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => router.push("/dashboard/tasks")}>
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
