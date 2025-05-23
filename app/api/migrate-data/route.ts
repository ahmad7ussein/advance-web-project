import { NextResponse } from "next/server"
import { connectToMongoDB, connectToMySQL, seedDatabase } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { users, tasks, messages } = await request.json()
    const databaseType = process.env.DATABASE_TYPE || "sqlite"

    if (databaseType === "mongodb") {
      const { db } = await connectToMongoDB()

      // Clear existing collections
      await db.collection("users").deleteMany({})
      await db.collection("tasks").deleteMany({})
      await db.collection("messages").deleteMany({})

      // Insert new data
      if (users && users.length > 0) {
        await db.collection("users").insertMany(users)
      }

      if (tasks && tasks.length > 0) {
        await db.collection("tasks").insertMany(tasks)
      }

      if (messages && messages.length > 0) {
        await db.collection("messages").insertMany(messages)
      }

      return NextResponse.json({
        success: true,
        message: "Data migrated to MongoDB successfully",
        counts: {
          users: users?.length || 0,
          tasks: tasks?.length || 0,
          messages: messages?.length || 0,
        },
      })
    } else if (databaseType === "mysql") {
      const pool = await connectToMySQL()

      // Clear existing tables
      await pool.query("DELETE FROM messages")
      await pool.query("DELETE FROM tasks")
      await pool.query("DELETE FROM users")

      // Insert new data
      if (users && users.length > 0) {
        for (const user of users) {
          await pool.query("INSERT INTO users (id, name, email, password, role, studentId) VALUES (?, ?, ?, ?, ?, ?)", [
            user.id,
            user.name,
            user.email,
            user.password,
            user.role,
            user.studentId || null,
          ])
        }
      }

      if (tasks && tasks.length > 0) {
        for (const task of tasks) {
          await pool.query(
            "INSERT INTO tasks (id, title, description, status, assignedTo, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [task.id, task.title, task.description, task.status, task.assignedTo, task.createdBy, task.createdAt],
          )
        }
      }

      if (messages && messages.length > 0) {
        for (const message of messages) {
          await pool.query(
            "INSERT INTO messages (id, senderId, receiverId, content, timestamp) VALUES (?, ?, ?, ?, ?)",
            [message.id, message.senderId, message.receiverId, message.content, message.timestamp],
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: "Data migrated to MySQL successfully",
        counts: {
          users: users?.length || 0,
          tasks: tasks?.length || 0,
          messages: messages?.length || 0,
        },
      })
    } else if (databaseType === "sqlite") {
      // Use the seedDatabase function for SQLite
      const result = await seedDatabase(users || [], tasks || [], messages || [])

      return NextResponse.json({
        success: true,
        message: "Data migrated to SQLite successfully",
        counts: result,
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
    console.error("Data migration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Data migration failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
