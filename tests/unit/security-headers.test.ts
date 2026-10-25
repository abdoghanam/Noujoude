import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";

type HeaderEntry = { key: string; value: string };

async function globalHeaders(): Promise<HeaderEntry[]> {
  const headersFn = (
    nextConfig as {
      headers?: () => Promise<{ source: string; headers: HeaderEntry[] }[]>;
    }
  ).headers;
  expect(headersFn).toBeTypeOf("function");
  const routes = await headersFn!();
  const global = routes.find((route) => route.source === "/(.*)");
  expect(global).toBeDefined();
  return global!.headers;
}

describe("security headers (requirements §197 / architecture §7)", () => {
  it("sets the required enforced headers on every path", async () => {
    const map = new Map(
      (await globalHeaders()).map((header) => [header.key, header.value]),
    );
    expect(map.get("X-Content-Type-Options")).toBe("nosniff");
    expect(map.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(map.get("X-Frame-Options")).toBe("DENY");
    expect(map.get("Strict-Transport-Security")).toBe("max-age=31536000");
    expect(map.get("Permissions-Policy")).toContain("camera=()");
  });

  it("sets enforced CSP with frame-ancestors none", async () => {
    const headers = await globalHeaders();
    const csp = headers.find(
      (header) => header.key === "Content-Security-Policy",
    );
    expect(csp).toBeDefined();
    expect(csp!.value).toContain("frame-ancestors 'none'");
    expect(csp!.value).toContain("object-src 'none'");
    expect(csp!.value).toContain("report-uri /api/csp-report");
    /* Report-Only header must be gone — CSP is now enforced. */
    expect(
      headers.find(
        (header) => header.key === "Content-Security-Policy-Report-Only",
      ),
    ).toBeUndefined();
  });
});
