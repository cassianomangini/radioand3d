import { expect, test } from "@playwright/test";

test("Home X1 and copy fit the actual Studio in every Radio state", async ({ page }, testInfo) => {
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
  await expect(page.getByRole("link", { name: "Quero conhecer tudo" }))
    .toHaveAttribute("href", "/studio");

  // CSS letter reveals must finish before judging the final text geometry.
  // In reduced-motion mode the letters should be visible without animation.
  async function awaitCompleteHeading() {
    await title.evaluate(async (heading) => {
      await Promise.all(heading.getAnimations({ subtree: true }).map((animation) =>
        animation.finished.catch(() => undefined)
      ));
    });
  }

  async function inspectHomeState(state: string) {
    await awaitCompleteHeading();

    const geometry = await page.evaluate(() => {
      const studio = document.querySelector("#studio") as HTMLElement;
      const heading = document.querySelector("#studio-title") as HTMLElement;
      const copy = studio.querySelector('section[data-studio-intro="home"]') as HTMLElement;
      const cta = copy.querySelector('a[href="/studio"]') as HTMLAnchorElement;
      const art = studio.querySelector('[data-home-art="true"]') as HTMLElement;
      const header = document.querySelector("header") as HTMLElement;
      const divider = document.querySelector('[role="separator"][aria-label="Arraste para redimensionar CM Rádio"]');

      const studioBox = studio.getBoundingClientRect();
      const headingBox = heading.getBoundingClientRect();
      const copyBox = copy.getBoundingClientRect();
      const ctaBox = cta.getBoundingClientRect();
      const textRects: Array<{ left: number; right: number; top: number; bottom: number }> = [];
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const textNode = walker.currentNode;
        if (!textNode.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(textNode);
        for (const rect of range.getClientRects()) {
          if (rect.width > 0 && rect.height > 0) {
            textRects.push({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
          }
        }
        range.detach();
      }

      return {
        viewportWidth: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
        studioWidth: studio.clientWidth,
        studioScrollWidth: studio.scrollWidth,
        studioLeft: studioBox.left,
        studioRight: studioBox.right,
        copyLeft: copyBox.left,
        copyTop: copyBox.top,
        copyLayout: getComputedStyle(copy).position,
        titleLeft: headingBox.left,
        titleRight: headingBox.right,
        visibleTextRight: Math.max(0, ...textRects.map((rect) => rect.right)),
        visibleTextLeft: Math.min(Infinity, ...textRects.map((rect) => rect.left)),
        visibleTextTop: Math.min(Infinity, ...textRects.map((rect) => rect.top)),
        ctaLeft: ctaBox.left,
        ctaRight: ctaBox.right,
        headerBottom: header.getBoundingClientRect().bottom,
        fontSize: getComputedStyle(heading).fontSize,
        artGradient: getComputedStyle(art, "::after").backgroundImage,
        dividerRange: divider ? {
          min: Number(divider.getAttribute("aria-valuemin")),
          now: Number(divider.getAttribute("aria-valuenow")),
          max: Number(divider.getAttribute("aria-valuemax"))
        } : null
      };
    });

    await testInfo.attach(`home-position-${state}.json`, {
      body: Buffer.from(JSON.stringify(geometry, null, 2), "utf8"),
      contentType: "application/json"
    });

    expect(geometry.pageWidth, `${state}: page horizontal overflow`)
      .toBeLessThanOrEqual(geometry.viewportWidth + 1);
    expect(geometry.studioScrollWidth, `${state}: Studio content overflows its own width`)
      .toBeLessThanOrEqual(geometry.studioWidth + 1);
    expect(geometry.titleLeft, `${state}: H1 exits left edge`)
      .toBeGreaterThanOrEqual(geometry.studioLeft - 2);
    expect(geometry.titleRight, `${state}: H1 box exits right edge`)
      .toBeLessThanOrEqual(geometry.studioRight + 1);
    expect(geometry.visibleTextRight, `${state}: headline letters clipped at divider`)
      .toBeLessThanOrEqual(geometry.studioRight + 1);
    expect(geometry.visibleTextLeft, `${state}: headline letters clipped at left`)
      .toBeGreaterThanOrEqual(geometry.studioLeft - 2);
    expect(geometry.ctaRight, `${state}: CTA exits Studio right edge`)
      .toBeLessThanOrEqual(geometry.studioRight + 1);

    if (geometry.viewportWidth >= 1180) {
      // The latest Home deliberately retains a side-by-side composition even
      // when the Radio has expanded. The former vertical-copy test was stale.
      expect(geometry.copyLayout, `${state}: desktop copy must remain anchored`)
        .toBe("absolute");
      expect(geometry.copyLeft, `${state}: copy intrudes into the image lane`)
        .toBeGreaterThanOrEqual(geometry.studioLeft + geometry.studioWidth * 0.38);
      expect(geometry.copyTop, `${state}: copy behind navbar`)
        .toBeGreaterThanOrEqual(geometry.headerBottom - 2);
      if (geometry.dividerRange) {
        const { min, now, max } = geometry.dividerRange;
        expect(now, `${state}: separator value below minimum`).toBeGreaterThanOrEqual(min);
        expect(now, `${state}: separator value exceeds actual maximum`).toBeLessThanOrEqual(max);
        expect(max, `${state}: ARIA maximum must be bounded by available width`)
          .toBeLessThanOrEqual(1120);
      }
    } else {
      expect(geometry.copyLayout, `${state}: mobile copy should follow artwork`).toBe("relative");
    }
    return geometry;
  }

  async function verifyArtCoverage() {
    const metric = await page.evaluate(() => {
      const studio = document.querySelector("#studio") as HTMLElement;
      const imageFrame = document.querySelector('[data-home-art="true"]') as HTMLElement;
      const img = imageFrame.querySelector("img") as HTMLImageElement;
      const s = studio.getBoundingClientRect();
      const a = imageFrame.getBoundingClientRect();
      const header = document.querySelector("header") as HTMLElement;
      return {
        studioLeft: s.left,
        studioRight: s.right,
        studioBottom: s.bottom,
        artLeft: a.left,
        artRight: a.right,
        artTop: a.top,
        artBottom: a.bottom,
        expectedTop: header.getBoundingClientRect().bottom,
        fit: getComputedStyle(img).objectFit,
        mask: getComputedStyle(imageFrame).maskImage
      };
    });
    expect(metric.artLeft).toBeGreaterThanOrEqual(metric.studioLeft - 2);
    expect(metric.artLeft).toBeLessThanOrEqual(metric.studioLeft + 2);
    expect(metric.artRight).toBeGreaterThanOrEqual(metric.studioRight - 2);
    expect(metric.artTop).toBeLessThanOrEqual(metric.expectedTop + 2);
    expect(metric.artBottom).toBeGreaterThanOrEqual(metric.studioBottom - 2);
    expect(metric.fit).toBe("cover");
    expect(metric.mask).toBe("none");
  }

  const initial = await inspectHomeState("split-default");
  if (testInfo.project.name === "desktop-1440" || testInfo.project.name === "desktop-short") {
    await verifyArtCoverage();
    if (initial.dividerRange) {
      const shellWidth = await page.locator('[aria-label="Estúdio e Rádio"]').evaluate((e) =>
        e.getBoundingClientRect().width
      );
      const physicalMaximum = Math.min(1120, Math.max(Math.round(shellWidth * 0.3), shellWidth - 640 - 32));
      expect(initial.dividerRange.max).toBeCloseTo(physicalMaximum, 0);
    }
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

    for (let index = 0; index < 4; index += 1) {
      await divider.press("Shift+ArrowLeft");
    }
    await expect.poll(async () =>
      page.locator("#studio").evaluate((node) => node.getBoundingClientRect().width)
    ).toBeLessThan(850);
    await inspectHomeState("radio-medium");
    await page.screenshot({
      path: testInfo.outputPath("home-x1-radio-medium.png"),
      fullPage: false,
      animations: "disabled"
    });

    await divider.press("End");
    await verifyArtCoverage();
    await inspectHomeState("radio-maximum");
    await page.screenshot({
      path: testInfo.outputPath("home-x1-studio-compact.png"),
      fullPage: false,
      animations: "disabled"
    });

    await divider.press("Home");
    await divider.press("ArrowRight");
    await expect(page.locator("[data-radio-layout-mode]"))
      .toHaveAttribute("data-radio-layout-mode", "docked");
    await verifyArtCoverage();
    await inspectHomeState("radio-docked");
    await page.screenshot({
      path: testInfo.outputPath("home-x1-radio-docked.png"),
      fullPage: false,
      animations: "disabled"
    });
  }
});
