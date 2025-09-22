"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ensure refresh cookie is set via proxy
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = data?.detail || data?.message || `Registration failed (${res.status}).`
        throw new Error(msg)
      }

      if (data?.access_token) {
        try {
          sessionStorage.setItem("access_token", data.access_token)
        } catch {}
      }

      // Go to dashboard (home with auth guard B)
      router.replace("/")
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground">Sign up to start using Suma</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Already have an account? {" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
