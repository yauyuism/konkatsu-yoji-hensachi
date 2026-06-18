import { expect, test } from "@playwright/test";

test("トップページの主要導線を表示できる", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("home-page")).toBeVisible();
  await expect(page.getByRole("link", { name: /婚活診断LAB/ })).toBeVisible();
  await expect(page.getByTestId("home-hero-heading")).toContainText("診断で、恋愛や婚活の癖を知る。");
  await expect(page.getByTestId("home-hero-cta")).toHaveAttribute("href", "/diagnoses/deai-fit");
  await expect(page.getByTestId("home-first-step")).toBeVisible();
  await expect(page.getByText("診断・ツール一覧")).toBeVisible();
  await expect(page.locator("#tool-list").getByRole("link", { name: /自分に合う出会い方診断/ })).toBeVisible();
  await expect(page.locator("#tool-list").getByRole("link", { name: /My 9 Specs/ })).toBeVisible();
  await expect(page.getByTestId("home-guides")).toBeVisible();
  await expect(page.getByTestId("home-aikata")).toBeVisible();
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
  await expect(page.getByTestId("home-first-step")).toHaveCount(0);
});
