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

  // These are measurements in the *Studio pane* rather than the viewport:
  // the old 54rem breakpoint dropped the title on top of the robot.
  async function inspectHomeState(state: string) {
    const geometry = await page.evaluate(() => {
      const studio = document.querySelector("#studio") as HTMLElement;
      const copy = studio.querySelector('section[data-studio-intro="home"]') as HTMLElement;
      const heading = studio.querySelector("#studio-title") as HTMLElement;
      const cta = copy.querySelector('a[href="/studio"]') as HTMLAnchorElement;
      const s = studio.getBoundingClientRect();
      const c = copy.getBoundingClientRect();
      const h = heading.getBoundingClientRect();
      const a = cta.getBoundingClientRect();
      const nav = document.querySelector("header") as HTMLElement;
      return {
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        studioWidth: s.width,
        studioScrollWidth: studio.scrollWidth,
        studioLeft: s.left,
        studioRight: s.right,
        copyLeft: c.left,
        copyTop: c.top,
        titleLeft: h.left,
        titleRight: h.right,
        titleTop: h.top,
        ctaLeft: a.left,
        ctaRight: a.right,
        headerBottom: nav.getBoundingClientRect().bottom,
        fontSize: getComputedStyle(heading).fontSize,
        copyLayout: getComputedStyle(copy).position,
        artGradient: getComputedStyle(studio.querySelector('[data-home-art="true"]') as HTMLElement, "::after").backgroundImage
      };
    });
    await testInfo.attach(`home-position-${state}.json`, {
      body: Buffer.from(JSON.stringify(geometry, null, 2), "utf8"),
      contentType: "application/json"
    });
    expect(geometry.pageWidth, `${state}: page overflow`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(geometry.studioScrollWidth, `${state}: Studio overflow`).toBeLessThanOrEqual(geometry.studioWidth + 1);
    expect(geometry.titleRight, `${state}: title hits divider`).toBeLessThanOrEqual(geometry.studioRight + 1);
    expect(geometry.ctaRight, `${state}: CTA hits divider`).toBeLessThanOrEqual(geometry.studioRight + 1);
    if (geometry.viewportWidth >= 1180 && geometry.studioWidth >= 52 * 16) {
      expect(geometry.titleLeft, `${state}: title invades the X1 speech-bubble lane`)
        .toBeGreaterThanOrEqual(geometry.studioLeft + geometry.studioWidth * 0.4 + 160 - 2);
      expect(geometry.copyTop, `${state}: title sits behind the navbar`)
        .toBeGreaterThanOrEqual(geometry.headerBottom - 2);
    }
    if (geometry.viewportWidth >= 1180 && geometry.studioWidth < 52 * 16) {
      expect(geometry.copyLayout, `${state}: compact Studio should stack`).toBe("relative");
      expect(geometry.artGradient, `${state}: the compact vertical fade is not active`).not.toContain("90deg");
      expect(geometry.copyTop, `${state}: title overlays the illustrated greeting`)
        .toBeGreaterThan(geometry.headerBottom + 350);
    }
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
  await inspectHomeState("split-default");
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
    await divider.press("Home");

    // An intermediate divider state must stay side-by-side, not place text
    // over the robot and speech bubble.
    for (let index = 0; index < 4; index += 1) {
      await divider.press("Shift+ArrowLeft");
    }
    await expect.poll(async () =>
      page.locator("#studio").evaluate((node) => node.getBoundingClientRect().width)
    ).toBeLessThan(850);
    await inspectHomeState("radio-medium");
    await verifyLayout();
    await page.screenshot({
      path: testInfo.outputPath("home-x1-radio-medium.png"),
      fullPage: false,
      animations: "disabled"
    });

    // At the physical minimum Studio width, copy appears BELOW art instead.
    await divider.press("End");
    await verifyLayout();
    await verifyArtCoverage();
    await inspectHomeState("radio-maximum");
    await page.screenshot({
      path: testInfo.outputPath("home-x1-studio-compact.png"),
      fullPage: false,
      animations: "disabled"
    });

    await divider.press("Home");
    await divider.press("ArrowRight");
    await expect(page.locator('[data-radio-layout-mode]')).toHaveAttribute("data-radio-layout-mode", "docked");
    await inspectHomeState("radio-docked");
    await verifyArtCoverage();
    await page.screenshot({
      path: testInfo.outputPath("home-x1-radio-docked.png"),
      fullPage: false,
      animations: "disabled"
    });
  }
});
