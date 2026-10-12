import { expect, test } from "@playwright/test";

test("Studio hub preserves three entrances and separates commercial color accents", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-studio-card]")).toHaveCount(3);
  const prints = page.locator('[data-studio-card="prints"]');
  const quote = page.locator('[data-studio-card="quote"]');
  const products = page.locator('[data-studio-card="products"]');
  await expect(prints.locator('[data-studio-prints-carousel="true"]')).toBeVisible();
  await expect(prints.getByRole("heading", { name: "Impressões" })).toBeVisible();
  await expect(quote.getByText("Pedir orçamento")).toBeVisible();
  await expect(products.getByText("Ver produtos")).toBeVisible();

  const colors = await page.evaluate(() => {
    const action = (card: string) => {
      const element = document.querySelector(`[data-studio-card="${card}"] [class*="studioCardAction"]`);
      return element ? getComputedStyle(element).color : null;
    };
    return { quote: action("quote"), products: action("products") };
  });
  expect(colors.quote).toBe("rgb(245, 250, 255)");
  expect(colors.products).toBe("rgb(255, 149, 105)");
});

test("Studio carousel navigation and gallery keep the same Radio audio node", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    (window as Window & { __radioBefore?: HTMLAudioElement | null }).__radioBefore = document.querySelector("audio");
  });

  const next = page.getByRole("button", { name: "Próxima impressão" });
  if (await next.count()) {
    const indicator = page.locator('[data-studio-prints-carousel] [class*="counter"]');
    const previous = await indicator.textContent();
    await next.click();
    await expect(indicator).not.toHaveText(previous ?? "");
  }

  await page.getByRole("link", { name: /Explorar galeria/i }).click();
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
