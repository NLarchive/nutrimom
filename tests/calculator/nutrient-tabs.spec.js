/**
 * Calculator - Nutrient Tabs Tests
 * Tests nutrient category tab switching and grid content
 */

const { test, expect } = require('@playwright/test');
const { waitForAppLoad, fillProfile, submitProfile } = require('../helpers/test-data');

test.describe('Nutrient Tabs', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    await fillProfile(page);
    await submitProfile(page);
  });

  test('should display macros tab by default', async ({ page }) => {
    await expect(page.locator('.nutrient-tab[data-category="macro"]')).toHaveClass(/active/);
  });

  test('should switch to vitamins tab', async ({ page }) => {
    await page.click('.nutrient-tab[data-category="vitamin"]');
    await expect(page.locator('.nutrient-tab[data-category="vitamin"]')).toHaveClass(/active/);
    await expect(page.locator('.nutrient-tab[data-category="macro"]')).not.toHaveClass(/active/);
  });

  test('should switch to minerals tab', async ({ page }) => {
    await page.click('.nutrient-tab[data-category="mineral"]');
    await expect(page.locator('.nutrient-tab[data-category="mineral"]')).toHaveClass(/active/);
  });

  test('should switch to fatty acids tab', async ({ page }) => {
    await page.click('.nutrient-tab[data-category="fatty_acid"]');
    await expect(page.locator('.nutrient-tab[data-category="fatty_acid"]')).toHaveClass(/active/);
  });

  test('should update nutrient grid content when switching tabs', async ({ page }) => {
    const macroContent = await page.locator('#nutrient-grid').textContent();
    await page.click('.nutrient-tab[data-category="vitamin"]');
    const vitaminContent = await page.locator('#nutrient-grid').textContent();
    expect(macroContent).not.toEqual(vitaminContent);
  });
});
