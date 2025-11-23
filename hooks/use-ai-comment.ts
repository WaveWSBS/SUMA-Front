"use client"

import { useEffect, useState } from "react"

interface HighOccurrenceReport {
  is_high_occurrence?: boolean
  textbook_coverage?: {
    matches_found?: number
  }
  quiz_similarity?: number | null
  confidence?: number | null
}

const aiCommentCache = new Map<string, string>()

function formatAiComment(report: HighOccurrenceReport | null): string {
  if (!report) return "AI 無法取得分析"

  const matches = report.textbook_coverage?.matches_found ?? 0
  const confidencePct =
    typeof report.confidence === "number" ? Math.round(report.confidence * 100) : null
  const quizPct =
    typeof report.quiz_similarity === "number"
      ? Math.round(report.quiz_similarity * 100)
      : null

  if (report.is_high_occurrence) {
    const segments = ["常出現在考試/測驗"]
    if (quizPct !== null) {
      segments.push(`測驗重疊約 ${quizPct}%`)
    }
    segments.push(`課本對應 ${matches} 處`)
    if (confidencePct !== null) {
      segments.push(`信心 ${confidencePct}%`)
    }
    return segments.join("，")
  }

  if (matches === 0) {
    return confidencePct !== null
      ? `測驗頻率低：目前找不到課本對應（信心 ${confidencePct}%）`
      : "測驗頻率低：目前找不到課本對應"
  }

  return confidencePct !== null
    ? `測驗頻率低：僅 ${matches} 處課本對應，信心 ${confidencePct}%`
    : `測驗頻率低：僅 ${matches} 處課本對應`
}

interface UseAiCommentParams {
  taskId?: number | string
  assignmentText?: string | null
}

export function useAiComment({ taskId, assignmentText }: UseAiCommentParams) {
  const [comment, setComment] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const normalized = (assignmentText || "").trim()
    if (!normalized) {
      setComment(null)
      setError(null)
      setLoading(false)
      return
    }

    const cacheKey = taskId ? `task:${taskId}` : `text:${normalized}`
    if (aiCommentCache.has(cacheKey)) {
      setComment(aiCommentCache.get(cacheKey) ?? null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const controller = new AbortController()

    async function fetchComment() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/ai/rag/check-high-occurrence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignment_text: normalized }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error("AI 分析失敗")
        }

        const report: HighOccurrenceReport = await res.json()
        const formatted = formatAiComment(report)
        aiCommentCache.set(cacheKey, formatted)
        if (!cancelled) {
          setComment(formatted)
        }
      } catch (err: any) {
        if (controller.signal.aborted) return
        if (!cancelled) {
          setError(err?.message || "AI 分析失敗")
          setComment(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchComment()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [assignmentText, taskId])

  return { comment, loading, error }
}

