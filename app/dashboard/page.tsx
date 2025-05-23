"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import Chart from "chart.js/auto"
import { Clock } from "@/components/clock"

export default function DashboardHome() {
  const [stats, setStats] = useState({
    projectsCount: 0,
    studentsCount: 0,
    tasksCount: 0,
    finishedProjectsCount: 0,
  })
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    // Load data from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    const projects = JSON.parse(localStorage.getItem("projects") || "[]")

    // Calculate stats
    const studentsCount = users.filter((user: any) => user.role === "student").length
    const tasksCount = tasks.length
    const projectsCount = projects.length
    const finishedProjectsCount = projects.filter((project: any) => project.status === "completed").length

    setStats({
      projectsCount,
      studentsCount,
      tasksCount,
      finishedProjectsCount,
    })

    // Initialize chart
    initializeChart(projectsCount, studentsCount, tasksCount, finishedProjectsCount)
  }, [])

  const initializeChart = (
    projectsCount: number,
    studentsCount: number,
    tasksCount: number,
    finishedProjectsCount: number,
  ) => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Projects", "Students", "Tasks", "Finished Projects"],
            datasets: [
              {
                label: "Count",
                data: [projectsCount, studentsCount, tasksCount, finishedProjectsCount],
                backgroundColor: [
                  "rgba(0, 102, 102, 0.7)",
                  "rgba(51, 102, 153, 0.7)",
                  "rgba(102, 102, 0, 0.7)",
                  "rgba(102, 51, 0, 0.7)",
                ],
                borderColor: [
                  "rgba(0, 102, 102, 1)",
                  "rgba(51, 102, 153, 1)",
                  "rgba(102, 102, 0, 1)",
                  "rgba(102, 51, 0, 1)",
                ],
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
                text: "Admin Dashboard Overview",
                color: "rgba(255, 255, 255, 0.7)",
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

  return (
    <DashboardLayout title="Admin Dashboard" userRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-500">
            Welcome to the Task Management System
          </h1>
          <Clock />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Number of Projects</h3>
              <p className="text-4xl font-bold">{stats.projectsCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Number of Students</h3>
              <p className="text-4xl font-bold">{stats.studentsCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Number of Tasks</h3>
              <p className="text-4xl font-bold">{stats.tasksCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Finished Projects</h3>
              <p className="text-4xl font-bold">{stats.finishedProjectsCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full h-96 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <canvas ref={chartRef} className="w-full h-full"></canvas>
        </div>
      </div>
    </DashboardLayout>
  )
}
