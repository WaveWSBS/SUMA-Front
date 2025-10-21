import { Fragment, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle,
  Clock,
  Cpu,
  Gauge,
  Layers,
  LineChart,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { trackEvent, useAnalytics } from "./analytics"

const trustLogos = ["Dubai Future Foundation", "EdTech MENA Alliance", "AWS EdStart", "Coursera Partner Lab"]

const trustQuotes = [
  {
    quote:
      "“ΣUMA helped us transform static curriculum into immersive experiences in less than two weeks, cutting prep time for faculty in half.”",
    name: "Dr. Layla Al-Mansoori",
    title: "Director of Teaching Innovation, Emirates University",
  },
  {
    quote:
      "“Our corporate academies finally have AI-powered visibility. Completion rates are at a record high and our teams are aligned on every learning sprint.”",
    name: "Miguel Santos",
    title: "Global L&D Director, NovaWorks",
  },
]

type HeroTask = {
  id: number
  title: string
  course: string
  due: string
  status: "pending" | "submitted"
  aiHint: string
  type: "assignment" | "project" | "lab"
}

const heroTasks: HeroTask[] = [
  {
    id: 1,
    title: "Math Assignment 5",
    course: "Linear Algebra 101",
    due: "Tonight · 23:59 GST",
    status: "pending",
    aiHint: "High Occurence in your midterm exam",
    type: "assignment",
  },
  {
    id: 2,
    title: "Physics Lab Report",
    course: "PHYSICS 1120",
    due: "Wednesday · 17:00 GST",
    status: "pending",
    aiHint: "Time Consuming",
    type: "project",
  },
]

const heroTaskAccent: Record<HeroTask["type"], string> = {
  assignment: "bg-blue-500",
  project: "bg-indigo-500",
  lab: "bg-emerald-500",
}

const featureHighlights: Array<{
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    title: "AI Mission Orchestration",
    description: "Surface the next-best task for every learner based on real-time performance and engagement signals.",
    icon: Sparkles,
  },
  {
    title: "Scenario-Based Modules",
    description: "Convert slides and PDFs into immersive, decision-led narratives that mirror on-the-ground situations.",
    icon: Layers,
  },
  {
    title: "Auto-Generated Briefings",
    description: "Generate shareable recaps, knowledge bases, and feedback summaries in seconds for faculty and coaches.",
    icon: Cpu,
  },
  {
    title: "Live Learning Dashboards",
    description: "Monitor completion, risk trends, and intervention priorities on a single canvas across your ecosystem.",
    icon: Gauge,
  },
]

const demoViews = [
  {
    id: "missions",
    label: "Mission Queue",
    description: "AI reprioritises workstreams as learner behaviour shifts, complete with contextual nudges.",
    insights: [
      { title: "AI Recommendations Today", value: "3 missions", detail: "Ranked by the last 7 days of performance" },
      { title: "Completion Lift", value: "82%", detail: "14% above cohort average" },
      { title: "Risk Alert", value: "1 learner", detail: "Inactive for 48 hours" },
    ],
  },
  {
    id: "progress",
    label: "Progress Pulse",
    description: "Visualise module progression and AI-recommended reinforcement assets at a glance.",
    insights: [
      { title: "Core Modules", value: "12 / 16", detail: "Scenario completion at 75%" },
      { title: "Self-Study Hours", value: "18.4 hrs", detail: "2.1 hrs ahead of target pace" },
      { title: "Reinforcement Assets", value: "5 prompts", detail: "Auto-pushed extension activities" },
    ],
  },
  {
    id: "insights",
    label: "AI Guidance",
    description: "An embedded coach surfaces next actions, cohort-wide patterns, and strategic interventions.",
    insights: [
      { title: "Instructional Signals", value: "4 highlights", detail: "Top areas where learners request support" },
      { title: "Engagement Heat", value: "+32%", detail: "Scenario-based missions boost participation" },
      { title: "Action Items", value: "2 tasks", detail: "Schedule TA pods and triggered reminders" },
    ],
  },
]

const useCases = [
  {
    persona: "Higher Education Faculty",
    headline: "Turn lecture notes into immersive decision labs",
    scenario: "Launch cross-disciplinary scenarios in two weeks with built-in cases and applied assessments.",
    outcome: "End-of-term evaluations rose by 1.3 points while remedial requests dropped 35%.",
  },
  {
    persona: "Corporate L&D Teams",
    headline: "Segment learners and close skills gaps with AI",
    scenario: "Auto-generate role-aware pathways and nudges across regions and business units.",
    outcome: "Programmes finish in six weeks, accelerating go-live timelines by 18%.",
  },
  {
    persona: "Online Course Platforms",
    headline: "Upgrade video courses into adaptive storylines",
    scenario: "Learners make live decisions inside the embedded dashboard while AI coaches respond instantly.",
    outcome: "Renewals climbed 42% and support tickets fell by 27%.",
  },
]

const metrics = [
  {
    value: "↑ 28%",
    label: "Completion uplift",
    description: "Scenario-driven missions keep learners engaged and on track to submit on time.",
  },
  {
    value: "↓ 46%",
    label: "Prep time saved",
    description: "Automated summaries and resource curation free faculty to focus on high-value coaching.",
  },
  {
    value: "90%",
    label: "NPS from partners",
    description: "Learning leaders credit ΣUMA with elevating both experience and measurable outcomes.",
  },
]

const integrationItems: Array<{
  name: string
  description: string
  icon: LucideIcon
}> = [
  {
    name: "Enterprise LMS Sync",
    description: "One-click connectivity with Canvas, Moodle, Blackboard, D2L, and homegrown stacks.",
    icon: Layers,
  },
  {
    name: "Open APIs",
    description: "GraphQL and REST tooling to link data warehouses, HRIS, and analytics platforms.",
    icon: Server,
  },
  {
    name: "Enterprise SSO",
    description: "Secure access with Azure AD, Okta, Google Workspace, and UAE Pass compliant flows.",
    icon: ShieldCheck,
  },
  {
    name: "Real-Time Webhooks",
    description: "Push learning events into Slack, Teams, ServiceNow, or custom workflow orchestrators.",
    icon: Zap,
  },
  {
    name: "AI Coach Extensions",
    description: "Deploy agents via Bot Framework or bespoke assistants embedded across your ecosystem.",
    icon: Bot,
  },
]

const landingUrl = "https://suma-edu.com"
const demoUrl = "https://demo.suma-edu.com"

const pricingTiers = [
  {
    name: "Starter",
    price: "20 USD / month",
    description: "Ideal for pilot cohorts and boutique academies validating AI-led contextual learning.",
    highlighted: false,
    cta: "Start Free Trial",
    ctaHref: landingUrl,
    features: [
      "Up to 100 active learners",
      "AI mission orchestration & nudges",
      "Scenario starter templates",
      "Standard dashboards & exports",
    ],
  },
  {
    name: "Growth",
    price: "25 USD / month",
    description: "Built for multi-campus and cross-market deployments requiring advanced intelligence.",
    highlighted: true,
    cta: "Book a Demo",
    ctaHref: demoUrl,
    features: [
      "Unlimited learner seats",
      "Automated scenario generation & co-authoring",
      "Custom KPI dashboards & live alerts",
      "Full API, SSO, and webhook integrations",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom engagement",
    description: "End-to-end rollouts for large institutions, regulated entities, and multi-brand networks.",
    highlighted: false,
    cta: "Talk to Our Team",
    ctaHref: demoUrl,
    features: [
      "Dedicated success squad & migration services",
      "Private cloud or on-premise options",
      "Compliance & security audit support",
      "Bespoke data strategy & governance",
    ],
  },
]

const comparisonMatrix = [
  {
    feature: "AI mission recommendations & behaviour predictions",
    tiers: { Starter: true, Growth: true, Enterprise: true },
  },
  {
    feature: "Scenario-based course auto-generation",
    tiers: { Starter: false, Growth: true, Enterprise: true },
  },
  {
    feature: "Global dashboards with custom KPIs",
    tiers: { Starter: false, Growth: true, Enterprise: true },
  },
  {
    feature: "Custom APIs & data lakehouse connectors",
    tiers: { Starter: false, Growth: true, Enterprise: true },
  },
  {
    feature: "Dedicated success & governance workshops",
    tiers: { Starter: false, Growth: false, Enterprise: true },
  },
]

const faqItems = [
  {
    question: "Can ΣUMA operate alongside our existing LMS?",
    answer:
      "Absolutely. We integrate via LTI, APIs, or secure batch sync so enrolments, grades, and content flow seamlessly without changing your current login experience.",
  },
  {
    question: "Does the AI-generated content meet privacy and compliance standards?",
    answer:
      "ΣUMA operates within dedicated, encrypted environments aligned with GDPR, ISO 27001, UAE PDPL, and organisation-specific governance policies.",
  },
  {
    question: "Can enterprise teams customise scenarios and assessment criteria?",
    answer:
      "Yes. Our scenario builder and knowledge graph let you configure roles, branching narratives, rubrics, and AI can suggest optimal parameters based on outcomes.",
  },
  {
    question: "How long does implementation take?",
    answer:
      "Starter launches immediately. Growth and Enterprise rollouts usually complete within 4–6 weeks including enablement and stakeholder training.",
  },
]

const footerLinks = {
  product: ["Product Tour", "What’s New", "Customer Stories"],
  resources: ["Knowledge Base", "Partner Programme", "Press Kit"],
  contact: ["hello@suma.ai", "+971506236350", "MBZUAI Incubator, Abu Dhabi, UAE"],
}

const currentYear = new Date().getFullYear()

function HeroTaskCard() {
  return (
    <div className="relative w-full max-w-md shrink-0">
      <div className="absolute -inset-12 -z-10 rounded-[36px] bg-[radial-gradient(circle_at_top,_rgba(123,140,255,0.35),_rgba(8,10,22,0)_65%)] blur-3xl" />
      <div className="space-y-5 rounded-[34px] border border-white/8 bg-black/40 p-6 shadow-[0_26px_90px_-48px_rgba(111,125,255,0.65)] backdrop-blur-[28px]">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-primary/70">
          <span>Today’s Mission Overview</span>
          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Clock className="size-3.5 text-primary/80" />
            AI schedule ready
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">AI Mission List</h3>
          <button
            className="rounded-md border border-white/10 px-3 py-1 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            onClick={() =>
              trackEvent("interaction", {
                component: "hero_task_card",
                action: "export_actions",
              })
            }
          >
            Export actions
          </button>
        </div>
        <div className="space-y-3">
          {heroTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground"
            >
              <span className={`mt-1 size-2.5 rounded-full ${heroTaskAccent[task.type]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">{task.title}</p>
                  <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {task.course}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-[11px] text-purple-300">
                    <Sparkles className="size-3" />
                    {task.aiHint}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {task.status === "submitted" ? "Completed · " : "Due: "}
                  {task.due}
                </p>
              </div>
              {task.status === "submitted" ? (
                <CheckCircle className="mt-1 size-5 text-emerald-400" />
              ) : (
                <button
                  className="rounded-md border border-white/10 px-3 py-1 text-[11px] font-semibold text-white transition hover:border-primary/40 hover:text-primary"
                  onClick={() =>
                    trackEvent("interaction", {
                      component: "hero_task_card",
                      action: "submit_now",
                      taskId: task.id,
                      taskTitle: task.title,
                    })
                  }
                >
                  Submit now
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-10 -left-20 hidden h-32 w-32 rounded-full bg-primary/20 blur-3xl md:block" />
      <div className="pointer-events-none absolute -right-16 top-6 hidden h-24 w-24 rounded-full bg-sky-400/20 blur-3xl md:block" />
    </div>
  )
}

export default function App() {
  const { track } = useAnalytics()
  const [activeDemo, setActiveDemo] = useState(demoViews[0]?.id ?? "missions")
  const activeDemoView = demoViews.find((view) => view.id === activeDemo) ?? demoViews[0]
  const pricingSectionRef = useRef<HTMLElement | null>(null)

  const handlePricingClick = () => {
    track("cta_click", {
      location: "hero",
      label: "Pricing",
    })
    pricingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <Fragment>
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[720px] backdrop-grad" />
        <header className="border-b border-white/5 bg-gradient-to-br from-[#101324] via-[#070811] to-[#010103]/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
            <a href="#hero" className="text-lg font-semibold tracking-wide text-primary">
              ΣUMA
            </a>
            <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
              <a href="#features" className="transition-colors hover:text-primary">
                Features
              </a>
              <a href="#demo" className="transition-colors hover:text-primary">
                Interactive Demo
              </a>
              <a href="#use-cases" className="transition-colors hover:text-primary">
                Use Cases
              </a>
              <a href="#pricing" className="transition-colors hover:text-primary">
                Pricing
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <button className="rounded-md border border-transparent px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <a href="#faq">FAQ</a>
              </button>
              <a
                href={demoUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 md:flex"
                onClick={() =>
                  track("cta_click", {
                    location: "header",
                    label: "Talk to us",
                  })
                }
              >
                Talk to us
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </header>

        <section id="hero" className="bg-gradient-to-b from-[#0a0d1c]/80 via-[#05060c] to-[#05060c]">
          <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-28 pt-24 md:pt-32 lg:flex-row lg:items-end">
            <div className="max-w-2xl space-y-8">
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                AI-contextualised LMS
              </span>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl md:leading-[1.05] lg:text-[3.8rem]">
                Place Your LMS Inside an AI Context
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-[1.65]">
                ΣUMA turns static courseware into immersive, real-world scenes. AI keeps every learner on pace, syncs progress across teams, and translates each interaction into measurable outcomes.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_12px_45px_-12px_rgba(111,125,255,0.7)] transition hover:bg-primary/90"
                  onClick={() =>
                    track("sign_up", {
                      location: "hero",
                      label: "Free Demo",
                    })
                  }
                >
                  Free Demo
                  <ArrowRight className="size-5" />
                </a>
                <button
                  type="button"
                  onClick={handlePricingClick}
                  className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_35px_-20px_rgba(15,20,35,0.9)] transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                >
                  Pricing
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
            <div className="relative flex-1">
              <div className="absolute -left-12 -top-12 hidden size-44 rounded-full bg-primary/30 blur-3xl md:block" />
              <div className="absolute -right-16 bottom-12 hidden size-36 rounded-full bg-sky-500/30 blur-3xl md:block" />
              <HeroTaskCard />
            </div>
          </div>
        </section>

        {false && (
          <section className="mx-auto max-w-6xl px-6 py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Trusted across the UAE and beyond
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-4">
              {trustLogos.map((logo) => (
                <div
                  key={logo}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-muted-foreground shadow-inner shadow-black/30"
                >
                  {logo}
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {trustQuotes.map((quote) => (
                <div key={quote.name} className="card-surface rounded-3xl border border-white/10 p-6">
                  <p className="text-lg font-semibold leading-relaxed text-white">{quote.quote}</p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {quote.name}・{quote.title}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Core capabilities
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Infuse AI into every stage of the learning journey
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              A dashboard-first experience keeps faculty, learners, and leadership aligned while maintaining complete
              operational control.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="card-surface group flex h-full flex-col gap-4 rounded-3xl border border-white/10 p-6 transition-transform hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/10"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-2 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Interactive demo preview
              </span>
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                Embedded dashboards to stay ahead of every learning signal
              </h2>
              <p className="text-base text-muted-foreground">
                Explore how mission queues, progress pulse, and AI guidance co-exist inside the ΣUMA workspace. Select a
                tab below to preview each perspective.
              </p>
            </div>
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-md border border-primary/40 px-6 py-3 text-center text-base font-semibold text-primary transition hover:bg-primary/10 md:w-auto"
              onClick={() =>
                track("cta_click", {
                  location: "interactive_demo",
                  label: "Schedule full demo",
                })
              }
            >
              Schedule full demo
              <ArrowRight className="ml-2 inline size-5" />
            </a>
          </div>
          <div className="mt-10 space-y-6">
            <div className="flex flex-wrap gap-2">
              {demoViews.map((view) => {
                const isActive = activeDemo === view.id
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => {
                      setActiveDemo(view.id)
                      track("demo_tab_select", {
                        viewId: view.id,
                        label: view.label,
                      })
                    }}
                    className={`rounded-lg border px-4 py-2 text-sm transition ${
                      isActive
                        ? "border-primary/60 bg-primary/10 text-primary shadow-inner shadow-primary/20"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {view.label}
                  </button>
                )
              })}
            </div>
            {activeDemoView && (
              <div className="card-surface grid gap-8 rounded-3xl border border-white/10 p-8 shadow-lg shadow-primary/5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="size-5 text-primary" />
                    <h3 className="text-xl font-semibold text-white">{activeDemoView.label}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{activeDemoView.description}</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {activeDemoView.insights.map((insight) => (
                      <div key={insight.title} className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-muted-foreground">
                        <p className="text-xs uppercase tracking-wider text-primary/80">{insight.title}</p>
                        <p className="mt-2 text-2xl font-semibold text-white">{insight.value}</p>
                        <p className="mt-2 text-xs leading-relaxed">{insight.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-between rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                  <div>
                    <div className="flex items-center gap-3 text-primary">
                      <LineChart className="size-5" />
                      <span className="text-sm font-semibold text-white">AI guidance chip</span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      ΣUMA unifies multi-source data into a single surface and recommends the next best action. Contextual
                      prompts and auto-generated summaries embed inside your LMS or standalone workflows without
                      disruption.
                    </p>
                  </div>
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-primary/80">Next best actions</span>
                      <span className="text-xs">Auto-generated</span>
                    </div>
                    <ul className="mt-3 space-y-2 text-xs">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 text-primary" />
                        Push interactive scenario before Wednesday to re-engage at-risk learners.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 text-primary" />
                        Enable AI summaries for faculty and teaching assistants.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 text-primary" />
                        Trigger webhook to update CRM and support pipeline.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="use-cases" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Use cases
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                Three core arenas transforming learning outcomes
              </h2>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              From higher education to enterprise academies and digital platforms, ΣUMA’s contextual AI accelerates
              content transformation and delivers measurable results.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {useCases.map((useCase) => (
              <div key={useCase.persona} className="card-surface flex flex-col gap-4 rounded-3xl border border-white/10 p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                  {useCase.persona}
                </span>
                <h3 className="text-lg font-semibold text-white">{useCase.headline}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{useCase.scenario}</p>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-muted-foreground">
                  <span className="text-primary">Outcome:</span>
                  {useCase.outcome}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Impact metrics
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                Evidence that contextual learning drives real change
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="card-surface rounded-3xl border border-white/10 p-6 text-center">
                    <div className="text-3xl font-semibold text-primary">{metric.value}</div>
                    <p className="mt-2 text-sm font-medium text-white">{metric.label}</p>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {trustQuotes.map((quote) => (
                <div
                  key={`${quote.name}-testimonial`}
                  className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6"
                >
                  <p className="text-sm leading-relaxed text-white">{quote.quote}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {quote.name}・{quote.title}
                  </p>
                </div>
              ))}
              <div className="card-surface rounded-3xl border border-white/10 p-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-3 text-primary">
                  <Users className="size-5" />
                  <span className="text-sm font-semibold text-white">Customer highlights</span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" /> 90% of partners report dramatically simplified
                    rollout.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" /> 78% of learners complete their personalised mission
                    path within the first week.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" /> Leaders save an average of 6 hours on reporting
                    every cycle.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section> */}

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Integrations
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Seamlessly plug into your existing tools and processes
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Whatever LMS, identity provider, or data backbone you rely on, ΣUMA connects securely and scales as you
              grow.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {integrationItems.map((integration) => (
              <div key={integration.name} className="card-surface rounded-3xl border border-white/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-2 text-primary">
                    <integration.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{integration.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section ref={pricingSectionRef} id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Pricing
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                Flexible tiers for teams of every scale
              </h2>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              Start with Starter to explore, or partner with our consultants for an end-to-end rollout. Every tier
              includes a 14-day free trial.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`card-surface flex h-full flex-col gap-6 rounded-3xl border p-6 ${
                  tier.highlighted
                    ? "border-primary/60 bg-gradient-to-br from-primary/15 via-primary/10 to-transparent shadow-lg shadow-primary/30"
                    : "border-white/10"
                }`}
              >
                <div className="space-y-3">
                  <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    {tier.name}
                  </span>
                  <h3 className="text-2xl font-semibold text-white">{tier.price}</h3>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <ul className="flex-1 space-y-3 text-sm text-muted-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 text-primary" /> {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.ctaHref}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-md px-4 py-2 text-center text-sm font-semibold transition ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                      : "border border-primary/40 text-primary hover:bg-primary/10"
                  }`}
                  onClick={() =>
                    track(
                      tier.cta.toLowerCase().includes("trial") ? "sign_up" : "cta_click",
                      {
                        location: "pricing",
                        label: tier.cta,
                        tier: tier.name,
                      },
                    )
                  }
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <div className="px-6 py-4">Feature comparison</div>
              {pricingTiers.map((tier) => (
                <div key={`${tier.name}-header`} className="px-6 py-4 text-center">
                  {tier.name}
                </div>
              ))}
            </div>
            {comparisonMatrix.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1.4fr_repeat(3,1fr)] border-t border-white/5 bg-black/30 text-sm text-muted-foreground"
              >
                <div className="px-6 py-4">{row.feature}</div>
                {pricingTiers.map((tier) => (
                  <div key={`${row.feature}-${tier.name}`} className="flex items-center justify-center px-6 py-4">
                    {row.tiers[tier.name] ? (
                      <Check className="size-5 text-primary" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              FAQ
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Questions we hear most often</h2>
          </div>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5">
            {faqItems.map((faq, index) => (
              <details
                key={faq.question}
                className="border-b border-white/5 last:border-none"
                onToggle={(event) =>
                  track("faq_response", {
                    question: faq.question,
                    state: event.currentTarget.open ? "open" : "closed",
                    index,
                  })
                }
              >
                <summary className="cursor-pointer select-none px-6 py-4 text-left text-base font-medium text-white">
                  {faq.question}
                </summary>
                <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/70" id="contact">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-5">
          <div className="md:col-span-2">
            <a href="#hero" className="text-lg font-semibold tracking-wide text-primary">
              ΣUMA
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              ΣUMA is the AI-contextualised LMS built for next-generation learning. Data-driven dashboards and automated
              workflows empower high-conversion, sustainable learning experiences.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
              <Clock className="size-4" />
              Support Sunday–Thursday · 09:00–18:00 GST
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {footerLinks.product.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Resources</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {footerLinks.resources.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {footerLinks.contact.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
              onClick={() =>
                track("cta_click", {
                  location: "footer",
                  label: "Plan your rollout",
                })
              }
            >
              Plan your rollout
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs text-muted-foreground">
          © {currentYear} ΣUMA. All rights reserved.
        </div>
      </footer>
    </Fragment>
  )
}
