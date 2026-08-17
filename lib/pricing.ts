import { SessionType, TrainerLevel } from "@prisma/client"

// See docs/revenue-model.md for the accounting this implements.

export type RateCard = {
  defaultSessionFee: number
  level2SessionFee: number | null
  introSessionFee: number | null
}

export type PackPricing = {
  price: number | null
  totalSessions: number
}

/**
 * What a single session off this pack is worth.
 *
 * The pack records what the member actually paid, discounts included, so it is
 * the only honest basis for both revenue recognition and trainer pay. Returns
 * null for a pack with no recorded price, so callers fall back to the rate card
 * rather than silently booking zero.
 */
export function packSessionPrice(pack: PackPricing | null | undefined) {
  if (!pack || pack.price == null || pack.totalSessions <= 0) return null
  return pack.price / pack.totalSessions
}

/**
 * The gym's list price for a session, before any pack applies.
 *
 * Introductory rate wins over the level-2 rate: an introductory session is
 * usually a discounted or free trial, and that intent should not be overridden
 * just because a senior trainer happens to take it.
 */
export function rateCardFee(
  rateCard: RateCard,
  opts: { type?: SessionType | null; trainerLevel?: TrainerLevel | null }
) {
  if (opts.type === "INTRODUCTORY" && rateCard.introSessionFee != null) {
    return rateCard.introSessionFee
  }
  if (opts.trainerLevel === "LEVEL_2" && rateCard.level2SessionFee != null) {
    return rateCard.level2SessionFee
  }
  return rateCard.defaultSessionFee
}

/**
 * The fee to write onto a session at booking time. Pack price first, rate card
 * as the fallback.
 */
export function resolveSessionFee(
  rateCard: RateCard,
  opts: {
    type?: SessionType | null
    trainerLevel?: TrainerLevel | null
    pack?: PackPricing | null
  }
) {
  return packSessionPrice(opts.pack) ?? rateCardFee(rateCard, opts)
}

/**
 * The trainer's share of a session fee. Off-shift work earns a premium on top
 * of the level rate (BR-041..BR-048).
 */
export function trainerPayFor(
  fee: number,
  opts: {
    trainerLevel?: TrainerLevel | null
    offShift: boolean
    level1BaseRate: number
    level2BaseRate: number
    offShiftPremium: number
  }
) {
  const base =
    opts.trainerLevel === "LEVEL_2" ? opts.level2BaseRate : opts.level1BaseRate
  const rate = base + (opts.offShift ? opts.offShiftPremium : 0)
  return { amount: round2(fee * rate), rate }
}

/** Money is still Float in the schema until M1-4 — round at the boundary. */
export function round2(n: number) {
  return Math.round(n * 100) / 100
}
