import { MongoClient, ServerApiVersion, type Db } from "mongodb"
import mysql from "mysql2/promise"
import * as SQLite from "./db-sqlite"

// Add this at the top of the file
const isSQLiteAvailable = () => {
  try {
    require("sqlite3")
    return true
  } catch (error) {
    console.warn("SQLite is not available in this environment. Falling back to alternative storage.")
    return false
  }
}

// MongoDB connection
let mongoClient: MongoClient | null = null
let mongoDb: Db | null = null

export async function connectToMongoDB() {
  try {
    if (mongoClient && mongoDb) {
      return {
        client: mongoClient,
        db: mongoDb,
        users: mongoDb.collection("users"),
        tasks: mongoDb.collection("tasks"),
        messages: mongoDb.collection("messages"),
      }
    }

    const uri = process.env.MONGODB_URI || ""
    mongoClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })

    await mongoClient.connect()
    mongoDb = mongoClient.db("task_management_system")

    return {
      client: mongoClient,
      db: mongoDb,
      users: mongoDb.collection("users"),
      tasks: mongoDb.collection("tasks"),
      messages: mongoDb.collection("messages"),
    }
  } catch (error) {
    console.error("Failed to connect to MongoDB", error)
    throw error
  }
}

// MySQL connection
let mysqlPool: any = null

export async function connectToMySQL() {
  try {
    if (mysqlPool) {
      return mysqlPool
    }

    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    // Test the connection
    const connection = await mysqlPool.getConnection()
    connection.release()

    return mysqlPool
  } catch (error) {
    console.error("Failed to connect to MySQL", error)
    throw error
  }
}

// Initialize MySQL tables
export async function initializeMySQLTables() {
  const pool = await connectToMySQL()

  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      studentId VARCHAR(255)
    )
  `)

  // Create tasks table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) NOT NULL,
      assignedTo VARCHAR(255) NOT NULL,
      createdBy VARCHAR(255) NOT NULL,
      createdAt DATETIME NOT NULL,
      FOREIGN KEY (assignedTo) REFERENCES users(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `)

  // Create messages table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(255) PRIMARY KEY,
      senderId VARCHAR(255) NOT NULL,
      receiverId VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      FOREIGN KEY (senderId) REFERENCES users(id),
      FOREIGN KEY (receiverId) REFERENCES users(id)
    )
  `)

  console.log("MySQL tables initialized")
}

// Export SQLite functions
export const connectToSQLite = SQLite.connectToSQLite
export async function initializeSQLiteTables() {
  if (!isSQLiteAvailable()) {
    console.warn("Skipping SQLite initialization as it is not available")
    return
  }

  // Rest of the initialization code
  // ...
  return SQLite.initializeSQLiteTables()
}
export const seedDatabase = SQLite.seedDatabase

// Helper functions for localStorage (fallback when not in production)
export function getUsers() {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("users") || "[]")
}

export function getTasks() {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("tasks") || "[]")
}

export function getMessages() {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("messages") || "[]")
}

export function saveUsers(users: any[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("users", JSON.stringify(users))
}

export function saveTasks(tasks: any[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

export function saveMessages(messages: any[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("messages", JSON.stringify(messages))
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("currentUser")
  return user ? JSON.parse(user) : null
}

export function setCurrentUser(user: any) {
  if (typeof window === "undefined") return
  localStorage.setItem("currentUser", JSON.stringify(user))
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem("currentUser")
}
