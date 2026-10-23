import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests of the static export (`npm run build:e2e` first), with the
 * API answered from fixtures (e2e/support.ts): no API, network or clock of
 * the day is involved. Run in the Playwright Docker image (see README).
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Locally, half of every core (16 here) is more browsers than the static
  // server and the machine keep up with: pages stall on their font loads.
  workers: process.env.CI ? undefined : 4,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: "node e2e/serve.mjs",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: !process.env.CI,
  },
});
