"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Dumbbell, Lock, Mail, AlertCircle } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || ""
  const paramError = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(
    paramError === "member_app_only"
      ? "Members must use the GymOS Mobile App to log in."
      : ""
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Invalid email or password.")
        setLoading(false)
        return
      }

      // Force a hard navigation to guarantee server components run cleanly on Vercel
      if (callbackUrl) {
        window.location.href = callbackUrl
      } else {
        window.location.href = "/owner"
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl border border-[#E1E1E4] shadow-sm p-8">
      {/* Header / Logo */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="h-12 w-12 rounded-xl bg-[#007A35] flex items-center justify-center text-white mb-3 shadow-sm">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171B28]">GymOS</h1>
        <p className="text-xs font-semibold text-[#8B8E98] tracking-wider uppercase mt-1">
          Smart Gym Management System
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-3.5 rounded-lg bg-[#FDE4E4] border border-[#F8B4B4] text-[#D71920] text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
            <input
              type="email"
              required
              placeholder="owner@fitgym.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007A35] focus:bg-white transition-all text-[#171B28]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007A35] focus:bg-white transition-all text-[#171B28]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#007A35] hover:bg-[#00622A] text-white font-medium text-sm rounded-lg shadow-sm transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {loading ? <span>Signing in...</span> : <span>Sign In to Dashboard</span>}
        </button>
      </form>

      {/* Footer info */}
      <div className="mt-8 pt-6 border-t border-[#E1E1E4] text-center">
        <p className="text-xs text-[#8B8E98]">
          GymOS Phase 1 Web Portal • For Gym Owners & Personal Trainers
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F5F7] px-4 font-sans text-[#171B28]">
      <Suspense fallback={<div className="text-sm text-[#8B8E98]">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
