import { expect, type Page, test } from "@playwright/test";

const moshServicesUrl = "https://mosh.jp/yauyuism/services";
const deaiFitShareVersion = "20260628";

const deaiFitShareCases = [
  {
    code: "O-C-Q-D",
    slug: "ocqd",
    label: "条件確認スピード婚活タイプ",
    copy: "会う前に条件を確認し、合いそうなら早めに一対一で進めたいタイプです。",
  },
  {
    code: "O-C-Q-N",
    slug: "ocqn",
    label: "条件から広げる紹介活用タイプ",
    copy: "条件は見たいけれど、自分だけで探すより誰かの目を通した出会いが合うタイプです。",
  },
  {
    code: "O-C-S-D",
    slug: "ocsd",
    label: "慎重な条件確認タイプ",
    copy: "条件は大事。でも、気持ちが育つまで少し時間が必要なタイプです。",
  },
  {
    code: "O-C-S-N",
    slug: "ocsn",
    label: "条件も安心感もほしい紹介育成タイプ",
    copy: "条件だけでなく、紹介や場の信用がある中で少しずつ進むほうが合うタイプです。",
  },
  {
    code: "O-V-Q-D",
    slug: "ovqd",
    label: "SNS即フィーリングタイプ",
    copy: "文章や投稿の温度感で気になり、会ったら早めに進みたいタイプです。",
  },
  {
    code: "O-V-Q-N",
    slug: "ovqn",
    label: "SNS人脈拡張タイプ",
    copy: "オンライン上の価値観や空気感から入り、人間関係が広がる中で恋愛に進みやすいタイプです。",
  },
  {
    code: "O-V-S-D",
    slug: "ovsd",
    label: "文章からじわじわ好きになるタイプ",
    copy: "相手の文章、考え方、日常の出し方から少しずつ気になるタイプです。",
  },
  {
    code: "O-V-S-N",
    slug: "ovsn",
    label: "オンライン生活圏タイプ",
    copy: "オンラインでゆるくつながり、何度も目に入るうちに気になるタイプです。",
  },
  {
    code: "F-C-Q-D",
    slug: "fcqd",
    label: "会って条件確認タイプ",
    copy: "会わないと分からない。でも会ったら早めに判断したいタイプです。",
  },
  {
    code: "F-C-Q-N",
    slug: "fcqn",
    label: "紹介即決タイプ",
    copy: "誰かの信用がある状態で会い、合えば早めに進めたいタイプです。",
  },
  {
    code: "F-C-S-D",
    slug: "fcsd",
    label: "対面でゆっくり確認タイプ",
    copy: "会って話したい。でもすぐには決めず、何度か会う中で判断したいタイプです。",
  },
  {
    code: "F-C-S-N",
    slug: "fcsn",
    label: "生活観じわじわ確認タイプ",
    copy: "人柄も条件も大事で、何度か顔を合わせる中で生活観を見たいタイプです。",
  },
  {
    code: "F-V-Q-D",
    slug: "fvqd",
    label: "直感対面タイプ",
    copy: "会った瞬間の空気感や会話のテンポで気持ちが動きやすいタイプです。",
  },
  {
    code: "F-V-Q-N",
    slug: "fvqn",
    label: "外飲み即展開タイプ",
    copy: "場のノリ、偶然、紹介の連鎖から恋愛が動きやすいタイプです。",
  },
  {
    code: "F-V-S-D",
    slug: "fvsd",
    label: "一対一で空気を育てるタイプ",
    copy: "条件より空気感重視。ただし、大人数より一対一でゆっくり相手を見るほうが合うタイプです。",
  },
  {
    code: "F-V-S-N",
    slug: "fvsn",
    label: "生活圏でじわじわ好きになるタイプ",
    copy: "出会いを探しに行くより、生活圏に混ざる中で少しずつ好きになりやすいタイプです。",
  },
] as const;

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

function getPngSize(bytes: Buffer) {
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
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
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", new RegExp(`share%3D${deaiFitShareVersion}`));
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
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", new RegExp(`share%3D${deaiFitShareVersion}`));
  await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", /\/diagnoses\/deai-fit\/result\/fvsn$/);
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", new RegExp(`/og/deai-fit/fvsn\\.png\\?v=${deaiFitShareVersion}`));
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", /生活圏でじわじわ好きになるタイプ/);
});

test("結果別URLではタイプ別OGPと診断導線を表示する", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit/result/ocqn");

  await expect(page.getByTestId("deai-fit-intro")).toHaveCount(0);
  await expect(page.getByTestId("deai-fit-result")).toBeVisible();
  await expect(page.getByTestId("deai-fit-result-hero")).toContainText("O-C-Q-N");
  await expect(page.getByTestId("deai-fit-result-hero").getByRole("heading", { name: "条件から広げる紹介活用タイプ" })).toBeVisible();
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", /diagnoses%2Fdeai-fit%2Fresult%2Focqn/);
  await expect(page.getByTestId("deai-fit-share-x-top")).toHaveAttribute("href", new RegExp(`share%3D${deaiFitShareVersion}`));
  await expect(page.getByTestId("deai-fit-start-from-share")).toHaveAttribute("href", "/diagnoses/deai-fit");
  await expect(page.getByTestId("deai-fit-consultation-top")).toHaveAttribute("href", moshServicesUrl);
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", "あなたに合う出会い方診断｜条件から広げる紹介活用タイプ");
  await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", /\/diagnoses\/deai-fit\/result\/ocqn$/);
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", new RegExp(`/og/deai-fit/ocqn\\.png\\?v=${deaiFitShareVersion}`));
  await expect(page.locator("meta[name='twitter:image']")).toHaveAttribute("content", new RegExp(`/og/deai-fit/ocqn\\.png\\?v=${deaiFitShareVersion}`));
});

test("16タイプの結果別URLとOGP画像がタイプごとに対応している", async ({ page, request }) => {
  for (const shareCase of deaiFitShareCases) {
    const response = await page.goto(`/diagnoses/deai-fit/result/${shareCase.slug}`);

    expect(response?.status(), `${shareCase.slug} result page status`).toBe(200);
    await expect(page.getByTestId("deai-fit-result-hero")).toContainText(shareCase.code);
    await expect(page.getByTestId("deai-fit-result-hero")).toContainText(shareCase.label);
    await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", `あなたに合う出会い方診断｜${shareCase.label}`);
    await expect(page.locator("meta[property='og:description']")).toHaveAttribute("content", shareCase.copy);
    await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", new RegExp(`/diagnoses/deai-fit/result/${shareCase.slug}$`));
    await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator("meta[name='twitter:title']")).toHaveAttribute("content", `あなたに合う出会い方診断｜${shareCase.label}`);
    await expect(page.locator("meta[name='twitter:description']")).toHaveAttribute("content", shareCase.copy);

    const ogImageUrl = await page.locator("meta[property='og:image']").getAttribute("content");
    const twitterImageUrl = await page.locator("meta[name='twitter:image']").getAttribute("content");
    const imagePattern = new RegExp(`/og/deai-fit/${shareCase.slug}\\.png\\?v=${deaiFitShareVersion}$`);

    expect(ogImageUrl, `${shareCase.slug} og:image`).toMatch(imagePattern);
    expect(twitterImageUrl, `${shareCase.slug} twitter:image`).toMatch(imagePattern);

    const xShareHref = await page.getByTestId("deai-fit-share-x-top").getAttribute("href");
    const decodedShareHref = decodeURIComponent(xShareHref ?? "");

    expect(decodedShareHref).toContain("https://twitter.com/intent/tweet");
    expect(decodedShareHref).toContain(`${shareCase.code}｜${shareCase.label}`);
    expect(decodedShareHref).toContain(`/diagnoses/deai-fit/result/${shareCase.slug}?share=${deaiFitShareVersion}`);
    expect(decodedShareHref).not.toContain("navigator.share");

    const imageRequestUrl = new URL(ogImageUrl ?? "");
    const currentOrigin = new URL(page.url()).origin;
    const currentOriginUrl = new URL(currentOrigin);
    imageRequestUrl.protocol = currentOriginUrl.protocol;
    imageRequestUrl.host = currentOriginUrl.host;

    const imageResponse = await request.get(imageRequestUrl.toString());
    const contentType = imageResponse.headers()["content-type"] ?? "";
    const imageBytes = await imageResponse.body();
    const imageSize = getPngSize(imageBytes);

    expect(imageResponse.status(), `${shareCase.slug} image status`).toBe(200);
    expect(contentType, `${shareCase.slug} image content-type`).toContain("image/png");
    expect(imageSize, `${shareCase.slug} image size`).toEqual({ width: 1200, height: 630 });
  }
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
