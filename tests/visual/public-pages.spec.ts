import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  { name: "home", path: "/" },
  { name: "studio", path: "/studio" },
  { name: "quote", path: "/studio/orcamento" },
  { name: "product", path: "/studio/produtos/porta-curativos-compacto" }
] as const;

for (const route of routes) {
  test(`capture and inspect ${route.name}`, async ({ page }, testInfo) => {
    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `response for ${route.path}`).toBeLessThan(400);
    await page.locator("body").waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: testInfo.outputPath(`${route.name}-viewport.png`),
      fullPage: false,
      animations: "disabled",
      caret: "hide"
    });

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
