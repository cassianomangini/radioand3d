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
