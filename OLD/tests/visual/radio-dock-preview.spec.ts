import { expect, test } from "@playwright/test";

const dev = process.env.VISUAL_LAB_QA === "1";
test.use({ video: dev ? "on" : "off" });

test.describe("03c development route protection", () => {
  test.skip(dev || !process.env.CI, "Run this assertion against the production build");

  test("the dock QA route returns 404 in production", async ({ request }) => {
    const response = await request.get("/dev/radio-dock");
    expect(response.status()).toBe(404);
  });
});

test.describe("03c real-shell development preview", () => {
  test.skip(!dev, "Only available while running the development server");

  test("does not mount a second experimental player or gesture controller", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop-1440", "One representative desktop");
    const response = await page.goto("/dev/radio-dock", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    const shell = page.locator('[data-radio-layout-mode]');
    await expect(shell).toBeVisible();
    await expect(page.locator('[data-radio-navbar-mini="true"]')).toHaveCount(1);
    await expect(page.locator('[data-radio-dock-preview="true"]')).toHaveCount(0);

    const divider = page.getByRole("separator", { name: "Arraste para redimensionar CM Rádio" });
    await expect(divider).toBeVisible();
    await divider.focus();
    await divider.press("Home");
    await divider.press("ArrowRight");
    await expect(shell).toHaveAttribute("data-radio-layout-mode", "docked");
    await expect(page.locator('[data-radio-navbar-mini="true"]')).toBeVisible();
    await page.screenshot({ path: info.outputPath("real-integrated-dock-dev-route.png"), animations: "disabled" });
    await page.locator('[data-radio-navbar-mini="true"]').getByRole("button", { name: "Restaurar a Rádio lateral" }).click();
    await expect(shell).not.toHaveAttribute("data-radio-docked", "true");
  });

  test("small screens retain only the existing mobile player", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile-390", "Mobile visual check");
    await page.goto("/dev/radio-dock");
    await expect(page.getByRole("region", { name: "Mini player da CM Rádio" })).toBeVisible();
    await expect(page.locator('[data-radio-navbar-mini="true"]')).toBeHidden();
    await page.screenshot({ path: info.outputPath("real-mobile-mini-dev-route.png"), animations: "disabled" });
  });
});
