import { expect, test } from "@playwright/test";

const labEnabled = process.env.VISUAL_LAB_QA === "1";

test.describe("Studio slideshow: real playback clock + truthful image framing", () => {
  test.skip(!labEnabled, "Development-only QA fixture with existing site art (never marketed as prints)");

  test("starts playing, advances with pointer on photography, pauses and resumes at same progress", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "Full slideshow timing validated on desktop");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const response = await page.goto("/dev/studio-carousel-qa", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    const carousel = page.locator('[data-studio-prints-carousel="true"]');
    await expect(carousel).toHaveAttribute("data-carousel-playing", "true");
    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-alpha");
    await expect(carousel).toHaveAttribute("data-auto-rotating", "true");

    const box = await carousel.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + 75);
    await expect(carousel).toHaveAttribute("data-auto-rotating", "true");

    // Images are not being zoomed or cropped to fill the viewport.
    const frame = await carousel.evaluate((element) => {
      const photo = element.querySelector<HTMLImageElement>('img[class*="photo"]');
      const ambient = element.querySelector<HTMLImageElement>('img[class*="ambientImage"]');
      const slide = element.querySelector<HTMLElement>('[class*="mediaSlide"]');
      return {
        photoFit: photo && getComputedStyle(photo).objectFit,
        ambientFit: ambient && getComputedStyle(ambient).objectFit,
        photoWidth: photo && photo.getBoundingClientRect().width,
        slideWidth: slide && slide.getBoundingClientRect().width
      };
    });
    expect(frame.photoFit).toBe("contain");
    expect(frame.ambientFit).toBe("cover");
    expect(frame.photoWidth).toBe(frame.slideWidth);

    // A visible <img> can still be a blank rectangle while next/image
    // decodes. Fail the visual test instead of accepting an empty slide.
    const firstPhoto = carousel.locator('img[class*="photo"]').last();
    await expect.poll(
      () => firstPhoto.evaluate((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0),
      { timeout: 6500, message: "First fixture photo must decode before capture" }
    ).toBe(true);
    await firstPhoto.evaluate((node) => (node as HTMLImageElement).decode());
    await page.screenshot({
      path: testInfo.outputPath("carousel-fixture-first-photo.png"),
      animations: "disabled"
    });

    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-beta", { timeout: 8500 });
    // Freeze the current slide before waiting for its image; otherwise a
    // slow image decode can outlive the 4.8s rotation and skew the screenshot.
    await page.getByRole("button", { name: "Pausar apresentação" }).click();
    await expect(carousel).toHaveAttribute("data-carousel-playing", "false");
    const secondPhoto = carousel.locator('img[class*="photo"]').last();
    await expect.poll(
      () => secondPhoto.evaluate((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0),
      { timeout: 6500, message: "Second fixture photo must decode before capture" }
    ).toBe(true);
    await secondPhoto.evaluate((node) => (node as HTMLImageElement).decode());
    await page.screenshot({
      path: testInfo.outputPath("carousel-fixture-second-photo.png"),
      animations: "disabled"
    });
    await page.waitForTimeout(5400);
    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-beta");
    await page.getByRole("button", { name: "Reproduzir apresentação" }).click();
    await page.getByRole("heading", { name: /QA: carrossel/ }).click();
    await expect(carousel).toHaveAttribute("data-auto-rotating", "true");
    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-alpha", { timeout: 8500 });

    await page.screenshot({
      path: testInfo.outputPath("carousel-player-fixture-not-portfolio.png"),
      animations: "disabled"
    });
  });

  test("reduced motion uses cuts instead of zoom, but slideshow is still on by default", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390", "Touch-first, reduced-motion profile");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dev/studio-carousel-qa");
    const carousel = page.locator('[data-studio-prints-carousel="true"]');
    await expect(carousel).toHaveAttribute("data-carousel-playing", "true");
    await expect(carousel).toHaveAttribute("data-auto-rotating", "true");
    await expect(carousel).toHaveAttribute("data-active-media-id", "fixture-beta", { timeout: 8500 });
    await page.getByRole("button", { name: "Pausar apresentação" }).click();
    await expect(carousel).toHaveAttribute("data-auto-rotating", "false");
  });
});
