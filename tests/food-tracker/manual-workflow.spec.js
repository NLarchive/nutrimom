/**
 * Food Tracker - Manual Workflow Tests
 * Tests copy prompt, parse JSON response, meal type selection, and error handling
 */

const { test, expect } = require('@playwright/test');
const { VALID_MEAL_CHICKEN, waitForAppLoad, navigateToTracker, fillProfile, fillPregnantProfile, submitProfile } = require('../helpers/test-data');

test.describe('Food Tracker Manual Workflow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    await navigateToTracker(page);
  });

  test('should allow meal type selection', async ({ page }) => {
    await page.click('.meal-option[data-meal="breakfast"]');
    await expect(page.locator('.meal-option[data-meal="breakfast"]')).toHaveClass(/active/);
    await expect(page.locator('.meal-option[data-meal="snack"]')).not.toHaveClass(/active/);

    await page.click('.meal-option[data-meal="lunch"]');
    await expect(page.locator('.meal-option[data-meal="lunch"]')).toHaveClass(/active/);
    await expect(page.locator('.meal-option[data-meal="breakfast"]')).not.toHaveClass(/active/);
  });

  test('should copy prompt to clipboard', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);

    await page.click('#ft-copy-prompt');

    await expect(page.locator('#ft-copy-feedback')).toContainText('Copied');

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('FOOD IMAGE NUTRITIONAL ANALYSIS REQUEST');
  });

  test('should validate and parse valid JSON response', async ({ page }) => {
    await page.fill('#ft-llm-response', JSON.stringify(VALID_MEAL_CHICKEN));
    await page.click('#ft-parse-response');

    await expect(page.locator('#ft-results')).toBeVisible();
    await expect(page.locator('.results-content')).toContainText('Grilled Chicken Breast');
    await expect(page.locator('.results-content')).toContainText('231 kcal');
  });

  test('should show error for invalid JSON', async ({ page }) => {
    await page.fill('#ft-llm-response', 'not a valid json string');
    await page.click('#ft-parse-response');

    await expect(page.locator('#ft-parse-error')).toBeVisible();
    await expect(page.locator('#ft-parse-error')).toContainText('Invalid JSON format');
  });

  test('should show error for empty response', async ({ page }) => {
    await page.click('#ft-parse-response');

    await expect(page.locator('#ft-parse-error')).toBeVisible();
    await expect(page.locator('#ft-parse-error')).toContainText('Please paste the AI response');
  });

  test('should show error for incomplete schema', async ({ page }) => {
    const incompleteResponse = JSON.stringify({
      analysis_id: 'test_123',
      confidence_overall: 0.9
      // Missing required fields: food_items, totals
    });

    await page.fill('#ft-llm-response', incompleteResponse);
    await page.click('#ft-parse-response');

    await expect(page.locator('#ft-parse-error')).toBeVisible();
    await expect(page.locator('#ft-parse-error')).toContainText('Schema validation failed');
  });

  test('should include user context in prompt after profile is set', async ({ page }) => {
    // Go to calculator first
    await page.click('nav.main-nav button[data-target="calculator-view"]');
    await page.waitForTimeout(300);

    // Fill pregnant profile
    await fillPregnantProfile(page, '28');
    await submitProfile(page);

    // Go to Food Tracker
    await page.click('nav.main-nav button[data-target="tracker-view"]');
    await page.waitForTimeout(500);

    const promptText = await page.locator('#ft-prompt-output').inputValue();
    expect(promptText).toContain('PREGNANT woman (28 weeks)');
    expect(promptText).toContain('28 years old');
    expect(promptText).toContain('65kg');
  });

  test('should discard analysis results', async ({ page }) => {
    await page.fill('#ft-llm-response', JSON.stringify(VALID_MEAL_CHICKEN));
    await page.click('#ft-parse-response');
    await page.waitForSelector('#ft-results', { state: 'visible' });

    await page.click('#ft-discard');
    await page.waitForTimeout(300);

    await expect(page.locator('#ft-results')).toBeHidden();
  });
});
