"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Upload, Users, Sparkles, FileText, BookOpen, Settings } from "lucide-react"

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

interface CourseDetailOut {
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
  tasks: TaskOut[]
}

export default function TeacherCoursePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [ready, setReady] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [course, setCourse] = useState<CourseDetailOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    async function fetchCourse() {
      try {
        setLoading(true)
        setError(null)
        const token = sessionStorage.getItem("access_token") || ""
        let res = await fetch(`/api/courses/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
        if (res.status === 401) {
          const r = await fetch(`/api/auth/refresh`, { method: "POST", credentials: "include" })
          if (r.ok) {
            const { access_token } = await r.json()
            sessionStorage.setItem("access_token", access_token)
            res = await fetch(`/api/courses/${params.id}`, {
              headers: { Authorization: `Bearer ${access_token}` },
              credentials: "include",
            })
          } else {
            router.replace("/login")
            return
          }
        }
        if (res.status === 404) {
          setError("Course not found")
          return
        }
        const data: CourseDetailOut = await res.json()
        setCourse(data)
      } catch (e: any) {
        setError(e?.message || "Failed to load course")
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [ready, params.id, router])

  if (!ready) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} courseBase="teacher/course" />
        <div className="flex-1">
          <Navbar />
          <div className="p-6">
            {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
            {error && !loading && <div className="text-sm text-destructive">{error}</div>}
            {course && (
              <>
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{course.name}</h1>
                    <div className="text-muted-foreground">{course.code}</div>
                    {course.description && <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{course.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Course Settings
                    </Button>
                    <Button size="sm" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Create Assignment
                    </Button>
                  </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-muted-foreground">Syllabus coverage</span>
                        <span className="font-medium">{course.progress ?? 0}%</span>
                      </div>
                      <Progress value={course.progress ?? 0} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Next class</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" /> {course.next_class || "—"}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Assignments</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {course.assignments ?? 0} active
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Upcoming / Pending Tasks */}
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <div className="w-full flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Upcoming & Pending</CardTitle>
                        <p className="text-sm text-muted-foreground">Assignments and exams for this course</p>
                      </div>
                      <Link href={`/teacher/course/${course.id}`} className="text-sm text-primary hover:underline">View all</Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.tasks?.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{t.title}</div>
                              <div className="text-xs text-muted-foreground capitalize">{t.type} • {t.points ?? 0} pts</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Due {t.due_date || ""} {t.due_time || ""}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {t.ai_comment && (
                              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                <Sparkles className="w-3 h-3" /> {t.ai_comment}
                              </Badge>
                            )}
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                              <Upload className="w-4 h-4" /> Grade
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!course.tasks || course.tasks.length === 0) && (
                        <div className="text-sm text-muted-foreground">No items.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* People (placeholder) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Instructors</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/teacher-avatar.png" alt="Teacher" />
                          <AvatarFallback>TC</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">You</div>
                          <div className="text-xs text-muted-foreground">Lead Instructor</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Students</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Student roster management coming soon.
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
