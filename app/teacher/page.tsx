"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { AIAssistant } from "@/components/ai-assistant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Upload, Sparkles, BookOpen, Calculator } from "lucide-react"

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

const taskTypeColorMap: Record<string, string> = {
  assignment: "bg-blue-500",
  lab: "bg-green-500",
  project: "bg-purple-500",
  quiz: "bg-orange-500",
  test: "bg-red-500",
  default: "bg-muted-foreground",
}

const aiInsightPool = [
  "往年同學此單元表現較差，建議提前複習",
  "課堂互動指標偏低，可安排討論活動",
  "建議提交補充講義，協助學生理解重點",
] as const

const getTaskColor = (type?: string) => taskTypeColorMap[type || ""] || taskTypeColorMap.default

const resolveInsight = (task: TaskOut, index: number) => task.ai_comment || aiInsightPool[index % aiInsightPool.length]

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
  const courseLookup = useMemo(
    () => new Map((courses || []).map((course) => [course.id, course])),
    [courses],
  )

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

          <div className="p-6 space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Hello, Maria</h1>
              <p className="text-muted-foreground">Here’s your teaching overview.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Clock className="w-5 h-5" />
                    Upcoming Teaching Tasks
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">預覽即將到來的教學任務並快速提交課件。</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading && (
                    <div className="space-y-3">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
                      ))}
                    </div>
                  )}
                  {!loading && tasks.length === 0 && (
                    <div className="text-sm text-muted-foreground">目前沒有接下來的教學任務。</div>
                  )}
                  {tasks.map((task, idx) => {
                    const course = courseLookup.get(task.course_id)
                    const courseLabel = course ? `${course.name}${course.code ? ` (${course.code})` : ""}` : "未指定課程"
                    const dueDisplay = [task.due_date, task.due_time].filter(Boolean).join(" ") || "待定"
                    const insight = resolveInsight(task, idx)
                    const courseLink = course ? `/teacher/course/${course.id}` : undefined
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-muted/40 border border-border"
                      >
                        <div className={`w-3 h-3 rounded-full ${getTaskColor(task.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-card-foreground">{task.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {courseLabel}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {task.points ?? 0} pts
                            </Badge>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40">
                              <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-200" />
                              <span className="text-xs text-purple-700 dark:text-purple-100">{insight}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> Due: {dueDisplay}
                          </p>
                        </div>
                        {courseLink ? (
                          <Link href={courseLink}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Upload className="w-4 h-4" />
                              提交課件
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-2" disabled>
                            <Upload className="w-4 h-4" />
                            提交課件
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
              <div className="lg:col-span-1">
                <AIAssistant />
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-1">
                <CardTitle className="text-xl">Teaching Schedule</CardTitle>
                <p className="text-sm text-muted-foreground">固定課程安排，方便快速進入課程管理。</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {teacherSchedule.map((cls) => {
                    const Icon = cls.icon
                    const matched = (courses || []).find((c) => {
                      try {
                        return cls.match(c as CourseOut)
                      } catch {
                        return false
                      }
                    })
                    return (
                      <div key={cls.key} className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-xl ${cls.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="space-y-1">
                            <div className="font-semibold">{cls.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {cls.time}
                            </div>
                            <div className="text-xs text-muted-foreground">地點：{cls.room}</div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          {matched ? (
                            <Link href={`/teacher/course/${matched.id}`}>
                              <Button size="sm" className="gap-2">
                                <BookOpen className="w-4 h-4" />
                                進入課程
                              </Button>
                            </Link>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="gap-2">
                              <BookOpen className="w-4 h-4" />
                              無對應課程
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Your Courses</h2>
                  <p className="text-sm text-muted-foreground">快速掌握每門課程的進度與工作量。</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(Array.isArray(courses) ? courses : []).map((course) => {
                  const Icon = iconMap[course.icon ?? ""] || BookOpen
                  return (
                    <Link key={course.id} href={`/teacher/course/${course.id}`} className="block">
                      <Card className="h-full bg-card border-border hover:bg-accent/40 transition-colors">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl ${course.color || "bg-primary"} flex items-center justify-center flex-shrink-0`}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-card-foreground truncate">{course.name}</div>
                              <p className="text-xs text-muted-foreground truncate">{course.code}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Next class</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {course.next_class || "待排程"}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1 text-xs">
                                <span>Progress</span>
                                <span className="font-semibold">{course.progress ?? 0}%</span>
                              </div>
                              <Progress value={course.progress ?? 0} />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Assignments: {course.assignments ?? 0}
                            </Badge>
                            {course.grade && (
                              <Badge className="text-xs bg-emerald-500/15 text-emerald-500">Avg Grade {course.grade}</Badge>
                            )}
                          </div>
                          {course.description && (
                            <p className="text-xs text-muted-foreground">{course.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
              {!loading && courses.length === 0 && (
                <div className="text-sm text-muted-foreground">尚未指派任何課程。</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
