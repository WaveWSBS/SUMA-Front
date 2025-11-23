import { chemistryPdf } from "@/lib/chemistry"

export interface TaskAttachment {
  id: number
  name: string
  size: string
  type: string
  uploadedBy: string
  href?: string
}

export interface DummyTask {
  id: number
  title: string
  course: string
  courseCode: string
  type: string
  dueDate: string
  dueTime: string
  points: number
  status: string
  description: string
  tags: string[]
  attachments: TaskAttachment[]
}

export const dummyTasks: DummyTask[] = [
  {
    id: 2,
    title: "Chemistry Midterm Exam",
    course: "Chemistry",
    courseCode: "CHEM 101",
    type: "exam",
    dueDate: "2024-03-18",
    dueTime: "10:00 AM",
    points: 200,
    status: "pending",
    description: `The midterm exam will cover all topics from the first half of the semester.

**Instructions:**
1. The exam is closed-book and closed-notes.
2. A periodic table and a list of constants will be provided.
3. You will have 90 minutes to complete the exam.
4. The exam consists of multiple-choice and free-response questions.
**Note:**
This is an in-person exam. Please arrive at the classroom 10 minutes early. Bring a pen, pencil, and calculator. All materials will be provided during the exam.`,
    tags: ["chemistry", "midterm", "Time Consuming"],
    attachments: [],
  },
  {
    id: 3,
    title: "Redox Reactions Assignment",
    course: "Chemistry",
    courseCode: "CHEM 101",
    type: "assignment",
    dueDate: "2024-03-25",
    dueTime: "11:59 PM",
    points: 80,
    status: "pending",
    description: `This assignment focuses on oxidation-reduction (redox) reactions, including determining oxidation states, balancing half-reactions, and identifying oxidizing and reducing agents.

**Instructions:**
1. Complete all problems in the attached homework sheet.
2. Show all your work, including:
   - Assignment of oxidation numbers
   - Separated half-reactions (oxidation and reduction)
   - Balanced complete redox equations
3. Clearly identify the oxidizing agent and reducing agent for each reaction.
4. Submit your answers as a single PDF file.

**Topics Covered:**
- Determining oxidation states in compounds
- Writing and balancing half-reactions
- Balancing redox equations in acidic solutions
- Balancing redox equations in basic solutions
- Identifying oxidizing and reducing agents

**Grading Criteria:**
- Correct oxidation state assignments (25%)
- Properly balanced half-reactions (30%)
- Correctly balanced full equations (30%)
- Proper identification of agents (15%)`,
    tags: ["redox", "oxidation-reduction", "High Occurrence in tests"],
    attachments: [
      {
        id: 1,
        name: "Redox Homework 1.pdf",
        size: "1.3 MB",
        type: "pdf",
        uploadedBy: "instructor",
        href: chemistryPdf("Redox Homework 1.pdf"),
      },
      {
        id: 2,
        name: "Reference · General Chemistry Textbook",
        size: "48.0 MB",
        type: "pdf",
        uploadedBy: "instructor",
        href: chemistryPdf("textbook.pdf"),
      },
    ],
  },
]

const dummyTaskMap = new Map<number, DummyTask>(dummyTasks.map((task) => [task.id, task]))

export function getDummyTaskById(id: number | string | undefined | null): DummyTask | undefined {
  if (id === undefined || id === null) return undefined
  const numericId = typeof id === "string" ? Number(id) : id
  if (Number.isNaN(numericId)) return undefined
  return dummyTaskMap.get(numericId)
}

