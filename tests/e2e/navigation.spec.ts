import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/ar", heading: /NOUJOUDE|نجود/ },
  { path: "/ar/articles", heading: "المقالات" },
  { path: "/ar/articles/test-mdx-pipeline", heading: "تجربة تجميع خط المحتوى" },
  { path: "/ar/about", heading: "عن المنصة" },
  { path: "/ar/contact", heading: "تواصل" },
  { path: "/ar/privacy", heading: "سياسة الخصوصية" },
  { path: "/ar/terms", heading: "الشروط والأحكام" },
] as const;

test.describe("core navigation flow (requirements §3 user flow)", () => {
  test("visitor walks home → articles → article → about → contact", async ({
    page,
  }) => {
    await page.goto("/ar");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "المقالات" })
      .click();
    await expect(page).toHaveURL(/\/ar\/articles$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "المقالات",
    );

    await page
      .getByRole("heading", { level: 3 })
      .getByRole("link")
      .first()
      .click();
    await expect(page).toHaveURL(/\/ar\/articles\/test-mdx-pipeline$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "تجربة تجميع خط المحتوى",
    );

    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "عن المنصة" })
      .click();
    await expect(page).toHaveURL(/\/ar\/about$/);

    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "تواصل" })
      .click();
    await expect(page).toHaveURL(/\/ar\/contact$/);
  });

  test("footer exposes about/contact/privacy/terms + language switch", async ({
    page,
  }) => {
    await page.goto("/ar");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "عن المنصة" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "تواصل" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "الخصوصية" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "الشروط" })).toBeVisible();
    await expect(
      footer.getByRole("navigation", { name: "Language" }),
    ).toBeVisible();
  });

  test("category chips on home lead to the filtered archive", async ({
    page,
  }) => {
    await page.goto("/ar");
    /* Home categories are a labelled <section>, not a landmark. */
    await page
      .getByRole("region", { name: "التصنيفات" })
      .getByRole("link", { name: "فن" })
      .click();
    await expect(page).toHaveURL(/\/ar\/articles\?category=art$/);
  });

  for (const entry of PAGES) {
    test(`single h1 on ${entry.path}`, async ({ page }) => {
      const response = await page.goto(entry.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  }
});
