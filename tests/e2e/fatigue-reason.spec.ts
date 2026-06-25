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

  await expect(page.getByTestId("fatigue-reason-result-hero").locator("h1", { hasText: "判断先行型" })).toBeVisible();
  await expect(
    page
      .getByTestId("fatigue-reason-result-hero")
      .getByText("会えるのに進まない理由は、相手を見る前に疲れる仕組みに入っていることかもしれません。")
  ).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-radar")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "判断先行" })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-top-factors").locator("article")).toHaveCount(3);
  await expect(page.getByText("いちばんの詰まり").first()).toBeVisible();
  await expect(page.getByText("疲れを増やす要素").first()).toBeVisible();
  await expect(page.getByText("隠れた負担要因").first()).toBeVisible();
  await expect(page.getByText("主因")).toHaveCount(0);
  await expect(page.getByText("副因")).toHaveCount(0);
  await expect(page.getByText("補助要因")).toHaveCount(0);
  await expect(page.getByText("上位3つの強さ")).toBeVisible();
  await expect(page.getByText("おすすめの見直し方")).toBeVisible();
  await expect(page.getByText("合いやすい出会い方")).toBeVisible();
  await expect(page.getByText("主戦場にしすぎると疲れやすい出会い方")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-card")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-x-top")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByTestId("fatigue-reason-share-x-bottom")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByTestId("fatigue-reason-save-card")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-related")).toContainText("次におすすめの診断");
  await expect(page.getByText("タイプ一致度")).toHaveCount(0);
  await expect(page.getByText("詳しいスコアを見る")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-language-consultation-cta")).toContainText("診断だけでは分からない人へ");
  await expect(
    page
      .getByTestId("fatigue-reason-language-consultation-cta")
      .getByRole("link", { name: "婚活疲れの言語化相談を見てみる" })
  ).toHaveAttribute("href", moshServicesUrl);
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
    page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "入口ズレ" })
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

  await expect(page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "立て直し" })).toBeVisible();
  await expect(page.getByTestId("mosh-consultation-cta").getByRole("link", { name: "2回セットを見る" })).toHaveAttribute("href", moshServicesUrl);
});
