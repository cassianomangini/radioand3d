import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const routes = [
  { name: "home", path: "/" },
  { name: "studio", path: "/studio" },
  { name: "prints", path: "/studio/impressoes" },
  { name: "quote", path: "/studio/orcamento" },
  { name: "product", path: "/studio/produtos/porta-curativos-compacto" }
] as const;

for (const route of routes) {
  test(`capture and inspect ${route.name}`, async ({ page }, testInfo) => {
    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `response for ${route.path}`).toBeLessThan(400);
    await page.locator("body").waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);

    if (route.name === "product") {
      // Fonts being ready says nothing about media. The previous CDP/Playwright
      // review occasionally photographed an empty 400px product hero while its
      // priority image was still decoding. Wait for the actual product photo.
      const heroPhoto = page.locator('section[aria-labelledby="product-title"] img[alt]:not([alt=""])').first();
      await expect(heroPhoto).toBeVisible();
      await expect.poll(async () => heroPhoto.evaluate((image) =>
        (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0
      ), { message: "product hero image failed to load before the visual capture" }).toBe(true);
      await heroPhoto.evaluate((image) => (image as HTMLImageElement).decode());

      // A loaded hero is not proof that visible lazy thumbnails and variants
      // are ready for a screenshot. The Shopee origin can also be unavailable.
      const visibleMediaReady = await page.waitForFunction(() => {
        const images = [...document.querySelectorAll<HTMLImageElement>('section[aria-labelledby="product-title"] img')];
        const onScreen = images.filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.bottom > 0 &&
            rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
        });
        return onScreen.length > 0 && onScreen.every((image) => image.complete && image.naturalWidth > 0);
      }, null, { timeout: 9000 }).then(() => true, () => false);

      const mediaReadiness = await page.evaluate(async () => {
        const images = [...document.querySelectorAll<HTMLImageElement>('section[aria-labelledby="product-title"] img')];
        const onScreen = images.filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.bottom > 0 &&
            rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
        });
        await Promise.allSettled(
          onScreen.filter((image) => image.complete && image.naturalWidth > 0)
            .map((image) => image.decode())
        );
        return onScreen.map((image) => ({
          source: image.currentSrc || image.src,
          complete: image.complete,
          loaded: image.naturalWidth > 0
        }));
      });
      const mediaDiagnosticPath = testInfo.outputPath("product-visible-media-readiness.json");
      await writeFile(mediaDiagnosticPath, JSON.stringify({ allReady: visibleMediaReady, media: mediaReadiness }, null, 2));
      await testInfo.attach("product-visible-media-readiness.json", {
        path: mediaDiagnosticPath,
        contentType: "application/json"
      });
      if (!visibleMediaReady) {
        testInfo.annotations.push({
          type: "external-product-media-incomplete",
          description: `Visible product photos still unavailable: ${mediaReadiness.filter((image) => !image.loaded).length}/${mediaReadiness.length}. See attachment before accepting the visual capture.`
        });
      }
    }

    await page.screenshot({
      path: testInfo.outputPath(`${route.name}-viewport.png`),
      fullPage: false,
      animations: "disabled",
      caret: "hide"
    });

    if (route.name === "prints") {
      // The Studio route can be taller than one viewport; inspect the complete
      // editorial sequence and the last service handoff, not just its hero.
      await page.screenshot({
        path: testInfo.outputPath("prints-full-page.png"),
        fullPage: true,
        animations: "disabled",
        caret: "hide"
      });
      await page.getByRole("heading", { name: "Placas, caixas e outras necessidades" }).scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath("prints-services-viewport.png"),
        fullPage: false,
        animations: "disabled",
        caret: "hide"
      });
    }

    const measured = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      heading: document.querySelector("h1")?.textContent?.trim() ?? "",
      audioNodes: document.querySelectorAll("audio").length
    }));
    await testInfo.attach(`${route.name}-measurements`, {
      body: Buffer.from(JSON.stringify(measured, null, 2), "utf8"),
      contentType: "application/json"
    });
    if (measured.scroll > measured.viewport + 1) {
      testInfo.annotations.push({
        type: "observed-overflow",
        description: `${route.path}: document width ${measured.scroll}px vs viewport ${measured.viewport}px; triage before visual acceptance`
      });
    }
    expect(measured.scroll, `horizontal overflow on ${route.path}`).toBeLessThanOrEqual(
      measured.viewport + 1
    );
    expect(measured.heading.length, `missing heading for ${route.path}`).toBeGreaterThan(0);
  });
}

test("automated accessibility inventory (non-blocking until triage)", async ({ page }, testInfo) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  const audit = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-inventory.json", {
    body: Buffer.from(JSON.stringify({
      route: "/studio",
      violations: audit.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map(n => n.target)
      }))
    }, null, 2), "utf8"),
    contentType: "application/json"
  });
  testInfo.annotations.push({
    type: "axe-summary",
    description: `${audit.violations.length} violations captured for triage; this is not a clean accessibility certificate`
  });
});
