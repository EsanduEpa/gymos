import type { NextConfig } from "next";

// A Content-Security-Policy strict enough to matter without breaking the app.
//
// 'unsafe-inline' on style-src is required by Tailwind's runtime styles, and
// Next injects inline bootstrap scripts, so script-src needs it too until the
// app adopts nonces. Both are noted rather than hidden: they weaken CSP's XSS
// protection, and tightening them is worthwhile once the app is stable.
//
// The clauses doing real work here are frame-ancestors (clickjacking),
// form-action (stops an injected form posting credentials off-site), and
// object-src (blocks legacy plugin vectors).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt and braces alongside frame-ancestors, for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This app has no need for any of these; deny them outright.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Two years, subdomains included. Only sent over HTTPS, so it is inert locally.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
