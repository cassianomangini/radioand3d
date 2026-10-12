import { expect, test } from "@playwright/test";

const labEnabled = process.env.VISUAL_LAB_QA === "1";

test.describe("Studio carousel isolated motion QA", () => {
  test.skip(!labEnabled, "Only run the photo rotation fixture on development QA");

  test("slides advance automatically despite the pointer resting on the photo; pause is explicit", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Full photo progression verified on desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const response = await page.goto("/dev/studio-carousel-qa", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    const carousel = page.locator('[data-studio-prints-carousel="true"]');
    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-alpha");
    await expect(carousel).toHaveAttribute("data-auto-rotating", "true");

    // Hovering the broad photograph must not freeze the reel for the whole visit.
    const box = await carousel.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + 70);
    await expect(carousel).toHaveAttribute("data-auto-rotating", "true");
    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-beta", { timeout: 10_000 });

    await page.getByRole("button", { name: "Pausar carrossel automático" }).click();
    await expect(carousel).toHaveAttribute("data-auto-rotating", "false");
    await page.waitForTimeout(6200);
    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-beta");
    await page.getByRole("button", { name: "Iniciar carrossel automático" }).click();
    await page.getByRole("heading", { name: /QA: carrossel/ }).click();
    await expect(carousel).toHaveAttribute("data-auto-rotating", "true");

    await page.screenshot({
      path: testInfo.outputPath("carousel-fixture-not-real-portfolio.png"),
      animations: "disabled"
    });
  });

  test("reduced motion stops automatic cycling but allows manual navigation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390", "Representative touch and reduced motion profile");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/studio-carousel-qa");
    const carousel = page.locator('[data-studio-prints-carousel="true"]');
    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-alpha");
    await expect(carousel).toHaveAttribute("data-auto-rotating", "false");
    await page.getByRole("button", { name: "Próxima impressão" }).click();
    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-beta");
    await expect(carousel).toHaveAttribute("data-auto-rotating", "false");
  });
});
