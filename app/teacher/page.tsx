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

type DisplayTask = TaskOut & {
  course_name?: string
  course_code?: string
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

const teacherTaskSamples: DisplayTask[] = [
  {
    id: "sample-precalc-functions",
    course_id: "sample-precalc",
    title: "函數與圖形練習講義",
    type: "assignment",
    due_date: "週四",
    due_time: "10:00 AM",
    points: 30,
    ai_comment: "基礎概念掌握度分散，建議課前小測",
    course_name: "Precalculus",
    course_code: "MATH 201",
  },
  {
    id: "sample-apcalc-series",
    course_id: "sample-apcalc",
    title: "泰勒級數重點講義",
    type: "assignment",
    due_date: "週五",
    due_time: "2:30 PM",
    points: 40,
    ai_comment: "往年此單元錯誤率偏高，建議補充例題",
    course_name: "AP Calculus BC",
    course_code: "AP CALC BC",
  },
  {
    id: "sample-apcalc-ftc",
    course_id: "sample-apcalc",
    title: "微積分基本定理例題解析",
    type: "project",
    due_date: "下週一",
    due_time: "9:00 AM",
    points: 25,
    ai_comment: "建議提供分段練習，降低一次性負擔",
    course_name: "AP Calculus BC",
    course_code: "AP CALC BC",
  },
] as const

const courseShowcaseSamples = [
  {
    scheduleKey: "adv-math-101",
    id: "precalc-spotlight",
    name: "Precalculus",
    code: "MATH 201",
    grade: "B+",
    progress: 68,
    assignments: 2,
    nextClass: "Today, 10:00 AM",
    color: "bg-blue-500",
    icon: Calculator,
    topics: [
      { title: "Functions & Graphs", completed: true },
      { title: "Trigonometric Basics", completed: true },
      { title: "Algebraic Manipulation", completed: false },
      { title: "Intro to Limits", completed: false },
    ],
  },
  {
    scheduleKey: "calculus-101",
    id: "ap-calc-bc-spotlight",
    name: "AP Calculus BC",
    code: "AP CALC BC",
    grade: "A-",
    progress: 76,
    assignments: 3,
    nextClass: "Tomorrow, 2:15 PM",
    color: "bg-indigo-500",
    icon: Calculator,
    topics: [
      { title: "Limits & Continuity", completed: true },
      { title: "Derivatives", completed: true },
      { title: "Integrals & FTC", completed: false },
      { title: "Series (Taylor/Maclaurin)", completed: false },
    ],
  },
] as const

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
  const spotlightLookup = useMemo(
    () => new Map(courseShowcaseSamples.map((sample) => [sample.scheduleKey, sample])),
    [],
  )
  const displayTasks: DisplayTask[] = tasks.length > 0 ? tasks : teacherTaskSamples
  const showingSamples = tasks.length === 0

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
                  {!loading && showingSamples && (
                    <div className="text-xs text-muted-foreground">
                      以下為樣例任務，等待後端資料接入時可立即替換。
                    </div>
                  )}
                  {displayTasks.map((task, idx) => {
                    const course = courseLookup.get(task.course_id)
                    const fallbackLabel = task.course_name
                      ? `${task.course_name}${task.course_code ? ` (${task.course_code})` : ""}`
                      : "未指定課程"
                    const courseLabel = course ? `${course.name}${course.code ? ` (${course.code})` : ""}` : fallbackLabel
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
                <p className="text-sm text-muted-foreground">結合排程與課程洞察，快速檢視進度與主題。</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {teacherSchedule.map((cls) => {
                    const Icon = cls.icon
                    const matched = (courses || []).find((c) => {
                      try {
                        return cls.match(c as CourseOut)
                      } catch {
                        return false
                      }
                    })
                    const snapshot = spotlightLookup.get(cls.key)
                    const displayName = matched?.name ?? snapshot?.name ?? cls.title
                    const displayCode = matched?.code ?? snapshot?.code ?? ""
                    const displayGrade = matched?.grade ?? snapshot?.grade ?? "—"
                    const progressValue = matched?.progress ?? snapshot?.progress ?? 0
                    const assignments = matched?.assignments ?? snapshot?.assignments ?? 0
                    const nextClass = matched?.next_class ?? snapshot?.nextClass ?? cls.time
                    const topics =
                      snapshot?.topics ??
                      [
                        { title: "Lesson tailoring", completed: true },
                        { title: "Assessment prep", completed: false },
                      ]
                    return (
                      <Card key={cls.key} className="bg-card border-border rounded-3xl shadow-sm">
                        <CardContent className="p-5 space-y-5">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl ${cls.color} flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-card-foreground">{displayName}</div>
                                <p className="text-sm text-muted-foreground">
                                  {displayCode ? `${displayCode} • ` : ""}
                                  Grade: {displayGrade}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 justify-end">
                                <Calendar className="w-3 h-3" />
                                {cls.time}
                              </div>
                              <div className="text-xs">地點：{cls.room}</div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                              <span>Progress</span>
                              <span className="font-semibold text-foreground">{progressValue}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-indigo-400"
                                style={{ width: `${progressValue}%` }}
                              />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                              <span>{assignments} assignments</span>
                              <span>{nextClass}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-card-foreground">Topics</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {topics.map((topic) => (
                                <div
                                  key={topic.title}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm ${
                                    topic.completed
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      topic.completed ? "bg-emerald-500" : "bg-muted-foreground/50"
                                    }`}
                                  />
                                  {topic.title}
                                </div>
                              ))}
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
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Your Courses section removed as requested */}
          </div>
        </div>
      </div>
    </div>
  )
}
