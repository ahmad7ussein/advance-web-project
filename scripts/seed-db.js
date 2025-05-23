// Database seeding script
const { generateSampleData } = require("../lib/sample-data")
const sqlite3 = require("sqlite3")
const { open } = require("sqlite")

async function seedDatabase() {
  try {
    console.log("Generating sample data...")
    const { users, tasks, messages } = generateSampleData()

    console.log("Opening SQLite database...")
    const db = await open({
      filename: "./task_management_system.db",
      driver: sqlite3.Database,
    })

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON")

    console.log("Clearing existing data...")
    await db.exec("BEGIN TRANSACTION")

    try {
      await db.exec("DELETE FROM messages")
      await db.exec("DELETE FROM tasks")
      await db.exec("DELETE FROM users")

      console.log("Inserting sample users...")
      for (const user of users) {
        await db.run("INSERT INTO users (id, name, email, password, role, studentId) VALUES (?, ?, ?, ?, ?, ?)", [
          user.id,
          user.name,
          user.email,
          user.password,
          user.role,
          user.studentId || null,
        ])
      }

      console.log("Inserting sample tasks...")
      for (const task of tasks) {
        await db.run(
          "INSERT INTO tasks (id, title, description, status, assignedTo, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [task.id, task.title, task.description, task.status, task.assignedTo, task.createdBy, task.createdAt],
        )
      }

      console.log("Inserting sample messages...")
      for (const message of messages) {
        await db.run("INSERT INTO messages (id, senderId, receiverId, content, timestamp) VALUES (?, ?, ?, ?, ?)", [
          message.id,
          message.senderId,
          message.receiverId,
          message.content,
          message.timestamp,
        ])
      }

      await db.exec("COMMIT")
      console.log("Database seeded successfully!")
      console.log(`Created: ${users.length} users, ${tasks.length} tasks, ${messages.length} messages`)
    } catch (error) {
      await db.exec("ROLLBACK")
      throw error
    }

    await db.close()
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
