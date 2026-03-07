"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // find user by email
    const existingUser = users.find((u: any) => u.email === email.trim())

    if (!existingUser) {
      setError("No account found with this email. Please sign up.")
      setIsLoading(false)
      return
    }

    // check password
    if (existingUser.password !== password) {
      setError("Incorrect password")
      setIsLoading(false)
      return
    }

    // store logged in user
    localStorage.setItem("loggedInUser", JSON.stringify(existingUser))

    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900">
            <Zap className="h-6 w-6 text-white" />
          </div>

          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to RIFT
          </CardTitle>

          <CardDescription className="text-slate-500">
            Control center for safe AI prompt releases
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

          </CardContent>

          <CardFooter className="flex flex-col gap-4">

            <Button
              type="submit"
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-slate-500">
              {"Don't have an account? "}
              <Link
                href="/signup"
                className="font-medium text-slate-900 hover:underline"
              >
                Create Account
              </Link>
            </p>

          </CardFooter>
        </form>

      </Card>
    </div>
  )
}