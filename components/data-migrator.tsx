"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database } from "lucide-react"

export function DataMigrator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; counts?: any } | null>(null)
  const [databaseType, setDatabaseType] = useState<string>(process.env.DATABASE_TYPE || "sqlite")

  const initializeDatabase = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/init-db")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error.message || "Failed to initialize database",
      })
    } finally {
      setLoading(false)
    }
  }

  const migrateData = async () => {
    try {
      setLoading(true)

      // Get data from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
      const messages = JSON.parse(localStorage.getItem("messages") || "[]")

      const response = await fetch("/api/migrate-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users, tasks, messages }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error.message || "Failed to migrate data",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl">Database Management</CardTitle>
        <CardDescription>Initialize database and migrate data from localStorage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && (
          <Alert
            variant={result.success ? "default" : "destructive"}
            className={result.success ? "bg-green-900/20 border-green-500" : ""}
          >
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
            {result.counts && (
              <div className="mt-2 text-sm">
                <p>
                  Migrated: {result.counts.users} users, {result.counts.tasks} tasks, {result.counts.messages} messages
                </p>
              </div>
            )}
          </Alert>
        )}

        <div className="p-3 bg-gray-700/50 rounded-md">
          <p className="text-sm mb-2">
            <strong>Current database:</strong> {databaseType}
          </p>
          <p className="text-xs text-gray-400">
            {databaseType === "sqlite"
              ? "SQLite is a file-based database perfect for local development."
              : databaseType === "mongodb"
                ? "MongoDB is a NoSQL database good for flexible data structures."
                : "MySQL is a relational database with strong data consistency."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={initializeDatabase} disabled={loading}>
          <Database className="mr-2 h-4 w-4" />
          Initialize Database
        </Button>
        <Button onClick={migrateData} disabled={loading} variant="secondary">
          Migrate Data
        </Button>
      </CardFooter>
    </Card>
  )
}
