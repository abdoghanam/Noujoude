import { expect, test } from "@playwright/test";

test.describe("archive filters — shareable URLs (wireframes §3/§89)", () => {
  test("category chip activates, updates the URL and the count", async ({
    page,
  }) => {
    await page.goto("/ar/articles");
    const filters = page.getByRole("navigation", { name: "تصفية المقالات" });
    await filters.getByRole("link", { name: "فن", exact: true }).click();
    await expect(page).toHaveURL(/category=art/);
    await expect(
      filters.getByRole("link", { name: "فن", exact: true }),
    ).toHaveAttribute("aria-current", "true");
    await expect(page.getByText("نتيجة واحدة")).toBeVisible();
  });

  test("tag chip filters and survives a direct visit (encoded Arabic)", async ({
    page,
  }) => {
    const tag = encodeURIComponent("تجريبي");
    await page.goto(`/ar/articles?tag=${tag}`);
    await expect(page.getByText("نتيجة واحدة")).toBeVisible();
    const active = page
      .getByRole("navigation", { name: "تصفية المقالات" })
      .getByRole("link", { name: "تجريبي" });
    await expect(active).toHaveAttribute("aria-current", "true");
  });

  test("combined category+tag (AND) with an empty result state", async ({
    page,
  }) => {
    await page.goto("/en/articles?category=art&tag=missing-tag");
    await expect(page.getByText("No articles match")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Clear filters" }).first(),
    ).toBeVisible();
  });

  test("clear filters returns to the unfiltered archive", async ({ page }) => {
    await page.goto("/ar/articles?category=coins");
    await page.getByRole("link", { name: "مسح الفلاتر" }).first().click();
    await expect(page).toHaveURL(/\/ar\/articles$/);
    await expect(page.getByText("نتيجة واحدة")).toBeVisible();
  });

  test("out-of-range page clamps to a valid page (no crash)", async ({
    page,
  }) => {
    const response = await page.goto("/ar/articles?page=99");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "المقالات",
    );
    await expect(page.getByText("نتيجة واحدة")).toBeVisible();
  });

  test("pagination UI stays hidden while there is a single page", async ({
    page,
  }) => {
    await page.goto("/ar/articles");
    await expect(
      page.getByRole("navigation", { name: "التنقل بين صفحات المقالات" }),
    ).toHaveCount(0);
    await expect(page.getByRole("link", { name: "تحميل المزيد" })).toHaveCount(
      0,
    );
  });
});
