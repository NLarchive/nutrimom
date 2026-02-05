/**
 * Food Tracker - Meal Log & Data Persistence Tests
 * Tests adding/removing meals, daily summary, localStorage persistence
 */

const { test, expect } = require('@playwright/test');
const { VALID_MEAL_CHICKEN, VALID_MEAL_PASTA, VALID_MEAL_AVOCADO, waitForAppLoad, navigateToTracker, fillProfile, submitProfile, addMealViaManualWorkflow } = require('../helpers/test-data');

test.describe('Food Tracker Meal Log', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
    // Clear food log for clean state
    await page.evaluate(() => localStorage.removeItem('nutrimom_food_log'));
    // Accept any confirm dialogs (profile incomplete warning)
    page.on('dialog', dialog => dialog.accept());
    await navigateToTracker(page);
  });

  test('should add parsed meal to daily log', async ({ page }) => {
    await addMealViaManualWorkflow(page, VALID_MEAL_PASTA);

    await page.click('#ft-add-to-log');
    await page.waitForTimeout(500);

    // Daily summary should update
    await expect(page.locator('.empty-state')).toHaveCount(0);
    await expect(page.locator('#ft-summary-content')).toContainText('520');

    // Should appear in meals list
    await expect(page.locator('#ft-meals-list')).toContainText('Spaghetti Carbonara');
  });

  test('should add multiple meals and update totals', async ({ page }) => {
    // Add first meal
    await addMealViaManualWorkflow(page, VALID_MEAL_CHICKEN);
    await page.click('#ft-add-to-log');
    await page.waitForTimeout(300);

    // Add second meal
    await addMealViaManualWorkflow(page, VALID_MEAL_AVOCADO);
    await page.click('#ft-add-to-log');
    await page.waitForTimeout(300);

    // Both meals should appear
    await expect(page.locator('#ft-meals-list')).toContainText('Grilled Chicken Breast');
    await expect(page.locator('#ft-meals-list')).toContainText('Avocado Toast');
  });

  test('should remove a meal from the log', async ({ page }) => {
    await addMealViaManualWorkflow(page, VALID_MEAL_CHICKEN);
    await page.click('#ft-add-to-log');
    await page.waitForTimeout(300);

    await expect(page.locator('#ft-meals-list')).toContainText('Grilled Chicken Breast');

    // Click remove button
    await page.click('.remove-meal');
    await page.waitForTimeout(300);

    // Should show empty state
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('should persist food log in localStorage', async ({ page }) => {
    await addMealViaManualWorkflow(page, VALID_MEAL_AVOCADO);
    await page.click('#ft-add-to-log');
    await page.waitForTimeout(500);

    const foodLog = await page.evaluate(() => localStorage.getItem('nutrimom_food_log'));
    expect(foodLog).toBeTruthy();

    const parsed = JSON.parse(foodLog);
    const today = new Date().toISOString().split('T')[0];
    expect(parsed[today]).toBeTruthy();
    expect(parsed[today].meals).toHaveLength(1);
    expect(parsed[today].meals[0].food_items[0].name).toBe('Avocado Toast');
  });

  test('should load persisted food log on page refresh', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await page.evaluate((date) => {
      const foodLog = {};
      foodLog[date] = {
        date: date,
        meals: [{
          id: 'test_meal_persist',
          timestamp: new Date().toISOString(),
          meal_type: 'lunch',
          food_items: [{
            name: 'Greek Salad',
            quantity: 1,
            unit: 'serving',
            estimated_weight_g: 220,
            nutrients: { energy_kcal: 180, protein_g: 6, carbs_g: 12, fat_g: 13 }
          }],
          totals: { energy_kcal: 180, protein_g: 6, carbs_g: 12, fat_g: 13 }
        }],
        dailyTotals: { energy_kcal: 180, protein_g: 6, carbs_g: 12, fat_g: 13, fiber_g: 0, sodium_mg: 0 }
      };
      localStorage.setItem('nutrimom_food_log', JSON.stringify(foodLog));
    }, today);

    await page.reload();
    await waitForAppLoad(page);
    await navigateToTracker(page);

    await expect(page.locator('#ft-meals-list')).toContainText('Greek Salad');
    await expect(page.locator('#ft-summary-content')).toContainText('180');
  });

  test('should show empty state with no meals logged', async ({ page }) => {
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state')).toContainText('No meals logged today');
  });

  test('should handle malformed localStorage data gracefully', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('nutrimom_food_log', 'invalid json'));

    await page.reload();
    await waitForAppLoad(page);
    await navigateToTracker(page);

    // Should gracefully fall back to empty state
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('should show nutrient comparison when profile targets exist', async ({ page }) => {
    // Go to calculator and fill profile
    await page.click('nav.main-nav button[data-target="calculator-view"]');
    await page.waitForTimeout(300);
    await fillProfile(page);
    await submitProfile(page);

    // Go to food tracker and add a meal
    await page.click('nav.main-nav button[data-target="tracker-view"]');
    await page.waitForTimeout(500);

    await addMealViaManualWorkflow(page, VALID_MEAL_CHICKEN);
    await page.click('#ft-add-to-log');
    await page.waitForTimeout(500);

    // Nutrient comparison section should be visible after adding meal with profile
    await expect(page.locator('#ft-comparison')).toBeVisible();
  });
});
