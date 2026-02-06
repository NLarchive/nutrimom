/**
 * Food Tracker - UI Components Tests
 * Tests that the Food Tracker always renders all UI components regardless of API status
 */

const { test, expect } = require('@playwright/test');
const { NAV, waitForAppLoad, navigateToTracker } = require('../helpers/test-data');

test.describe('Food Tracker UI Components', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    await navigateToTracker(page);
  });

  test('should render Food Tracker header', async ({ page }) => {
    await expect(page.locator('.tracker-header h2')).toContainText('Daily Food Tracker');
    await expect(page.locator('.tracker-subtitle')).toContainText('Track your meals and monitor nutrient intake');
  });

  test('should render upload area with instructions', async ({ page }) => {
    await expect(page.locator('#ft-upload-area')).toBeVisible();
    await expect(page.locator('.upload-icon')).toContainText('📷');
    await expect(page.locator('#ft-upload-area')).toContainText('Drop food image here');
  });

  test('should render camera and browse buttons', async ({ page }) => {
    await expect(page.locator('#ft-camera-btn')).toBeVisible();
    await expect(page.locator('#ft-browse-btn')).toBeVisible();
    await expect(page.locator('#ft-camera-btn')).toContainText('Take Photo');
    await expect(page.locator('#ft-browse-btn')).toContainText('Browse Files');
  });

  test('should render photo title input', async ({ page }) => {
    await expect(page.locator('#ft-title-section')).toBeVisible();
    await expect(page.locator('#ft-photo-title')).toBeVisible();
    await expect(page.locator('#ft-title-section label')).toContainText('Photo Title');
  });

  test('should render meal type selector with all options', async ({ page }) => {
    await expect(page.locator('#ft-meal-selector')).toBeVisible();
    await expect(page.locator('.meal-option[data-meal="breakfast"]')).toBeVisible();
    await expect(page.locator('.meal-option[data-meal="lunch"]')).toBeVisible();
    await expect(page.locator('.meal-option[data-meal="dinner"]')).toBeVisible();
    await expect(page.locator('.meal-option[data-meal="snack"]')).toBeVisible();
    // Snack is active by default
    await expect(page.locator('.meal-option[data-meal="snack"]')).toHaveClass(/active/);
  });

  test('should render manual LLM section with prompt and response areas', async ({ page }) => {
    await expect(page.locator('#ft-manual-section')).toBeVisible();
    await expect(page.locator('#ft-manual-section h3')).toContainText('Your Dedicated AI Nutritionist');
    await expect(page.locator('.section-description')).toContainText('Copy the prompt below');

    // Prompt generator
    await expect(page.locator('#ft-prompt-output')).toBeVisible();
    await expect(page.locator('#ft-copy-prompt')).toBeVisible();
    await expect(page.locator('#ft-copy-prompt')).toContainText('Copy Prompt');

    // Response parser
    await expect(page.locator('#ft-llm-response')).toBeVisible();
    await expect(page.locator('#ft-parse-response')).toBeVisible();
    await expect(page.locator('#ft-parse-response')).toContainText('Parse & Calculate');
  });

  test('should render daily summary section', async ({ page }) => {
    await expect(page.locator('#ft-daily-summary')).toBeVisible();
    await expect(page.locator('#ft-daily-summary h3')).toContainText("Today's Intake");
    await expect(page.locator('.empty-state')).toContainText('No meals logged today');
  });

  test('should render meals log section', async ({ page }) => {
    await expect(page.locator('#ft-meals-log')).toBeVisible();
    await expect(page.locator('#ft-meals-log h3')).toContainText('Logged Meals');
  });

  test('should populate AI prompt textarea with analysis template', async ({ page }) => {
    const promptText = await page.locator('#ft-prompt-output').inputValue();
    expect(promptText).toContain('FOOD IMAGE NUTRITIONAL ANALYSIS REQUEST');
    expect(promptText).toContain('USER PROFILE');
    expect(promptText).toContain('OUTPUT FORMAT');
  });

  test('should update prompt when photo title changes', async ({ page }) => {
    const initialPrompt = await page.locator('#ft-prompt-output').inputValue();

    await page.fill('#ft-photo-title', 'Spanish Paella with Seafood');
    await page.waitForTimeout(200);

    const updatedPrompt = await page.locator('#ft-prompt-output').inputValue();
    expect(updatedPrompt).toContain('Spanish Paella with Seafood');
    expect(updatedPrompt).not.toEqual(initialPrompt);
  });
});
