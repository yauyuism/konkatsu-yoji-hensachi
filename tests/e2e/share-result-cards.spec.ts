import { expect, test } from "@playwright/test";

test("プロフィール偏差値の共有結果ページで画像保存導線を表示できる", async ({ page }) => {
  await page.goto("/prof/result");

  await expect(page.getByRole("heading", { name: /シェア用サマリー/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Xでシェア" })).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByRole("link", { name: "LINEで送る" })).toHaveAttribute("href", /social-plugins\.line\.me/);
  await expect(page.getByTestId("prof-save-card")).toBeVisible();
});

test("条件リアリティチェッカーの共有結果ページで画像保存導線を表示できる", async ({ page }) => {
  await page.goto("/conditions/result");

  await expect(page.getByTestId("conditions-static-share-section")).toBeVisible();
  await expect(page.getByRole("link", { name: "Xでシェアする" })).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByRole("link", { name: "LINEで送る" })).toHaveAttribute("href", /social-plugins\.line\.me/);
  await expect(page.getByTestId("conditions-save-card")).toBeVisible();
});
