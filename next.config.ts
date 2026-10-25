import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  {
    key: "Reporting-Endpoints",
    value: 'csp-endpoints="/api/csp-report"',
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "connect-src 'self'",
      "report-uri /api/csp-report",
      "report-to csp-endpoints",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  /* Architecture §3: app/[locale] = top-level dynamic root layout → global-not-found
     is the documented convention for this case (Next 15.4+ experimental).
     inlineCss was tried and reverted (2026-10-16 Lighthouse): inlining the Tailwind
     sheet into HTML removed the render-blocking link but raised HTML parse cost so
     much that TBT went ~300ms → ~2200ms and the performance score dropped (54 vs 73).
     External stylesheet (one 8KB request) is the better trade-off for this build. */
  experimental: {
    globalNotFound: true,
  },
  /* Required for next-mdx-remote under Turbopack (package README). */
  transpilePackages: ["next-mdx-remote"],
  /* Phase 4 (P4-A): enforced baseline headers + CSP report-only (architecture §7). */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
