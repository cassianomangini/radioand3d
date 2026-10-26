import { expect, test } from "@playwright/test";

test("A pagina de orcamento preserva a composicao e a selecao em um clique", async ({ page }, testInfo) => {
  const response = await page.goto("/studio/orcamento", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1, name: "Conte o que você precisa." })).toBeVisible();
  const wizard = page.locator('[data-quote-step]');
  await expect(wizard).toHaveAttribute("data-quote-step", "1");
  await expect(wizard.getByRole("heading", { level: 2, name: "O que você quer imprimir?" })).toBeFocused();

  const options = page.getByRole("group", { name: "Tipo de projeto" });
  await expect(options.locator("button")).toHaveCount(4);
  const background = await page.locator('[class*="quoteHero"]').evaluate(
    (element) => getComputedStyle(element, "::before").backgroundImage
  );
  expect(background).toContain("/images/studio/fundo-orc.png");

  const columns = await options.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length
  );
  expect(columns).toBe(testInfo.project.name.startsWith("mobile-") ? 1 : 2);

  await options.getByRole("button", { name: /Imprimir um arquivo 3D que já tenho/i }).click();
  await expect(wizard).toHaveAttribute("data-quote-step", "2");
  await wizard.getByRole("button", { name: /voltar/i }).click();
  await expect(wizard).toHaveAttribute("data-quote-step", "1");
});

test("O fundo original do orcamento esta disponivel", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "Uma validacao de asset por build basta");
  const response = await page.request.get("/images/studio/fundo-orc.png");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/image\/png/);
});
