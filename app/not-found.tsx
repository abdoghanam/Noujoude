"use client";

/* Root 404 boundary — official next-intl pattern ('use client' + full html):
   renders when an invalid [locale] param reaches app/[locale]/layout.tsx
   (e.g. /unknown.txt) and notFound() is thrown from i18n/request.ts.
   Unmatched-route handling: app/global-not-found.tsx (experimental.globalNotFound).
   Bilingual by design (no locale context). Colors: design-system §2.1. */
import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          fontFamily:
            "Noto Naskh Arabic, Noto Sans Arabic, Georgia, system-ui, sans-serif",
          background: "#F8F5EF",
          color: "#302923",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <main style={{ textAlign: "center", padding: "2rem", lineHeight: 1.8 }}>
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
              flexWrap: "wrap",
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
              العودة للرئيسية (عربي)
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
              Back to home (English)
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
