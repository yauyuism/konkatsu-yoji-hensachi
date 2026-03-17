import { expect, test } from "@playwright/test";

test("統計ページの主要導線を表示できる", async ({ page }) => {
  await page.goto("/prof/stats");

  await expect(page.getByTestId("prof-stats-page")).toBeVisible();
  await expect(page.getByTestId("prof-stats-heading")).toBeVisible();
  await expect(page.getByTestId("stats-diagnose-cta")).toBeVisible();
  await expect(page.getByTestId("stats-share-x")).toBeVisible();
  await expect(page.getByRole("link", { name: "詳しく見る →" })).toBeVisible();
  await expect(page.getByText("質問型偏差値もやる")).toHaveCount(0);
});
