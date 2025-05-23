import sqlite3 from "sqlite3"
import { open } from "sqlite"

// Add this at the top of the file
const isSQLiteAvailable = () => {
  try {
    require("sqlite3")
    return true
  } catch (error) {
    return false
  }
}

// Create in-memory fallback when SQLite is not available
const inMemoryDB = {
  users: [],
  tasks: [],
  messages: [],
}

// SQLite connection
let db: any = null

export async function connectToSQLite() {
  try {
    if (db) return db

    // Open SQLite database
    db = await open({
      filename: "./task_management_system.db", // File-based database
      driver: sqlite3.Database,
    })

    return db
  } catch (error) {
    console.error("Failed to connect to SQLite", error)
    throw error
  }
}

// Initialize SQLite tables
export async function initializeSQLiteTables() {
  try {
    const db = await connectToSQLite()

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON")

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        studentId TEXT
      )
    `)

    // Create tasks table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        assignedTo TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (assignedTo) REFERENCES users(id),
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )
    `)

    // Create messages table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        senderId TEXT NOT NULL,
        receiverId TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (senderId) REFERENCES users(id),
        FOREIGN KEY (receiverId) REFERENCES users(id)
      )
    `)

    console.log("SQLite tables initialized")
    return true
  } catch (error) {
    console.error("Failed to initialize SQLite tables", error)
    throw error
  }
}

// Helper functions for SQLite operations
export async function getAllUsers() {
  if (!isSQLiteAvailable()) {
    return inMemoryDB.users
  }
  const db = await connectToSQLite()
  return await db.all("SELECT * FROM users")
}

export async function getUserById(id: string) {
  if (!isSQLiteAvailable()) {
    return inMemoryDB.users.find((user) => user.id === id) || null
  }
  const db = await connectToSQLite()
  return await db.get("SELECT * FROM users WHERE id = ?", id)
}

export async function createUser(user: any) {
  const db = await connectToSQLite()
  await db.run("INSERT INTO users (id, name, email, password, role, studentId) VALUES (?, ?, ?, ?, ?, ?)", [
    user.id,
    user.name,
    user.email,
    user.password,
    user.role,
    user.studentId || null,
  ])
  return user
}

export async function updateUser(id: string, userData: any) {
  const db = await connectToSQLite()
  const user = await getUserById(id)
  if (!user) throw new Error("User not found")

  const updatedUser = { ...user, ...userData }

  await db.run("UPDATE users SET name = ?, email = ?, password = ?, role = ?, studentId = ? WHERE id = ?", [
    updatedUser.name,
    updatedUser.email,
    updatedUser.password,
    updatedUser.role,
    updatedUser.studentId,
    id,
  ])

  return updatedUser
}

export async function deleteUser(id: string) {
  const db = await connectToSQLite()
  const result = await db.run("DELETE FROM users WHERE id = ?", id)
  return result.changes > 0
}

export async function getAllTasks() {
  if (!isSQLiteAvailable()) {
    return inMemoryDB.tasks
  }
  const db = await connectToSQLite()
  return await db.all("SELECT * FROM tasks")
}

export async function getTaskById(id: string) {
  if (!isSQLiteAvailable()) {
    return inMemoryDB.tasks.find((task) => task.id === id) || null
  }
  const db = await connectToSQLite()
  return await db.get("SELECT * FROM tasks WHERE id = ?", id)
}

export async function getTasksByUser(userId: string) {
  if (!isSQLiteAvailable()) {
    return inMemoryDB.tasks.filter((task) => task.assignedTo === userId)
  }
  const db = await connectToSQLite()
  return await db.all("SELECT * FROM tasks WHERE assignedTo = ?", userId)
}

export async function createTask(task: any) {
  const db = await connectToSQLite()
  await db.run(
    "INSERT INTO tasks (id, title, description, status, assignedTo, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [task.id, task.title, task.description, task.status, task.assignedTo, task.createdBy, task.createdAt],
  )
  return task
}

export async function updateTask(id: string, taskData: any) {
  const db = await connectToSQLite()
  const task = await getTaskById(id)
  if (!task) throw new Error("Task not found")

  const updatedTask = { ...task, ...taskData }

  await db.run("UPDATE tasks SET title = ?, description = ?, status = ?, assignedTo = ? WHERE id = ?", [
    updatedTask.title,
    updatedTask.description,
    updatedTask.status,
    updatedTask.assignedTo,
    id,
  ])

  return updatedTask
}

export async function deleteTask(id: string) {
  const db = await connectToSQLite()
  const result = await db.run("DELETE FROM tasks WHERE id = ?", id)
  return result.changes > 0
}

export async function getAllMessages() {
  if (!isSQLiteAvailable()) {
    return inMemoryDB.messages
  }
  const db = await connectToSQLite()
  return await db.all("SELECT * FROM messages")
}

export async function getMessagesBetweenUsers(user1Id: string, user2Id: string) {
  if (!isSQLiteAvailable()) {
    return inMemoryDB.messages
      .filter(
        (message) =>
          (message.senderId === user1Id && message.receiverId === user2Id) ||
          (message.senderId === user2Id && message.receiverId === user1Id),
      )
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }
  const db = await connectToSQLite()
  return await db.all(
    "SELECT * FROM messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY timestamp ASC",
    [user1Id, user2Id, user2Id, user1Id],
  )
}

export async function createMessage(message: any) {
  const db = await connectToSQLite()
  await db.run("INSERT INTO messages (id, senderId, receiverId, content, timestamp) VALUES (?, ?, ?, ?, ?)", [
    message.id,
    message.senderId,
    message.receiverId,
    message.content,
    message.timestamp,
  ])
  return message
}

// Function to seed the database with initial data
export async function seedDatabase(users: any[], tasks: any[], messages: any[]) {
  const db = await connectToSQLite()

  // Begin transaction
  await db.exec("BEGIN TRANSACTION")

  try {
    // Clear existing data
    await db.exec("DELETE FROM messages")
    await db.exec("DELETE FROM tasks")
    await db.exec("DELETE FROM users")

    // Insert users
    if (users && users.length > 0) {
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
    }

    // Insert tasks
    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        await db.run(
          "INSERT INTO tasks (id, title, description, status, assignedTo, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [task.id, task.title, task.description, task.status, task.assignedTo, task.createdBy, task.createdAt],
        )
      }
    }

    // Insert messages
    if (messages && messages.length > 0) {
      for (const message of messages) {
        await db.run("INSERT INTO messages (id, senderId, receiverId, content, timestamp) VALUES (?, ?, ?, ?, ?)", [
          message.id,
          message.senderId,
          message.receiverId,
          message.content,
          message.timestamp,
        ])
      }
    }

    // Commit transaction
    await db.exec("COMMIT")

    return {
      users: users.length,
      tasks: tasks.length,
      messages: messages.length,
    }
  } catch (error) {
    // Rollback on error
    await db.exec("ROLLBACK")
    throw error
  }
}
