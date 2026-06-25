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
  await expect(page.getByTestId("fatigue-reason-share-actions")).toContainText("画像を保存してシェア");
  await expect(page.getByTestId("fatigue-reason-share-actions")).toContainText("個別に相談する");
  await expect(page.getByTestId("fatigue-reason-consultation-quick")).toHaveAttribute("href", moshServicesUrl);
  await expect(page.getByTestId("fatigue-reason-share-x-top")).toHaveText("Xで文章だけシェア");
  await expect(page.getByTestId("fatigue-reason-summary")).toContainText("なぜ疲れているのか");
  await expect(page.getByTestId("fatigue-reason-first-actions")).toContainText("まず見直すこと");
  await expect(page.getByTestId("fatigue-reason-first-actions").locator("li")).toHaveCount(3);
  await expect(page.getByTestId("fatigue-reason-consultation-cta")).toContainText("この結果、もう少し個別に見たい人へ");
  await expect(page.getByTestId("fatigue-reason-consultation-cta").getByRole("link", { name: "婚活の見直し相談を見る" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
  await expect(page.getByTestId("fatigue-reason-radar")).toBeHidden();
  await expect(page.getByTestId("fatigue-reason-map")).toBeHidden();
  await expect(page.getByTestId("fatigue-reason-breakdown")).toBeHidden();
  await expect(page.getByTestId("fatigue-reason-top-factors")).toBeHidden();
  await page.getByText("詳しい診断結果を見る").click();
  await expect(page.getByTestId("fatigue-reason-radar")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-map")).toContainText("詳しい婚活疲れマップ");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("今のしんどさの内訳");
  await expect(page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "判断先行" })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-top-factors").locator("article")).toHaveCount(3);
  await expect(page.getByText("一番の原因").first()).toBeVisible();
  await expect(page.getByText("二番目のストレス").first()).toBeVisible();
  await expect(page.getByText("見落としがちな癖").first()).toBeVisible();
  await expect(page.getByText("主因")).toHaveCount(0);
  await expect(page.getByText("副因")).toHaveCount(0);
  await expect(page.getByText("補助要因")).toHaveCount(0);
  await expect(page.getByText("疲れを増やす要素")).toHaveCount(0);
  await expect(page.getByText("隠れた負担要因")).toHaveCount(0);
  await expect(page.getByText("やや出ています")).toHaveCount(0);
  await expect(page.getByText("合いやすい出会い方")).toBeVisible();
  await expect(page.getByText("主戦場にしすぎると疲れやすい出会い方")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-card")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-x-top")).toHaveAttribute("href", /twitter\.com\/intent\/tweet/);
  expect(await page.getByTestId("fatigue-reason-share-x-top").getAttribute("href")).not.toContain("result%3D");
  await expect(page.getByText("画像つきでXに載せたい人は、結果カードを保存して投稿に添付してください。")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-save-card")).toHaveText("画像を保存してシェア");
  await expect(page.getByTestId("fatigue-reason-related")).toContainText("次におすすめの診断");
  await expect(page.getByText("タイプ一致度")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-reference-scores")).toContainText("参考メモ");
  await expect(page.getByTestId("fatigue-reason-details")).toContainText("詳細説明");
});

test("result付きURLでは婚活疲れ診断の個別結果カードを直接表示する", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue?result=wrongPeople");

  await expect(page.getByTestId("fatigue-reason-intro")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-result")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-result-hero").locator("h1", { hasText: "入口ズレ型" })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-card")).toContainText("入口ズレ型");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toBeHidden();
  await page.getByText("詳しい診断結果を見る").click();
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

test("大きな疲れサインが薄い回答では低サイン結果を表示する", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue");

  await answerDiagnosis(page, Array.from({ length: 20 }, () => "none"));

  await expect(page.getByTestId("fatigue-reason-result-hero").locator("h1", { hasText: "疲れサイン薄め型" })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-summary")).toContainText("婚活疲れの原因がどこか一箇所に強く偏っている状態ではありませんでした");
  await expect(page.getByTestId("fatigue-reason-share-card")).toContainText("大きな原因は薄め");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-top-factors")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-reference-scores")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-share-x-top")).toHaveAttribute("href", /diagnoses%2Fkonkatsu-fatigue/);
  await page.getByText("詳しい診断結果を見る").click();
  await expect(page.getByTestId("fatigue-reason-low-signal")).toContainText("大きく出た原因はありません");
  await expect(page.getByTestId("fatigue-reason-low-signal")).toContainText("大きな原因は薄め");
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
  await expect(page.getByTestId("fatigue-reason-breakdown")).toBeHidden();
  await page.getByText("詳しい診断結果を見る").click();
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("一番の原因：予定調和");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("100");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("二番目のストレス：判断先行");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("67");
});

test("合わない人が入りすぎている結果でも上部の相談CTAを表示する", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue");

  const answers = Array.from({ length: 20 }, () => "none");
  answers[4] = "very";
  answers[5] = "very";
  answers[6] = "very";

  await answerDiagnosis(page, answers);

  await page.getByText("詳しい診断結果を見る").click();
  await expect(
    page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "入口ズレ" })
  ).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-consultation-cta").getByRole("link", { name: "婚活の見直し相談を見る" })).toHaveAttribute(
    "href",
    moshServicesUrl
  );
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

  await expect(page.getByTestId("fatigue-reason-condition")).toBeHidden();
  await page.getByText("詳しい診断結果を見る").click();
  await expect(page.getByTestId("fatigue-reason-condition")).toContainText("今のコンディション");
  await expect(page.getByTestId("fatigue-reason-condition")).toContainText("立て直しサインが出ています");
  await expect(page.getByTestId("fatigue-reason-top-factors").getByRole("heading", { name: "立て直し" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "2回セットを見る" })).toHaveCount(0);
});
