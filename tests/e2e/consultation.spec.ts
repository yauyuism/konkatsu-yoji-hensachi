import { expect, test } from "@playwright/test";

const reservationUrl = "https://note.com/yauyuism/n/nf5c37e6297f0";

test("60分婚活相談LPを表示し、予約CTAが指定URLを向いている", async ({ page }) => {
  await page.goto("/consultation");

  await expect(page.getByTestId("consultation-page")).toBeVisible();
  await expect(page.getByRole("heading", { name: "60分婚活相談" })).toBeVisible();
  await expect(page.getByText("このページは仮リンク先です")).toHaveCount(0);
  await expect(page.getByText("11,000円（税込）").first()).toBeVisible();

  const reservationCtas = page.getByTestId("consultation-reservation-cta");
  await expect(reservationCtas).toHaveCount(2);
  await expect(reservationCtas.first()).toHaveAttribute("href", reservationUrl);
  await expect(reservationCtas.last()).toHaveAttribute("href", reservationUrl);
});
