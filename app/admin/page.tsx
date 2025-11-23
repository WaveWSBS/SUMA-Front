"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TeacherSidebar } from "@/components/sidebar-teacher"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Archive,
  ArrowRight,
  Database,
  FileText,
  Lock,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from "lucide-react"

const vaultEntries = [
  {
    id: "chem-midterm-23",
    name: "General Chemistry Midterm A",
    course: "CHEM 101",
    session: "Fall 2023",
    coverage: "Atomic structure, stoichiometry, gas laws",
    aiTag: "High overlap",
    lastUsed: "2 weeks ago",
    status: "Published",
  },
  {
    id: "calc-final-22",
    name: "Calculus Final Form B",
    course: "MATH 201",
    session: "Spring 2022",
    coverage: "Series, optimization, integrals",
    aiTag: "Balanced",
    lastUsed: "Nov 2023",
    status: "Ready",
  },
  {
    id: "bio-quizbank",
    name: "Biology Quiz Bank",
    course: "BIO 110",
    session: "Rolling",
    coverage: "Cell transport, enzymes, DNA",
    aiTag: "Practice heavy",
    lastUsed: "3 days ago",
    status: "Draft",
  },
]

const classroomHealth = [
  { name: "Chemistry 101 · Section A", students: 28, onTrack: 82, alerts: 2 },
  { name: "AP Calculus BC", students: 22, onTrack: 76, alerts: 3 },
  { name: "Physics Lab", students: 18, onTrack: 91, alerts: 0 },
]

const aiAlerts = [
  {
    title: "Exam overlap flagged",
    detail: "Chemistry Midterm A shares 78% items with this term's review set.",
    severity: "high",
  },
  {
    title: "Vault missing recent uploads",
    detail: "No 2024 quizzes for BIO 110. AI comments will rely on textbook only.",
    severity: "medium",
  },
  {
    title: "New archive synced",
    detail: "Calculus Final Form B re-indexed for AI comment generation.",
    severity: "low",
  },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <TeacherSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 lg:p-8 space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Lock className="h-3 w-3" /> Hidden exam vault controls
              </div>
              <h1 className="mt-2 text-3xl font-bold">Admin Control Center</h1>
              <p className="text-muted-foreground">
                Curate the private past-exam vault, classroom access, and the AI comment pipeline.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" asChild>
                <Link href="/admin/classroom">
                  <Users className="h-4 w-4" />
                  Classroom console
                </Link>
              </Button>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload past exam
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Past exam files</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-muted-foreground">Private vault indexed for AI</p>
                </div>
                <Database className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">AI comments served</p>
                  <p className="text-2xl font-bold">142</p>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
                <Sparkles className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active classrooms</p>
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-xs text-muted-foreground">Teacher-facing</p>
                </div>
                <ShieldCheck className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Alerts</p>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-muted-foreground">Sync, overlap, access</p>
                </div>
                  <Archive className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">Past Exam Vault</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Private repository feeding AI comment suggestions. Only administrators can see or swap files.
                  </p>
                </div>
                <Button size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add to vault
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {vaultEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-3 rounded-lg border border-border/80 bg-card/50 p-4 md:flex-row md:items-center md:gap-6"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold leading-tight">{entry.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {entry.session}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {entry.aiTag}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.course} · {entry.coverage}
                      </p>
                      <p className="text-xs text-muted-foreground">Last used {entry.lastUsed}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={entry.status === "Published" ? "default" : entry.status === "Ready" ? "secondary" : "outline"}>
                        {entry.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Classroom health</CardTitle>
                <p className="text-sm text-muted-foreground">Quick glance at roster load and AI alerts.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {classroomHealth.map((room) => (
                  <div key={room.name} className="rounded-lg border border-border/70 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold leading-tight">{room.name}</p>
                        <p className="text-xs text-muted-foreground">{room.students} students</p>
                      </div>
                      <Badge variant={room.alerts > 0 ? "destructive" : "secondary"}>
                        {room.alerts > 0 ? `${room.alerts} alerts` : "Clear"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">On-track rate</span>
                      <span className="font-semibold">{room.onTrack}%</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-2" asChild>
                        <Link href="/admin/classroom">
                          <ArrowRight className="h-4 w-4" />
                          Open classroom
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">AI comment stream</CardTitle>
                <p className="text-sm text-muted-foreground">
                  System-level alerts and sync notices tied to the hidden archive.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/40 p-4"
                  >
                    <div className="mt-0.5">
                      {alert.severity === "high" ? (
                        <Sparkles className="h-4 w-4 text-destructive" />
                      ) : alert.severity === "medium" ? (
                        <Sparkles className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold leading-tight">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quick actions</CardTitle>
                <p className="text-sm text-muted-foreground">Administrative routes you may need.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full justify-between">
                  Sync vault to AI
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Invite faculty reviewer
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Export audit log
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <div className="rounded-lg border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                  Need a new classroom? Use the console to set rosters, then drop exams into the vault to keep AI
                  comments grounded.
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
