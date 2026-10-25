import { expect, test } from "@playwright/test";

test.describe("404 behaviour (requirements §158 + wireframes §8)", () => {
  test("GET /fr returns a real HTTP 404 (unsupported locale)", async ({
    request,
  }) => {
    const response = await request.get("/fr");
    expect(response.status()).toBe(404);
  });

  test("deep unknown path inside a locale is a real 404", async ({
    request,
  }) => {
    const response = await request.get("/ar/definitely-not-a-page");
    expect(response.status()).toBe(404);
  });

  /* unmatched deep paths serve app/global-not-found.tsx (experimental.globalNotFound)
     — bilingual h1 + one home link per language, labels without locale suffix */
  test("in-locale 404 page is bilingual with home links", async ({ page }) => {
    const response = await page.goto("/ar/definitely-not-a-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "الصفحة غير موجودة",
    );
    await expect(page.getByText("Page not found")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "العودة للرئيسية" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to home" }),
    ).toBeVisible();
  });

  test("root 404 for an unmatched URL offers both home links", async ({
    page,
  }) => {
    const response = await page.goto("/en/definitely-not-a-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test("unknown single-segment path outside locales still 404s", async ({
    request,
  }) => {
    const response = await request.get("/unknown.txt");
    expect(response.status()).toBe(404);
  });
});
