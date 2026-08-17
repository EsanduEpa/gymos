import bcrypt from "bcryptjs"
import { randomInt } from "crypto"
import { z } from "zod"

const BCRYPT_ROUNDS = 10

// Ambiguous glyphs removed — these passwords get read aloud at a front desk or
// copied off a screen, and 0/O and 1/l/I are where that goes wrong.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
const TEMPORARY_LENGTH = 12

/**
 * A single-use password for an account someone else created.
 *
 * Uses `crypto.randomInt` rather than `Math.random`, which is not seeded for
 * unpredictability and must never generate a credential. Accounts issued one of
 * these are flagged `mustChangePassword`, so it only survives one sign-in.
 */
export function generateTemporaryPassword() {
  let out = ""
  for (let i = 0; i < TEMPORARY_LENGTH; i++) {
    out += ALPHABET[randomInt(0, ALPHABET.length)]
  }
  return out
}

/**
 * What a person may choose for themselves.
 *
 * Length carries most of the strength here. The one composition rule — not
 * entirely letters — rules out the worst dictionary choices without pushing
 * people toward `Password1!`.
 */
export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(200, "Password must be 200 characters or fewer.")
  .refine((v) => !/^[a-zA-Z]+$/.test(v), {
    message: "Include at least one number or symbol.",
  })
  .refine((v) => v.trim().length === v.length, {
    message: "Password cannot start or end with a space.",
  })

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}
