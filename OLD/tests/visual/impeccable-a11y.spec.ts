import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Studio hub exposes an accessible primary heading", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "ESTÚDIO DE IMPRESSÃO 3D" })).toBeVisible();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa", "best-practice"])
    .analyze();
  const missingHeading = audit.violations.filter((issue) => issue.id === "page-has-heading-one");
  expect(missingHeading).toHaveLength(0);
});

test("Mobile radio buttons meet the CM touch target and do not overflow", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile-"), "Mobile only");
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  const sizes = await page.locator('[aria-label="Mini player da CM Rádio"] button').evaluateAll(
    (buttons) => buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { name: button.getAttribute("aria-label"), width: rect.width, height: rect.height };
    })
  );
  expect(sizes.length).toBeGreaterThan(0);
  for (const button of sizes) {
    expect(button.width, button.name ?? "mobile button").toBeGreaterThanOrEqual(44);
    expect(button.height, button.name ?? "mobile button").toBeGreaterThanOrEqual(44);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("Carousel transport supports finger-sized actions without overlapping", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile-"), "Mobile only");
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  const transport = page.getByRole("group", { name: "Controles da apresentação de Impressões" });
  test.skip(await transport.count() === 0, "Requires a multi-item prints fixture");
  await expect(transport).toBeVisible();
  const metrics = await transport.locator("button").evaluateAll((buttons) =>
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      const clipping = button.closest('[role="group"][aria-label="Escolher impressão"]')?.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        left: clipping ? Math.max(rect.left, clipping.left) : rect.left,
        right: clipping ? Math.min(rect.right, clipping.right) : rect.right,
        top: rect.top,
        bottom: rect.bottom
      };
    })
  );
  for (const target of metrics) {
    expect(target.width).toBeGreaterThanOrEqual(44);
    expect(target.height).toBeGreaterThanOrEqual(44);
  }
  // Compare hit regions after overflow clipping. Offscreen timeline steps
  // may geometrically overlap Pause but cannot receive clicks there.
  for (let i = 0; i < metrics.length; i += 1) {
    for (let j = i + 1; j < metrics.length; j += 1) {
      const a = metrics[i], b = metrics[j];
      if (a.right <= a.left || b.right <= b.left) continue;
      const overlapping = a.left < b.right && a.right > b.left &&
        a.top < b.bottom && a.bottom > b.top;
      expect(overlapping).toBe(false);
    }
  }
  await transport.getByRole("button", { name: /Pausar apresentação|Reproduzir apresentação/ }).click();
});

test("Desktop divider has valid range values after hydration and retains keyboard dock", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "desktop-short"].includes(testInfo.project.name), "Desktop radio split only");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/studio", { waitUntil: "domcontentloaded" });
  const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
  await expect(divider).toBeVisible();
  await expect(divider).toHaveAttribute("aria-valuenow", /[0-9]+/);
  await expect(divider).toHaveAttribute("aria-valuemin", /[0-9]+/);
  await expect(divider).toHaveAttribute("aria-valuemax", /[0-9]+/);
  const axe = await new AxeBuilder({ page }).analyze();
  const relevant = axe.violations.filter((issue) =>
    ["aria-required-attr", "region"].includes(issue.id)
  );
  expect(relevant).toHaveLength(0);
  await divider.focus();
  await divider.press("Home");
  await divider.press("ArrowRight");
  await expect(page.locator('[data-radio-navbar-mini="true"]')).toBeVisible();
});
