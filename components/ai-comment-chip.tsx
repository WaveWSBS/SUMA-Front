"use client"

import { Sparkles } from "lucide-react"
import { useAiComment } from "@/hooks/use-ai-comment"
import { cn } from "@/lib/utils"

interface AiCommentChipProps {
  taskId?: number | string
  assignmentText?: string | null
  variant?: "chip" | "block"
  className?: string
}

export function AiCommentChip({ taskId, assignmentText, variant = "chip", className }: AiCommentChipProps) {
  const { comment, loading, error } = useAiComment({ taskId, assignmentText })

  if (!assignmentText || !assignmentText.trim()) {
    return null
  }

  const message = loading ? "AI 分析中..." : error ? "AI 無法取得分析" : comment || "AI 無法取得分析"

  if (variant === "block") {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-sm text-muted-foreground",
          className,
        )}
      >
        <Sparkles className="mt-0.5 h-4 w-4 text-purple-600 dark:text-purple-300" />
        <span className="text-card-foreground">{message}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-200",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" />
      <span>{message}</span>
    </div>
  )
}

