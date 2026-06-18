import { expect, test } from "@playwright/test";

test("My 9 Specs の結果にマッチングアプリ推薦を表示できる", async ({ page }) => {
  await page.goto("/my9specs");

  await page.getByRole("button", { name: /年収400万以上/ }).click();
  await page.getByRole("button", { name: /貯金がちゃんとある/ }).click();

  await page.getByRole("button", { name: "年齢", exact: true }).click();
  await page.getByRole("button", { name: /3歳差まで/ }).click();

  await page.getByRole("button", { name: "見た目", exact: true }).click();
  await page.getByRole("button", { name: /清潔感/ }).click();
  await page.getByRole("button", { name: /身長170cm以上/ }).click();

  await page.getByRole("button", { name: "性格", exact: true }).click();
  await page.getByRole("button", { name: /優しい/ }).click();

  await page.getByRole("button", { name: "学歴", exact: true }).click();
  await page.getByRole("button", { name: /🎓 大卒以上/ }).click();

  await page.getByRole("button", { name: "住まい", exact: true }).click();
  await page.getByRole("button", { name: /東京/ }).click();

  await page.getByRole("button", { name: "生活", exact: true }).click();
  await page.getByRole("button", { name: /タバコ吸わない/ }).click();

  await expect(page.getByRole("button", { name: "画像を作る →" })).toBeVisible();
  await page.getByRole("button", { name: "画像を作る →" }).click();

  await expect(page.getByText("マッチングアプリの現実")).toBeVisible();
  await expect(page.getByRole("heading", { name: /上位.*使うアプリを間違えるな/ })).toBeVisible();
  await expect(page.getByText("公式サイト →").first()).toBeVisible();
});
