import { createSchema, createYoga } from "graphql-yoga"
import { connectToMongoDB, connectToMySQL, initializeMySQLTables, initializeSQLiteTables } from "@/lib/db"
import * as SQLite from "@/lib/db-sqlite"

// Add this near the top of the file
const isSQLiteAvailable = () => {
  try {
    require("sqlite3")
    return true
  } catch (error) {
    console.warn("SQLite is not available in this environment. Using fallback storage.")
    return false
  }
}

// Modify the DATABASE_TYPE selection to handle SQLite unavailability
const DATABASE_TYPE = process.env.DATABASE_TYPE || (isSQLiteAvailable() ? "sqlite" : "memory")

// GraphQL Schema
const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      name: String!
      email: String!
      password: String!
      role: String!
      studentId: String
    }

    type Task {
      id: ID!
      title: String!
      description: String!
      status: String!
      assignedTo: String!
      createdBy: String!
      createdAt: String!
    }

    type Message {
      id: ID!
      senderId: String!
      receiverId: String!
      content: String!
      timestamp: String!
    }

    type Query {
      users: [User!]!
      user(id: ID!): User
      tasks: [Task!]!
      task(id: ID!): Task
      tasksByUser(userId: ID!): [Task!]!
      messages: [Message!]!
      messagesBetween(user1Id: ID!, user2Id: ID!): [Message!]!
    }

    type Mutation {
      createUser(name: String!, email: String!, password: String!, role: String!, studentId: String): User!
      updateUser(id: ID!, name: String, email: String, password: String, role: String, studentId: String): User!
      deleteUser(id: ID!): Boolean!
      
      createTask(title: String!, description: String!, assignedTo: String!, createdBy: String!): Task!
      updateTask(id: ID!, title: String, description: String, status: String, assignedTo: String): Task!
      deleteTask(id: ID!): Boolean!
      
      sendMessage(senderId: String!, receiverId: String!, content: String!): Message!
    }
  `,
  resolvers: {
    Query: {
      users: async () => {
        if (DATABASE_TYPE === "mongodb") {
          const { users } = await connectToMongoDB()
          return await users.find({}).toArray()
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [rows] = await pool.query("SELECT * FROM users")
          return rows
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          return await SQLite.getAllUsers()
        } else {
          // Memory fallback
          return global.memoryDB?.users || []
        }
      },
      user: async (_, { id }) => {
        if (DATABASE_TYPE === "mongodb") {
          const { users } = await connectToMongoDB()
          return await users.findOne({ id })
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id])
          return rows[0]
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          return await SQLite.getUserById(id)
        } else {
          // Memory fallback
          return global.memoryDB?.users?.find((user) => user.id === id) || null
        }
      },
      tasks: async () => {
        if (DATABASE_TYPE === "mongodb") {
          const { tasks } = await connectToMongoDB()
          return await tasks.find({}).toArray()
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [rows] = await pool.query("SELECT * FROM tasks")
          return rows
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          return await SQLite.getAllTasks()
        } else {
          // Memory fallback
          return global.memoryDB?.tasks || []
        }
      },
      task: async (_, { id }) => {
        if (DATABASE_TYPE === "mongodb") {
          const { tasks } = await connectToMongoDB()
          return await tasks.findOne({ id })
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id])
          return rows[0]
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          return await SQLite.getTaskById(id)
        } else {
          // Memory fallback
          return global.memoryDB?.tasks?.find((task) => task.id === id) || null
        }
      },
      tasksByUser: async (_, { userId }) => {
        if (DATABASE_TYPE === "mongodb") {
          const { tasks } = await connectToMongoDB()
          return await tasks.find({ assignedTo: userId }).toArray()
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [rows] = await pool.query("SELECT * FROM tasks WHERE assignedTo = ?", [userId])
          return rows
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          return await SQLite.getTasksByUser(userId)
        } else {
          // Memory fallback
          return global.memoryDB?.tasks?.filter((task) => task.assignedTo === userId) || []
        }
      },
      messages: async () => {
        if (DATABASE_TYPE === "mongodb") {
          const { messages } = await connectToMongoDB()
          return await messages.find({}).toArray()
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [rows] = await pool.query("SELECT * FROM messages")
          return rows
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          return await SQLite.getAllMessages()
        } else {
          // Memory fallback
          return global.memoryDB?.messages || []
        }
      },
      messagesBetween: async (_, { user1Id, user2Id }) => {
        if (DATABASE_TYPE === "mongodb") {
          const { messages } = await connectToMongoDB()
          return await messages
            .find({
              $or: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id },
              ],
            })
            .sort({ timestamp: 1 })
            .toArray()
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [rows] = await pool.query(
            "SELECT * FROM messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY timestamp ASC",
            [user1Id, user2Id, user2Id, user1Id],
          )
          return rows
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          return await SQLite.getMessagesBetweenUsers(user1Id, user2Id)
        } else {
          // Memory fallback
          const messages = global.memoryDB?.messages || []
          return messages
            .filter(
              (msg) =>
                (msg.senderId === user1Id && msg.receiverId === user2Id) ||
                (msg.senderId === user2Id && msg.receiverId === user1Id),
            )
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        }
      },
    },
    Mutation: {
      createUser: async (_, { name, email, password, role, studentId }) => {
        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password,
          role,
          studentId: studentId || "",
        }

        if (DATABASE_TYPE === "mongodb") {
          const { users } = await connectToMongoDB()
          await users.insertOne(newUser)
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          await pool.query("INSERT INTO users (id, name, email, password, role, studentId) VALUES (?, ?, ?, ?, ?, ?)", [
            newUser.id,
            newUser.name,
            newUser.email,
            newUser.password,
            newUser.role,
            newUser.studentId,
          ])
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          await SQLite.createUser(newUser)
        } else {
          // Memory fallback
          global.memoryDB?.users?.push(newUser)
        }

        return newUser
      },
      updateUser: async (_, { id, name, email, password, role, studentId }) => {
        if (DATABASE_TYPE === "mongodb") {
          const { users } = await connectToMongoDB()
          const user = await users.findOne({ id })
          if (!user) throw new Error("User not found")

          const updatedUser = {
            ...user,
            ...(name && { name }),
            ...(email && { email }),
            ...(password && { password }),
            ...(role && { role }),
            ...(studentId !== undefined && { studentId }),
          }

          await users.updateOne({ id }, { $set: updatedUser })
          return updatedUser
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id])
          if (rows.length === 0) throw new Error("User not found")

          const user = rows[0]
          const updatedUser = {
            ...user,
            ...(name && { name }),
            ...(email && { email }),
            ...(password && { password }),
            ...(role && { role }),
            ...(studentId !== undefined && { studentId }),
          }

          await pool.query("UPDATE users SET name = ?, email = ?, password = ?, role = ?, studentId = ? WHERE id = ?", [
            updatedUser.name,
            updatedUser.email,
            updatedUser.password,
            updatedUser.role,
            updatedUser.studentId,
            id,
          ])
          return updatedUser
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          const userData = {
            ...(name && { name }),
            ...(email && { email }),
            ...(password && { password }),
            ...(role && { role }),
            ...(studentId !== undefined && { studentId }),
          }
          return await SQLite.updateUser(id, userData)
        } else {
          // Memory fallback
          const userIndex = global.memoryDB?.users?.findIndex((user) => user.id === id) || -1
          if (userIndex === -1) throw new Error("User not found")

          const updatedUser = {
            ...global.memoryDB?.users[userIndex],
            ...(name && { name }),
            ...(email && { email }),
            ...(password && { password }),
            ...(role && { role }),
            ...(studentId !== undefined && { studentId }),
          }

          global.memoryDB.users[userIndex] = updatedUser
          return updatedUser
        }
      },
      deleteUser: async (_, { id }) => {
        if (DATABASE_TYPE === "mongodb") {
          const { users } = await connectToMongoDB()
          const result = await users.deleteOne({ id })
          return result.deletedCount > 0
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id])
          return result.affectedRows > 0
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          return await SQLite.deleteUser(id)
        } else {
          // Memory fallback
          const userIndex = global.memoryDB?.users?.findIndex((user) => user.id === id) || -1
          if (userIndex === -1) return false

          global.memoryDB?.users?.splice(userIndex, 1)
          return true
        }
      },
      createTask: async (_, { title, description, assignedTo, createdBy }) => {
        const newTask = {
          id: Date.now().toString(),
          title,
          description,
          status: "pending",
          assignedTo,
          createdBy,
          createdAt: new Date().toISOString(),
        }

        if (DATABASE_TYPE === "mongodb") {
          const { tasks } = await connectToMongoDB()
          await tasks.insertOne(newTask)
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          await pool.query(
            "INSERT INTO tasks (id, title, description, status, assignedTo, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              newTask.id,
              newTask.title,
              newTask.description,
              newTask.status,
              newTask.assignedTo,
              newTask.createdBy,
              newTask.createdAt,
            ],
          )
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          await SQLite.createTask(newTask)
        } else {
          // Memory fallback
          global.memoryDB?.tasks?.push(newTask)
        }

        return newTask
      },
      updateTask: async (_, { id, title, description, status, assignedTo }) => {
        if (DATABASE_TYPE === "mongodb") {
          const { tasks } = await connectToMongoDB()
          const task = await tasks.findOne({ id })
          if (!task) throw new Error("Task not found")

          const updatedTask = {
            ...task,
            ...(title && { title }),
            ...(description && { description }),
            ...(status && { status }),
            ...(assignedTo && { assignedTo }),
          }

          await tasks.updateOne({ id }, { $set: updatedTask })
          return updatedTask
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id])
          if (rows.length === 0) throw new Error("Task not found")

          const task = rows[0]
          const updatedTask = {
            ...task,
            ...(title && { title }),
            ...(description && { description }),
            ...(status && { status }),
            ...(assignedTo && { assignedTo }),
          }

          await pool.query("UPDATE tasks SET title = ?, description = ?, status = ?, assignedTo = ? WHERE id = ?", [
            updatedTask.title,
            updatedTask.description,
            updatedTask.status,
            updatedTask.assignedTo,
            id,
          ])
          return updatedTask
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          const taskData = {
            ...(title && { title }),
            ...(description && { description }),
            ...(status && { status }),
            ...(assignedTo && { assignedTo }),
          }
          return await SQLite.updateTask(id, taskData)
        } else {
          // Memory fallback
          const taskIndex = global.memoryDB?.tasks?.findIndex((task) => task.id === id) || -1
          if (taskIndex === -1) throw new Error("Task not found")

          const updatedTask = {
            ...global.memoryDB?.tasks[taskIndex],
            ...(title && { title }),
            ...(description && { description }),
            ...(status && { status }),
            ...(assignedTo && { assignedTo }),
          }

          global.memoryDB.tasks[taskIndex] = updatedTask
          return updatedTask
        }
      },
      deleteTask: async (_, { id }) => {
        if (DATABASE_TYPE === "mongodb") {
          const { tasks } = await connectToMongoDB()
          const result = await tasks.deleteOne({ id })
          return result.deletedCount > 0
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id])
          return result.affectedRows > 0
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          return await SQLite.deleteTask(id)
        } else {
          // Memory fallback
          const taskIndex = global.memoryDB?.tasks?.findIndex((task) => task.id === id) || -1
          if (taskIndex === -1) return false

          global.memoryDB?.tasks?.splice(taskIndex, 1)
          return true
        }
      },
      sendMessage: async (_, { senderId, receiverId, content }) => {
        const newMessage = {
          id: Date.now().toString(),
          senderId,
          receiverId,
          content,
          timestamp: new Date().toISOString(),
        }

        if (DATABASE_TYPE === "mongodb") {
          const { messages } = await connectToMongoDB()
          await messages.insertOne(newMessage)
        } else if (DATABASE_TYPE === "mysql") {
          const pool = await connectToMySQL()
          await pool.query(
            "INSERT INTO messages (id, senderId, receiverId, content, timestamp) VALUES (?, ?, ?, ?, ?)",
            [newMessage.id, newMessage.senderId, newMessage.receiverId, newMessage.content, newMessage.timestamp],
          )
        } else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
          await SQLite.createMessage(newMessage)
        } else {
          // Memory fallback
          global.memoryDB?.messages?.push(newMessage)
        }

        return newMessage
      },
    },
  },
})

// Add this before creating the Yoga instance
// Initialize in-memory database if needed
if (DATABASE_TYPE === "memory" && typeof global.memoryDB === "undefined") {
  global.memoryDB = {
    users: [],
    tasks: [],
    messages: [],
  }
}

// Initialize database tables if needed
if (DATABASE_TYPE === "mysql") {
  initializeMySQLTables().catch(console.error)
} else if (DATABASE_TYPE === "sqlite" && isSQLiteAvailable()) {
  initializeSQLiteTables().catch(console.error)
}

// Create a Yoga instance with a GraphQL schema.
const { handleRequest } = createYoga({
  schema,
  // Yoga specific options
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
})

export { handleRequest as GET, handleRequest as POST }
