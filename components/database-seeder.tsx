"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database, Loader2 } from "lucide-react"

export function DatabaseSeeder() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; counts?: any } | null>(null)

  const seedDatabase = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/seed-database", {
        method: "POST",
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error.message || "Failed to seed database",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl">Sample Data Generator</CardTitle>
        <CardDescription>Populate the database with sample users, tasks, and messages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-md">
          <p className="text-sm">
            This will create 6 sample users (2 admins, 4 students), 8 tasks, and 14 messages for testing purposes.
          </p>
          <p className="text-sm mt-2 text-yellow-400">
            <strong>Warning:</strong> This will replace all existing data in the database.
          </p>
        </div>

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
                  Created: {result.counts.users} users, {result.counts.tasks} tasks, {result.counts.messages} messages
                </p>
              </div>
            )}
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={seedDatabase} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding Database...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Seed Database with Sample Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
