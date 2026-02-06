/**
 * Food Tracker - API Status Tests
 * Tests the no-API warning banner, API status detection, and error handling
 */

const { test, expect } = require('@playwright/test');
const { waitForAppLoad, navigateToTracker } = require('../helpers/test-data');

test.describe('Food Tracker API Status', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    await navigateToTracker(page);
  });

  test('should show no-API banner when no API is configured', async ({ page }) => {
    const banner = page.locator('.api-status-banner.api-not-connected');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Personal AI Tracker Mode');
  });

  test('should display manual workflow guidance in no-API banner', async ({ page }) => {
    const banner = page.locator('.api-status-banner.api-not-connected');
    await expect(banner).toContainText('dedicated pregnancy nutrition assistant');
    await expect(banner).toContainText('ChatGPT');
    await expect(banner).toContainText('Gemini');
    await expect(banner).toContainText('Claude');
  });

  test('should display step-by-step instructions in no-API banner', async ({ page }) => {
    const banner = page.locator('.api-status-banner.api-not-connected');
    await expect(banner.locator('ol')).toBeVisible();
    await expect(banner.locator('ol li')).toHaveCount(4);
  });

  test('should NOT show connected banner when no API is configured', async ({ page }) => {
    const connectedBanner = page.locator('.api-status-banner.api-connected');
    await expect(connectedBanner).toHaveCount(0);
  });

  test('should still show all Food Tracker components despite no API', async ({ page }) => {
    // Open dropdowns if they are closed to verify internal components
    for (const selector of ['details.manual-workflow', 'details.auto-workflow']) {
      const details = page.locator(selector);
      const isOpen = await details.evaluate(el => el.open);
      if (!isOpen) {
        await details.locator('summary').click();
      }
    }

    // All core components should be visible when dropdowns are open
    await expect(page.locator('#ft-upload-area')).toBeVisible();
    await expect(page.locator('#ft-camera-btn')).toBeVisible();
    await expect(page.locator('#ft-browse-btn')).toBeVisible();
    await expect(page.locator('#ft-meal-selector')).toBeVisible();
    await expect(page.locator('#ft-manual-section')).toBeVisible();
    await expect(page.locator('#ft-prompt-output')).toBeVisible();
    await expect(page.locator('#ft-llm-response')).toBeVisible();
    await expect(page.locator('#ft-daily-summary')).toBeVisible();
    await expect(page.locator('#ft-meals-log')).toBeVisible();
  });

  test('should not have any console errors on initialization', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.reload();
    await waitForAppLoad(page);

    const criticalErrors = errors.filter(err =>
      err.includes('Failed to initialize Food Tracker') ||
      err.includes('MockFoodResponses') ||
      err.includes('is not defined')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('should log successful initialization', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.reload();
    await waitForAppLoad(page);

    expect(logs.some(log => log.includes('Food Tracker Plugin initialized successfully'))).toBeTruthy();
  });
});
