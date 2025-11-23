"use client"

import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AiCommentChip } from "@/components/ai-comment-chip"
import { getDummyTaskById } from "@/data/dummy-tasks"
import { chemistryPdf } from "@/lib/chemistry"
import {
  Clock,
  BookOpen,
  CheckCircle,
  User,
  Mail,
  Phone,
  Video,
  FileText,
  Download,
  MessageSquare,
  BarChart3,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
  Upload,
  Calendar,
  Grid3X3,
  FlaskConical,
} from "lucide-react"

// --- Unified Dummy Data for the Course Page ---
const coursePageData = {
  id: 1,
  name: "General Chemistry",
  code: "CHEM 101",
  semester: "Fall 2024",
  credits: 3,
  description: "Introduction to atomic structure, chemical bonding, stoichiometry, and thermochemistry with laboratory applications.",
  professor: {
    name: "Dr. Emily Zhang",
    email: "e.zhang@university.edu",
    phone: "+1 (555) 123-4567",
    office: "Science Building, Room 310",
    officeHours: "Tue/Thu 3-5 PM",
    zoomLink: "https://zoom.us/j/123456789",
    avatar: "/placeholder.svg?height=64&width=64",
  },
  upcomingTasks: [
    /* Stoichiometry Problem Set removed */
    {
      id: 2,
      title: "Chemistry Midterm Exam",
      type: "exam",
      dueDate: "2024-03-18",
      dueTime: "10:00 AM",
      status: "upcoming",
      points: 200,
    },
    {
      id: 3,
      title: "Redox Reactions Assignment",
      type: "assignment",
      dueDate: "2024-03-25",
      dueTime: "11:59 PM",
      status: "upcoming",
      points: 80,
    },
  ],
  modulesByTopic: [
    {
      id: 1,
      title: "Atomic Structure and Periodicity",
      progress: 100,
      lessons: 8,
      completed: 8,
      status: "completed",
      description: "Structure of atoms, electron configuration, and periodic properties of elements.",
      materials: ["General Chemistry Textbook Ch. 1-3", "Periodic Table", "Atomic Models Slides"],
      assignments: ["Atomic Structure Homework", "Quiz: Periodic Trends"],
    },
    {
      id: 2,
      title: "Chemical Bonding and Molecular Geometry",
      progress: 75,
      lessons: 6,
      completed: 4,
      status: "in-progress",
      description: "How atoms bond, molecular shapes, and how structure relates to properties.",
      materials: ["Bonding Textbook Ch. 6-8", "Molecular Geometry Kit Guide", "Practice Problems"],
      assignments: ["Lewis Structures Assignment", "Chemical Bonding Quiz"],
    },
    {
      id: 3,
      title: "States of Matter and Intermolecular Forces",
      progress: 30,
      lessons: 10,
      completed: 3,
      status: "in-progress",
      description: "Behavior of gases, liquids, and solids with focus on intermolecular forces.",
      materials: ["States of Matter Notes", "IMF Comparison Chart", "Problem Sets"],
      assignments: ["States of Matter Quiz", "Intermolecular Forces Worksheet"],
    },
    {
      id: 4,
      title: "Thermochemistry and Chemical Reactions",
      progress: 0,
      lessons: 8,
      completed: 0,
      status: "locked",
      description: "Energy changes in chemical reactions and thermochemical calculations.",
      materials: ["Thermochemistry Textbook Ch. 9-10", "Calorimetry Lab Handout", "Sample Calculations"],
      assignments: ["Thermochemistry Problem Set", "Gas Laws Worksheet"],
    },
  ],
  modulesByWeek: [
    {
      id: 1,
      week: "Week 1-2",
      title: "Introduction to Atomic Structure",
      progress: 100,
      lessons: 8,
      completed: 8,
      status: "completed",
      description: "Fundamental concepts of atoms, isotopes, and the periodic table. Learn how elements are organized.",
      materials: ["Lecture Notes 1-2", "Video: Atomic Models", "Practice Problems Set A"],
      assignments: ["Atomic Structure Homework", "Quiz: Periodic Trends"],
    },
    {
      id: 2,
      week: "Week 3-4",
      title: "Moles, Stoichiometry, and Reactions",
      progress: 75,
      lessons: 6,
      completed: 4,
      status: "in-progress",
      description: "Mole concept, balancing equations, and yield calculations in chemical reactions.",
      materials: ["Lecture Notes 3-4", "Stoichiometry Guide", "Limiting Reagent Tutorial"],
      assignments: ["Lab Report: Reaction Yield"],
    },
    {
      id: 3,
      week: "Week 5-6",
      title: "Chemical Bonding and Molecular Geometry",
      progress: 30,
      lessons: 10,
      completed: 3,
      status: "in-progress",
      description: "Ionic, covalent, and metallic bonding; VSEPR shapes and polarity.",
      materials: ["Bonding Textbook Ch. 6-8", "Molecular Geometry Models", "Practice Worksheets"],
      assignments: ["Chemical Bonding Quiz", "Lewis Structures Assignment"],
    },
    {
      id: 4,
      week: "Week 7-8",
      title: "Gases, Thermochemistry, and Solutions",
      progress: 0,
      lessons: 8,
      completed: 0,
      status: "locked",
      description: "Gas laws, enthalpy changes, calorimetry, and solution concentrations with lab applications.",
      materials: ["Gas Laws Notes", "Thermochemistry Lab Manual", "Solution Molarity Practice"],
      assignments: ["Gas Laws Worksheet", "Thermochemistry Lab Report"],
    },
  ],
  resources: [
    {
      id: 1,
      name: "CHEM 101 Syllabus",
      type: "pdf",
      size: "2.0 MB",
    },
    {
      id: 2,
      name: "General Chemistry Textbook",
      type: "pdf",
      size: "48.0 MB",
      href: chemistryPdf("textbook.pdf"),
    },
    {
      id: 3,
      name: "Midterm Exam Archive (Form A)",
      type: "pdf",
      size: "1.8 MB",
      href: chemistryPdf("Midterm-Exam.pdf"),
    },
    {
      id: 4,
      name: "Final Exam Archive",
      type: "pdf",
      size: "2.2 MB",
      href: chemistryPdf("Final-Exam.pdf"),
    },
    {
      id: 5,
      name: "Quiz 1 – Atomic Structure",
      type: "pdf",
      size: "0.8 MB",
      href: chemistryPdf("Quiz 1.pdf"),
    },
    {
      id: 6,
      name: "Quiz 2 – Stoichiometry",
      type: "pdf",
      size: "0.9 MB",
      href: chemistryPdf("Quiz 2.pdf"),
    },
    {
      id: 7,
      name: "Quiz 3 – Bonding Models",
      type: "pdf",
      size: "0.9 MB",
      href: chemistryPdf("Quiz 3.pdf"),
    },
    {
      id: 8,
      name: "Quiz 4 – States of Matter",
      type: "pdf",
      size: "0.9 MB",
      href: chemistryPdf("Quiz 4.pdf"),
    },
    {
      id: 9,
      name: "Quiz 5 – Thermochemistry",
      type: "pdf",
      size: "1.0 MB",
      href: chemistryPdf("Quiz 5.pdf"),
    },
  ],
  attendance: {
    warning: "You can only skip 5 more classes to not lose 10% of your GPA",
    records: [
      { date: "2024-03-01", status: "present" },
      { date: "2024-03-04", status: "present" },
      { date: "2024-03-06", status: "absent" },
      { date: "2024-03-08", status: "present" },
      { date: "2024-03-11", status: "present" },
      { date: "2024-03-13", status: "late" },
    ],
  },
  grades: {
    overall: 0, // Will be calculated
    breakdown: [
      /* Stoichiometry Problem Set grade removed */
      { assignment: "Atomic Structure Homework", score: 88, total: 100, weight: "10%" },
      { assignment: "Quiz: Chemical Bonding", score: 42, total: 50, weight: "5%" },
      { assignment: "Gas Laws Worksheet", score: 92, total: 100, weight: "10%" },
      { assignment: "Midterm Exam", score: null, total: 200, weight: "25%" },
    ],
  },
  discussions: [
    {
      id: 1,
      title: "Question about Integration by Parts",
      author: "Alex Chen",
      replies: 3,
      lastActivity: "2 hours ago",
      isAnswered: true,
    },
    {
      id: 2,
      title: "Study Group for Midterm",
      author: "Maria Rodriguez",
      replies: 8,
      lastActivity: "5 hours ago",
      isAnswered: false,
    },
    {
      id: 3,
      title: "Clarification on Problem Set #7",
      author: "John Smith",
      replies: 1,
      lastActivity: "1 day ago",
      isAnswered: true,
    },
  ],
}
// --- End of Dummy Data ---

export default function CoursePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<"topics" | "weeks">("topics")
  const [expandedModules, setExpandedModules] = useState<number[]>([])

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "assignment":
        return "bg-blue-500"
      case "exam":
        return "bg-red-500"
      case "quiz":
        return "bg-green-500"
      case "project":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500"
      case "absent":
        return "bg-red-500"
      case "late":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const calculateOverallGrade = () => {
    const completedGrades = coursePageData.grades.breakdown.filter((g) => g.score !== null)
    if (completedGrades.length === 0) return 0
    const totalPoints = completedGrades.reduce((sum, g) => sum + (g.score || 0), 0)
    const maxPoints = completedGrades.reduce((sum, g) => sum + g.total, 0)
    return Math.round((totalPoints / maxPoints) * 100)
  }

  const toggleModuleDropdown = (moduleId: number) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const currentModules = viewMode === "topics" ? coursePageData.modulesByTopic : coursePageData.modulesByWeek

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-6">
          {/* Course Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{coursePageData.name}</h1>
                <p className="text-muted-foreground">
                  {coursePageData.code} • {coursePageData.semester} • {coursePageData.credits} Credits
                </p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">{coursePageData.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Upcoming Tasks */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Clock className="w-5 h-5" />
                    Upcoming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coursePageData.upcomingTasks.map((task) => {
                    const assignment = getDummyTaskById(task.id)
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-3 h-3 rounded-full ${getTaskTypeColor(task.type)}`} />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/task/${task.id}`} className="hover:underline">
                              <span className="font-medium text-card-foreground cursor-pointer">{task.title}</span>
                            </Link>
                            <Badge variant="outline" className="text-xs capitalize">
                              {task.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {task.points} pts
                            </Badge>
                            {assignment?.description && (
                              <AiCommentChip taskId={task.id} assignmentText={assignment.description} />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()} at {task.dueTime}
                          </p>
                        </div>
                        {task.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Link href={`/task/${task.id}#submission`}>
                            <Upload className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-600" />
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Course Modules */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <BookOpen className="w-5 h-5" />
                      Course Modules
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "topics" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("topics")}
                        className="gap-2"
                      >
                        <Grid3X3 className="w-4 h-4" />
                        Topics View
                      </Button>
                      <Button
                        variant={viewMode === "weeks" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("weeks")}
                        className="gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Weeks View
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={viewMode === "topics" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                    {currentModules.map((module) => (
                      <div key={module.id} className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-card-foreground">
                            {viewMode === "weeks" && module.week ? `${module.week}: ${module.title}` : module.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                module.status === "completed"
                                  ? "default"
                                  : module.status === "in-progress"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {module.status === "completed"
                                ? "Completed"
                                : module.status === "in-progress"
                                  ? "In Progress"
                                  : "Locked"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleModuleDropdown(module.id)}
                              className="p-1 h-6 w-6"
                            >
                              {expandedModules.includes(module.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                {module.completed}/{module.lessons} lessons
                              </span>
                              <span className="text-card-foreground">{module.progress}%</span>
                            </div>
                            <Progress value={module.progress} className="h-2" />
                          </div>
                          <Button variant="outline" size="sm" disabled={module.status === "locked"}>
                            {module.status === "completed" ? "Review" : "Continue"}
                          </Button>
                        </div>

                        {expandedModules.includes(module.id) && (
                          <div className="mt-4 pt-4 border-t border-border space-y-4">
                            <div>
                              <h4 className="font-medium text-card-foreground mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-card-foreground mb-2">Materials</h4>
                              <div className="space-y-2">
                                {module.materials.map((material, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-card-foreground">{material}</span>
                                    <Button variant="ghost" size="sm" className="ml-auto p-1 h-6">
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-card-foreground mb-2">Assignments</h4>
                              <div className="space-y-3">
                                {module.assignments.map((assignment, index) => (
                                  <div key={index} className="p-3 bg-background rounded-lg border">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-card-foreground">{assignment}</span>
                                      <Badge variant="outline" className="text-xs">
                                        Due Soon
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                        <Upload className="w-3 h-3" />
                                        Submit
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        View Details
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Resources */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <FileText className="w-5 h-5" />
                    Course Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coursePageData.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <span className="font-medium text-card-foreground">{resource.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {resource.type.toUpperCase()} • {resource.size}
                        </p>
                      </div>
                      {resource.href && (
                        <Link href={resource.href} target="_blank">
                          <Button variant="outline" size="sm" asChild={false}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Discussion Forum */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <MessageSquare className="w-5 h-5" />
                    Discussion Forum
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coursePageData.discussions.map((discussion) => (
                    <div key={discussion.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-card-foreground">{discussion.title}</span>
                            {discussion.isAnswered && (
                              <Badge variant="default" className="text-xs">
                                Answered
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            by {discussion.author} • {discussion.replies} replies • {discussion.lastActivity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start New Discussion
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Professor Info */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <User className="w-5 h-5" />
                    Professor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={coursePageData.professor.avatar || "/placeholder.svg"}
                        alt={coursePageData.professor.name}
                      />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-card-foreground">{coursePageData.professor.name}</h3>
                      <p className="text-sm text-muted-foreground">Course Instructor</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-card-foreground">{coursePageData.professor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-card-foreground">{coursePageData.professor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-card-foreground">{coursePageData.professor.office}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-card-foreground">{coursePageData.professor.officeHours}</span>
                    </div>
                  </div>

                  <Button className="w-full gap-2">
                    <Video className="w-4 h-4" />
                    Join Office Hours
                  </Button>
                </CardContent>
              </Card>

              {/* Grades Overview */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <BarChart3 className="w-5 h-5" />
                    Grades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground">{calculateOverallGrade()}%</div>
                    <p className="text-sm text-muted-foreground">Overall Grade</p>
                  </div>

                  <div className="space-y-2">
                    {coursePageData.grades.breakdown.map((grade, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground truncate">{grade.assignment}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-card-foreground">
                            {grade.score !== null ? `${grade.score}/${grade.total}` : "Pending"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {grade.weight}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Attendance */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Users className="w-5 h-5" />
                    Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        {coursePageData.attendance.warning}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {coursePageData.attendance.records.map((record, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full ${getStatusColor(record.status)}`}
                        title={`${record.date}: ${record.status}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Present
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Late
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Absent
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
