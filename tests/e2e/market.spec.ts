import { expect, test } from "@playwright/test";

test("婚活スペック年収換算の入力から結果画面へ遷移できる", async ({ page }) => {
  await page.goto("/market");

  await page.locator("#market-age").fill("32");
  await page.locator("#market-income").fill("550");
  await page.locator("#market-height").fill("171");
  await page.getByTestId("market-submit").click();

  await expect(page).toHaveURL(/\/market\/result\?/);
  await expect(page.getByTestId("market-result")).toContainText("相当のレア度");
  await expect(page.getByTestId("market-result")).toContainText("650");
  await expect(page.getByText("スペックの効き方")).toBeVisible();
  await expect(page.getByText("重み付けすると")).toBeVisible();
  await expect(page.getByText("計算ロジック")).toBeVisible();
});

test("条件チェッカー結果が sessionStorage にあれば婚活倍率を表示できる", async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem(
      "conditionResult",
      JSON.stringify({
        count: 4312,
      })
    );
  });

  await page.goto("/market/result?g=male&age=32&inc=550&h=171&e=college&r=tokyo");

  await expect(page.getByTestId("market-result")).toContainText("婚活倍率");
  await expect(page.getByText("あなたが求めている相手", { exact: true })).toBeVisible();
  await expect(page.getByText("あなたを条件内に入れやすい相手", { exact: true })).toBeVisible();
});
