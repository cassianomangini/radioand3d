import { defineConfig } from "@playwright/test";

const baseURL = process.env.VISUAL_REVIEW_URL ?? "http://127.0.0.1:3000";
const labPreview = process.env.VISUAL_LAB_QA === "1";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // Dev-lab QA must pass on the first attempt; do not hide hydration races with retries.
  retries: labPreview ? 0 : process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", {
    outputFolder: labPreview ? "playwright-report/visual-lab" : "playwright-report/public",
    open: "never"
  }]],
  outputDir: labPreview ? "test-results/visual-lab" : "test-results/visual",
  use: {
    baseURL,
    browserName: "chromium",
    channel: "chrome",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    reducedMotion: "reduce"
  },
  projects: [
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
    { name: "desktop-1024", use: { viewport: { width: 1024, height: 768 } } },
    { name: "desktop-short", use: { viewport: { width: 1760, height: 824 } } },
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
    { name: "mobile-360", use: { viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } }
  ],
  webServer: {
    command: process.env.CI ? "pnpm start" : "pnpm dev",
    url: baseURL,
    reuseExistingServer: true, // CI's earlier CDP capture leaves the same Next server listening on :3000
    timeout: 120_000,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }
  }
});
