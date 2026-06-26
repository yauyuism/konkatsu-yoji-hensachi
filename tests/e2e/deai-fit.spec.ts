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
  await expect(page.getByTestId("deai-fit-result-hero").getByRole("heading", { name: "あなたに合う出会い方は？" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-result-hero").getByRole("heading", { name: "条件確認スピード婚活タイプ" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-result-hero")).toContainText("O-C-Q-D");
  await expect(page.getByTestId("deai-fit-result-hero")).toContainText("会う前に条件を確認し、合いそうなら早めに一対一で進めたいタイプです。");
  await expect(page.getByTestId("deai-fit-axis-bars")).toContainText("4軸で見る出会い方のクセ");
  await expect(page.getByTestId("deai-fit-axis-bars")).toContainText("Online");
  await expect(page.getByTestId("deai-fit-axis-bars")).toContainText("Condition");
  await expect(page.getByTestId("deai-fit-radar")).toBeVisible();
  await expect(page.getByTestId("deai-fit-route-cards").locator("article")).toHaveCount(3);
  await expect(page.getByTestId("deai-fit-route-cards")).toContainText("いちばん合いそうな出会い方");
  await expect(page.getByTestId("deai-fit-method-map")).toContainText("あなたの出会い方マップ");
  await expect(page.getByTestId("deai-fit-method-map")).toContainText("合いやすい出会い方");
  await expect(page.getByTestId("deai-fit-method-map")).toContainText("主戦場にしすぎると疲れやすい出会い方");
  await expect(page.getByTestId("deai-fit-meeting-bars")).toContainText("相性が高く出た入口");
  await expect(page.getByTestId("deai-fit-share-card")).toContainText("あなたの出会い方診断結果");
  await expect(page.getByTestId("deai-fit-share-card")).toContainText("条件確認スピード婚活タイプ");
  await expect(page.getByTestId("deai-fit-share-card")).toContainText("やうゆ式");
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveText("診断結果をXにシェア");
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("target", "_blank");
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", /diagnoses%2Fdeai-fit%2Fresult%2Focqd/);
  await expect(page.getByTestId("deai-fit-consultation-top")).toHaveAttribute("href", moshServicesUrl);
  await expect(page.getByTestId("deai-fit-consultation-top")).toHaveAttribute("target", "_blank");
  await expect(page.getByTestId("deai-fit-consultation-top")).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByTestId("deai-fit-share-x-bottom")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByTestId("deai-fit-save-card")).toHaveText("結果を画像で保存");
  await expect(page.getByTestId("deai-fit-next-diagnostics")).toContainText("次におすすめの診断");
  await expect(page.getByTestId("deai-fit-next-diagnostics").getByRole("link", { name: /婚活疲れ・マチアプ疲れの理由診断/ })).toHaveAttribute(
    "href",
    "/diagnoses/konkatsu-fatigue"
  );
  await expect(page.getByTestId("deai-fit-next-diagnostics").getByRole("link", { name: /プロフィール偏差値診断/ })).toHaveAttribute("href", "/prof");
  await expect(page.getByTestId("deai-fit-mosh-cta").getByRole("link", { name: "自分に合う出会い方を相談する" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});

test("result付きURLでは出会い方診断の個別結果カードを直接表示する", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit?result=F-V-S-N");

  await expect(page.getByTestId("deai-fit-intro")).toHaveCount(0);
  await expect(page.getByTestId("deai-fit-result")).toBeVisible();
  await expect(page.getByTestId("deai-fit-result-hero").getByRole("heading", { name: "生活圏でじわじわ好きになるタイプ" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-share-card")).toContainText("生活圏でじわじわ好きになるタイプ");
  await expect(page.getByTestId("deai-fit-axis-bars")).toContainText("Offline");
  await expect(page.getByTestId("deai-fit-method-map")).toContainText("あなたの出会い方マップ");
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", /diagnoses%2Fdeai-fit%2Fresult%2Ffvsn/);
  await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", /\/diagnoses\/deai-fit\/result\/fvsn$/);
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", /\/og\/deai-fit\/fvsn\.png\?v=20260626/);
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", /生活圏でじわじわ好きになるタイプ/);
});

test("結果別URLではタイプ別OGPと診断導線を表示する", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit/result/ocqn");

  await expect(page.getByTestId("deai-fit-intro")).toHaveCount(0);
  await expect(page.getByTestId("deai-fit-result")).toBeVisible();
  await expect(page.getByTestId("deai-fit-result-hero")).toContainText("O-C-Q-N");
  await expect(page.getByTestId("deai-fit-result-hero").getByRole("heading", { name: "条件から広げる紹介活用タイプ" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", /diagnoses%2Fdeai-fit%2Fresult%2Focqn/);
  await expect(page.getByTestId("deai-fit-start-from-share")).toHaveAttribute("href", "/diagnoses/deai-fit");
  await expect(page.getByTestId("deai-fit-consultation-top")).toHaveAttribute("href", moshServicesUrl);
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", "あなたに合う出会い方診断｜条件から広げる紹介活用タイプ");
  await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", /\/diagnoses\/deai-fit\/result\/ocqn$/);
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", /\/og\/deai-fit\/ocqn\.png\?v=20260626/);
  await expect(page.locator("meta[name='twitter:image']")).toHaveAttribute("content", /\/og\/deai-fit\/ocqn\.png\?v=20260626/);
});

test("通常タイプでは出会い方相談CTAを表示する", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit");

  await answerDiagnosis(page, fcqnAnswers);

  await expect(page.getByTestId("deai-fit-result-hero").getByRole("heading", { name: "紹介即決タイプ" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-mosh-cta").getByRole("link", { name: "自分に合う出会い方を相談する" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});

test("生活圏タイプでも出会い方相談CTAを表示する", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit");

  await answerDiagnosis(page, fvsnAnswers);

  await expect(page.getByTestId("deai-fit-result-hero").getByRole("heading", { name: "生活圏でじわじわ好きになるタイプ" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-mosh-cta").getByRole("link", { name: "自分に合う出会い方を相談する" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
});
