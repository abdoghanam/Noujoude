/* Global 404 — full document (bypasses layouts; nextjs.org global-not-found convention).
   Handles URLs matching no route. In-locale misses go to app/[locale]/not-found.tsx
   via the catch-all. Bilingual by design: no locale is known for an unmatched URL.
   Colors: green/ivory 7.82:1 · ink/ivory 13.15:1 (design-system §2.1).
   Next auto-injects <meta name="robots" content="noindex"> for 404 status. */
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — NOUJOUDE",
};

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body
        className="bg-ivory text-ink"
        style={{
          fontFamily:
            "Noto Naskh Arabic, Noto Sans Arabic, Georgia, system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <main
          id="content"
          style={{ textAlign: "center", padding: "2rem", lineHeight: 1.8 }}
        >
          <p
            style={{
              fontSize: "64px",
              margin: 0,
              color: "#3E5145",
              fontWeight: 600,
            }}
          >
            404
          </p>
          <h1
            style={{
              fontSize: "28px",
              color: "#302923",
              fontWeight: 600,
              margin: "16px 0 0",
            }}
          >
            الصفحة غير موجودة
          </h1>
          <p style={{ margin: "8px 0 0", color: "#302923" }}>Page not found</p>
          <p
            style={{
              marginTop: "32px",
              display: "flex",
              gap: 16,
              justifyContent: "center",
            }}
          >
            <Link
              href="/ar"
              style={{
                background: "#302923",
                color: "#F8F5EF",
                padding: "12px 24px",
                borderRadius: 2,
                textDecoration: "none",
              }}
            >
              العودة للرئيسية
            </Link>
            <Link
              href="/en"
              style={{
                border: "2px solid #302923",
                color: "#302923",
                padding: "10px 22px",
                borderRadius: 2,
                textDecoration: "none",
              }}
            >
              Back to home
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
