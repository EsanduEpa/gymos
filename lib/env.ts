// Fail loudly at startup rather than quietly at runtime.
//
// The auth secret previously fell back to a literal committed to this repo,
// which meant a missing environment variable produced a working app that any
// reader of the git history could forge sessions against. A crash on boot is
// the correct behaviour: an app that cannot sign tokens safely must not serve
// requests at all.

function required(name: string, value: string | undefined) {
  if (!value || value.trim() === "") {
    throw new Error(
      `${name} is not set. Add it to your environment before starting the app — there is no default.`
    )
  }
  return value
}

/**
 * The NextAuth signing secret. `AUTH_SECRET` is the v5 convention;
 * `NEXTAUTH_SECRET` is accepted so existing deployments keep working.
 */
export function authSecret() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

  // A short secret is not meaningfully better than no secret. 32 bytes of
  // base64 is what `openssl rand -base64 32` produces.
  if (secret && secret.length < 32) {
    throw new Error(
      "NEXTAUTH_SECRET is too short. Generate one with: openssl rand -base64 32"
    )
  }

  return required("NEXTAUTH_SECRET", secret)
}

export function databaseUrl() {
  return required("DATABASE_URL", process.env.DATABASE_URL)
}
