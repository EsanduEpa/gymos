"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy, KeyRound } from "lucide-react"

/**
 * Shown once, immediately after an account is created.
 *
 * Until transactional email exists, handing the credential to the gym owner on
 * screen is the only delivery mechanism — so it has to be unmissable, and it
 * has to say plainly that it will not be shown again.
 */
export function TemporaryPasswordNotice({
  fullName,
  email,
  temporaryPassword,
  continueHref,
  continueLabel,
}: {
  fullName: string
  email: string
  temporaryPassword: string
  continueHref: string
  continueLabel: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(temporaryPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden max-w-xl">
      <div className="px-6 py-4 bg-[#E4F0E8] border-b border-[#C3DFCE] flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-[#007A35] flex items-center justify-center text-white shrink-0">
          <KeyRound className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#171B28]">{fullName} can now sign in</h2>
          <p className="text-xs text-[#4A4D58] mt-0.5">
            Give them these details. They&apos;ll choose their own password on first sign-in.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B8E98] mb-1.5">
            Email
          </div>
          <div className="font-mono text-sm text-[#171B28] break-all">{email}</div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B8E98] mb-1.5">
            Temporary password
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-base tracking-wide text-[#171B28] bg-[#F5F4F5] border border-[#E1E1E4] rounded-lg px-3 py-2.5 select-all">
              {temporaryPassword}
            </code>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy temporary password"
              className="shrink-0 h-[42px] px-3 rounded-lg border border-[#E1E1E4] bg-white hover:bg-[#F5F4F5] text-[#4A4D58] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#007A35]" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#9A5B08] bg-[#F8EEDD] border border-[#E8D5AC] rounded-lg px-3 py-2.5">
          This password is shown once and cannot be retrieved later. If it&apos;s lost,
          you&apos;ll need to issue a new one.
        </p>

        <div className="pt-1">
          <Link
            href={continueHref}
            className="inline-flex items-center justify-center py-2.5 px-5 bg-[#007A35] hover:bg-[#00622A] text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            {continueLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
