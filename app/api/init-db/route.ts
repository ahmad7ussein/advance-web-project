import { NextResponse } from "next/server"
import { connectToMongoDB, initializeMySQLTables, initializeSQLiteTables } from "@/lib/db"

export async function GET() {
  try {
    const databaseType = process.env.DATABASE_TYPE || "sqlite"

    if (databaseType === "mongodb") {
      // Initialize MongoDB
      const { db, users, tasks, messages } = await connectToMongoDB()

      // Create indexes
      await users.createIndex({ email: 1 }, { unique: true })
      await tasks.createIndex({ assignedTo: 1 })
      await tasks.createIndex({ createdBy: 1 })
      await messages.createIndex({ senderId: 1, receiverId: 1 })

      return NextResponse.json({
        success: true,
        message: "MongoDB initialized successfully",
        collections: ["users", "tasks", "messages"],
      })
    } else if (databaseType === "mysql") {
      // Initialize MySQL tables
      await initializeMySQLTables()

      return NextResponse.json({
        success: true,
        message: "MySQL tables initialized successfully",
        tables: ["users", "tasks", "messages"],
      })
    } else if (databaseType === "sqlite") {
      // Initialize SQLite tables
      await initializeSQLiteTables()

      return NextResponse.json({
        success: true,
        message: "SQLite database initialized successfully",
        tables: ["users", "tasks", "messages"],
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid database type. Set DATABASE_TYPE to "mongodb", "mysql", or "sqlite"',
        },
        { status: 400 },
      )
    }
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
