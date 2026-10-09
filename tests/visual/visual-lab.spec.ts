import { expect, test } from "@playwright/test";

const labEnabled = process.env.VISUAL_LAB_QA === "1";
const studies = ["editorial", "mostruario", "detalhe"] as const;

test.describe("Visual Lab production boundary", () => {
  test.skip(labEnabled || !process.env.CI, "Production-only access check");

  test("development-only route returns 404", async ({ request }) => {
    const response = await request.get("/dev/visual-lab");
    expect(response.status()).toBe(404);
  });
});

test.describe("Visual Lab development preview", () => {
  test.skip(!labEnabled, "Run only with VISUAL_LAB_QA=1 against pnpm dev");

  for (const study of studies) {
    test("renders isolated study " + study, async ({ page }, testInfo) => {
      const response = await page.goto("/dev/visual-lab", { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expect(page.locator('[data-visual-lab="true"]')).toBeVisible();
      const button = page.locator('[data-study-button="' + study + '"]');
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('[data-study="' + study + '"]')).toBeVisible();
      await expect(page.locator('[data-media-status="pending"]')).toHaveCount(1);
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth
      }));
      expect(dimensions.document, "No horizontal scroll should be introduced").toBeLessThanOrEqual(
        dimensions.viewport + 1
      );
      await page.screenshot({
        path: testInfo.outputPath("lab-" + study + ".png"),
        fullPage: true,
        animations: "disabled",
        caret: "hide"
      });
    });
  }

  test("study switching works with keyboard and maintains one active choice", async ({ page }) => {
    await page.goto("/dev/visual-lab", { waitUntil: "domcontentloaded" });
    const controls = page.locator("[data-study-button]");
    await expect(controls).toHaveCount(3);
    const second = page.locator('[data-study-button="mostruario"]');
    await second.focus();
    await page.keyboard.press("Space");
    await expect(second).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-active-study="mostruario"]')).toBeVisible();
    await expect(page.locator('[data-study-button][aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Laboratório visual");
  });
});
