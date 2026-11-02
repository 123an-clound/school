import { defineConfig } from "@playwright/test";

// Tests read Supabase keys and the demo admin login from .env.local, like `next start` does.
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  testDir: "e2e",
  workers: 1, // admin specs change shared demo data in order
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome", // the installed Chrome; no browser download
    locale: "vi-VN",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }, testMatch: /public\.spec/ },
  ],
  webServer: { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 },
});
