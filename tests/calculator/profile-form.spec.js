/**
 * Calculator - Profile Form Tests
 * Tests form interactions, pregnancy/lactation fields, validation
 */

const { test, expect } = require('@playwright/test');
const { waitForAppLoad } = require('../helpers/test-data');

test.describe('Profile Form', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('should display all form fields', async ({ page }) => {
    await expect(page.locator('#age')).toBeVisible();
    await expect(page.locator('#sex')).toBeVisible();
    await expect(page.locator('#weight')).toBeVisible();
    await expect(page.locator('#height')).toBeVisible();
    await expect(page.locator('#activity')).toBeVisible();
  });

  test('should hide results section initially', async ({ page }) => {
    await expect(page.locator('#results-section')).toBeHidden();
  });

  test('should hide pregnancy section by default (no age entered)', async ({ page }) => {
    // Until a valid female age 14-50 is entered, pregnancy section stays hidden
    const section = page.locator('#pregnancy-section');
    await expect(section).toBeHidden();
  });

  test('should show pregnancy section for female age 14-50', async ({ page }) => {
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '28');
    const section = page.locator('#pregnancy-section');
    await expect(section).toBeVisible();
  });

  test('should hide pregnancy section for male', async ({ page }) => {
    await page.selectOption('#sex', 'male');
    await page.fill('#age', '28');
    const section = page.locator('#pregnancy-section');
    await expect(section).toBeHidden();
  });

  test('should show pregnancy fields when pregnant status is selected', async ({ page }) => {
    // First make pregnancy section visible
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '28');
    await expect(page.locator('#pregnancy-section')).toBeVisible();

    await page.locator('.toggle-option:has(input[value="pregnant"])').click({ force: true });
    await page.waitForSelector('#pregnancy-fields', { state: 'visible' });

    await expect(page.locator('#pregnancy-week')).toBeVisible();
  });

  test('should show lactation fields when breastfeeding is selected', async ({ page }) => {
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '28');
    await expect(page.locator('#pregnancy-section')).toBeVisible();

    await page.locator('.toggle-option:has(input[value="lactating"])').click();
    await expect(page.locator('#lactation-fields')).toBeVisible();
    await expect(page.locator('#lactation-months')).toBeVisible();
  });

  test('should show trimester 1 for weeks 1-13', async ({ page }) => {
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '28');
    await expect(page.locator('#pregnancy-section')).toBeVisible();
    await page.locator('.toggle-option:has(input[value="pregnant"])').click();
    await page.fill('#pregnancy-week', '10');
    await expect(page.locator('#trimester-display')).toContainText('Trimester 1');
  });

  test('should show trimester 2 for weeks 14-27', async ({ page }) => {
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '28');
    await expect(page.locator('#pregnancy-section')).toBeVisible();
    await page.locator('.toggle-option:has(input[value="pregnant"])').click();
    await page.fill('#pregnancy-week', '24');
    await expect(page.locator('#trimester-display')).toContainText('Trimester 2');
  });

  test('should show trimester 3 for weeks 28+', async ({ page }) => {
    await page.selectOption('#sex', 'female');
    await page.fill('#age', '28');
    await expect(page.locator('#pregnancy-section')).toBeVisible();
    await page.locator('.toggle-option:has(input[value="pregnant"])').click();
    await page.fill('#pregnancy-week', '35');
    await expect(page.locator('#trimester-display')).toContainText('Trimester 3');
  });

  test('should not crash with empty form submission', async ({ page }) => {
    await page.click('button[type="submit"]');
    // HTML5 validation should prevent submission
    await expect(page.locator('#results-section')).toBeHidden();
  });
});
