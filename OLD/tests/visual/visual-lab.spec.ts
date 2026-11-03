import { writeFile } from "node:fs/promises";
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
      await expect(page.locator('[data-visual-lab="true"][data-lab-ready="true"]')).toBeVisible();
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
      const collision = await page.evaluate(() => {
        const heading = document.querySelector('[data-study] h2');
        const paragraph = document.querySelector('[data-study-description="true"]');
        if (!heading || !paragraph) return { missing: true, overlapping: true };
        const range = document.createRange();
        range.selectNodeContents(heading);
        const title = range.getBoundingClientRect();
        const copy = paragraph.getBoundingClientRect();
        return {
          missing: false,
          overlapping: title.left < copy.right - 1 &&
            title.right > copy.left + 1 &&
            title.top < copy.bottom - 1 &&
            title.bottom > copy.top + 1
        };
      });
      expect(collision.missing, "Lab content must expose readable title and description").toBe(false);
      expect(collision.overlapping, "Text glyphs must not collide with the description").toBe(false);

      // Diagnostic, not a performance certification: these samples come from
      // headless Chromium against the *development* server, not production RUM.
      const performanceInventory = await page.evaluate(async () => {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        const scripts = resources.filter((resource) =>
          resource.initiatorType === "script" || /\\.js(?:\\?|$)/.test(resource.name)
        );
        const samples = await new Promise<number[]>((resolve) => {
          const intervals: number[] = [];
          let previous: number | null = null;
          const began = performance.now();
          function frame(timestamp: number) {
            if (previous !== null) intervals.push(timestamp - previous);
            previous = timestamp;
            if (timestamp - began < 350) requestAnimationFrame(frame);
            else resolve(intervals);
          }
          requestAnimationFrame(frame);
        });
        return {
          mode: "development",
          sampleDurationMs: 350,
          navigationDomContentLoadedMs: nav?.domContentLoadedEventEnd ?? null,
          jsResourceRequests: scripts.length,
          jsDecodedBodyBytesReported: scripts.reduce((sum, resource) => sum + resource.decodedBodySize, 0),
          maxAnimationFrameIntervalMs: samples.length ? Math.round(Math.max(...samples)) : null,
          intervalsOver50Ms: samples.filter((ms) => ms > 50).length,
          sampleCount: samples.length,
          caveat: "Lab costs only; development server overhead and CI runner load distort real production performance."
        };
      });
      await writeFile(
        testInfo.outputPath("visual-lab-performance-inventory.json"),
        JSON.stringify(performanceInventory, null, 2),
        "utf8"
      );
      await testInfo.attach("visual-lab-performance-inventory.json", {
        body: Buffer.from(JSON.stringify(performanceInventory, null, 2), "utf8"),
        contentType: "application/json"
      });

      // Next dev badge is not part of the authored composition.
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
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
    await expect(page.locator('[data-visual-lab="true"][data-lab-ready="true"]')).toBeVisible();
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
