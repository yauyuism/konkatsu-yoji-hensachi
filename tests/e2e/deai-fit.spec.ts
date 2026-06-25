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

  await expect(page.getByTestId("deai-fit-result-hero")).toContainText("RESULT CARD");
  await expect(page.getByTestId("deai-fit-result-hero").locator("h1", { hasText: "条件検索即決型" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-result-hero")).toContainText("条件で候補を絞って、合いそうなら早めに一対一で進めたいタイプです。");
  await expect(page.getByTestId("deai-fit-radar")).toBeVisible();
  await expect(page.getByTestId("deai-fit-route-cards").locator("article")).toHaveCount(3);
  await expect(page.getByTestId("deai-fit-route-cards")).toContainText("いちばん合いそうな出会い方");
  await expect(page.getByTestId("deai-fit-meeting-bars")).toContainText("出会い方の相性");
  await expect(page.getByTestId("deai-fit-share-card")).toContainText("条件検索即決型");
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", /result%3DO-C-Q-D/);
  await expect(page.getByTestId("deai-fit-share-x-bottom")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByTestId("deai-fit-save-card")).toBeVisible();
  await expect(page.getByTestId("deai-fit-fatigue-cta").getByRole("link", { name: "婚活疲れ・マチアプ疲れ診断をやってみる" })).toHaveAttribute(
    "href",
    "/diagnoses/konkatsu-fatigue"
  );
  await expect(page.getByTestId("deai-fit-mosh-cta").getByRole("link", { name: "婚活疲れの言語化相談を見てみる" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});

test("通常タイプでは出会い方相談CTAを表示する", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit");

  await answerDiagnosis(page, fcqnAnswers);

  await expect(page.getByTestId("deai-fit-result-hero").locator("h1", { hasText: "紹介即決型" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-mosh-cta").getByRole("link", { name: "婚活疲れの言語化相談を見てみる" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});

test("生活圏タイプでも出会い方相談CTAを表示する", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit");

  await answerDiagnosis(page, fvsnAnswers);

  await expect(page.getByTestId("deai-fit-result-hero").locator("h1", { hasText: "生活圏拡張型" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-mosh-cta").getByRole("link", { name: "婚活疲れの言語化相談を見てみる" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});
