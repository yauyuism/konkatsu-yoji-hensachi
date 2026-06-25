import { expect, type Page, test } from "@playwright/test";

const moshServicesUrl = "https://mosh.jp/yauyuism/services";

async function answerDiagnosis(page: Page, answers: string[]) {
  await page.getByTestId("fatigue-reason-start").click();

  for (const answer of answers) {
    await expect(page.getByTestId("fatigue-reason-question")).toBeVisible();
    await page.locator(`[data-testid='fatigue-reason-question'] .fatigue-answer[data-answer-value='${answer}']`).click();
  }

  await expect(page.getByTestId("fatigue-reason-result")).toBeVisible();
}

test("婚活疲れ・マチアプ疲れの理由診断を最後まで進められる", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue");

  await expect(page.getByTestId("fatigue-reason-intro")).toBeVisible();
  await expect(page.getByRole("heading", { name: "婚活疲れ・マチアプ疲れの理由診断" })).toBeVisible();

  const answers = Array.from({ length: 20 }, () => "none");
  answers[0] = "very";
  answers[1] = "very";
  answers[2] = "very";
  answers[3] = "very";

  await answerDiagnosis(page, answers);

  await expect(page.getByRole("heading", { name: /あなたが婚活疲れしている一番の理由/ })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "速すぎる判断に疲れているタイプ" })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-top-factors").locator("article")).toHaveCount(3);
  await expect(page.getByText("主因").first()).toBeVisible();
  await expect(page.getByText("副因").first()).toBeVisible();
  await expect(page.getByText("補助要因").first()).toBeVisible();
  await expect(page.getByText("まず見直すこと")).toBeVisible();
  await expect(page.getByText("合いやすい出会い方")).toBeVisible();
  await expect(page.getByText("主戦場にしすぎると疲れやすい出会い方")).toBeVisible();
  await expect(page.getByText("タイプ一致度")).toHaveCount(0);
  await expect(page.getByText("詳しいスコアを見る")).toBeVisible();
  await expect(page.getByTestId("mosh-consultation-cta").getByRole("link", { name: "婚活の見直し相談を見る" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});

test("合わない人が入りすぎている結果ではプロフィール添削CTAを表示する", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue");

  const answers = Array.from({ length: 20 }, () => "none");
  answers[4] = "very";
  answers[5] = "very";
  answers[6] = "very";

  await answerDiagnosis(page, answers);

  await expect(
    page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "合わない人が入りすぎて疲れているタイプ" })
  ).toBeVisible();
  await expect(
    page.getByTestId("mosh-consultation-cta").getByRole("link", { name: "プロフィール添削を見る" })
  ).toHaveAttribute("href", moshServicesUrl);
});

test("立て直し結果では2回セットCTAを表示する", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue");

  const answers = Array.from({ length: 20 }, () => "none");
  answers[18] = "very";
  answers[19] = "very";

  await answerDiagnosis(page, answers);

  await expect(page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "いったん立て直したほうがいいタイプ" })).toBeVisible();
  await expect(page.getByTestId("mosh-consultation-cta").getByRole("link", { name: "2回セットを見る" })).toHaveAttribute("href", moshServicesUrl);
});
