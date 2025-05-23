"use client"
import { X } from "lucide-react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { addNotification } from "@/lib/notifications"
import { Sidebar } from './../../../components/sidebar';

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

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  status: string
  projectId: string
}
 
// User interface
interface User {
  id: string
  name: string
  email: string
  role: string
  studentId?: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Status cycle order
  const statusCycle = ["pending", "in-progress", "completed", "on-hold", "cancelled"]
 // Status project sidebar 
const [selectedProject, setSelectedProject] = useState<Project | null>(null)

const [allTasks, setAllTasks] = useState<Task[]>([])


  // New project form state
  const [newProject, setNewProject] = useState<Omit<Project, "id" | "progress">>({
    title: "",
    description: "",
    students: [],
    category: "Web Development",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "pending",
  })

  // Load projects and users from localStorage
  useEffect(() => {
    // Load projects
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
setAllTasks(storedTasks)

    const storedProjects = localStorage.getItem("projects")
    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects)
      setProjects(parsedProjects)
      setFilteredProjects(parsedProjects)
    } else {
      // Sample project data if none exists
      const sampleProjects = [
        {
          id: "1",
          title: "Website Redesign",
          description: "Redesign the company website with modern UI/UX principles",
          students: ["student1", "student2"],
          category: "Web Development",
          startDate: "2023-01-15",
          endDate: "2023-03-30",
          status: "in-progress",
          progress: 65,
        },
        {
          id: "2",
          title: "Mobile App Development",
          description: "Create a cross-platform mobile app for task management",
          students: ["student3", "student4"],
          category: "Mobile Development",
          startDate: "2023-02-10",
          endDate: "2023-05-20",
          status: "pending",
          progress: 30,
        },
        {
          id: "3",
          title: "Database Migration",
          description: "Migrate the existing database to a new cloud platform",
          students: ["student2", "student3"],
          category: "Database",
          startDate: "2023-03-05",
          endDate: "2023-04-15",
          status: "completed",
          progress: 100,
        },
        {
          id: "4",
          title: "AI Chatbot Integration",
          description: "Integrate an AI chatbot for customer support",
          students: ["student1", "student3"],
          category: "Artificial Intelligence",
          startDate: "2023-04-01",
          endDate: "2023-06-30",
          status: "in-progress",
          progress: 45,
        },
        {
          id: "5",
          title: "Security Audit",
          description: "Perform a comprehensive security audit of all systems",
          students: ["student4"],
          category: "Security",
          startDate: "2023-05-10",
          endDate: "2023-06-10",
          status: "pending",
          progress: 10,
        },
      ]
      setProjects(sampleProjects)
      setFilteredProjects(sampleProjects)
      localStorage.setItem("projects", JSON.stringify(sampleProjects))
    }

    // Load users
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    setUsers(storedUsers)

    // Filter student users
    const studentUsers = storedUsers.filter((user: User) => user.role === "student")
    setStudents(studentUsers)
  }, [])


  
  // Filter projects based on search term and status
  useEffect(() => {
    let filtered = [...projects]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (project) => project.title.toLowerCase().includes(term) || project.description.toLowerCase().includes(term),
      )
    }

    if (statusFilter !== "all-status") {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }

    setFilteredProjects(filtered)
  }, [searchTerm, statusFilter, projects])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-500"
      case "in-progress":
        return "bg-blue-900/20 text-blue-400 border-blue-500"
      case "completed":
        return "bg-green-900/20 text-green-400 border-green-500"
      case "on-hold":
        return "bg-orange-900/20 text-orange-400 border-orange-500"
      case "cancelled":
        return "bg-red-900/20 text-red-400 border-red-500"
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-500"
    }
  }

  const handleAddProject = () => {
    // Validate form
    if (!newProject.title || !newProject.description || !newProject.endDate || newProject.students.length === 0) {
      alert("Please fill in all required fields and select at least one student")
      return
    }

    // Create new project
    const project: Project = {
      id: Date.now().toString(),
      ...newProject,
      progress: newProject.status === "completed" ? 100 : newProject.status === "in-progress" ? 50 : 0,
    }

    // Add to projects list
    const updatedProjects = [...projects, project]
    setProjects(updatedProjects)

    // Save to localStorage
    localStorage.setItem("projects", JSON.stringify(updatedProjects))

    // Create notifications for all assigned students
    newProject.students.forEach((studentId) => {
      addNotification(
        studentId,
        "project",
        `You have been assigned to a new project: "${newProject.title}"`,
        project.id,
      )
    })

    // Reset form and close dialog
    setNewProject({
      title: "",
      description: "",
      students: [],
      category: "Web Development",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: "pending",
    })
    setIsAddProjectOpen(false)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsEditProjectOpen(true)
  }

  const handleUpdateProject = () => {
    if (!editingProject) return

    // Find the project in the list
    const oldProject = projects.find((p) => p.id === editingProject.id)

    // Update the project
    const updatedProjects = projects.map((project) => (project.id === editingProject.id ? editingProject : project))

    setProjects(updatedProjects)
    localStorage.setItem("projects", JSON.stringify(updatedProjects))

    // Create notifications for status changes
    if (oldProject && oldProject.status !== editingProject.status) {
      editingProject.students.forEach((studentId) => {
        addNotification(
          studentId,
          "project",
          `Project "${editingProject.title}" status has been changed to ${editingProject.status}`,
          editingProject.id,
        )
      })
    }

    // Create notifications for newly added students
    if (oldProject) {
      const newStudents = editingProject.students.filter((id) => !oldProject.students.includes(id))
      newStudents.forEach((studentId) => {
        addNotification(
          studentId,
          "project",
          `You have been assigned to project: "${editingProject.title}"`,
          editingProject.id,
        )
      })
    }

    setIsEditProjectOpen(false)
    setEditingProject(null)
  }

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId)
  }

  const confirmDeleteProject = () => {
    if (!projectToDelete) return

    const projectToRemove = projects.find((p) => p.id === projectToDelete)

    if (projectToRemove) {
      // Notify students about project deletion
      projectToRemove.students.forEach((studentId) => {
        addNotification(studentId, "project", `Project "${projectToRemove.title}" has been deleted`, projectToRemove.id)
      })
    }

    const updatedProjects = projects.filter((project) => project.id !== projectToDelete)
    setProjects(updatedProjects)
    localStorage.setItem("projects", JSON.stringify(updatedProjects))
    setProjectToDelete(null)
  }

  const handleStudentSelection = (studentId: string, isChecked: boolean) => {
    if (isChecked) {
      setNewProject({
        ...newProject,
        students: [...newProject.students, studentId],
      })
    } else {
      setNewProject({
        ...newProject,
        students: newProject.students.filter((id) => id !== studentId),
      })
    }
  }

  const handleEditStudentSelection = (studentId: string, isChecked: boolean) => {
    if (!editingProject) return

    if (isChecked) {
      setEditingProject({
        ...editingProject,
        students: [...editingProject.students, studentId],
      })
    } else {
      setEditingProject({
        ...editingProject,
        students: editingProject.students.filter((id) => id !== studentId),
      })
    }
  }

  const getStudentNames = (studentIds: string[]) => {
    return studentIds
      .map((id) => {
        const student = users.find((user) => user.id === id)
        return student ? student.name : "Unknown"
      })
      .join(", ")
  }

  // Function to cycle through project statuses when clicked
  const cycleProjectStatus = (project: Project) => {
    const currentIndex = statusCycle.indexOf(project.status)
    const nextIndex = (currentIndex + 1) % statusCycle.length
    const newStatus = statusCycle[nextIndex]

    // Calculate new progress based on status
    let newProgress = project.progress
    if (newStatus === "completed") {
      newProgress = 100
    } else if (newStatus === "in-progress") {
      newProgress = 50
    } else if (newStatus === "pending") {
      newProgress = 0
    }

    // Update project
    const updatedProject = {
      ...project,
      status: newStatus,
      progress: newProgress,
    }

    const updatedProjects = projects.map((p) => (p.id === project.id ? updatedProject : p))

    setProjects(updatedProjects)
    localStorage.setItem("projects", JSON.stringify(updatedProjects))

    // Notify students about status change
    project.students.forEach((studentId) => {
      addNotification(
        studentId,
        "project",
        `Project "${project.title}" status has been changed to ${newStatus}`,
        project.id,
      )
    })
  }

const getTeamMembers = (studentIds: string[]) => {
  return studentIds
    .map((id) => {
      const student = users.find((user) => user.id === id)
      return student ? student.name : "Unknown"
    })
    .join(", ")
}

useEffect(() => {
  const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
  setAllTasks(storedTasks)
}, [])

const projectTasks = allTasks.filter(task => task.projectId === selectedProject?.id)


  return (
    <DashboardLayout title="Projects Management" userRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Projects Overview</h2>
          <Button onClick={() => setIsAddProjectOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <Button className="md:col-span-1" onClick={() => setIsAddProjectOpen(true)}>
            Add New Project
          </Button>
          <Input
            placeholder="Search projects by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 border-gray-600 md:col-span-1"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400">
              No projects found matching your filters.
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id}
              onClick={() => setSelectedProject(project)}
              
               className="bg-gray-800 border-gray-700" >
                
                <CardContent className="p-6">
                  
                  <div className="flex justify-between items-start mb-2">
                    
                    <h3 className="text-xl font-bold text-blue-500">{project.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 -mt-1 -mr-2"
                        onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 -mt-1 -mr-2"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{project.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-gray-200">{project.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Students:</span>
                      <span className="text-gray-200">{getStudentNames(project.students)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Timeline:</span>
                      <span className="text-gray-200">
                        {project.startDate} to {project.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Progress:</span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-full cursor-pointer ${getStatusColor(project.status)}`}
                        onClick={() => cycleProjectStatus(project)}
                        title="Click to change status"
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <div className="text-right text-sm text-gray-400">{project.progress}%</div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the project details below to create a new project.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="Enter project title"
                className="bg-gray-700 border-gray-600"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                className="bg-gray-700 border-gray-600 min-h-[100px]"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newProject.category}
                  onValueChange={(value) => setNewProject({ ...newProject, category: value })}
                >
                  <SelectTrigger id="category" className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                >
                  <SelectTrigger id="status" className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  className="bg-gray-700 border-gray-600"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  className="bg-gray-700 border-gray-600"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Assign Students</Label>
              <div className="bg-gray-700 border border-gray-600 rounded-md p-3 max-h-[150px] overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-gray-400 text-sm">No students available</p>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={newProject.students.includes(student.id)}
                        onCheckedChange={(checked) => handleStudentSelection(student.id, checked as boolean)}
                      />
                      <Label htmlFor={`student-${student.id}`} className="text-sm cursor-pointer">
                        {student.name} {student.studentId ? `(${student.studentId})` : ""}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProject}>Add Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Project</DialogTitle>
            <DialogDescription className="text-gray-400">Update the project details below.</DialogDescription>
          </DialogHeader>

          {editingProject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Project Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter project title"
                  className="bg-gray-700 border-gray-600"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter project description"
                  className="bg-gray-700 border-gray-600 min-h-[100px]"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingProject.category}
                    onValueChange={(value) => setEditingProject({ ...editingProject, category: value })}
                  >
                    <SelectTrigger id="edit-category" className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingProject.status}
                    onValueChange={(value) => {
                      const progress =
                        value === "completed"
                          ? 100
                          : value === "in-progress"
                            ? 50
                            : value === "pending"
                              ? 0
                              : editingProject.progress
                      setEditingProject({
                        ...editingProject,
                        status: value,
                        progress,
                      })
                    }}
                  >
                    <SelectTrigger id="edit-status" className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    className="bg-gray-700 border-gray-600"
                    value={editingProject.startDate}
                    onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    className="bg-gray-700 border-gray-600"
                    value={editingProject.endDate}
                    onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Assign Students</Label>
                <div className="bg-gray-700 border border-gray-600 rounded-md p-3 max-h-[150px] overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="text-gray-400 text-sm">No students available</p>
                  ) : (
                    students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`edit-student-${student.id}`}
                          checked={editingProject.students.includes(student.id)}
                          onCheckedChange={(checked) => handleEditStudentSelection(student.id, checked as boolean)}
                        />
                        <Label htmlFor={`edit-student-${student.id}`} className="text-sm cursor-pointer">
                          {student.name} {student.studentId ? `(${student.studentId})` : ""}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  className="bg-gray-700 border-gray-600"
                  value={editingProject.progress}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, progress: Number.parseInt(e.target.value) || 0 })
                  }
                />
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${editingProject.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>Update Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the project and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteProject}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

{selectedProject && (
  <div className="fixed top-0 right-0 h-full w-[320px] md:w-[400px] bg-gray-900 text-white shadow-lg p-6 overflow-y-auto z-50">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold text-cyan-400">{selectedProject.title}</h3>
      <Button size="icon" variant="ghost" onClick={() => setSelectedProject(null)}>
        <X className="text-white" />
      </Button>
    </div>

    <p className="mb-2"><strong>Description:</strong> {selectedProject.description}</p>
    <p><strong>Category:</strong> {selectedProject.category}</p>
    <p><strong>Students:</strong> {getTeamMembers(selectedProject.students)}</p>
    <p><strong>Start Date:</strong> {selectedProject.startDate}</p>
    <p><strong>End Date:</strong> {selectedProject.endDate}</p>
    <p className="mt-2"><strong>Status:</strong> {selectedProject.status}</p>
    <p><strong>Progress:</strong> {selectedProject.progress}%</p>

    {/* Tasks Section */}
    <h4 className="text-lg font-bold text-cyan-300 mt-6 mb-2">Tasks</h4>
    {projectTasks.length === 0 ? (
      <p className="text-sm text-gray-400">No tasks assigned to this project.</p>
    ) : (
      projectTasks.map((task) => (
        <div key={task.id} className="border border-cyan-700 rounded-md p-3 mb-3 bg-gray-800">
          <p><strong>Task ID:</strong> {task.id}</p>
          <p><strong>Task Name:</strong> {task.title}</p>
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Assigned Student:</strong> {users.find((u) => u.id === task.assignedTo)?.name || "Unknown"}</p>
          <p><strong>Status:</strong> {task.status}</p>
        </div>
      ))
    )}
  </div>
)}


    </DashboardLayout>
  )
}
