"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role === "admin") {
        router.push("/dashboard")
      } else {
        router.push("/student-dashboard")
      }
    } else {
      router.push("/signin")
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Task Management System</h1>
        <p className="mt-4">Redirecting...</p>
      </div>
    </div>
  )
}
