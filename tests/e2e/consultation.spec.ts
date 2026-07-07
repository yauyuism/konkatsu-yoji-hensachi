import { expect, test } from "@playwright/test";

const reservationUrl = "https://yauyuism.stores.jp/";

test("婚活相談LPを表示し、STORES前の説明とCTAが機能している", async ({ page }) => {
  await page.goto("/consultation");

  await expect(page.getByTestId("consultation-page")).toBeVisible();
  await expect(page.getByRole("heading", { name: "会えるのに進まない理由を、 出会い方から整理します。" })).toBeVisible();
  await expect(page.getByTestId("consultation-first-cta")).toHaveText("相談内容を見る");
  await expect(page.getByTestId("consultation-first-cta")).toHaveAttribute("href", "#service");
  await expect(page.getByRole("heading", { name: "こんな状態ではありませんか？" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "この相談でやること" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "実際に相談で話せること" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "相談メニューは2つです" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "進まない原因は、ひとつではありません" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "普通の婚活相談と、この相談の違い" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "相談後に残るもの" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "よくある質問" })).toBeVisible();
  await expect(page.getByText("結婚相談所のように、条件に合う人を紹介するサービスでもありません。")).toBeVisible();
  await expect(page.getByText("合っていない頑張り方をやめるための相談です。")).toHaveCount(2);
  await expect(page.getByText("相手選びの前に、出会い方選び。")).toHaveCount(2);
  await expect(page.getByText("婚活をもっと頑張らせる相談ではありません。")).toHaveCount(2);
  await expect(page.getByText("出会い方から見直す")).toBeVisible();
  await expect(page.getByText("整理する", { exact: true })).toBeVisible();
  await expect(
    page.getByText("単発の60分オンライン相談と、公式LINEで何度でも相談できる定額プランがあります。空き日程はSTORESで確認できます。")
  ).toBeVisible();
  await expect(page.getByText("9,800円（税込）", { exact: true })).toBeVisible();
  await expect(page.getByText("月額19,800円（税込）", { exact: true })).toBeVisible();
  await expect(page.getByText("STORES", { exact: true })).toBeVisible();
  await expect(page.getByText("今使っているマチアプが自分に合っているか")).toBeVisible();
  await expect(page.getByRole("heading", { name: "リモート婚活相談 60分" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "婚活かけこみ相談し放題" })).toBeVisible();
  await expect(page.getByText("9,800円（税込）・単発", { exact: true })).toBeVisible();
  await expect(page.getByText("月額19,800円（税込）・定額", { exact: true })).toBeVisible();
  await expect(page.getByText("まずはこれ")).toBeVisible();
  await expect(page.getByText("結婚相談所の入会金は、3万〜20万円が相場です。")).toBeVisible();
  await expect(page.getByRole("link", { name: "60分相談を見る" })).toHaveAttribute("href", reservationUrl);
  await expect(page.getByRole("link", { name: "相談し放題を見る" })).toHaveAttribute("href", reservationUrl);
  await expect(page.getByRole("link", { name: "STORESでプランを見る" })).toHaveAttribute("href", reservationUrl);
  await expect(page.getByRole("link", { name: "STORESでプランを見る" })).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: "STORESでプランを見る" })).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByRole("link", { name: "会えるのに進まない理由を診断する" })).toBeVisible();
  await expect(page.getByRole("link", { name: "自分に合う出会い方を診断する" })).toBeVisible();
  await expect(page.getByText("このページは仮リンク先です")).toHaveCount(0);

  const storeCtas = page.getByTestId("consultation-store-cta");
  await expect(storeCtas).toHaveCount(5);
  await expect(storeCtas.first()).toHaveAttribute("href", reservationUrl);
  await expect(storeCtas.first()).toHaveAttribute("target", "_blank");
  await expect(storeCtas.first()).toHaveAttribute("rel", "noopener noreferrer");
  await expect(storeCtas.last()).toHaveAttribute("href", reservationUrl);
  await expect(storeCtas.last()).toHaveText("STORESで相談を申し込む");

  await expect(page.getByTestId("consultation-diagnosis-cta").first()).toHaveAttribute("href", "https://www.shindanlab.jp/");
});

test("共通ヘッダーとフッターの相談導線は説明LPへ遷移する", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner").getByRole("link", { name: "個別相談" })).toHaveAttribute("href", "/consultation");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "60分婚活相談" })).toHaveAttribute("href", "/consultation");
});
