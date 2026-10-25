import { expect, test } from "@playwright/test";

const KEY_PAGES = [
  "/ar",
  "/en",
  "/ar/articles",
  "/ar/articles/test-mdx-pipeline",
  "/ar/about",
  "/ar/contact",
];

test.describe("mobile 375×667 (requirements §66 + wireframes §1)", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("details menu exposes navigation and leads to articles", async ({
    page,
  }) => {
    await page.goto("/ar");
    const menu = page.locator("header details");
    await menu.locator("summary").click();
    const mobileNav = menu.getByRole("link", { name: "المقالات" });
    await expect(mobileNav).toBeVisible();
    await mobileNav.click();
    await expect(page).toHaveURL(/\/ar\/articles$/);
  });

  test("desktop nav is hidden on mobile (no duplicate focus stops)", async ({
    page,
  }) => {
    await page.goto("/ar");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
  });

  for (const path of KEY_PAGES) {
    test(`no horizontal overflow on ${path} at 375px`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("reflow at 320px (400% zoom proxy — requirements §181)", () => {
  test.use({ viewport: { width: 320, height: 256 } });

  for (const path of KEY_PAGES) {
    test(`reflow ok on ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
