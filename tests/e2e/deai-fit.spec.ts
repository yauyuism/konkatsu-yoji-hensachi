import { expect, test } from "@playwright/test";

test("自分に合う出会い方診断を最後まで進められる", async ({ page }) => {
  await page.goto("/diagnoses/deai-fit");

  await expect(page.getByTestId("deai-fit-intro")).toBeVisible();
  await page.getByTestId("deai-fit-start").click();

  for (let index = 0; index < 10; index += 1) {
    await expect(page.getByTestId("deai-fit-question")).toBeVisible();
    await page.locator("[data-testid='deai-fit-question'] .choice-button").first().click();
  }

  await expect(page.getByTestId("deai-fit-result")).toBeVisible();
  await expect(page.getByRole("heading", { name: /条件検索型/ })).toBeVisible();
  await expect(page.getByTestId("aikata-consultation-cta").getByRole("link", { name: "60分婚活相談はこちら" })).toHaveAttribute(
    "href",
    "/consultation"
  );
});
