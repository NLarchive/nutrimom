const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8080';

test.describe('NutriMom Basic Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for data to load and app to initialize
    await page.waitForFunction(() => {
      return document.querySelector('#profile-form') !== null &&
             document.querySelector('#tracker-view') !== null;
    }, { timeout: 10000 });
  });

  test('should load the application successfully', async ({ page }) => {
    await expect(page).toHaveTitle('NutriMom - Pregnancy Nutrition Calculator');
    await expect(page.locator('h1')).toContainText('NutriMom');
  });

  test('should have both Calculator and Food Tracker tabs', async ({ page }) => {
    // Use more specific selectors to avoid ambiguity
    await expect(page.locator('nav button:has-text("Calculator")')).toBeVisible();
    await expect(page.locator('nav button:has-text("Food Tracker")')).toBeVisible();
  });

  test('should switch to Food Tracker and show UI components', async ({ page }) => {
    // Switch to Food Tracker using the specific navigation button
    await page.click('nav button:has-text("Food Tracker")');
    
    // Wait a moment for the view switching animation
    await page.waitForTimeout(500);
    
    // Check if Food Tracker view is visible  
    const trackerView = page.locator('#tracker-view');
    await expect(trackerView).toBeVisible();
    
    // Check core UI elements are present
    await expect(page.locator('h2:has-text("Daily Food Tracker")')).toBeVisible();
    await expect(page.locator('#ft-upload-area')).toBeVisible();
    await expect(page.locator('#ft-camera-btn')).toBeVisible();
    await expect(page.locator('#ft-browse-btn')).toBeVisible();
  });

  test('should show profile warning when not configured', async ({ page }) => {
    await page.click('nav button:has-text("Food Tracker")');
    
    // Wait for view switching
    await page.waitForTimeout(500);
    
    const warningBanner = page.locator('#profile-warning-banner');
    await expect(warningBanner).toBeVisible();
    await expect(warningBanner.locator('strong')).toHaveText('Complete Your Profile First');
  });

  test('should display meal type selector', async ({ page }) => {
    await page.click('nav button:has-text("Food Tracker")');
    
    // Wait for view switching
    await page.waitForTimeout(500);
    
    await expect(page.locator('.meal-option[data-meal="breakfast"]')).toBeVisible();
    await expect(page.locator('.meal-option[data-meal="lunch"]')).toBeVisible();
    await expect(page.locator('.meal-option[data-meal="dinner"]')).toBeVisible();
    await expect(page.locator('.meal-option[data-meal="snack"]')).toBeVisible();
  });

  test('should display manual LLM section', async ({ page }) => {
    await page.click('nav button:has-text("Food Tracker")');
    
    // Wait for view switching
    await page.waitForTimeout(500);
    
    await expect(page.locator('#ft-manual-section')).toBeVisible();
    await expect(page.locator('#ft-prompt-output')).toBeVisible();
    await expect(page.locator('#ft-copy-prompt')).toBeVisible();
    await expect(page.locator('#ft-llm-response')).toBeVisible();
    await expect(page.locator('#ft-parse-response')).toBeVisible();
  });
});