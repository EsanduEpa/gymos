"use client"

/**
 * AISummaryPanel.tsx
 *
 * A self-contained client component that lets the gym owner request and view
 * the AI-generated weekly financial summary on the Analytics page.
 *
 * Renders a "Generate Summary" button on first load. When clicked it calls the
 * generateWeeklyFinancialSummary Server Action and displays the returned
 * markdown in a styled card. Both loading and error states are handled.
 *
 * Markdown is rendered as HTML using a simple inline renderer so we avoid
 * adding a heavy dependency (e.g. react-markdown). The subset we convert:
 *   **bold**  → <strong>
 *   # / ## / ### headings → <h3>/<h4>
 *   - bullet → <li>
 *   blank lines → paragraph breaks
 *
 * If you later add `react-markdown` + `remark-gfm` to the project, replace
 * renderMarkdown() with <ReactMarkdown>{markdown}</ReactMarkdown>.
 */

import { useState, useTransition } from "react"
import { generateWeeklyFinancialSummary } from "@/app/actions/ai-summary"

// ---------------------------------------------------------------------------
// Minimal markdown → HTML renderer (no extra deps)
// ---------------------------------------------------------------------------

function renderMarkdown(md: string): string {
  return md
    // Headings — must run before bold so ## **text** works correctly
    .replace(/^### (.+)$/gm, "<h5 class=\"text-sm font-bold text-[#171B28] mt-4 mb-1\">$1</h5>")
    .replace(/^## (.+)$/gm, "<h4 class=\"text-base font-bold text-[#171B28] mt-5 mb-1\">$1</h4>")
    .replace(/^# (.+)$/gm, "<h3 class=\"text-lg font-bold text-[#171B28] mt-5 mb-2\">$1</h3>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Bullet list items
    .replace(/^[-*] (.+)$/gm, "<li class=\"ml-4 list-disc text-[#3D3D4E]\">$1</li>")
    // Wrap consecutive <li> blocks in <ul>.
    // The 's' flag (dotAll) is not used; instead we match the multi-line run
    // by targeting the pattern: one or more <li>…</li> lines joined by \n.
    .replace(/(<li[^>]*>(?:(?!<\/ul>)[\s\S])*?<\/li>\n?)+/g, (match) =>
      `<ul class="space-y-1 my-2">${match}</ul>`
    )
    // Blank lines → paragraph breaks
    .replace(/\n{2,}/g, "\n<br class=\"my-2\" />\n")
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AISummaryPanelProps {
  gymId: string
}

type SummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; markdown: string; generatedAt: string; windowStart: string; windowEnd: string }
  | { status: "error"; message: string }

export default function AISummaryPanel({ gymId }: AISummaryPanelProps) {
  const [state, setState] = useState<SummaryState>({ status: "idle" })
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    setState({ status: "loading" })
    startTransition(async () => {
      const result = await generateWeeklyFinancialSummary(gymId)

      if ("error" in result) {
        setState({ status: "error", message: result.error })
      } else {
        setState({
          status: "success",
          markdown: result.markdown,
          generatedAt: result.generatedAt,
          windowStart: result.windowStart,
          windowEnd: result.windowEnd,
        })
      }
    })
  }

  const isLoading = isPending || state.status === "loading"

  return (
    <div className="bg-white rounded-xl border border-[#E1E1E4] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 border-b border-[#E1E1E4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h2 className="text-sm font-bold text-[#171B28]">
              AI Weekly Financial Summary
            </h2>
          </div>
          <p className="text-xs text-[#8B8E98] mt-0.5">
            Gemini analyses your last 7 days of revenue, expenses, and PT session
            activity and writes an executive management accounts briefing.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={[
            "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            isLoading
              ? "bg-[#E1E1E4] text-[#8B8E98] cursor-not-allowed"
              : "bg-[#007A35] text-white hover:bg-[#005F28] active:scale-95",
          ].join(" ")}
        >
          {isLoading ? "Generating…" : state.status === "success" ? "Regenerate" : "Generate Summary"}
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Idle — prompt the user */}
        {state.status === "idle" && (
          <p className="text-xs text-[#8B8E98] italic text-center py-6">
            Click &ldquo;Generate Summary&rdquo; to get your AI-powered weekly briefing.
          </p>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3 animate-pulse py-2">
            <div className="h-3 bg-[#E1E1E4] rounded w-3/4" />
            <div className="h-3 bg-[#E1E1E4] rounded w-full" />
            <div className="h-3 bg-[#E1E1E4] rounded w-5/6" />
            <div className="h-3 bg-[#E1E1E4] rounded w-2/3" />
            <div className="h-3 bg-[#E1E1E4] rounded w-full" />
            <div className="h-3 bg-[#E1E1E4] rounded w-4/5" />
          </div>
        )}

        {/* Error state */}
        {!isLoading && state.status === "error" && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
            <span className="text-red-500 text-lg mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-700">Summary generation failed</p>
              <p className="text-xs text-red-600 mt-1">{state.message}</p>
              <button
                onClick={handleGenerate}
                className="mt-3 text-xs font-semibold text-red-700 underline underline-offset-2 hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Success — render markdown */}
        {!isLoading && state.status === "success" && (
          <div>
            {/* Period badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FAF4] border border-[#007A35]/20 px-3 py-1 text-xs font-medium text-[#007A35]">
                📅 {state.windowStart} → {state.windowEnd}
              </span>
              <span className="text-xs text-[#8B8E98]">
                Generated {new Date(state.generatedAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Markdown content */}
            <div
              className="prose prose-sm max-w-none text-[#3D3D4E] leading-relaxed text-sm"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: renderMarkdown(state.markdown) }}
            />

            {/* Disclaimer */}
            <p className="mt-5 text-[10px] text-[#8B8E98] border-t border-[#E1E1E4] pt-3">
              ✦ This summary was generated by Gemini AI from your live database. Always verify
              figures against your authoritative records before making business decisions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

