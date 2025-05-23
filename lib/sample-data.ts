// Sample data generator for testing purposes

// Sample user data
export const sampleUsers = [
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    studentId: "",
  },
  {
    id: "student1",
    name: "John Smith",
    email: "john@example.com",
    password: "password123",
    role: "student",
    studentId: "S12345",
  },
  {
    id: "student2",
    name: "Emma Johnson",
    email: "emma@example.com",
    password: "password123",
    role: "student",
    studentId: "S12346",
  },
  {
    id: "student3",
    name: "Michael Brown",
    email: "michael@example.com",
    password: "password123",
    role: "student",
    studentId: "S12347",
  },
  {
    id: "student4",
    name: "Sophia Davis",
    email: "sophia@example.com",
    password: "password123",
    role: "student",
    studentId: "S12348",
  },
  {
    id: "admin2",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    password: "password123",
    role: "admin",
    studentId: "",
  },
]

// Sample task data
export const generateSampleTasks = (users: any[]) => {
  const adminUsers = users.filter((user) => user.role === "admin")
  const studentUsers = users.filter((user) => user.role === "student")

  if (adminUsers.length === 0 || studentUsers.length === 0) {
    return []
  }

  const tasks = [
    {
      id: "task1",
      title: "Complete Project Proposal",
      description:
        "Write a detailed proposal for the final project including objectives, methodology, and expected outcomes.",
      status: "pending",
      assignedTo: studentUsers[0].id,
      createdBy: adminUsers[0].id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    },
    {
      id: "task2",
      title: "Submit Weekly Progress Report",
      description: "Document your progress for the week, including challenges faced and solutions implemented.",
      status: "completed",
      assignedTo: studentUsers[1].id,
      createdBy: adminUsers[0].id,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    },
    {
      id: "task3",
      title: "Prepare Presentation Slides",
      description: "Create a presentation summarizing your research findings for the upcoming seminar.",
      status: "in-progress",
      assignedTo: studentUsers[2].id,
      createdBy: adminUsers[1].id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: "task4",
      title: "Review Literature",
      description: "Review and summarize at least 10 academic papers related to your research topic.",
      status: "pending",
      assignedTo: studentUsers[0].id,
      createdBy: adminUsers[1].id,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    },
    {
      id: "task5",
      title: "Collect Survey Data",
      description: "Distribute the survey to at least 50 participants and compile the responses.",
      status: "in-progress",
      assignedTo: studentUsers[1].id,
      createdBy: adminUsers[0].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      id: "task6",
      title: "Analyze Experimental Results",
      description: "Perform statistical analysis on the collected data and prepare visualizations.",
      status: "pending",
      assignedTo: studentUsers[3].id,
      createdBy: adminUsers[1].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: "task7",
      title: "Submit Final Report",
      description: "Complete and submit the final report including all findings and conclusions.",
      status: "pending",
      assignedTo: studentUsers[2].id,
      createdBy: adminUsers[0].id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: "task8",
      title: "Prepare for Final Presentation",
      description: "Rehearse your presentation and prepare for potential questions from the panel.",
      status: "pending",
      assignedTo: studentUsers[3].id,
      createdBy: adminUsers[0].id,
      createdAt: new Date().toISOString(), // Today
    },
  ]

  return tasks
}

// Sample message data
export const generateSampleMessages = (users: any[]) => {
  const adminUsers = users.filter((user) => user.role === "admin")
  const studentUsers = users.filter((user) => user.role === "student")

  if (adminUsers.length === 0 || studentUsers.length === 0) {
    return []
  }

  const messages = [
    {
      id: "msg1",
      senderId: adminUsers[0].id,
      receiverId: studentUsers[0].id,
      content: "How is your project proposal coming along?",
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    },
    {
      id: "msg2",
      senderId: studentUsers[0].id,
      receiverId: adminUsers[0].id,
      content: "I'm making good progress. Should have it ready by tomorrow.",
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 6 days ago + 30 minutes
    },
    {
      id: "msg3",
      senderId: adminUsers[0].id,
      receiverId: studentUsers[0].id,
      content: "Great! Let me know if you need any help.",
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // 6 days ago + 45 minutes
    },
    {
      id: "msg4",
      senderId: adminUsers[1].id,
      receiverId: studentUsers[1].id,
      content: "Your weekly report is overdue. When can you submit it?",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: "msg5",
      senderId: studentUsers[1].id,
      receiverId: adminUsers[1].id,
      content: "I apologize for the delay. I'll submit it by end of day.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(), // 3 days ago + 20 minutes
    },
    {
      id: "msg6",
      senderId: studentUsers[2].id,
      receiverId: adminUsers[0].id,
      content: "Do you have any examples of previous presentations I could look at?",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: "msg7",
      senderId: adminUsers[0].id,
      receiverId: studentUsers[2].id,
      content: "Yes, I'll email you some examples from last semester.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), // 2 days ago + 15 minutes
    },
    {
      id: "msg8",
      senderId: studentUsers[3].id,
      receiverId: adminUsers[1].id,
      content: "I'm having trouble accessing the research database. Can you help?",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: "msg9",
      senderId: adminUsers[1].id,
      receiverId: studentUsers[3].id,
      content: "I'll reset your access credentials and send them to you shortly.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(), // 1 day ago + 10 minutes
    },
    {
      id: "msg10",
      senderId: adminUsers[0].id,
      receiverId: studentUsers[0].id,
      content: "Don't forget about the deadline for the literature review next week.",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
    {
      id: "msg11",
      senderId: studentUsers[0].id,
      receiverId: adminUsers[0].id,
      content: "I've already started working on it. Thanks for the reminder!",
      timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(), // 11 hours ago
    },
    {
      id: "msg12",
      senderId: adminUsers[1].id,
      receiverId: studentUsers[2].id,
      content: "How is the presentation preparation going?",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
      id: "msg13",
      senderId: studentUsers[2].id,
      receiverId: adminUsers[1].id,
      content: "I've completed the first draft. Would you be able to review it?",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    },
    {
      id: "msg14",
      senderId: adminUsers[1].id,
      receiverId: studentUsers[2].id,
      content: "Sure, send it over and I'll take a look tomorrow morning.",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    },
  ]

  return messages
}

// Generate complete sample data
export function generateSampleData() {
  const users = sampleUsers
  const tasks = generateSampleTasks(users)
  const messages = generateSampleMessages(users)

  return { users, tasks, messages }
}
