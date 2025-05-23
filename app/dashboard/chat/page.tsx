"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  studentId?: string
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
}

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    // Load current user, users, and messages from localStorage
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const storedMessages = JSON.parse(localStorage.getItem("messages") || "[]")

    setUsers(storedUsers)
    setMessages(storedMessages)

    // Set first student as selected by default if available
    const studentUsers = storedUsers.filter((u: User) => u.role === "student")
    if (studentUsers.length > 0 && !selectedStudent) {
      setSelectedStudent(studentUsers[0].id)
    }
  }, [selectedStudent])

  const handleSendMessage = () => {
    if (!newMessage || !selectedStudent || !currentUser) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedStudent,
      content: newMessage,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    localStorage.setItem("messages", JSON.stringify(updatedMessages))
    setNewMessage("")
  }

  const getStudentName = (id: string) => {
    const student = users.find((user) => user.id === id)
    return student ? student.name : "Unknown Student"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getConversation = (studentId: string) => {
    if (!currentUser) return []

    return messages
      .filter(
        (msg) =>
          (msg.senderId === currentUser.id && msg.receiverId === studentId) ||
          (msg.senderId === studentId && msg.receiverId === currentUser.id),
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const studentUsers = users.filter((user) => user.role === "student")

  return (
    <DashboardLayout title="Chat with Students" userRole="admin">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-4">Students</h2>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2 pr-4">
                {studentUsers.map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 rounded-md cursor-pointer flex items-center space-x-3 ${
                      selectedStudent === student.id ? "bg-gray-700" : "hover:bg-gray-700/50"
                    }`}
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    <Avatar>
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      {student.studentId && <p className="text-sm text-gray-400">ID: {student.studentId}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 md:col-span-2">
          <CardContent className="p-4 flex flex-col h-[calc(100vh-240px)]">
            {selectedStudent ? (
              <>
                <div className="border-b border-gray-700 pb-4 mb-4">
                  <h2 className="text-xl font-bold">Chatting with {getStudentName(selectedStudent)}</h2>
                </div>
                <ScrollArea className="flex-grow mb-4">
                  <div className="space-y-4 pr-4">
                    {getConversation(selectedStudent).map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.senderId === currentUser?.id ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">{formatDate(msg.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Select a student from the list to start chatting</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
