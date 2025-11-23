"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TeacherSidebar } from "@/components/sidebar-teacher"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, PlusCircle } from "lucide-react"

// Type aligned with backend CourseOut
interface CourseOut {
  id: string
  code: string
  name: string
  description?: string
  color?: string
  icon?: string
}

export default function TeacherDashboardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [courses, setCourses] = useState<CourseOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function ensureAuth() {
      const token = sessionStorage.getItem("access_token")
      if (!token) {
        router.replace("/login")
      } else {
        setReady(true)
      }
    }
    ensureAuth()
  }, [router])

  useEffect(() => {
    if (!ready) return
    async function fetchCourses() {
      try {
        setLoading(true)
        const token = sessionStorage.getItem("access_token")
        const response = await fetch(`/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 401) {
          router.replace("/login")
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch courses")
        }

        const data: CourseOut[] = await response.json()
        setCourses(data)
      } catch (error) {
        console.error("Error fetching courses:", error)
        // Optionally, handle error with a toast notification
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [ready, router])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <TeacherSidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Courses</h1>
              <p className="text-muted-foreground">Select a course to manage or create a new one.</p>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-[200px] animate-pulse bg-muted" />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <p className="text-muted-foreground">{course.code}</p>
                    <Link href={`/teacher/course/${course.id}`} passHref>
                      <Button className="w-full mt-4">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Manage Course
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
              <h2 className="text-xl font-semibold">No Courses Found</h2>
              <p className="text-muted-foreground mt-2 mb-4">
                It looks like you haven't created any courses yet.
              </p>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Course
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
