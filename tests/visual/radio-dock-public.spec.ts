import { expect, test } from "@playwright/test";

const run = process.env.VISUAL_LAB_QA === "1";
const desktop = new Set(["desktop-1440", "desktop-short"]);

test.use({ video: run ? "on" : "off" });

test.describe("03c — integrated public Radio dock (development fixture)", () => {
  test.skip(!run, "Interactive Radio gestures run against the isolated development CI server");

  test("overshoot transforms the real sidebar into the navbar and restores without remounting audio", async ({ page }, testInfo) => {
    test.skip(!desktop.has(testInfo.project.name), "Desktop full Radio only");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const root = page.locator('[data-radio-layout-mode]');
    const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    const aside = page.locator('aside[aria-label="CM Rádio"]');
    await expect(divider).toBeVisible();
    await expect(aside).toBeVisible();
    await expect(root).not.toHaveAttribute("data-radio-docked", "true");
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await page.screenshot({ path: testInfo.outputPath("01-lateral-original.png"), animations: "disabled" });

    const beforeAudioCount = await page.locator("audio").count();
    const before = await divider.boundingBox();
    expect(before).not.toBeNull();
    const x = before!.x + before!.width / 2;
    const y = before!.y + Math.min(240, before!.height / 3);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 250, y, { steps: 20 });
    await page.mouse.up();

    await expect(root).toHaveAttribute("data-radio-layout-mode", "docked", { timeout: 4800 });
    await expect(root).toHaveAttribute("data-radio-docked", "true");
    const mini = page.locator('[data-radio-navbar-mini="true"]');
    await expect(mini).toBeVisible();
    await expect(mini.getByRole("button", { name: "Faixa anterior" })).toBeVisible();
    await expect(mini.getByRole("button", { name: "Próxima faixa" })).toBeVisible();
    await expect(mini.locator('[data-dock-signal="true"] [role="img"] > span')).toHaveCount(13);
    await expect(aside).toBeHidden();
    await expect(aside).toHaveAttribute("inert", "");
    await expect(mini).not.toHaveAttribute("inert", "");

    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)?.getBoundingClientRect();
      const brand = rect('header a[aria-label="CM 3D e Rádio, início"]');
      const nav = rect('nav[aria-label="Navegação principal"]');
      const mini = rect('[data-radio-navbar-mini="true"]');
      const social = rect('[role="group"][aria-label="Contato e redes sociais"]');
      if (!brand || !nav || !mini || !social) return null;
      return {
        brandRight: brand.right,
        navLeft: nav.left,
        navRight: nav.right,
        miniLeft: mini.left,
        miniRight: mini.right,
        socialLeft: social.left,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(geometry).not.toBeNull();
    expect(geometry!.navLeft, "Navigation must remain after the CM logo").toBeGreaterThan(geometry!.brandRight);
    expect(geometry!.miniLeft, "Mini must not overlap navigation").toBeGreaterThan(geometry!.navRight);
    expect(geometry!.socialLeft, "Social buttons must remain after the mini").toBeGreaterThan(geometry!.miniRight);
    expect(geometry!.overflow, "Dock must not add horizontal page scroll").toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath("02-dock-in-real-navbar.png"), animations: "disabled" });

    // The single player/context is shared by both presentations.
    expect(await page.locator("audio").count()).toBe(beforeAudioCount);
    await mini.getByRole("button", { name: "Restaurar a Rádio lateral" }).click();
    await expect(root).not.toHaveAttribute("data-radio-docked", "true", { timeout: 4000 });
    await expect(aside).toBeVisible();
    await expect(mini).toBeHidden();
    await expect(divider).toBeVisible();
    expect(await page.locator("audio").count()).toBe(beforeAudioCount);
    await page.screenshot({ path: testInfo.outputPath("03-restored-lateral.png"), animations: "disabled" });
  });

  test("dock survives Studio navigation; full Radio opens and returns to dock", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Route and fullscreen continuity on representative desktop");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const root = page.locator('[data-radio-layout-mode]');
    const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    await expect(divider).toBeVisible();

    await divider.focus();
    await divider.press("Home");
    await divider.press("ArrowRight");
    await expect(root).toHaveAttribute("data-radio-layout-mode", "docked");
    const mini = page.locator('[data-radio-navbar-mini="true"]');
    await expect(mini).toBeVisible();

    await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Estúdio" }).click();
    await expect(page).toHaveURL(/\/studio$/);
    await expect(root).toHaveAttribute("data-radio-layout-mode", "docked");
    await expect(mini).toBeVisible();

    await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Rádio" }).click();
    await expect(root).toHaveAttribute("data-radio-layout-mode", "fullscreen");
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();
    const fullDivider = page.getByRole("separator", { name: "Arraste para a direita para mostrar o Estúdio" });
    await expect(fullDivider).toBeVisible();
    await fullDivider.focus();
    await fullDivider.press("Escape");
    await expect(root).toHaveAttribute("data-radio-layout-mode", "docked");
    await expect(mini).toBeVisible();

    await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Início" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(root).toHaveAttribute("data-radio-layout-mode", "docked");
  });

  test("dragging dock edge back left restores; reduced motion avoids flight", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Dock restoration gesture and reduced-motion");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const root = page.locator('[data-radio-layout-mode]');
    const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    await expect(divider).toBeVisible();
    await divider.focus();
    await divider.press("Home");
    await divider.press("ArrowRight");
    await expect(root).toHaveAttribute("data-radio-layout-mode", "docked");
    const edge = page.locator('[data-radio-dock-edge="true"]');
    await expect(edge).toBeVisible();

    const box = await edge.boundingBox();
    expect(box).not.toBeNull();
    const x = box!.x + box!.width / 2;
    const y = box!.y + Math.min(230, box!.height / 3);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 130, y, { steps: 12 });
    await page.mouse.up();
    await expect(root).not.toHaveAttribute("data-radio-docked", "true");
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();
    await expect(page.locator('[data-radio-dock-flight="true"]')).toBeHidden();
  });

  test("short or cancelled rightward drag must not dock the sidebar", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Cancellation QA on representative desktop");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const shell = page.locator('[data-radio-layout-mode]');
    const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    await expect(divider).toBeVisible();
    const box = await divider.boundingBox();
    expect(box).not.toBeNull();
    const x = box!.x + box!.width / 2;
    const y = box!.y + 190;

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 60, y, { steps: 10 });
    await page.mouse.up();
    await expect(shell).not.toHaveAttribute("data-radio-docked", "true");
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();

    // Pointer cancellation mid-drag is NOT a dock and restores last width.
    const next = await divider.boundingBox();
    expect(next).not.toBeNull();
    const x2 = next!.x + next!.width / 2;
    await page.mouse.move(x2, y);
    await page.mouse.down();
    await page.mouse.move(x2 + 130, y, { steps: 8 });
    await divider.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse", clientX: x2 + 130 });
    await page.mouse.up();
    await expect(shell).not.toHaveAttribute("data-radio-docked", "true");
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();
  });

  test("real development audio continues through dock and Studio route, and spectrum is truthful", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Playback continuity on representative desktop");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const sidebar = page.locator('aside[aria-label="CM Rádio"]');
    await expect(sidebar).toBeVisible();
    // Query the preserved DOM input directly: once docked, the sidebar is
    // correctly aria-hidden/inert and getByRole() intentionally excludes it.
    // Its controlled value still reflects the ONE shared audio position.
    const seek = sidebar.locator('input[type="range"][aria-label="Posição da música"]');
    await expect(seek).toBeVisible();
    await sidebar.getByRole("button", { name: "Tocar", exact: true }).click();
    await expect.poll(async () => Number(await seek.inputValue()), { timeout: 5000 }).toBeGreaterThan(0.15);
    const positionBefore = Number(await seek.inputValue());

    const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    await divider.focus();
    await divider.press("Home");
    await divider.press("ArrowRight");
    const dock = page.locator('[data-radio-navbar-mini="true"]');
    await expect(dock).toBeVisible();
    await expect(dock).toHaveAttribute("data-playback-state", "playing");
    await expect(dock.getByRole("button", { name: "Pausar CM Rádio" })).toBeVisible();

    await expect.poll(async () => Number(await seek.inputValue()), { timeout: 4000 }).toBeGreaterThan(positionBefore + 0.2);

    const bars = dock.locator('[data-dock-signal="true"] [role="img"] > span');
    await expect(bars).toHaveCount(13);
    await expect.poll(async () => bars.evaluateAll((nodes) =>
      Math.max(...nodes.map((node) => Number.parseFloat((node as HTMLElement).style.height || "4")))
    ), { timeout: 3800, intervals: [100, 160, 210] }).toBeGreaterThan(4.5);

    const trackTitle = await dock.locator('[data-dock-title="true"]').textContent();
    await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Estúdio" }).click();
    await expect(page).toHaveURL(/\/studio$/);
    await expect(page.locator('[data-radio-navbar-mini="true"]')).toBeVisible();
    await expect(dock.locator('[data-dock-title="true"]')).toHaveText(trackTitle ?? "");
    await expect(dock).toHaveAttribute("data-playback-state", "playing");

    await dock.getByRole("button", { name: "Pausar CM Rádio" }).click();
    await expect(dock).toHaveAttribute("data-playback-state", "paused");
  });

  test("opening and returning while the dock is still flying never strands the sidebar", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Interrupted-flight resilience");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    const root = page.locator('[data-radio-layout-mode]');
    await expect(divider).toBeVisible();
    const b = await divider.boundingBox();
    expect(b).not.toBeNull();
    const x = b!.x + b!.width / 2;
    const y = b!.y + 180;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 265, y, { steps: 16 });
    await page.mouse.up();
    await expect(root).toHaveAttribute("data-radio-layout-mode", "docked");
    const edge = page.locator('[data-radio-dock-edge="true"]');
    await expect(edge).toBeVisible();
    const e = await edge.boundingBox();
    expect(e).not.toBeNull();
    const edgeX = e!.x + e!.width / 2;
    const edgeY = e!.y + 220;
    await page.mouse.move(edgeX, edgeY);
    await page.mouse.down();
    await page.mouse.move(edgeX - 140, edgeY, { steps: 8 });
    await page.mouse.up();

    await expect(root).not.toHaveAttribute("data-radio-docked", "true");
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();
    await expect(page.locator('[data-radio-dock-flight="true"]')).toBeHidden({ timeout: 3500 });
    await expect(divider).toBeVisible();
    await expect(page.locator('[data-radio-navbar-mini="true"]')).toBeHidden();
  });

  test("1180px dock does not overlap socials; resizing across mobile breakpoint resolves to ONE original mini", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Responsive transition on a desktop context");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1180, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const root = page.locator('[data-radio-layout-mode]');
    const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    await expect(divider).toBeVisible();
    await divider.focus();
    await divider.press("Home");
    await divider.press("ArrowRight");
    await expect(root).toHaveAttribute("data-radio-layout-mode", "docked");
    const dock = page.locator('[data-radio-navbar-mini="true"]');
    await expect(dock).toBeVisible();
    await expect(dock.getByRole("button", { name: "Próxima faixa" })).toBeVisible();

    const geometry = await page.evaluate(() => {
      const mini = document.querySelector('[data-radio-navbar-mini="true"]')?.getBoundingClientRect();
      const nav = document.querySelector('nav[aria-label="Navegação principal"]')?.getBoundingClientRect();
      const socials = document.querySelector('[role="group"][aria-label="Contato e redes sociais"]')?.getBoundingClientRect();
      return mini && nav && socials ? {
        navRight: nav.right,
        miniLeft: mini.left,
        miniRight: mini.right,
        socialLeft: socials.left,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      } : null;
    });
    expect(geometry).not.toBeNull();
    expect(geometry!.miniLeft, "Navbar mini cannot cover nav at 1180px").toBeGreaterThan(geometry!.navRight);
    expect(geometry!.socialLeft, "Social icons cannot be overlaid at 1180px").toBeGreaterThan(geometry!.miniRight);
    expect(geometry!.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath("public-dock-1180.png"), animations: "disabled" });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("region", { name: "Mini player da CM Rádio" })).toBeVisible();
    await expect(dock).toBeHidden();
    await expect(page.locator('[data-radio-dock-edge="true"]')).toHaveCount(0);
    await expect(root).not.toHaveAttribute("data-radio-docked", "true");
    expect(await page.locator("audio").count()).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath("docked-to-mobile-390.png"), animations: "disabled" });

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" })).toBeVisible();
    await expect(page.locator('aside[aria-label="CM Rádio"]')).toBeVisible();
    await expect(dock).toBeHidden();
  });

  test("mobile and narrow desktop retain the existing compact layout", async ({ page }, testInfo) => {
    test.skip(desktop.has(testInfo.project.name), "Test the unchanged smaller-width layout");
    await page.goto("/");
    const root = page.locator('[data-radio-layout-mode]');
    await expect(root).toBeVisible();
    await expect(page.getByRole("region", { name: "Mini player da CM Rádio" })).toBeVisible();
    await expect(page.locator('[data-radio-navbar-mini="true"]')).toBeHidden();
    await expect(page.locator('[data-radio-dock-edge="true"]')).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: testInfo.outputPath("mobile-original-layout.png"), animations: "disabled" });
  });
});
