// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * NutriMom Playwright Configuration
 * 
 * Supports two modes via BASE_URL env:
 *   Local:  npx playwright test                              → http://localhost:8080
 *   Live:   BASE_URL=https://user.github.io/nutrimom npx playwright test
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
const baseURL = process.env.BASE_URL || 'http://localhost:8080';
const isLocal = baseURL.includes('localhost');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : [['html', { open: 'never' }]],
  
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Only start local server when testing locally */
  ...(isLocal ? {
    webServer: {
      command: 'npx http-server . -p 8080 -c-1',
      url: 'http://localhost:8080',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  } : {}),
});
