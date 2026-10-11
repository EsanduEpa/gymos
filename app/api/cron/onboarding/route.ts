/**
 * app/api/cron/onboarding/route.ts
 *
 * Vercel Cron Job endpoint — fires daily at 08:00 UTC (see vercel.json).
 *
 * Security model
 * ──────────────
 * Vercel injects an `Authorization: Bearer <CRON_SECRET>` header on every
 * synthetic cron invocation. We reject anything that does not carry the
 * matching secret, returning 401 before any DB work is performed.
 *
 * For local development, call the route with:
 *
 *   curl -H "Authorization: Bearer <your-CRON_SECRET>" \
 *        http://localhost:3000/api/cron/onboarding
 *
 * Important: CRON_SECRET must be set both in Vercel project settings and in
 * your local `.env.local`. Never commit it to the repository.
 *
 * Runtime constraints
 * ───────────────────
 * Vercel Hobby cron functions have a 10-second execution limit; Pro/Team have
 * 300 seconds. If your member base is large, move the per-milestone fan-out
 * to a queue (e.g. Vercel Queues, Upstash QStash) rather than awaiting all
 * Prisma calls synchronously in this handler.
 */

import { NextRequest, NextResponse } from "next/server";
import { runOnboardingSequence } from "@/lib/onboarding";

// Force dynamic so Next.js never statically pre-renders or caches this route.
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/cron/onboarding
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── 1. Authenticate ───────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    // Fail loudly in development so mis-configured deployments are obvious.
    console.error(
      "[onboarding-cron] CRON_SECRET environment variable is not set. " +
        "Add it to your Vercel project settings and .env.local."
    );
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${cronSecret}`) {
    // Return the same error shape for both missing and wrong credentials
    // so we do not leak which case failed to a potential attacker.
    console.warn(
      "[onboarding-cron] Unauthorized request — invalid or missing Authorization header."
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Run the onboarding sequence ────────────────────────────────────────
  const startedAt = Date.now();

  try {
    const results = await runOnboardingSequence();

    const elapsedMs = Date.now() - startedAt;
    const totalProcessed = results.reduce((s, r) => s + r.processed, 0);
    const totalErrors = results.reduce((s, r) => s + r.errors, 0);

    return NextResponse.json(
      {
        ok: true,
        elapsedMs,
        milestones: results,
        summary: { totalProcessed, totalErrors },
      },
      { status: 200 }
    );
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    console.error("[onboarding-cron] Unhandled error after", elapsedMs, "ms:", err);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
        elapsedMs,
      },
      { status: 500 }
    );
  }
}

