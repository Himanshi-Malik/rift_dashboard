"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // password validation (min 6 chars, 1 letter, 1 number)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters and contain a letter and a number")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    // get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // check if email already exists
    const existingEmail = users.find((u: any) => u.email === email)

    if (existingEmail) {
      setError("Email already registered. Please login.")
      setIsLoading(false)
      return
    }

    // check if name already exists
    const existingName = users.find((u: any) => u.name === name)

    if (existingName) {
      setError("Username already taken. Please choose another.")
      setIsLoading(false)
      return
    }

    // create new user
    const newUser = {
      name,
      email,
      password
    }

    // add user to list
    users.push(newUser)

    // save users
    localStorage.setItem("users", JSON.stringify(users))

    // store logged in user
    localStorage.setItem("loggedInUser", JSON.stringify(newUser))

    setIsLoading(false)

    // redirect to dashboard
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
            Create your account
          </CardTitle>

          <CardDescription className="text-slate-500">
            Get started with RIFT
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-slate-900 hover:underline"
              >
                Sign in
              </Link>
            </p>

          </CardFooter>
        </form>

      </Card>
    </div>
  )
}