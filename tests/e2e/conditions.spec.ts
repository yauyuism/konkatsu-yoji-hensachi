import { expect, test } from "@playwright/test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn7nNQAAAAASUVORK5CYII=",
  "base64"
);

const mockedReadResult = {
  targetGender: "male",
  ageMin: 26,
  ageMax: 32,
  incomeMin: 600,
  incomeMax: null,
  heightMin: 175,
  heightMax: null,
  education: "大卒以上",
  region: "東京",
  rawConditions: [],
  confidence: "medium",
};

test("条件リアリティチェッカーの手動入力フローを最後まで表示できる", async ({ page }) => {
  let savedPayload: Record<string, unknown> | null = null;
  let saveCallCount = 0;

  await page.route("**/api/conditions-stats", async (route) => {
    saveCallCount += 1;
    savedPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 204,
      body: "",
    });
  });

  await page.goto("/conditions");

  await expect(page.getByTestId("conditions-live-count")).toBeVisible();
  await expect(page.getByText("18歳", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("60歳", { exact: true }).first()).toBeVisible();
  await page.getByLabel("年齢の上限").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("25〜36歳", { exact: true }).first()).toBeVisible();
  await page.getByLabel("年収の上限").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("500〜1500万円", { exact: true }).first()).toBeVisible();
  await page.getByLabel("身長の上限").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("170〜190cm", { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId("conditions-page")).toContainText("あなたの条件に当てはまるのは");
  await expect(page.getByTestId("conditions-page")).toContainText("未婚者全体の");

  await page.getByTestId("conditions-show-result").click();

  await expect(page.getByTestId("conditions-result")).toBeVisible();
  await expect(page.getByTestId("conditions-result")).toContainText("診断結果をもとにアドバイス");
  await expect.poll(() => saveCallCount).toBe(1);
  expect(savedPayload).not.toBeNull();
  expect(savedPayload).toMatchObject({
    inputMethod: "manual",
    conditions: {
      targetGender: "male",
      ageMin: 25,
      ageMax: 36,
      incomeMin: 500,
      incomeMax: 1500,
      heightMin: 170,
      heightMax: 190,
      education: "college",
      region: "tokyo",
    },
  });
  });

test("入力画面を下にスクロールしても先頭へ引き戻されない", async ({ page }) => {
  await page.goto("/conditions");

  await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(350);
  const afterFirstScroll = await page.evaluate(() => window.scrollY);

  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(350);
  const afterSecondScroll = await page.evaluate(() => window.scrollY);

  expect(afterFirstScroll).toBeGreaterThan(500);
  expect(afterSecondScroll).toBeGreaterThan(afterFirstScroll - 50);
});

test("スクショ読み取りから手動スライダーへ合流できる", async ({ page }) => {
  let savedPayload: Record<string, unknown> | null = null;
  let saveCallCount = 0;

  await page.route("**/api/read-filter", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockedReadResult),
    });
  });
  await page.route("**/api/conditions-stats", async (route) => {
    saveCallCount += 1;
    savedPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 204,
      body: "",
    });
  });

  await page.goto("/conditions");
  await page.getByTestId("open-screenshot-flow").click();
  await page.getByTestId("screenshot-app-pairs").click();
  await page.getByTestId("screenshot-file-input").setInputFiles({
    name: "filters.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await page.getByTestId("screenshot-read-button").click();

  await expect(page.getByText("読み取り結果の確認")).toBeVisible();
  await page.getByTestId("screenshot-apply-button").click();

  await expect(page.getByText("スクショから初期値を反映しました。")).toBeVisible();
  await expect(page.getByText("26〜32歳", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("600万円以上", { exact: true }).first()).toBeVisible();

  await page.getByTestId("conditions-show-result").click();

  await expect(page.getByTestId("conditions-result")).toBeVisible();
  await expect(page.getByText("この結果はスクショから読み取った条件をもとにしています。")).toBeVisible();
  await expect.poll(() => saveCallCount).toBe(1);
  expect(savedPayload).toMatchObject({
    inputMethod: "screenshot",
    screenshotApp: "pairs",
    screenshotConfidence: "medium",
    conditions: {
      targetGender: "male",
      ageMin: 26,
      ageMax: 32,
      incomeMin: 600,
      incomeMax: 0,
      heightMin: 175,
      heightMax: 0,
      education: "college",
      region: "tokyo",
    },
  });
});

test("スクショ読み取り失敗時にエラーを表示し手動入力へ戻れる", async ({ page }) => {
  await page.route("**/api/read-filter", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        error: "読み取りに失敗しました。手動で入力してください。",
      }),
    });
  });

  await page.goto("/conditions");
  await page.getByTestId("open-screenshot-flow").click();
  await page.getByTestId("screenshot-app-pairs").click();
  await page.getByTestId("screenshot-file-input").setInputFiles({
    name: "filters.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await page.getByTestId("screenshot-read-button").click();

  await expect(page.getByText("読み取りに失敗しました。手動で入力してください。")).toBeVisible();

  await page.getByTestId("open-screenshot-flow").click();
  await expect(page.getByText("相手の性別")).toBeVisible();
});

test("read-filter API は画像なしリクエストを 400 で拒否する", async ({ request }) => {
  const response = await request.post("/api/read-filter", {
    data: {
      appName: "pairs",
    },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: "画像が必要です",
  });
});

test("read-filter API は不正なアプリ名を 400 で拒否する", async ({ request }) => {
  const response = await request.post("/api/read-filter", {
    data: {
      appName: "unknown-app",
      image: "ZmFrZQ==",
    },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: "アプリ名が不正です",
  });
});

test("conditions-stats API は不正な入力方式を 400 で拒否する", async ({ request }) => {
  const response = await request.post("/api/conditions-stats", {
    data: {
      inputMethod: "unknown",
      conditions: {
        targetGender: "male",
        ageMin: 25,
        ageMax: 35,
        incomeMin: 500,
        incomeMax: 0,
        heightMin: 170,
        heightMax: 0,
        education: "college",
        region: "tokyo",
      },
    },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: "入力方式が不正です",
  });
});

test("conditions-stats API は不正な年齢条件を 400 で拒否する", async ({ request }) => {
  const response = await request.post("/api/conditions-stats", {
    data: {
      inputMethod: "manual",
      conditions: {
        targetGender: "male",
        ageMin: 45,
        ageMax: 20,
        incomeMin: 500,
        incomeMax: 0,
        heightMin: 170,
        heightMax: 0,
        education: "college",
        region: "tokyo",
      },
    },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: "年齢条件が不正です",
  });
});
