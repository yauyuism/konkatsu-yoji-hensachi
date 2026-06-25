import { expect, test } from "@playwright/test";

const moshServicesUrl = "https://mosh.jp/yauyuism/services";

test("トップページの主要導線を表示できる", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("home-page")).toBeVisible();
  await expect(page.getByRole("link", { name: /婚活診断LAB/ })).toBeVisible();
  await expect(page.getByTestId("home-hero-heading")).toContainText("婚活の違和感を、診断で言語化する。");
  await expect(page.getByTestId("home-hero-cta")).toHaveAttribute("href", "/diagnoses/konkatsu-fatigue");
  await expect(page.getByTestId("home-hero-consultation-cta")).toHaveAttribute("href", moshServicesUrl);
  await expect(page.getByTestId("home-main-diagnoses")).toBeVisible();
  await expect(page.getByTestId("home-main-diagnoses").getByRole("link", { name: /婚活疲れ・マチアプ疲れの理由診断/ })).toBeVisible();
  await expect(page.getByTestId("home-main-diagnoses").getByRole("link", { name: /あなたに合う出会い方診断/ })).toBeVisible();
  await expect(page.getByTestId("home-course-guides")).toBeVisible();
  await expect(page.getByText("診断・ツール一覧")).toBeVisible();
  await expect(page.locator("#tool-list").getByRole("link", { name: /婚活疲れ・マチアプ疲れの理由診断/ })).toBeVisible();
  await expect(page.locator("#tool-list").getByRole("link", { name: /あなたに合う出会い方診断/ })).toBeVisible();
  await expect(page.locator("#tool-list").getByRole("link", { name: /My 9 Specs/ })).toBeVisible();
  await expect(page.getByTestId("home-guides")).toBeVisible();
  await expect(page.getByTestId("home-consultation").getByTestId("mosh-consultation-cta").getByRole("link")).toHaveAttribute("href", moshServicesUrl);
});

test("完了済みユーザーには『まずはこれ』を表示しない", async ({ page, context, baseURL }) => {
  await context.addCookies([
    {
      name: "sl_completed_tools",
      value: "1",
      url: baseURL ?? "http://127.0.0.1:3000",
    },
  ]);

  await page.addInitScript(() => {
    window.localStorage.setItem("completedTools", JSON.stringify(["hensachi"]));
  });

  await page.goto("/");

  await expect(page.getByTestId("home-page")).toBeVisible();
  await expect(page.getByTestId("home-main-diagnoses")).toBeVisible();
  await expect(page.getByTestId("home-first-step")).toHaveCount(0);
});
