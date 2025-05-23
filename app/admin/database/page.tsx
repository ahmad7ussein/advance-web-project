"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataMigrator } from "@/components/data-migrator"
import { DatabaseSeeder } from "@/components/database-seeder"
import { LogOut, Database } from "lucide-react"
import { Clock } from "@/components/clock"

export default function DatabaseAdmin() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [databaseType, setDatabaseType] = useState<string>("sqlite")

  useEffect(() => {
    // Check if user is logged in and is admin
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/signin")
      return
    }

    const user = JSON.parse(userStr)
    if (user.role !== "admin") {
      router.push("/student-dashboard")
      return
    }

    setCurrentUser(user)

    // Get the database type from environment variable
    setDatabaseType(process.env.DATABASE_TYPE || "sqlite")
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/signin")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Database Administration</h1>
          <div className="flex items-center gap-4">
            <Clock />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Current database type: <span className="font-bold">{databaseType}</span>
              </p>
              <p className="mb-4">
                To change the database type, set the <code className="bg-gray-700 px-1 rounded">DATABASE_TYPE</code>{" "}
                environment variable to one of:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>
                  <code className="bg-gray-700 px-1 rounded">sqlite</code> - Local file-based database (default)
                </li>
                <li>
                  <code className="bg-gray-700 px-1 rounded">mongodb</code> - MongoDB database
                </li>
                <li>
                  <code className="bg-gray-700 px-1 rounded">mysql</code> - MySQL database
                </li>
              </ul>

              {databaseType === "sqlite" && (
                <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-md mb-4">
                  <h3 className="font-semibold mb-2">SQLite Information</h3>
                  <p>
                    SQLite database is stored in a local file named{" "}
                    <code className="bg-gray-700 px-1 rounded">task_management_system.db</code> in your project root.
                  </p>
                  <p className="mt-2">
                    This is perfect for local development but not recommended for production use with multiple users.
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Button onClick={() => router.push("/dashboard")} variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <DataMigrator />
            <DatabaseSeeder />
          </div>
        </div>
      </main>
    </div>
  )
}
