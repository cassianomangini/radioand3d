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

test.use({ video: "on" });

test.describe("03c visual dock preview", () => {
  test.skip(!previewRun, "Run the isolated animation preview against pnpm dev");

  test("real CM header: dock then restore using explicit player control", async ({ page }, testInfo) => {
    test.skip(!wideProjects.has(testInfo.project.name), "Desktop sidebar is available only on wide layouts");

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
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeHidden();

    const placement = await page.evaluate(() => {
      const dock = document.querySelector('[data-dock-mini="true"]')?.getBoundingClientRect();
      const group = document.querySelector('[role="group"][aria-label="Contato e redes sociais"]')?.getBoundingClientRect();
      const nav = document.querySelector('nav[aria-label="Navegação principal"]')?.getBoundingClientRect();
      if (!dock || !group || !nav) return null;
      return {
        miniRight: dock.right,
        socialsLeft: group.left,
        navCenter: nav.left + nav.width / 2,
        viewportCenter: document.documentElement.clientWidth / 2,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(placement).not.toBeNull();
    expect(placement!.miniRight, "The mini must be BEFORE the social icons").toBeLessThan(placement!.socialsLeft);
    expect(Math.abs(placement!.navCenter - placement!.viewportCenter), "Centered navigation must remain centered").toBeLessThan(24);
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

  test("overshoot right docks; pulling right edge left restores", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Gesture proof on representative wide desktop");
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
