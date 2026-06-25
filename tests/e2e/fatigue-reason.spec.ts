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
  await expect(page.getByTestId("fatigue-reason-result-hero")).toContainText("気持ちが育つ前に判断を迫られるタイプ");
  await expect(
    page
      .getByTestId("fatigue-reason-result-hero")
      .getByText("会えるのに進まない理由は、相手を見る前に疲れる仕組みに入っていることかもしれません。")
  ).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-radar")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-map")).toContainText("あなたの婚活疲れマップ");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("今のしんどさの内訳");
  await expect(page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "判断先行" })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-top-factors").locator("article")).toHaveCount(3);
  await expect(page.getByText("いちばんの詰まり").first()).toBeVisible();
  await expect(page.getByText("しんどさの増幅ポイント").first()).toBeVisible();
  await expect(page.getByText("見落としがちな疲れグセ").first()).toBeVisible();
  await expect(page.getByText("主因")).toHaveCount(0);
  await expect(page.getByText("副因")).toHaveCount(0);
  await expect(page.getByText("補助要因")).toHaveCount(0);
  await expect(page.getByText("疲れを増やす要素")).toHaveCount(0);
  await expect(page.getByText("隠れた負担要因")).toHaveCount(0);
  await expect(page.getByText("やや出ています")).toHaveCount(0);
  await expect(page.getByText("おすすめの見直し方")).toBeVisible();
  await expect(page.getByText("合いやすい出会い方")).toBeVisible();
  await expect(page.getByText("主戦場にしすぎると疲れやすい出会い方")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-card")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-x-top")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByTestId("fatigue-reason-share-x-top")).toHaveAttribute("href", /result%3DfastJudgment/);
  await expect(page.getByTestId("fatigue-reason-share-x-bottom")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  await expect(page.getByRole("heading", { name: "結果をシェアする" })).toBeVisible();
  await expect(page.getByText("画像つきで投稿したい場合は、先に結果カードを保存して、投稿に添付してください。")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-save-card")).toHaveText("画像を保存してシェア");
  await expect(page.getByTestId("fatigue-reason-related")).toContainText("次におすすめの診断");
  await expect(page.getByText("タイプ一致度")).toHaveCount(0);
  await expect(page.getByText("参考メモを見る")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-details")).toContainText("詳細説明");
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

test("result付きURLでは婚活疲れ診断の個別結果カードを直接表示する", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue?result=wrongPeople");

  await expect(page.getByTestId("fatigue-reason-intro")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-result")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-result-hero").locator("h1", { hasText: "入口ズレ型" })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-card")).toContainText("入口ズレ型");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("今のしんどさの内訳");
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", /\/og\/fatigue-reason\/wrongPeople\.png\?v=20260625/);
  await expect(page.locator("meta[name='twitter:image']")).toHaveAttribute("content", /\/og\/fatigue-reason\/wrongPeople\.png\?v=20260625/);
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", /入口ズレ型/);
});

test("結果カードをPNG画像として保存できる", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue?result=fastJudgment");

  await expect(page.getByTestId("fatigue-reason-share-card")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("fatigue-reason-save-card").click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("婚活疲れ診断_判断先行型.png");
});

test("しんどさの内訳は画面に出る点数の高い順に並ぶ", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue");

  const answers = Array.from({ length: 20 }, () => "none");
  answers[0] = "very";
  answers[1] = "very";
  answers[2] = "somewhat";
  answers[16] = "very";
  answers[17] = "very";

  await answerDiagnosis(page, answers);

  await expect(page.getByTestId("fatigue-reason-result-hero").locator("h1", { hasText: "予定調和疲れ型" })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("いちばんの詰まり：予定調和");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("100");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("しんどさの増幅ポイント：判断先行");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("67");
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

test("立て直しスコアが高い場合はコンディションとして別枠表示する", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue");

  const answers = Array.from({ length: 20 }, () => "none");
  answers[0] = "very";
  answers[3] = "very";
  answers[15] = "very";
  answers[18] = "very";
  answers[19] = "very";

  await answerDiagnosis(page, answers);

  await expect(page.getByTestId("fatigue-reason-condition")).toContainText("今のコンディション");
  await expect(page.getByTestId("fatigue-reason-condition")).toContainText("立て直しサインが出ています");
  await expect(page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "立て直し" })).toHaveCount(0);
  await expect(page.getByTestId("mosh-consultation-cta").getByRole("link", { name: "2回セットを見る" })).toHaveCount(0);
});
