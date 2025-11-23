"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardSignature,
  GraduationCap,
  MessageSquare,
  Sparkles,
} from "lucide-react"

interface TeacherSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

const teachingCourses = [
  {
    id: "precalc",
    name: "Precalculus",
    code: "MATH 201",
    nextSession: "Today · 10:00 AM",
    location: "Room 201",
    iconBg: "bg-blue-500",
  },
  {
    id: "ap-calc",
    name: "AP Calculus BC",
    code: "AP CALC BC",
    nextSession: "Tomorrow · 2:15 PM",
    location: "Room 305",
    iconBg: "bg-indigo-500",
  },
]

const quickActions = [
  { label: "Create Assignment", icon: ClipboardSignature, href: "/teacher/task/new" },
  { label: "Upload Lesson", icon: BookOpen, href: "/teacher/content" },
  { label: "Send Announcement", icon: MessageSquare, href: "/teacher/announcements" },
]

const facultyResources = [
  { label: "Rubrics & Templates", href: "/teacher/resources/rubrics" },
  { label: "AI Prompt Library", href: "/teacher/resources/prompts" },
  { label: "Staff Directory", href: "/teacher/staff" },
]

export function TeacherSidebar({ collapsed, onToggle }: TeacherSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isControlled = typeof collapsed === "boolean"
  const isCollapsed = isControlled ? !!collapsed : internalCollapsed

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    }
    if (!isControlled) {
      setInternalCollapsed((prev) => !prev)
    }
  }

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${isCollapsed ? "w-16" : "w-72"} flex flex-col sticky top-0 h-screen`}
    >
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/teacher" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sidebar-foreground">Beijing Etown Academy</div>
                <p className="text-xs text-muted-foreground">Faculty Console</p>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        <section>
          {!isCollapsed && <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">Teaching Today</h3>}
          <div className="space-y-2">
            {teachingCourses.map((course) => (
              <Link key={course.id} href={`/teacher/course/${course.id}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${isCollapsed ? "px-2" : "px-3"} ${isCollapsed ? "items-center" : "items-start"} gap-3`}
                >
                  <div className={`w-8 h-8 rounded-lg ${course.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  {!isCollapsed && (
                    <div className="text-left min-w-0 space-y-0.5">
                      <div className="text-sm font-semibold truncate">{course.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{course.code}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="truncate">{course.nextSession}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{course.location}</div>
                    </div>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </section>

        <section>
          {!isCollapsed && <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">Quick Actions</h3>}
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="secondary"
                    className={`w-full justify-start bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent ${isCollapsed ? "px-2" : "px-3"} gap-2`}
                  >
                    <Icon className="w-4 h-4" />
                    {!isCollapsed && <span className="text-sm">{action.label}</span>}
                  </Button>
                </Link>
              )
            })}
          </div>
        </section>

        <section>
          {!isCollapsed && <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">Resources</h3>}
          <div className="space-y-2">
            {facultyResources.map((resource) => (
              <Link key={resource.label} href={resource.href}>
                <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent gap-2">
                  <BookOpen className="w-4 h-4" />
                  {!isCollapsed && <span className="text-sm">{resource.label}</span>}
                </Button>
              </Link>
            ))}
          </div>
        </section>

        {!isCollapsed && (
          <section className="rounded-2xl border border-sidebar-border bg-sidebar-accent/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground">
              <Sparkles className="w-4 h-4" /> AI Highlights
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              2 classes flagged for follow-up. Review student insights before tomorrow’s sessions.
            </p>
            <Link href="#student-insights">
              <Button size="sm" className="w-full bg-primary text-primary-foreground">
                View insights
              </Button>
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
