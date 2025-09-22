"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { AIAssistant } from "@/components/ai-assistant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Upload, Sparkles, Users, BookOpen, Calculator } from "lucide-react"

// Types aligned with backend CourseOut / TaskOut
interface CourseOut {
  id: string
  code: string
  name: string
  description?: string
  color?: string
  icon?: string
  grade?: string
  progress?: number
  next_class?: string
  assignments?: number
}

interface TaskOut {
  id: string
  course_id: string
  title: string
  type: string
  due_date?: string
  due_time?: string
  status?: string
  points?: number
  ai_comment?: string
}

const iconMap: Record<string, any> = {
  Calculator: BookOpen, // fallback icons for teacher cards
  Atom: BookOpen,
  Code: BookOpen,
  Globe: BookOpen,
}

// Static class schedule for the teacher (written dead as requested)
const teacherSchedule = [
  {
    key: "adv-math-101",
    title: "Advanced Mathematics 101",
    time: "Mon 09:00–10:30",
    room: "Room 201",
    icon: Calculator,
    color: "bg-blue-500",
    // optional attempt to link to an existing course by best-effort matching at render time
    match: (c: CourseOut) => (c.name?.toLowerCase().includes("math") || c.code?.toUpperCase().includes("MATH")),
  },
  {
    key: "calculus-101",
    title: "Calculus 101",
    time: "Wed 14:00–15:30",
    room: "Room 305",
    icon: Calculator,
    color: "bg-indigo-500",
    match: (c: CourseOut) => (c.name?.includes("Calculus") || c.name?.includes("微積分")),
  },
] as const

export default function TeacherDashboardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [courses, setCourses] = useState<CourseOut[]>([])
  const [tasks, setTasks] = useState<TaskOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function ensureAuth() {
      try {
        const token = sessionStorage.getItem("access_token")
        if (!token) {
          const r = await fetch(`/api/auth/refresh`, { method: "POST", credentials: "include" })
          if (r.ok) {
            const { access_token } = await r.json()
            sessionStorage.setItem("access_token", access_token)
            setReady(true)
          } else {
            router.replace("/login")
            return
          }
        } else {
          setReady(true)
        }
      } catch {
        router.replace("/login")
      }
    }
    ensureAuth()
  }, [router])

  useEffect(() => {
    if (!ready) return
    async function fetchAll() {
      try {
        setLoading(true)
        const token = sessionStorage.getItem("access_token") || ""
        // Courses
        let res = await fetch(`/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
        if (res.status === 401) {
          const r = await fetch(`/api/auth/refresh`, { method: "POST", credentials: "include" })
          if (r.ok) {
            const { access_token } = await r.json()
            sessionStorage.setItem("access_token", access_token)
            res = await fetch(`/api/courses`, {
              headers: { Authorization: `Bearer ${access_token}` },
              credentials: "include",
            })
          } else {
            router.replace("/login")
            return
          }
        }
        const coursesData: unknown = await res.json().catch(() => null)
        setCourses(Array.isArray(coursesData) ? (coursesData as CourseOut[]) : [])

        // Today's teaching tasks (reuse today tasks API)
        let res2 = await fetch(`/api/tasks/today`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
          credentials: "include",
        })
        if (res2.status === 401) {
          const r = await fetch(`/api/auth/refresh`, { method: "POST", credentials: "include" })
          if (r.ok) {
            const { access_token } = await r.json()
            sessionStorage.setItem("access_token", access_token)
            res2 = await fetch(`/api/tasks/today`, {
              headers: { Authorization: `Bearer ${access_token}` },
              credentials: "include",
            })
          } else {
            router.replace("/login")
            return
          }
        }
        const tasksData: unknown = await res2.json().catch(() => null)
        setTasks(Array.isArray(tasksData) ? (tasksData as TaskOut[]) : [])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [ready, router])

  if (!ready) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} courseBase="teacher/course" />
        <div className="flex-1">
          <Navbar />

          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Hello, Maria</h1>
              <p className="text-muted-foreground">Here’s your teaching overview.</p>
            </div>

            {/* Course Selection + AI Assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Your Courses</CardTitle>
                    <p className="text-sm text-muted-foreground">Select the classes you teach and jump in quickly.</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {teacherSchedule.map((cls) => {
                      const Icon = cls.icon
                      const matched = (courses || []).find((c) => {
                        try { return cls.match(c as CourseOut) } catch { return false }
                      })
                      return (
                        <div key={cls.key} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            {/* checkbox removed as requested */}
                            <div className={`w-10 h-10 rounded-md ${cls.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium">{cls.title}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> {cls.time}
                                <span>•</span>
                                <span>{cls.room}</span>
                              </div>
                            </div>
                          </div>
                          {matched ? (
                            <Link href={`/teacher/course/${matched.id}`}>
                              <Button size="sm" className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Enter course</Button>
                            </Link>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Enter course</Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              <div className="lg:col-span-1">
                <AIAssistant />
              </div>
            </div>

            {/* My Classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {(Array.isArray(courses) ? courses : []).map((course) => {
                const Icon = iconMap[course.icon ?? ""] || BookOpen
                return (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-semibold truncate">
                        {course.name} <span className="text-sm text-muted-foreground">({course.code})</span>
                      </CardTitle>
                      <div className={`w-9 h-9 rounded-lg ${course.color || "bg-primary"} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-muted-foreground">Next class</div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4" /> {course.next_class || "—"}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{course.progress ?? 0}%</span>
                        </div>
                        <Progress value={course.progress ?? 0} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Assignments: {course.assignments ?? 0}</Badge>
                        {course.grade && <Badge className="bg-emerald-500/15 text-emerald-500">Avg Grade {course.grade}</Badge>}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <Link href={`/teacher/course/${course.id}`} className="text-primary text-sm hover:underline">Open course</Link>
                        <Button size="sm" variant="outline">Manage</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Today’s Teaching Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Today’s Teaching Tasks</CardTitle>
                  <p className="text-sm text-muted-foreground">Things that may need your attention today.</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="text-xs text-muted-foreground capitalize">{task.type} • {task.points ?? 0} pts</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due {task.due_date || ""} {task.due_time || ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.ai_comment && (
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <Sparkles className="w-3 h-3" /> {task.ai_comment}
                          </Badge>
                        )}
                        <Link href={`/teacher/course/${task.course_id}`}>
                          <Button size="sm" className="flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && !loading && (
                    <div className="text-sm text-muted-foreground">No tasks for today.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
