/**
 * lib/gemini.ts
 *
 * Singleton Gemini client — mirrors the prisma.ts pattern so we never
 * instantiate more than one SDK client across hot-reloads in development.
 *
 * The SDK automatically reads GEMINI_API_KEY from process.env. Do NOT pass
 * apiKey: undefined — some SDK versions treat that as an explicit override
 * and skip the env-var fallback. Omit the property entirely.
 *
 * Add GEMINI_API_KEY to:
 *   - .env.local           (local dev — never commit)
 *   - Vercel project settings → Environment Variables  (production)
 */

import { GoogleGenAI } from "@google/genai";

const globalForGemini = globalThis as unknown as {
  gemini: GoogleGenAI | undefined;
};

// The SDK reads GEMINI_API_KEY from process.env automatically.
// The ai-summary Server Action guards against a missing key before calling.
export const gemini =
  globalForGemini.gemini ??
  new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

if (process.env.NODE_ENV !== "production") globalForGemini.gemini = gemini;


