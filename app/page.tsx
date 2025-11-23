"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { AIAssistant } from "@/components/ai-assistant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { AiCommentChip } from "@/components/ai-comment-chip"
import { getDummyTaskById } from "@/data/dummy-tasks"
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Calculator,
  Atom,
  Code,
  Globe,
  ChevronDown,
  BookOpen,
  FileText,
  Upload,
} from "lucide-react"

// Local mock data used by the dashboard UI
const todaysTasks = [
  {
    id: 2,
    title: "Chemistry Midterm Exam",
    course: "Chemistry",
    type: "exam",
    dueTime: "10:00 AM",
    status: "pending",
    points: 200,
  },
  {
    id: 3,
    title: "Redox Reactions Assignment",
    course: "Chemistry",
    type: "assignment",
    dueTime: "11:59 PM",
    status: "pending",
    points: 80,
  },
]

const courses = [
  {
    id: 1,
    name: "Mathematics",
    code: "MATH 301",
    icon: Calculator,
    color: "bg-blue-500",
    progress: 75,
    nextClass: "Today, 10:00 AM",
    assignments: 3,
    grade: "A-",
    description:
      "Advanced calculus and linear algebra concepts with practical applications in engineering and physics.",
    materials: ["Textbook: Advanced Mathematics", "Lecture Notes Week 1-8", "Practice Problems Set"],
  },
  {
    id: 2,
    name: "Physics",
    code: "PHYS 201",
    icon: Atom,
    color: "bg-green-500",
    progress: 60,
    nextClass: "Tomorrow, 2:00 PM",
    assignments: 2,
    grade: "B+",
    description: "Introduction to quantum mechanics and thermodynamics with laboratory experiments.",
    materials: ["Physics Lab Manual", "Quantum Mechanics Textbook", "Experiment Data Sheets"],
  },
  {
    id: 3,
    name: "Computer Science",
    code: "CS 350",
    icon: Code,
    color: "bg-purple-500",
    progress: 85,
    nextClass: "Today, 3:00 PM",
    assignments: 1,
    grade: "A",
    description: "Data structures and algorithms with focus on optimization and complexity analysis.",
    materials: ["Algorithm Design Manual", "Code Examples Repository", "Project Templates"],
  },
  {
    id: 4,
    name: "History",
    code: "HIST 101",
    icon: Globe,
    color: "bg-orange-500",
    progress: 45,
    nextClass: "Friday, 9:00 AM",
    assignments: 4,
    grade: "B",
    description: "World history from ancient civilizations to modern times with emphasis on cultural development.",
    materials: ["World History Textbook", "Primary Source Documents", "Timeline References"],
  },
]

function DashboardUI() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<"topics" | "weeks">("topics")
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: number]: boolean }>({})

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "assignment":
        return "bg-blue-500"
      case "lab":
        return "bg-green-500"
      case "project":
        return "bg-purple-500"
      case "test":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const toggleDropdown = (courseId: number) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }))
  }

  const getViewContent = (course: any) => {
    if (viewMode === "topics") {
      return [
        { id: 1, title: "Introduction to Calculus", completed: true },
        { id: 2, title: "Derivatives and Applications", completed: true },
        { id: 3, title: "Integration Techniques", completed: false },
        { id: 4, title: "Differential Equations", completed: false },
      ]
    } else {
      return [
        { id: 1, title: "Week 1: Fundamentals", completed: true },
        { id: 2, title: "Week 2: Advanced Concepts", completed: true },
        { id: 3, title: "Week 3: Problem Solving", completed: false },
        { id: 4, title: "Week 4: Applications", completed: false },
      ]
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Good morning, John!</h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Button className="gap-2">
              <Calendar className="w-4 h-4" />
              Export Calendar
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Today\'s Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today\'s Tasks */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Clock className="w-5 h-5" />
                    Today's Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todaysTasks.map((task) => {
                    const assignment = getDummyTaskById(task.id)
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-3 h-3 rounded-full ${getTaskTypeColor(task.type)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-card-foreground">{task.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {task.course}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {task.points} pts
                            </Badge>
                            {assignment?.description && (
                              <AiCommentChip taskId={task.id} assignmentText={assignment.description} />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Due: {task.dueTime}</p>
                        </div>
                        {task.status === "submitted" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Link href={`/task/${task.id}#submission`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Upload className="w-4 h-4" />
                              Submit
                            </Button>
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* AI Assistant */}
            <div>
              <AIAssistant />
            </div>
          </div>

          {/* Course Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Your Courses</h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "topics" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("topics")}
                >
                  Topics View
                </Button>
                <Button
                  variant={viewMode === "weeks" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("weeks")}
                >
                  Weeks View
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => {
                const Icon = course.icon
                const isOpen = openDropdowns[course.id]
                const viewContent = getViewContent(course)

                return (
                  <div key={course.id} className="space-y-2">
                    <Link href={`/course/${course.id}`}>
                      <Card className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-10 h-10 rounded-lg ${course.color} flex items-center justify-center flex-shrink-0`}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-card-foreground truncate">{course.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {course.code} • Grade: {course.grade}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="text-card-foreground">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />

                            <div className="flex justify-between items-center text-sm pt-2">
                              <span className="text-muted-foreground">{course.assignments} assignments</span>
                              <span className="text-muted-foreground">{course.nextClass}</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2 capitalize">{viewMode}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {viewContent.map((item) => (
                                <div
                                  key={item.id}
                                  className={`p-2 rounded-md text-xs flex items-center gap-2 ${
                                    item.completed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${item.completed ? "bg-green-500" : "bg-gray-400"}`}
                                  />
                                  {item.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleDropdown(course.id)
                      }}
                      className="p-1"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </Button>

                    {isOpen && (
                      <Card className="bg-card border-border">
                        <CardContent className="p-4 space-y-4">
                          <div>
                            <h4 className="font-medium text-card-foreground mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Course Description
                            </h4>
                            <p className="text-sm text-muted-foreground">{course.description}</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-card-foreground mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Materials
                            </h4>
                            <ul className="space-y-1">
                              {course.materials.map((material, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                  {material}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-card-foreground mb-2 flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              Assignment Submission
                            </h4>
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Add assignment notes or comments..."
                                className="min-h-[80px] text-sm"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                                  <Upload className="w-3 h-3" />
                                  Upload File
                                </Button>
                                <Button size="sm">Submit Assignment</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    async function bootstrap() {
      try {
        // 1) If we already have an access token in sessionStorage, we are good.
        const existing = typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null
        if (existing) {
          if (mounted) setReady(true)
          return
        }
        // 2) Otherwise try to refresh using the backend refresh cookie
        const res = await fetch(`/api/auth/refresh`, { method: "POST", credentials: "include" })
        if (!res.ok) throw new Error("Refresh failed")
        const data = await res.json().catch(() => ({}))
        if (!data?.access_token) throw new Error("No access token returned")
        try { sessionStorage.setItem("access_token", data.access_token) } catch {}
        if (mounted) setReady(true)
      } catch (e) {
        router.replace("/login")
      }
    }
    bootstrap()
    return () => { mounted = false }
  }, [router])

  if (!ready) return null
  return <DashboardUI />
}
