import { expect, test } from "@playwright/test";

import { baseAnalysisResult, detailAnalysisResult } from "./fixtures/prof-analysis";

async function mockAnalyzeApi(page: import("@playwright/test").Page) {
  await page.route("**/api/analyze", async (route) => {
    const body = route.request().postDataJSON() as { mode?: string };

    if (body.mode === "details") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(detailAnalysisResult),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(baseAnalysisResult),
    });
  });
}

test("プロフィール診断フローを最後まで表示できる", async ({ page }) => {
  await mockAnalyzeApi(page);
  await page.goto("/prof");

  await page.getByTestId("profile-textarea").fill(
    "都内でWebマーケの仕事をしています。休みの日は代々木公園でランニングしたり、Netflixで海外ドラマを観ています。最近は友達に誘われてゴルフを始めました。美味しいもの好きなので、いいお店があったら教えてください。"
  );
  await page.getByTestId("profile-submit").click();

  await expect(page).toHaveURL(/\/prof\/result\?/);
  await expect(page.getByTestId("prof-result")).toBeVisible();
  await expect(page.getByTestId("target-audience")).toContainText("ど真ん中で刺さる層");
  await expect(page.getByTestId("before-after")).toBeVisible();
  await expect(page.getByTestId("before-after-delta")).toContainText("+18 UP");
});

test("短すぎる入力では診断ボタンが無効のまま", async ({ page }) => {
  await page.goto("/prof");

  await page.getByTestId("profile-textarea").fill("短い自己紹介です");
  await expect(page.getByTestId("profile-submit")).toBeDisabled();
});

test("初回分析の失敗時にエラーを表示する", async ({ page }) => {
  await page.route("**/api/analyze", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        error: "たくさん使っていただきありがとうございます。1時間後にまたどうぞ",
      }),
    });
  });

  await page.goto("/prof");
  await page.getByTestId("profile-textarea").fill(
    "都内でWebマーケの仕事をしています。休みの日は代々木公園でランニングしたり、Netflixで海外ドラマを観ています。最近は友達に誘われてゴルフを始めました。美味しいもの好きなので、いいお店があったら教えてください。"
  );
  await page.getByTestId("profile-submit").click();

  await expect(page.getByText("たくさん使っていただきありがとうございます。1時間後にまたどうぞ")).toBeVisible();
});
