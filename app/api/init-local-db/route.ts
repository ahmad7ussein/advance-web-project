import { NextResponse } from "next/server"
import { initializeSQLiteTables } from "@/lib/db-sqlite"

export async function GET() {
  try {
    await initializeSQLiteTables()

    return NextResponse.json({
      success: true,
      message: "Local SQLite database initialized successfully",
      tables: ["users", "tasks", "messages"],
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database initialization failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
