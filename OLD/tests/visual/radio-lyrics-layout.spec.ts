import { expect, test } from "@playwright/test";

test("desktop full Radio keeps lyrics in the expected scroll panel", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Desktop layout contract");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Rádio" }).click();
  await expect(page.locator("[data-radio-layout-mode]"))
    .toHaveAttribute("data-radio-layout-mode", "fullscreen");

  const lyrics = page.locator('aside[aria-label="CM Rádio"] section[aria-labelledby="radio-lyrics-title"]');
  await expect(lyrics).toBeVisible();
  await expect(lyrics.getByRole("heading", { name: "Letra" })).toBeVisible();
  const layout = await lyrics.evaluate((node) => {
    const scroll = node.querySelector('[role="region"]') as HTMLElement;
    const rect = node.getBoundingClientRect();
    return {
      display: getComputedStyle(node).display,
      background: getComputedStyle(node).backgroundColor,
      gridColumn: getComputedStyle(node).gridColumnStart,
      scrollY: getComputedStyle(scroll).overflowY,
      width: rect.width,
      height: rect.height
    };
  });
  expect(layout.display).toBe("flex");
  expect(layout.background).toBe("rgb(0, 0, 0)");
  expect(layout.gridColumn).not.toBe("auto");
  expect(layout.scrollY).toBe("auto");
  expect(layout.width).toBeGreaterThan(100);
  expect(layout.height).toBeGreaterThan(100);
  await page.screenshot({
    path: testInfo.outputPath("radio-fullscreen-lyrics.png"),
    animations: "disabled",
    fullPage: false
  });
});

test("mobile lyrics tab replaces playlist and can return without remounting audio", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390", "Mobile composition contract");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const countBefore = await page.locator("audio").count();
  await page.getByRole("button", { name: "Abrir rádio completa" }).click();

  const dialog = page.getByRole("dialog", { name: "CM Rádio completa" });
  await expect(dialog).toBeVisible();
  const lyrics = dialog.locator('section[aria-labelledby="mobile-radio-lyrics-title"]');
  const list = dialog.locator('ol[aria-label="Músicas da playlist"]');
  await expect(lyrics).toBeHidden();
  await expect(list).toBeVisible();

  await dialog.getByRole("button", { name: "Expandir letra" }).click();
  await expect(lyrics).toBeVisible();
  await expect(list).toBeHidden();
  const state = await lyrics.evaluate((node) => ({
    display: getComputedStyle(node).display,
    flex: getComputedStyle(node).flex,
    minHeight: getComputedStyle(node).minHeight
  }));
  expect(state.display).toBe("flex");
  expect(state.flex).toContain("1");
  expect(state.minHeight).toBe("0px");
  await page.screenshot({
    path: testInfo.outputPath("radio-mobile-lyrics.png"),
    animations: "disabled",
    fullPage: false
  });

  await lyrics.getByRole("button", { name: "Fechar letra" }).click();
  await expect(lyrics).toBeHidden();
  await expect(list).toBeVisible();
  expect(await page.locator("audio").count()).toBe(countBefore);
});
