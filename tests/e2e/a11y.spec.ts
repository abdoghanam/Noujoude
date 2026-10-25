import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const AXE_PAGES = [
  "/ar",
  "/en",
  "/ar/articles",
  "/en/articles",
  "/ar/articles/test-mdx-pipeline",
  "/en/articles/test-mdx-pipeline",
  "/ar/about",
  "/en/about",
  "/ar/contact",
  "/en/contact",
  "/ar/privacy",
  "/en/privacy",
  "/ar/terms",
  "/en/terms",
  "/ar/definitely-not-a-page",
  "/en/definitely-not-a-page",
];

async function seriousAndCritical(page: Page, path: string) {
  await page.goto(path);
  /* Cast: @axe-core/playwright resolves playwright-core types via its own
     specifier — structurally identical to @playwright/test's Page but a
     distinct TS identity. Runtime object is the same Playwright page. */
  const results = await new AxeBuilder({
    page: page as unknown as ConstructorParameters<
      typeof AxeBuilder
    >[0]["page"],
  })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );
}

test.describe("axe-core automated accessibility (Q3-A: zero critical/serious)", () => {
  for (const path of AXE_PAGES) {
    test(`axe on ${path}`, async ({ page }) => {
      const violations = await seriousAndCritical(page, path);
      expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });
  }
});

test.describe("keyboard + focus (requirements §176)", () => {
  test("skip link is the first tab stop and jumps to #content", async ({
    page,
  }) => {
    await page.goto("/ar");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "تخطَّ إلى المحتوى الرئيسي" });
    await expect(skip).toBeFocused();
    /* visible while focused (wireframes §1) */
    const box = await skip.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#content$/);
  });

  test("focus-visible outline is present on interactive elements", async ({
    page,
  }) => {
    await page.goto("/ar");
    await page.keyboard.press("Tab"); /* skip link */
    await page.keyboard.press("Tab"); /* brand */
    const brand = page
      .getByRole("navigation", { name: "Main" })
      .page()
      .locator("header a")
      .first();
    await expect(brand).toBeFocused();
    const outline = await brand.evaluate((el) => {
      const style = getComputedStyle(el);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });
    expect(outline.width).not.toBe("0px");
    expect(outline.style).not.toBe("none");
  });

  test("header nav links are reachable and activatable by keyboard", async ({
    page,
  }) => {
    await page.goto("/en");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "About" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en\/about$/);
  });
});

test.describe("motion + reflow (requirements §180–181)", () => {
  test.use({ reducedMotion: "reduce" });

  test("transitions are neutralised under prefers-reduced-motion", async ({
    page,
  }) => {
    await page.goto("/ar");
    const duration = await page
      .getByRole("link", { name: "تخطَّ إلى المحتوى الرئيسي" })
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    const seconds = Number.parseFloat(duration) || 0;
    expect(seconds).toBeLessThanOrEqual(0.01);
  });
});
