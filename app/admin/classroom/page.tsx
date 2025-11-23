"use client"

import { useState } from "react"
import Link from "next/link"
import { TeacherSidebar } from "@/components/sidebar-teacher"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Lock,
  PlusCircle,
  Sparkles,
  Upload,
} from "lucide-react"

const rosterSeed = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Active",
    focus: "Needs stoichiometry reps",
    aiNote: "High overlap with vault exam",
    progress: 76,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "Invited",
    focus: "Awaiting onboarding",
    aiNote: "Send primer set",
    progress: 10,
  },
  {
    id: "3",
    name: "Peter Jones",
    email: "peter.jones@example.com",
    status: "Active",
    focus: "Quiz-ready",
    aiNote: "Aligned with 2023 Quiz Bank",
    progress: 88,
  },
]

const examArchive = [
  {
    id: "mid-2023",
    title: "Midterm · Fall 2023",
    coverage: "Ch.1-6 · atoms, stoichiometry, gas laws",
    lastSync: "3 days ago",
    status: "Indexed",
    aiTag: "High overlap",
  },
  {
    id: "quiz-bank",
    title: "Quiz Bank · Section A",
    coverage: "Atomic structure, bonding models",
    lastSync: "1 hour ago",
    status: "In queue",
    aiTag: "Practice heavy",
  },
  {
    id: "final-2022",
    title: "Final · Spring 2022",
    coverage: "Thermochemistry & solutions",
    lastSync: "2 months ago",
    status: "Archive",
    aiTag: "Reference",
  },
]

const aiInterventions = [
  {
    title: "Push practice set",
    detail: "Auto-generated from Midterm · Fall 2023 overlap report.",
    status: "Queued for 8 students",
  },
  {
    title: "Lock outdated item",
    detail: "Final · Spring 2022 excluded from AI comments until updated.",
    status: "Complete",
  },
  {
    title: "Request new upload",
    detail: "Missing 2024 quizzes. Ask instructor to drop PDF into vault.",
    status: "Action needed",
  },
]

export default function AdminClassroomPage() {
  const [students] = useState(rosterSeed)
  const [open, setOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <TeacherSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 lg:p-8 space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Lock className="h-3 w-3" />
                Hidden classroom controls
              </div>
              <h1 className="mt-2 text-3xl font-bold">Classroom Console</h1>
              <p className="text-muted-foreground">
                Manage rosters and the hidden exam archive that powers AI comments for this course.
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add new student</DialogTitle>
                    <DialogDescription>Onboard a student into this classroom roster.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" className="col-span-3" placeholder="Student name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input id="email" type="email" className="col-span-3" placeholder="name@email.com" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create and invite</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload exam to vault
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Active students</p>
                <p className="text-2xl font-bold">22</p>
                <p className="text-xs text-muted-foreground">+3 pending invites</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Hidden exam docs</p>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Indexed for AI comments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">AI alerts</p>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Overlap + missing uploads</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Assignments covered</p>
                <p className="text-2xl font-bold">86%</p>
                <p className="text-xs text-muted-foreground">By past exams + textbook</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">Hidden exam archive</CardTitle>
                  <CardDescription>Private to admins; fuels AI comment generation for this classroom.</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Add PDF
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {examArchive.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-lg border border-border/80 bg-card/50 p-4 md:flex-row md:items-center md:gap-6"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold leading-tight">{item.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {item.aiTag}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.coverage}</p>
                      <p className="text-xs text-muted-foreground">Last sync: {item.lastSync}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          item.status === "Indexed"
                            ? "default"
                            : item.status === "In queue"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {item.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">AI coverage actions</CardTitle>
                <CardDescription>Keep comments grounded and specific.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInterventions.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-border/80 bg-muted/40 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold leading-tight">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                      <Badge variant={item.status === "Action needed" ? "destructive" : "outline"}>{item.status}</Badge>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" className="w-full justify-between">
                  Sync vault now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl">Roster</CardTitle>
                  <CardDescription>Students attached to this classroom with AI notes.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-2" asChild>
                  <Link href="/teacher">
                    <Sparkles className="h-4 w-4" />
                    Push AI comment
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AI focus</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div>{student.name}</div>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === "Active" ? "default" : "secondary"}>{student.status}</Badge>
                        </TableCell>
                        <TableCell className="max-w-sm">
                          <div className="text-sm text-foreground">{student.focus}</div>
                          <p className="text-xs text-muted-foreground">{student.aiNote}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={student.progress} className="w-32" />
                            <span className="text-xs text-muted-foreground">{student.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Flag
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Access & invites</CardTitle>
                <CardDescription>Keep the classroom private while onboarding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-sm font-semibold">Pending invites</p>
                  <p className="text-xs text-muted-foreground">3 invites waiting to be accepted.</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-sm font-semibold">Vault visibility</p>
                  <p className="text-xs text-muted-foreground">Only admins can read past exam files.</p>
                </div>
                <Button variant="outline" className="w-full justify-between">
                  Manage access
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
