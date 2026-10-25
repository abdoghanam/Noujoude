import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";

describe("i18n routing decisions (Q4-A)", () => {
  it("has exactly ar and en, default ar", () => {
    expect([...routing.locales]).toEqual(["ar", "en"]);
    expect(routing.defaultLocale).toBe("ar");
  });

  it("always prefixes locales, no cookie-based detection", () => {
    expect(routing.localePrefix).toBe("always");
    expect(routing.localeDetection).toBe(false);
    expect(routing.localeCookie).toBe(false);
  });

  it("uses metadata hreflang as the single alternate source (no HTTP Link headers)", () => {
    expect(routing.alternateLinks).toBe(false);
  });
});
