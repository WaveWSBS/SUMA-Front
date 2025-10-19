import { useCallback, useEffect } from "react"

type MetricEventType = "visit" | "sign_up" | "cta_click" | "demo_tab_select" | "faq_response" | "interaction"

type MetricEvent = {
  type: MetricEventType
  timestamp: string
  sessionId: string
  metadata: Record<string, unknown>
}

const STORAGE_KEY = "suma-metrics-buffer"
const VISITOR_KEY = "suma-visitor-id"
const MAX_BUFFER_LENGTH = 200

const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined

const hasWindow = typeof window !== "undefined"

function safeRead<T>(key: string, fallback: T): T {
  if (!hasWindow) {
    return fallback
  }
  try {
    const rawValue = window.localStorage.getItem(key)
    if (!rawValue) {
      return fallback
    }
    return JSON.parse(rawValue) as T
  } catch (error) {
    console.warn("[analytics] Failed to read storage", error)
    return fallback
  }
}

function safeWrite<T>(key: string, value: T) {
  if (!hasWindow) {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn("[analytics] Failed to persist storage", error)
  }
}

function getVisitorId(): string {
  if (!hasWindow) {
    return "server"
  }
  const cached = safeRead<string | null>(VISITOR_KEY, null)
  if (cached) {
    return cached
  }
  const freshId = window.crypto?.randomUUID?.() ?? `anon-${Date.now()}`
  safeWrite(VISITOR_KEY, freshId)
  return freshId
}

function persistEvent(event: MetricEvent) {
  const buffer = safeRead<MetricEvent[]>(STORAGE_KEY, [])
  buffer.push(event)
  if (buffer.length > MAX_BUFFER_LENGTH) {
    buffer.splice(0, buffer.length - MAX_BUFFER_LENGTH)
  }
  safeWrite(STORAGE_KEY, buffer)
}

async function flushBuffer() {
  if (!hasWindow || !analyticsEndpoint) {
    return
  }

  const buffer = safeRead<MetricEvent[]>(STORAGE_KEY, [])
  if (buffer.length === 0) {
    return
  }

  const payload = JSON.stringify({
    events: buffer,
    flushedAt: new Date().toISOString(),
  })

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" })
      const success = navigator.sendBeacon(analyticsEndpoint, blob)
      if (success) {
        safeWrite(STORAGE_KEY, [])
        return
      }
    }
  } catch (error) {
    console.warn("[analytics] sendBeacon failed", error)
  }

  try {
    const response = await fetch(analyticsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    })
    if (response.ok) {
      safeWrite(STORAGE_KEY, [])
    }
  } catch (error) {
    console.warn("[analytics] flush failed", error)
  }
}

export function trackEvent(type: MetricEventType, metadata: Record<string, unknown> = {}) {
  if (!hasWindow) {
    return
  }

  const enrichedMetadata = {
    ...metadata,
    path: window.location.pathname,
    referrer: document.referrer || null,
    userAgent: navigator.userAgent,
  }

  const event: MetricEvent = {
    type,
    timestamp: new Date().toISOString(),
    sessionId: getVisitorId(),
    metadata: enrichedMetadata,
  }

  persistEvent(event)
  // Fire-and-forget flush attempt; no need to await inside event handlers.
  void flushBuffer()
}

export function useAnalytics() {
  useEffect(() => {
    if (!hasWindow) {
      return
    }

    trackEvent("visit", {
      url: window.location.href,
    })
  }, [])

  useEffect(() => {
    if (!hasWindow) {
      return
    }

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        void flushBuffer()
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("beforeunload", flushBuffer)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("beforeunload", flushBuffer)
    }
  }, [])

  const track = useCallback(
    (type: MetricEventType, metadata: Record<string, unknown> = {}) => {
      trackEvent(type, metadata)
    },
    [],
  )

  return { track }
}

