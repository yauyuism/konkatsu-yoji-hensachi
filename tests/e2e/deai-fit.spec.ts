import { expect, type Page, test } from "@playwright/test";

const moshServicesUrl = "https://mosh.jp/yauyuism/services";

const ocqdAnswers = [
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
];

const fcqnAnswers = [
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
];

const fvsnAnswers = [
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
  "none",
  "very",
];

async function answerDiagnosis(page: Page, answers: string[]) {
  await page.getByTestId("deai-fit-start").click();

  for (const answer of answers) {
    await expect(page.getByTestId("deai-fit-question")).toBeVisible();
    await page.locator(`[data-testid='deai-fit-question'] .deai-fit-answer[data-answer-value='${answer}']`).click();
  }

  await expect(page.getByTestId("deai-fit-result")).toBeVisible();
}

test("あなたに合う出会い方診断を最後まで進められる", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit");

  await expect(page.getByTestId("deai-fit-intro")).toBeVisible();
  await expect(page.getByRole("heading", { name: "あなたに合う出会い方診断" })).toBeVisible();

  await answerDiagnosis(page, ocqdAnswers);

  await expect(page.getByRole("heading", { name: /O-C-Q-D/ })).toBeVisible();
  await expect(page.getByText("条件確認スピード婚活タイプ")).toBeVisible();
  await expect(page.getByTestId("mosh-consultation-cta").getByRole("link", { name: "プロフィール添削を見る" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});

test("通常タイプでは出会い方相談CTAを表示する", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit");

  await answerDiagnosis(page, fcqnAnswers);

  await expect(page.getByRole("heading", { name: /F-C-Q-N/ })).toBeVisible();
  await expect(page.getByText("紹介即決タイプ")).toBeVisible();
  await expect(page.getByTestId("mosh-consultation-cta").getByRole("link", { name: "自分に合う出会い方を相談する" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});

test("生活圏タイプでも出会い方相談CTAを表示する", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit");

  await answerDiagnosis(page, fvsnAnswers);

  await expect(page.getByRole("heading", { name: /F-V-S-N/ })).toBeVisible();
  await expect(page.getByText("生活圏でじわじわ好きになるタイプ")).toBeVisible();
  await expect(page.getByTestId("mosh-consultation-cta").getByRole("link", { name: "自分に合う出会い方を相談する" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});
