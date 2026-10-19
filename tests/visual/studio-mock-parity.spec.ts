import { expect, test } from "@playwright/test";
import { studioPrintMedia } from "@/features/studio/prints-media";

test("Studio matches the approved split composition with four ordered destinations", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "desktop-short"].includes(testInfo.project.name), "Desktop split geometry only");
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  const cards = page.locator('[data-studio-nav="true"] [data-studio-card]');
  await expect(cards).toHaveCount(4);
  await expect(cards.locator("strong")).toHaveText(["Orçamentos", "Produtos", "Materiais", "O Estúdio"]);
  await expect(page.getByRole("heading", { level: 1, name: "Impressões" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Fotos do estúdio|Fotos e vídeos do estúdio/ })).toBeVisible();

  const geometry = await page.evaluate(() => {
    const get = (selector: string) => document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
    const hero = get('[data-studio-card="prints"]');
    const actions = get('[data-studio-nav="true"]');
    const strip = get('[data-studio-media-strip="true"]');
    const radio = get('aside[aria-label="CM Rádio"]');
    if (!hero || !actions || !strip || !radio) return null;
    return {
      heroLeft: hero.left, heroRight: hero.right, heroBottom: hero.bottom,
      actionsLeft: actions.left, actionsBottom: actions.bottom,
      stripTop: strip.top, stripBottom: strip.bottom,
      radioWidth: radio.width, viewportWidth: innerWidth, viewportHeight: innerHeight
    };
  });
  expect(geometry).not.toBeNull();
  expect(geometry!.heroLeft).toBeLessThan(geometry!.actionsLeft);
  expect(geometry!.heroRight).toBeLessThan(geometry!.actionsLeft + 3);
  expect(Math.abs(geometry!.heroBottom - geometry!.actionsBottom)).toBeLessThan(4);
  expect(geometry!.stripTop).toBeGreaterThanOrEqual(geometry!.heroBottom);
  expect(geometry!.stripBottom).toBeLessThanOrEqual(geometry!.viewportHeight + 2);
  expect(geometry!.radioWidth / geometry!.viewportWidth).toBeLessThan(0.28);
});

test("Studio thumbnail selection changes the main photo without leaving the hub", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Selected thumbnail integration on representative desktop");
  test.skip(studioPrintMedia.length < 2, "At least two published photos required");
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  const carousel = page.locator('[data-studio-prints-carousel="true"]');
  const thumbnail = page.locator('[data-studio-thumbnail="1"]');
  await thumbnail.click();
  await expect(carousel).toHaveAttribute("data-active-media-id", studioPrintMedia[1].id);
  await expect(thumbnail).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/\/studio$/);
});

test("Mobile keeps the compact radio first and four accessible Studio cards", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile-"), "Mobile composition only");
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("region", { name: "Mini player da CM Rádio" })).toBeVisible();
  await expect(page.locator('[data-studio-nav="true"] [data-studio-card]')).toHaveCount(4);
  await expect(page.locator('[data-studio-media-strip="true"]')).toBeVisible();
  const layout = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    playerBottom: document.querySelector('[aria-label="Mini player da CM Rádio"]')?.getBoundingClientRect().bottom ?? 0,
    heroTop: document.querySelector('[data-studio-card="prints"]')?.getBoundingClientRect().top ?? 0
  }));
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.heroTop).toBeGreaterThanOrEqual(layout.playerBottom - 2);
});

test("Materials and Studio introduction have real destinations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Navigation contract on representative desktop");
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await page.locator('[data-studio-card="materials"]').click();
  await expect(page).toHaveURL(/\/studio\/materiais$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/studio");
  await page.locator('[data-studio-card="about"]').click();
  await expect(page).toHaveURL(/\/studio\/o-estudio$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
