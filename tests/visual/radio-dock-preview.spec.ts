import { expect, test } from "@playwright/test";

const previewRun = process.env.VISUAL_LAB_QA === "1";
const previewRoute = "/dev/radio-dock";
const wideProjects = new Set(["desktop-1440", "desktop-short"]);

test.describe("03c production protection", () => {
  test.skip(previewRun || !process.env.CI, "Only applicable to the production build");

  test("does not expose the radio dock experiment", async ({ request }) => {
    const response = await request.get(previewRoute);
    expect(response.status()).toBe(404);
  });
});

test.use({ video: previewRun ? "on" : "off" });

test.describe("03c visual dock preview", () => {
  test.skip(!previewRun, "Run the isolated animation preview against pnpm dev");

  test("real CM header: dock then restore using explicit player control", async ({ page }, testInfo) => {
    test.skip(!wideProjects.has(testInfo.project.name), "Desktop sidebar is available only on wide layouts");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    const response = await page.goto(previewRoute, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    const root = page.locator('[data-radio-dock-preview="true"][data-preview-ready="true"]');
    await expect(root).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
    await expect(page.locator('header img[src*="cm-3d-radio-logo"]')).toBeVisible();
    await expect(page.getByRole("group", { name: "Contato e redes sociais" })).toBeVisible();
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("radio-side-before.png"), animations: "disabled" });

    const beforeAudioCount = await page.locator("audio").count();
    expect(beforeAudioCount, "One shared RadioProvider must own the audio element").toBeLessThanOrEqual(1);

    await page.locator('[data-dock-demo-toggle="true"]').click();
    await expect(root).toHaveAttribute("data-dock-phase", "docking", { timeout: 1500 });
    await page.waitForTimeout(240);
    await page.screenshot({ path: testInfo.outputPath("radio-flight-to-navbar.png"), animations: "allow" });
    await expect(root).toHaveAttribute("data-dock-phase", "docked", { timeout: 4000 });
    const mini = page.locator('[data-dock-mini="true"]');
    await expect(mini).toBeVisible();
    await expect(mini.getByText("CM RÁDIO", { exact: true })).toBeVisible();
    await expect(mini.getByRole("button", { name: "Faixa anterior" })).toBeVisible();
    await expect(mini.getByRole("button", { name: "Tocar CM Rádio" })).toBeVisible();
    await expect(mini.getByRole("button", { name: "Próxima faixa" })).toBeVisible();
    await expect(mini.locator('[data-dock-signal="true"] [role="img"] > span')).toHaveCount(13);
    await expect(mini.getByRole("button", { name: "Restaurar a Rádio lateral" })).toBeVisible();
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeHidden();

    const placement = await page.evaluate(() => {
      const dock = document.querySelector('[data-dock-mini="true"]')?.getBoundingClientRect();
      const group = document.querySelector('[role="group"][aria-label="Contato e redes sociais"]')?.getBoundingClientRect();
      const nav = document.querySelector('nav[aria-label="Navegação principal"]')?.getBoundingClientRect();
      const brand = document.querySelector('header a[aria-label="CM 3D e Rádio, início"]')?.getBoundingClientRect();
      if (!dock || !group || !nav || !brand) return null;
      return {
        brandRight: brand.right,
        navLeft: nav.left,
        navRight: nav.right,
        miniLeft: dock.left,
        miniWidth: dock.width,
        miniRight: dock.right,
        socialsLeft: group.left,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(placement).not.toBeNull();
    expect(placement!.miniRight, "The mini must be BEFORE the social icons").toBeLessThan(placement!.socialsLeft);
    expect(placement!.navLeft - placement!.brandRight, "Dock-only nav should sit near the CM logo").toBeGreaterThanOrEqual(16);
    expect(placement!.navLeft - placement!.brandRight, "Do not keep nav centered while docked").toBeLessThanOrEqual(52);
    expect(placement!.miniLeft, "Wide dock must not cover the left-aligned navigation").toBeGreaterThanOrEqual(placement!.navRight + 15);
    expect(placement!.miniWidth, "Mini-player must use the space released by left-aligning nav").toBeGreaterThan(700);
    expect(placement!.overflow, "No horizontal page scroll from new navbar slot").toBeLessThanOrEqual(1);
    expect(await page.locator("audio").count()).toBe(beforeAudioCount);
    await page.screenshot({ path: testInfo.outputPath("radio-docked-before-socials.png"), animations: "disabled" });

    await page.locator('[data-dock-restore="true"]').click();
    await expect(root).toHaveAttribute("data-dock-phase", "side", { timeout: 4000 });
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();
    await expect(mini).toBeHidden();
    expect(await page.locator("audio").count()).toBe(beforeAudioCount);
    await page.screenshot({ path: testInfo.outputPath("radio-side-restored.png"), animations: "disabled" });
  });

  test("legacy-informed player fits 1180, 1440 and 1760 with a long track title", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Run the resizing comparison once on desktop");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const veryLongTitle = "Uma faixa intencionalmente muito longa para testar o nome da música no cabeçalho sem esconder os controles de anterior, tocar e próxima nem ocupar a navegação principal";
    await page.goto(previewRoute + "?previewTitle=" + encodeURIComponent(veryLongTitle), { waitUntil: "domcontentloaded" });
    const root = page.locator('[data-radio-dock-preview="true"][data-preview-ready="true"]');
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-preview-long-title", "true");
    await page.locator('[data-dock-demo-toggle="true"]').click();
    await expect(root).toHaveAttribute("data-dock-phase", "docked");
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    const mini = page.locator('[data-dock-mini="true"]');
    for (const width of [1180, 1440, 1760]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(mini).toBeVisible();
      const measured = await page.evaluate(() => {
        const mini = document.querySelector('[data-dock-mini="true"]');
        const nav = document.querySelector('nav[aria-label="Navegação principal"]');
        const brand = document.querySelector('header a[aria-label="CM 3D e Rádio, início"]');
        const group = document.querySelector('[role="group"][aria-label="Contato e redes sociais"]');
        const title = document.querySelector('[data-dock-title="true"]');
        const transport = document.querySelector('[data-dock-mini="true"] [role="group"][aria-label="Controles da Rádio"]');
        const signal = document.querySelector('[data-dock-signal="true"]');
        const restore = document.querySelector('[data-dock-restore="true"]');
        if (!mini || !nav || !brand || !group || !title || !transport || !signal || !restore) return null;
        const box = (e: Element) => e.getBoundingClientRect();
        const m = box(mini), n = box(nav), g = box(group);
        return {
          miniLeft: m.left, miniRight: m.right, miniWidth: m.width,
          brandRight: box(brand).right,
          navLeft: n.left, navRight: n.right, socialLeft: g.left,
          titleOverflowed: title.scrollWidth > title.clientWidth,
          transportLeft: box(transport).left, transportRight: box(transport).right,
          signalLeft: box(signal).left, signalRight: box(signal).right,
          restoreRight: box(restore).right,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      expect(measured, "Expected actual navigation and controls in CM shell").not.toBeNull();
      expect(measured!.navLeft - measured!.brandRight, `Navigation too far from logo at ${width}px`).toBeGreaterThanOrEqual(16);
      expect(measured!.navLeft - measured!.brandRight, `Navigation still centered at ${width}px`).toBeLessThanOrEqual(52);
      expect(measured!.miniLeft, `CM navigation overlaps dock at ${width}px`).toBeGreaterThan(measured!.navRight + 15);
      expect(measured!.miniWidth, `The player is still too cramped at ${width}px`).toBeGreaterThan(
        width === 1180 ? 500 : width === 1440 ? 740 : 830
      );
      expect(measured!.miniRight, `Social icons overlap dock at ${width}px`).toBeLessThan(measured!.socialLeft);
      expect(measured!.transportRight, `Transport collides with spectrum at ${width}px`).toBeLessThan(measured!.signalLeft);
      expect(measured!.signalRight, `Spectrum collides with restore at ${width}px`).toBeLessThan(measured!.restoreRight);
      expect(measured!.overflow, `Horizontal scroll at ${width}px`).toBeLessThanOrEqual(1);
      expect(measured!.titleOverflowed, `Long title should truncate at ${width}px`).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`radio-navbar-${width}-long-title.png`), animations: "disabled" });
    }
  });

  test("13 dock bars respond to the actual Web Audio fixture and relax after pausing", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Audio analyzer sample on one real Chromium desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(previewRoute, { waitUntil: "domcontentloaded" });
    const root = page.locator('[data-radio-dock-preview="true"][data-preview-ready="true"]');
    await expect(root).toBeVisible();
    await page.locator('[data-dock-demo-toggle="true"]').click();
    await expect(root).toHaveAttribute("data-dock-phase", "docked", { timeout: 3000 });

    const mini = page.locator('[data-dock-mini="true"]');
    const bars = mini.locator('[data-dock-signal="true"] [role="img"] > span');
    await expect(bars).toHaveCount(13);
    await mini.getByRole("button", { name: "Tocar CM Rádio" }).click();
    await expect(mini).toHaveAttribute("data-playback-state", "playing", { timeout: 7000 });
    await expect.poll(
      async () => bars.evaluateAll((elements) =>
        Math.max(...elements.map((element) =>
          Number.parseFloat((element as HTMLElement).style.height || "4")
        ))
      ),
      { message: "The 13 bars must react to the real analyzer, never a fake CSS loop", timeout: 5000, intervals: [90, 150, 190, 220] }
    ).toBeGreaterThan(4.5);
    await page.screenshot({ path: testInfo.outputPath("radio-dock-real-fixture-playing.png"), animations: "allow" });

    await mini.getByRole("button", { name: "Pausar CM Rádio" }).click();
    await expect(mini).toHaveAttribute("data-playback-state", "paused", { timeout: 2500 });
    await expect.poll(
      async () => bars.evaluateAll((elements) =>
        Math.max(...elements.map((element) =>
          Number.parseFloat((element as HTMLElement).style.height || "4")
        ))
      ),
      { message: "Dock bars should settle when playback stops", timeout: 3500, intervals: [100, 170, 250] }
    ).toBeLessThanOrEqual(4.5);
  });

  test("next, previous and keyboard restore reuse the actual RadioProvider", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Shared queue and keyboard check on desktop");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(previewRoute, { waitUntil: "domcontentloaded" });
    const root = page.locator('[data-radio-dock-preview="true"][data-preview-ready="true"]');
    await expect(root).toBeVisible();
    await page.locator('[data-dock-demo-toggle="true"]').click();
    await expect(root).toHaveAttribute("data-dock-phase", "docked");
    const mini = page.locator('[data-dock-mini="true"]');
    const title = mini.locator('[data-dock-title="true"]');
    await expect(title, "Wait for actual development catalog before queue assertions").toContainText("Amostra técnica");
    // innerText() can temporarily be empty while the dock is CSS-hidden during
    // reduced-motion hydration, even though the underlying track text exists.
    const originalTitle = (await title.textContent())?.trim() ?? "";
    expect(originalTitle).toMatch(/^Amostra técnica \d{2}$/);

    await mini.getByRole("button", { name: "Próxima faixa" }).click();
    await expect(title).not.toHaveText(originalTitle);
    await mini.getByRole("button", { name: "Faixa anterior" }).click();
    await expect(title).toHaveText(originalTitle);
    const restore = mini.getByRole("button", { name: "Restaurar a Rádio lateral" });
    await restore.focus();
    await expect(restore).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(root).toHaveAttribute("data-dock-phase", "side");
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();
  });

  test("overshoot right docks; pulling right edge left restores", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Gesture proof on representative wide desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(previewRoute, { waitUntil: "domcontentloaded" });
    const root = page.locator('[data-radio-dock-preview="true"][data-preview-ready="true"]');
    await expect(root).toBeVisible();

    const handle = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    const bounds = await handle.boundingBox();
    expect(bounds).not.toBeNull();
    const x = bounds!.x + bounds!.width / 2;
    const y = bounds!.y + Math.min(240, bounds!.height / 3);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 275, y, { steps: 18 });
    await page.mouse.up();
    await expect(root).toHaveAttribute("data-dock-phase", "docked", { timeout: 4200 });

    const edge = page.locator('[data-dock-edge="true"]');
    await expect(edge).toBeVisible();
    const edgeRect = await edge.boundingBox();
    expect(edgeRect).not.toBeNull();
    const edgeX = edgeRect!.x + edgeRect!.width / 2;
    const edgeY = edgeRect!.y + Math.min(210, edgeRect!.height / 3);
    await page.mouse.move(edgeX, edgeY);
    await page.mouse.down();
    await page.mouse.move(edgeX - 185, edgeY, { steps: 15 });
    await page.mouse.up();
    await expect(root).toHaveAttribute("data-dock-phase", "side", { timeout: 4200 });
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();
  });

  test("reduced motion preserves states without flight", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Representative desktop reduced-motion proof");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(previewRoute, { waitUntil: "domcontentloaded" });
    const root = page.locator('[data-radio-dock-preview="true"][data-preview-ready="true"]');
    await expect(root).toBeVisible();
    await page.locator('[data-dock-demo-toggle="true"]').click();
    await expect(root).toHaveAttribute("data-dock-phase", "docked");
    await expect(page.locator('[data-dock-mini="true"]')).toBeVisible();
    await page.locator('[data-dock-restore="true"]').click();
    await expect(root).toHaveAttribute("data-dock-phase", "side");
  });

  test("does not add another mobile player or horizontal overflow", async ({ page }, testInfo) => {
    test.skip(wideProjects.has(testInfo.project.name), "Small-screen contract proof");
    await page.goto(previewRoute, { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-radio-dock-preview="true"][data-preview-ready="true"]')).toBeVisible();
    await expect(page.locator('[data-dock-demo-toggle="true"]')).toBeHidden();
    await expect(page.locator('[data-dock-mini="true"]')).toBeHidden();
    const dimensions = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
    await page.screenshot({ path: testInfo.outputPath("mobile-original-mini-unchanged.png"), animations: "disabled" });
  });
});
