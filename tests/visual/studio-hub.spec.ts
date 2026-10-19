import { expect, test } from "@playwright/test";

test("Studio hub offers four clear destinations and separate media areas", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-studio-card]")).toHaveCount(5);
  const prints = page.locator('[data-studio-card="prints"]');
  const quote = page.locator('[data-studio-card="quote"]');
  const products = page.locator('[data-studio-card="products"]');
  await expect(prints.locator('[data-studio-prints-carousel="true"]')).toBeVisible();
  await expect(prints.getByRole("heading", { name: "Impressões" })).toBeVisible();
  await expect(quote.getByText("Orçamentos")).toBeVisible();
  await expect(products.getByText("Produtos")).toBeVisible();
  await expect(page.locator('[data-studio-card="materials"]')).toBeVisible();
  await expect(page.locator('[data-studio-card="about"]')).toBeVisible();

  await expect(page.locator('[data-studio-media-strip="true"]')).toBeVisible();
});

test("Studio carousel navigation and gallery keep the same Radio audio node", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    (window as Window & { __radioBefore?: HTMLAudioElement | null }).__radioBefore = document.querySelector("audio");
  });

  const next = page.getByRole("button", { name: "Próxima impressão" });
  if (await next.count()) {
    const indicator = page.locator('[data-studio-prints-carousel] span[aria-hidden="true"][class*="__counter"]');
    const previous = await indicator.textContent();
    await next.click();
    await expect(indicator).not.toHaveText(previous ?? "");
  }

  await page.locator('[data-studio-media-strip="true"]').getByRole("link", { name: /Ver todos/i }).click();
  await expect(page).toHaveURL(/\/studio\/impressoes/);
  await expect(page.getByRole("heading", { level: 1, name: "O que já saiu das impressoras." })).toBeVisible();
  const persisted = await page.evaluate(() => {
    const before = (window as Window & { __radioBefore?: HTMLAudioElement | null }).__radioBefore;
    return before instanceof HTMLAudioElement && before === document.querySelector("audio");
  });
  expect(persisted).toBe(true);

  const gallery = page.locator('[data-studio-print-gallery="true"]');
  if (await gallery.count()) {
    await gallery.locator("button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Fechar visualização" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
});

test("docked Radio leaves the approved Studio hub intact", async ({ page }, testInfo) => {
  test.skip(
    !["desktop-1440", "desktop-short"].includes(testInfo.project.name),
    "Navbar dock exists on desktop only"
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
  await expect(divider).toBeVisible();
  await divider.focus();
  await divider.press("Home");
  await divider.press("ArrowRight");

  const root = page.locator('[data-radio-layout-mode]');
  await expect(root).toHaveAttribute("data-radio-docked", "true");
  await expect(page.locator('[data-radio-navbar-mini="true"]')).toBeVisible();
  await expect(page.locator('[data-studio-card="prints"]')).toBeVisible();
  await expect(page.locator('[data-studio-card="quote"]')).toBeVisible();
  await expect(page.locator('[data-studio-card="products"]')).toBeVisible();
  const measurements = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    audioNodes: document.querySelectorAll("audio").length
  }));
  expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.viewport + 1);
  expect(measurements.audioNodes).toBe(1);
  await page.screenshot({
    path: testInfo.outputPath("studio-docked-viewport.png"),
    animations: "disabled"
  });
});


test("Reduced motion shows each Studio section without entrance choreography", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Motion accessibility on representative desktop");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/studio");
  await expect(page.locator('[data-studio-card="prints"]')).toBeVisible();
  const animation = await page.locator('[data-studio-card="prints"]').evaluate(
    (element) => getComputedStyle(element).animationName
  );
  expect(animation).toBe("none");
});
