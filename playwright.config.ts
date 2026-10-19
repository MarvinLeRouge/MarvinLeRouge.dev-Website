import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
// Set to test a running server instead (e.g. the production image, which applies the real CSP).
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: externalBaseUrl ?? `http://localhost:${PORT}`,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Serves the already built dist/: run `npm run build:e2e` first (it adds the test sheet).
  webServer: externalBaseUrl
    ? undefined
    : {
        // --ignore-lock: run in the foreground even if a background preview server is up.
        command: `npm run preview -- --port ${PORT} --ignore-lock`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
      },
});
