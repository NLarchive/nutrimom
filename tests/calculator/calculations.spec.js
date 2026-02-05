/**
 * Calculator - Nutrition Calculations Tests
 * Tests BMR, TDEE, energy display, pregnancy-specific results, age bands, activity levels
 */

const { test, expect } = require('@playwright/test');
const { waitForAppLoad, fillProfile, fillPregnantProfile, submitProfile } = require('../helpers/test-data');

test.describe('Nutrition Calculations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  // ── Non-Pregnant Female ──────────────────────────────────────────────────

  test.describe('Non-Pregnant Female', () => {

    test('should calculate and display results', async ({ page }) => {
      await fillProfile(page);
      await submitProfile(page);

      await expect(page.locator('#profile-stage-label')).toContainText('Non-Pregnant Female');
    });

    test('should display correct BMI for 65kg, 165cm', async ({ page }) => {
      await fillProfile(page, { activity: 'sedentary' });
      await submitProfile(page);

      // BMI = 65 / (1.65^2) ≈ 23.9
      await expect(page.locator('.bmi-value')).toContainText('23.9');
    });

    test('should display energy calculations', async ({ page }) => {
      await fillProfile(page);
      await submitProfile(page);

      await expect(page.locator('#bmr-value')).not.toContainText('--');
      await expect(page.locator('#tdee-value')).not.toContainText('--');
      await expect(page.locator('#total-energy-value')).not.toContainText('--');
    });

    test('should not show pregnancy increment for non-pregnant', async ({ page }) => {
      await fillProfile(page, { activity: 'sedentary' });
      await submitProfile(page);

      await expect(page.locator('#pregnancy-increment-stat')).toBeHidden();
    });
  });

  // ── Pregnant Female ──────────────────────────────────────────────────────

  test.describe('Pregnant Female', () => {

    test('should show second trimester label for T2', async ({ page }) => {
      await fillPregnantProfile(page, '24');
      await submitProfile(page);

      await expect(page.locator('#profile-stage-label')).toContainText('Pregnant - Second Trimester');
    });

    test('should show +340 kcal increment for T2', async ({ page }) => {
      await fillPregnantProfile(page, '24');
      await submitProfile(page);

      await expect(page.locator('#pregnancy-increment-stat')).toBeVisible();
      await expect(page.locator('#increment-value')).toContainText('+340');
    });

    test('should show +452 kcal increment for T3', async ({ page }) => {
      await fillPregnantProfile(page, '35');
      await submitProfile(page);

      await expect(page.locator('#increment-value')).toContainText('+452');
    });

    test('should show pregnancy comparison section', async ({ page }) => {
      await fillPregnantProfile(page, '24');
      await submitProfile(page);

      await expect(page.locator('#comparison-block')).toBeVisible();
      await expect(page.locator('#comparison-content')).toBeVisible();
    });

    test('should show critical nutrients (Folate, Iron)', async ({ page }) => {
      await fillPregnantProfile(page, '24');
      await submitProfile(page);

      await expect(page.locator('#critical-nutrients-card')).toBeVisible();
      await expect(page.locator('#critical-nutrients')).toContainText('Folate');
      await expect(page.locator('#critical-nutrients')).toContainText('Iron');
    });

    test('should display weight gain card when pre-pregnancy weight is provided', async ({ page }) => {
      await fillProfile(page, { weight: '68' });
      await page.waitForSelector('#pregnancy-section', { state: 'visible' });
      await page.locator('.toggle-option:has(input[value="pregnant"])').click();
      await page.waitForSelector('#pregnancy-fields', { state: 'visible' });
      await page.fill('#pregnancy-week', '24');
      await page.fill('#pre-pregnancy-weight', '62');
      await submitProfile(page);

      await expect(page.locator('#weight-gain-card')).toBeVisible();
      await expect(page.locator('#weight-recommendation')).toContainText('kg');
    });
  });

  // ── Age Bands ────────────────────────────────────────────────────────────

  test.describe('Age Bands', () => {

    test('should classify 16-year-old as 14-18 age band', async ({ page }) => {
      await fillProfile(page, { age: '16', weight: '55', height: '160', activity: 'sedentary' });
      await submitProfile(page);
      await expect(page.locator('#profile-subtitle')).toContainText('14-18 years');
    });

    test('should classify 25-year-old as 19-30 age band', async ({ page }) => {
      await fillProfile(page, { age: '25', weight: '60', activity: 'sedentary' });
      await submitProfile(page);
      await expect(page.locator('#profile-subtitle')).toContainText('19-30 years');
    });

    test('should classify 40-year-old as 31-50 age band', async ({ page }) => {
      await fillProfile(page, { age: '40', weight: '65', height: '168', activity: 'sedentary' });
      await submitProfile(page);
      await expect(page.locator('#profile-subtitle')).toContainText('31-50 years');
    });
  });

  // ── Activity Levels ──────────────────────────────────────────────────────

  test.describe('Activity Levels', () => {

    test('should show higher TDEE for more active users', async ({ page }) => {
      // Sedentary
      await fillProfile(page, { activity: 'sedentary' });
      await submitProfile(page);
      const sedentaryTDEE = await page.locator('#tdee-value').textContent();

      // Very active
      await page.selectOption('#activity', 'very_active');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(200);
      const activeTDEE = await page.locator('#tdee-value').textContent();

      expect(parseInt(activeTDEE.replace(/,/g, ''))).toBeGreaterThan(
        parseInt(sedentaryTDEE.replace(/,/g, ''))
      );
    });
  });
});
