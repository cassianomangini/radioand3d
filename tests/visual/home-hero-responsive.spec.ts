import { expect, test } from "@playwright/test";

test("Home X1 and copy remain usable at actual Studio widths", async ({ page }, testInfo) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBeLessThan(400);
  await page.evaluate(() => document.fonts.ready);

  const title = page.locator("#studio-title");
  await expect(title).toHaveText("Impressão 3D, música e muito mais do que você imagina.");
  const art = page.locator('[data-home-art="true"]');
  await expect(art).toBeVisible();
  await expect.poll(async () =>
    art.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)
  ).toBeGreaterThan(0);
  await expect(page.getByRole("link", { name: "Quero conhecer tudo" })).toHaveAttribute("href", "/studio");

  async function verifyLayout() {
    const metrics = await page.evaluate(() => {
      const studio = document.querySelector("#studio") as HTMLElement;
      const heading = document.querySelector("#studio-title") as HTMLElement;
      const studioBounds = studio.getBoundingClientRect();
      const titleBounds = heading.getBoundingClientRect();
      return {
        viewportWidth: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
        studioWidth: studio.clientWidth,
        studioScrollWidth: studio.scrollWidth,
        headingLeft: titleBounds.left,
        headingRight: titleBounds.right,
        studioLeft: studioBounds.left,
        studioRight: studioBounds.right
      };
    });
    expect(metrics.pageWidth, "unexpected page horizontal overflow").toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(metrics.headingLeft, "H1 crosses Studio left edge").toBeGreaterThanOrEqual(metrics.studioLeft - 1);
    expect(metrics.headingRight, "H1 crosses Studio right edge").toBeLessThanOrEqual(metrics.studioRight + 1);
    expect(metrics.studioScrollWidth, "Studio horizontal scroll").toBeLessThanOrEqual(metrics.studioWidth + 1);
  }

  // Regression: previously art occupied only 40% width and ~25rem height.
  // A full-bleed background must cover the entire Studio below the navbar.
  async function verifyArtCoverage() {
    const m = await page.evaluate(() => {
      const studio = document.querySelector("#studio") as HTMLElement;
      const art = document.querySelector('[data-home-art="true"]') as HTMLElement;
      const img = art.querySelector("img") as HTMLImageElement;
      const s = studio.getBoundingClientRect();
      const a = art.getBoundingClientRect();
      const navbar = document.querySelector("header") as HTMLElement;
      return {
        studioWidth: s.width,
        studioRight: s.right,
        studioLeft: s.left,
        studioBottom: s.bottom,
        artLeft: a.left,
        artRight: a.right,
        artTop: a.top,
        artBottom: a.bottom,
        expectedTop: navbar.getBoundingClientRect().bottom,
        fit: getComputedStyle(img).objectFit,
        mask: getComputedStyle(art).maskImage
      };
    });
    expect(m.artLeft).toBeGreaterThanOrEqual(m.studioLeft - 2);
    expect(m.artLeft).toBeLessThanOrEqual(m.studioLeft + 2);
    expect(m.artRight).toBeGreaterThanOrEqual(m.studioRight - 2);
    expect(m.artTop).toBeLessThanOrEqual(m.expectedTop + 2);
    expect(m.artBottom).toBeGreaterThanOrEqual(m.studioBottom - 2);
    expect(m.fit).toBe("cover");
    expect(m.mask).toBe("none");
  }

  await verifyLayout();
  if (testInfo.project.name === "desktop-1440" || testInfo.project.name === "desktop-short") {
    await verifyArtCoverage();
  }
  await page.screenshot({
    path: testInfo.outputPath("home-x1-default.png"),
    fullPage: false,
    animations: "disabled"
  });

  if (testInfo.project.name === "desktop-1440") {
    const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    await expect(divider).toBeVisible();
    await divider.focus();
    await divider.press("End");
    await verifyLayout();
    await verifyArtCoverage();
    await page.screenshot({
      path: testInfo.outputPath("home-x1-studio-compact.png"),
      fullPage: false,
      animations: "disabled"
    });
  }
});
