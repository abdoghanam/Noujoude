import { expect, test } from "@playwright/test";

test.describe("i18n behaviour (Q4-A + requirements §5)", () => {
  test("`/` redirects to `/ar` (default locale, no auto-detection)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar$/);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");
  });

  test("/en renders LTR with lang=en", async ({ page }) => {
    await page.goto("/en");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");
  });

  test("language switch preserves the relative path (article page)", async ({
    page,
  }) => {
    await page.goto("/ar/articles/test-mdx-pipeline");
    /* Two Language navs exist on article pages (on-page switcher + footer
       switcher, per wireframe §112) — the first is the on-page one. */
    await page
      .getByRole("navigation", { name: "Language" })
      .first()
      .getByRole("link", { name: "EN" })
      .click();
    await expect(page).toHaveURL(/\/en\/articles\/test-mdx-pipeline$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("language switch preserves the relative path (articles archive)", async ({
    page,
  }) => {
    await page.goto("/ar/about");
    await page
      .getByRole("navigation", { name: "Language" })
      .getByRole("link", { name: "EN" })
      .click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");
  });

  test("no cookie is set for the language (Q4-A — cookieLocale disabled)", async ({
    page,
    context,
  }) => {
    await page.goto("/en");
    const cookies = await context.cookies();
    expect(cookies.map((cookie) => cookie.name)).not.toContain("NEXT_LOCALE");
  });

  test("articles archive renders in both languages with equal structure", async ({
    page,
  }) => {
    for (const [locale, title] of [
      ["ar", "المقالات"],
      ["en", "Articles"],
    ] as const) {
      await page.goto(`/${locale}/articles`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(
        page.getByRole("navigation", {
          name: /تصفية المقالات|Filter articles/,
        }),
      ).toBeVisible();
    }
  });
});
