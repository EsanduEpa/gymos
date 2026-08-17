"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { AlertCircle, CheckCircle2, KeyRound, Lock, ShieldCheck } from "lucide-react"
import { changePassword } from "@/app/actions/account"

const inputClass =
  "w-full pl-10 pr-4 py-2.5 text-sm bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007A35] focus:bg-white transition-all text-[#171B28]"

const labelClass =
  "block text-xs font-semibold text-[#4A4D58] uppercase tracking-wider mb-2"

export function ChangePasswordForm({
  fullName,
  required,
}: {
  fullName: string
  required: boolean
}) {
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await changePassword(new FormData(e.currentTarget))

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Signing out drops the token that still says a change is required, and
    // rotates the session now that the credential has changed.
    setDone(true)
    setTimeout(() => signOut({ callbackUrl: "/login" }), 1600)
  }

  if (done) {
    return (
      <div className="w-full max-w-md bg-white rounded-xl border border-[#E1E1E4] shadow-sm p-8 text-center">
        <div className="h-12 w-12 rounded-xl bg-[#007A35] flex items-center justify-center text-white mx-auto mb-4">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-bold text-[#171B28]">Password updated</h1>
        <p className="text-sm text-[#4A4D58] mt-2">
          Signing you out so you can sign back in with your new password.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl border border-[#E1E1E4] shadow-sm p-8">
      <div className="flex flex-col items-center mb-7 text-center">
        <div className="h-12 w-12 rounded-xl bg-[#007A35] flex items-center justify-center text-white mb-3 shadow-sm">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#171B28]">
          {required ? "Choose your own password" : "Change your password"}
        </h1>
        <p className="text-sm text-[#4A4D58] mt-2">
          {required
            ? `Welcome, ${fullName}. Your account was set up with a temporary password. Pick your own to continue.`
            : `Signed in as ${fullName}.`}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded-lg bg-[#FDE4E4] border border-[#F8B4B4] text-[#D71920] text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="currentPassword" className={labelClass}>
            {required ? "Temporary password" : "Current password"}
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className={labelClass}>
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              autoComplete="new-password"
              aria-describedby="password-rules"
              className={inputClass}
            />
          </div>
          <p id="password-rules" className="text-xs text-[#8B8E98] mt-2">
            At least 10 characters, including a number or symbol.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8E98]" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#007A35] hover:bg-[#00622A] text-white font-medium text-sm rounded-lg shadow-sm transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>

      {!required && (
        <div className="mt-7 pt-5 border-t border-[#E1E1E4] text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-[#8B8E98] hover:text-[#171B28] transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
