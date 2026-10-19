import { expect, test } from "@playwright/test";

test("full desktop Radio keeps cover, transport, volume and playlist after CSS extraction", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Desktop player-specific visual contract");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const pane = page.locator('[data-radio-surface="desktop"]');
  await expect(pane).toBeVisible();
  const controls = pane.locator('[aria-label="Controles da rádio"]');
  await expect(controls).toBeVisible();
  await expect(pane.locator('ol[aria-label="Músicas da playlist"]')).toBeVisible();
  await expect(pane.locator('input[aria-label="Posição da música"]')).toBeVisible();
  await controls.getByRole("button", { name: /^Volume / }).click();
  await expect(pane.getByRole("group", { name: "Controle de volume" })).toBeVisible();
  const data = await pane.evaluate((node) => {
    const buttons = node.querySelector<HTMLElement>('[aria-label="Controles da rádio"]');
    const visualizer = node.querySelector<HTMLElement>('[data-radio-motion-key="visualizer"]');
    const queue = node.querySelector<HTMLElement>('ol[aria-label="Músicas da playlist"]');
    return {
      controlsVisible: Boolean(buttons && buttons.getBoundingClientRect().width > 0),
      queueScrollable: Boolean(queue && ["auto", "scroll"].includes(getComputedStyle(queue).overflowY)),
      visualizerVisible: Boolean(visualizer && visualizer.getBoundingClientRect().width > 0),
      audioCount: document.querySelectorAll("audio").length
    };
  });
  expect(data.controlsVisible).toBe(true);
  expect(data.queueScrollable).toBe(true);
  expect(data.visualizerVisible).toBe(true);
  expect(data.audioCount).toBe(1);
});

test("mobile full Radio preserves independent controls, spectrum and playlist", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390", "Mobile player-specific visual contract");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const beforeAudio = await page.locator("audio").count();
  await page.getByRole("button", { name: "Abrir rádio completa" }).click();
  const dialog = page.getByRole("dialog", { name: "CM Rádio completa" });
  await expect(dialog).toBeVisible();
  const pane = dialog.locator('[data-radio-surface="mobile"]');
  await expect(pane.locator('[aria-label="Controles da rádio"]')).toBeVisible();
  await expect(pane.locator('ol[aria-label="Músicas da playlist"]')).toBeVisible();
  await pane.locator('[aria-label="Controles da rádio"]').getByRole("button", { name: /^Volume / }).click();
  await expect(pane.getByRole("group", { name: "Controle de volume" })).toBeVisible();
  expect(await page.locator("audio").count()).toBe(beforeAudio);
});
