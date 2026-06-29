import { expect, test } from "@playwright/test";

const reservationUrl = "https://mosh.jp/yauyuism/services";

test("婚活相談LPを表示し、MOSH前の説明とCTAが機能している", async ({ page }) => {
  await page.goto("/consultation");

  await expect(page.getByTestId("consultation-page")).toBeVisible();
  await expect(page.getByRole("heading", { name: "会えるのに進まない理由を、 出会い方から整理する相談です。" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "こんな状態ではありませんか？" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "この相談でやること" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "よくある質問" })).toBeVisible();
  await expect(page.getByText("結婚相談所のように、条件に合う人を紹介するサービスでもありません。")).toBeVisible();
  await expect(page.getByText("合っていない頑張り方をやめるための相談です。")).toBeVisible();
  await expect(page.getByText("このページは仮リンク先です")).toHaveCount(0);

  const moshCtas = page.getByTestId("consultation-mosh-cta");
  await expect(moshCtas).toHaveCount(2);
  await expect(moshCtas.first()).toHaveAttribute("href", reservationUrl);
  await expect(moshCtas.first()).toHaveAttribute("target", "_blank");
  await expect(moshCtas.first()).toHaveAttribute("rel", "noopener noreferrer");
  await expect(moshCtas.last()).toHaveAttribute("href", reservationUrl);

  await expect(page.getByTestId("consultation-diagnosis-cta").first()).toHaveAttribute("href", "https://www.shindanlab.jp/");
});

test("共通ヘッダーとフッターの相談導線は説明LPへ遷移する", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner").getByRole("link", { name: "個別相談" })).toHaveAttribute("href", "/consultation");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "60分婚活相談" })).toHaveAttribute("href", "/consultation");
});
