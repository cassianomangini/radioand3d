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
  await expect(page).toHaveURL(/\/studio#impressoes/);
  await expect(page.getByRole("heading", { name: "Peças, detalhes e projetos reais" })).toBeInViewport();
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


test("Studio grows to the full Radio viewport and reveals cards separately", async ({ page }, testInfo) => {
  test.skip(
    !["desktop-1440", "desktop-short"].includes(testInfo.project.name),
    "Parallel full-height composition only on desktop"
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  // Cards persist across the route change. Record their actual Motion style
  // updates to prove a staggered entrance instead of a CSS keyframe declaration.
  await page.evaluate(() => {
    const names = ["prints", "quote", "products"];
    const marks: Record<string, number> = {};
    for (const name of names) {
      const element = document.querySelector<HTMLElement>(`[data-studio-card="${name}"]`);
      if (!element) continue;
      const observer = new MutationObserver(() => {
        if (marks[name] !== undefined) return;
        if (Number(getComputedStyle(element).opacity) > 0.035) {
          marks[name] = performance.now();
          observer.disconnect();
        }
      });
      observer.observe(element, { attributes: true, attributeFilter: ["style"] });
    }
    (window as Window & { __studioEntranceMarks?: Record<string, number> }).__studioEntranceMarks = marks;
  });

  await page.getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Estúdio" }).click();
  await expect(page).toHaveURL(/\/studio$/);
  const rail = page.locator('[data-studio-motion-owner="motion"]');
  await expect(rail).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator('[data-studio-card="products"]')).toHaveCSS("opacity", "1");

  const entrance = await page.evaluate(() => ({
    marks: (window as Window & { __studioEntranceMarks?: Record<string, number> }).__studioEntranceMarks,
    cssAnimationNames: ["prints", "quote", "products"].map((name) => {
      const element = document.querySelector<HTMLElement>(`[data-studio-card="${name}"]`);
      return element ? getComputedStyle(element).animationName : "missing";
    })
  }));
  expect(entrance.cssAnimationNames).toEqual(["none", "none", "none"]);
  expect(entrance.marks).toBeDefined();
  expect(Object.keys(entrance.marks ?? {}).sort()).toEqual(["prints", "products", "quote"]);
  expect(entrance.marks!.prints).toBeLessThan(entrance.marks!.quote);
  expect(entrance.marks!.quote).toBeLessThan(entrance.marks!.products);

  const geometry = await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>("main#studio");
    const rail = document.querySelector<HTMLElement>('[class*="studioDetailRail"]');
    const radio = document.querySelector<HTMLElement>('aside[aria-label="CM Rádio"]');
    const quote = document.querySelector<HTMLElement>('[data-studio-card="quote"]');
    const products = document.querySelector<HTMLElement>('[data-studio-card="products"]');
    if (!panel || !rail || !radio || !quote || !products) return null;
    return {
      studioBottom: panel.getBoundingClientRect().bottom,
      railBottom: rail.getBoundingClientRect().bottom,
      radioBottom: radio.getBoundingClientRect().bottom,
      quoteHeight: quote.getBoundingClientRect().height,
      productsHeight: products.getBoundingClientRect().height
    };
  });
  expect(geometry).not.toBeNull();
  expect(Math.abs(geometry!.studioBottom - geometry!.radioBottom)).toBeLessThan(2);
  expect(geometry!.radioBottom - geometry!.railBottom).toBeGreaterThanOrEqual(0);
  expect(geometry!.radioBottom - geometry!.railBottom).toBeLessThan(12);
  expect(Math.abs(geometry!.quoteHeight - geometry!.productsHeight)).toBeLessThan(3);

  // The mode change must not shrink the Studio back to the old header-offset height.
  const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
  await divider.focus();
  await divider.press("Home");
  await divider.press("ArrowRight");
  await expect(page.locator("[data-radio-layout-mode]")).toHaveAttribute("data-radio-docked", "true");
  const dockedBottom = await page.locator("main#studio").evaluate((el) => el.getBoundingClientRect().bottom);
  expect(Math.abs(dockedBottom - geometry!.radioBottom)).toBeLessThan(2);

  await page.screenshot({
    path: testInfo.outputPath("studio-docked-stagger-finished.png"),
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
