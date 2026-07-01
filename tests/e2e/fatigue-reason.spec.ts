import { expect, type Page, test } from "@playwright/test";

const storeUrl = "https://yauyuism.stores.jp/";

async function answerDiagnosis(page: Page, answers: string[]) {
  await expect(page.getByTestId("fatigue-reason-start")).toBeVisible();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.getByTestId("fatigue-reason-start").click();

    try {
      await expect(page.getByTestId("fatigue-reason-question")).toBeVisible({ timeout: 2500 });
      break;
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }
    }
  }

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
  await expect(page.getByTestId("fatigue-reason-share-card")).toContainText("SHARE IMAGE");
  await expect(page.getByTestId("fatigue-reason-share-card")).toContainText("RESULT CARD");
  await expect(page.getByTestId("fatigue-reason-share-card")).toContainText("ひとことで言うと");
  await expect(page.getByTestId("fatigue-reason-card-map")).not.toContainText("詳しい婚活疲れマップ");
  await expect(page.getByTestId("fatigue-reason-share-actions")).toContainText("この結果はXでシェアできます");
  await expect(page.getByTestId("fatigue-reason-share-actions")).toContainText("投稿すると、診断カードがリンク画像として表示されます");
  await expect(page.getByTestId("fatigue-reason-share-actions")).toContainText("診断結果をXにシェア");
  await expect(page.getByTestId("fatigue-reason-share-actions")).toContainText("自分の場合を相談する");
  await expect(page.getByTestId("fatigue-reason-share-actions")).toContainText("画像だけ保存する");
  await expect(page.getByTestId("fatigue-reason-consultation-quick")).toHaveAttribute("href", storeUrl);
  await expect(page.getByTestId("fatigue-reason-consultation-quick")).toHaveAttribute("target", "_blank");
  await expect(page.getByTestId("fatigue-reason-consultation-quick")).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByTestId("fatigue-reason-share-x-top")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-summary")).toContainText("なぜ疲れているのか");
  await expect(page.getByTestId("fatigue-reason-meeting-fit")).toContainText("自分に合う出会い方");
  await expect(page.getByTestId("fatigue-reason-meeting-fit")).toContainText("疲れやすい出会い方");
  await expect(page.getByTestId("fatigue-reason-review-analysis")).toContainText("見直すこと");
  await expect(page.getByTestId("fatigue-reason-review-analysis")).toContainText("見直すべきなのは、出会いの数より");
  const reviewParagraphStyle = await page.getByTestId("fatigue-reason-review-analysis").locator("p").first().evaluate((element) => {
    const style = window.getComputedStyle(element);

    return {
      color: style.color,
      fontWeight: style.fontWeight,
    };
  });
  const summaryParagraphStyle = await page.getByTestId("fatigue-reason-summary").locator("p").first().evaluate((element) => {
    const style = window.getComputedStyle(element);

    return {
      color: style.color,
      fontWeight: style.fontWeight,
    };
  });

  expect(reviewParagraphStyle.color).toBe(summaryParagraphStyle.color);
  expect(Number(reviewParagraphStyle.fontWeight)).toBeLessThan(600);
  await expect(page.getByTestId("fatigue-reason-consultation-cta")).toContainText("この結果、もう少し個別に見たい人へ");
  await expect(page.getByTestId("fatigue-reason-consultation-cta").getByRole("link", { name: "婚活の見直し相談を見る" })).toHaveAttribute(
    "href",
    storeUrl
  );
  await expect(page.getByTestId("fatigue-reason-consultation-cta").getByRole("link", { name: "婚活の見直し相談を見る" })).toHaveAttribute("target", "_blank");
  await expect(page.getByTestId("fatigue-reason-consultation-cta").getByRole("link", { name: "婚活の見直し相談を見る" })).toHaveAttribute(
    "rel",
    "noopener noreferrer"
  );
  await expect(page.getByTestId("fatigue-reason-breakdown")).toBeHidden();
  await expect(page.getByTestId("fatigue-reason-top-factors")).toBeHidden();
  await page.getByText("詳しい診断結果を見る").click();
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
  await expect(page.getByText("合いやすい出会い方")).toHaveCount(0);
  await expect(page.getByText("主戦場にしすぎると疲れやすい出会い方")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-share-card")).toBeVisible();
  await expect(page.getByText("診断カード画像をそのまま投稿に載せるための導線です。")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-share-x")).toContainText("診断結果をXにシェア");
  await expect(page.getByTestId("fatigue-reason-related")).toContainText("次におすすめの診断");
  await expect(page.getByText("タイプ一致度")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-reference-scores")).toContainText("参考メモ");
  await expect(page.getByTestId("fatigue-reason-details")).toContainText("詳細説明");
});

test("結果別URLでは婚活疲れ診断の個別結果カードとOGPを直接表示する", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue/result/wrong-people");

  await expect(page.getByTestId("fatigue-reason-intro")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-result")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-result-hero").locator("h1", { hasText: "入口ズレ型" })).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-card")).toContainText("入口ズレ型");
  await expect(page.getByTestId("fatigue-reason-breakdown")).toBeHidden();
  await page.getByText("詳しい診断結果を見る").click();
  await expect(page.getByTestId("fatigue-reason-breakdown")).toContainText("今のしんどさの内訳");
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", /\/og\/fatigue-reason\/wrong-people\.png\?v=20260626/);
  await expect(page.locator("meta[name='twitter:image']")).toHaveAttribute("content", /\/og\/fatigue-reason\/wrong-people\.png\?v=20260626/);
  await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", /\/diagnoses\/konkatsu-fatigue\/result\/wrong-people$/);
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", /入口ズレ型/);
});

test("旧camelCaseの結果URLも新しいslugのOGPへ正規化する", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue/result/overAdjusting");

  await expect(page.getByTestId("fatigue-reason-result-hero").locator("h1", { hasText: "合わせ疲れ型" })).toBeVisible();
  await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", /\/diagnoses\/konkatsu-fatigue\/result\/over-adjusting$/);
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", /\/og\/fatigue-reason\/over-adjusting\.png\?v=20260626/);
});

test("メイン共有ボタンは結果別URL付きのX投稿画面を開く", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue?result=fastJudgment");

  await expect(page.getByTestId("fatigue-reason-share-card")).toBeVisible();
  await expect(page.getByTestId("fatigue-reason-share-x")).toHaveAttribute("target", "_blank");
  await expect(page.getByTestId("fatigue-reason-share-x")).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByTestId("fatigue-reason-share-x")).toHaveAttribute("href", /https:\/\/twitter\.com\/intent\/tweet/);

  const popupPromise = page.waitForEvent("popup");
  await page.getByTestId("fatigue-reason-share-x").click();
  const popup = await popupPromise;
  const popupUrl = decodeURIComponent(popup.url());

  expect(popup.url()).toMatch(/https:\/\/(twitter|x)\.com\/intent\/tweet/);
  expect(popupUrl).toContain("婚活疲れ・マチアプ疲れの理由診断をやってみたら");
  expect(popupUrl).toContain("判断先行型");
  expect(popupUrl).toContain("/diagnoses/konkatsu-fatigue/result/fast-judgment");
  await popup.close();
});

test("サブリンクから結果カードをPNG画像として保存できる", async ({ page }) => {
  await page.goto("/diagnoses/konkatsu-fatigue?result=fastJudgment");

  await expect(page.getByTestId("fatigue-reason-share-card")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("fatigue-reason-save-image-only").click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("婚活疲れ診断_判断先行型.png");
  await expect(page.getByTestId("fatigue-reason-save-card-success")).toContainText("結果カードを保存しました");
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
  await expect(page.getByTestId("fatigue-reason-share-x-top")).toHaveCount(0);
  await expect(page.getByTestId("fatigue-reason-review-analysis")).toContainText("会った後の体感を細かく見る段階");
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
    storeUrl
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
