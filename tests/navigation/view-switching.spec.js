/**
 * Navigation & View Switching Tests
 * Tests tab navigation, view visibility, and profile warning banner
 */

const { test, expect } = require('@playwright/test');
const { NAV, waitForAppLoad, fillProfile, submitProfile } = require('../helpers/test-data');

test.describe('Navigation & View Switching', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('should load the application with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('NutriMom - Pregnancy Nutrition Calculator');
    await expect(page.locator('h1')).toContainText('NutriMom');
  });

  test('should display Calculator and Food Tracker tabs', async ({ page }) => {
    await expect(page.locator(NAV.calculatorTab)).toBeVisible();
    await expect(page.locator(NAV.trackerTab)).toBeVisible();
  });

  test('should have Calculator tab active by default', async ({ page }) => {
    await expect(page.locator(NAV.calculatorTab)).toHaveClass(/active/);
    await expect(page.locator('#calculator-view')).toHaveClass(/active/);
    await expect(page.locator('#tracker-view')).not.toHaveClass(/active/);
  });

  test('should switch to Food Tracker view when tab is clicked', async ({ page }) => {
    await page.click(NAV.trackerTab);
    await page.waitForTimeout(300);

    await expect(page.locator(NAV.trackerTab)).toHaveClass(/active/);
    await expect(page.locator('#tracker-view')).toHaveClass(/active/);
    await expect(page.locator('#calculator-view')).not.toHaveClass(/active/);
  });

  test('should switch back to Calculator from Food Tracker', async ({ page }) => {
    await page.click(NAV.trackerTab);
    await page.waitForTimeout(300);

    await page.click(NAV.calculatorTab);
    await page.waitForTimeout(300);

    await expect(page.locator(NAV.calculatorTab)).toHaveClass(/active/);
    await expect(page.locator('#calculator-view')).toHaveClass(/active/);
  });

  test('should navigate to Calculator when logo is clicked', async ({ page }) => {
    await page.click(NAV.trackerTab);
    await page.waitForTimeout(300);

    await page.click(NAV.logo);
    await page.waitForTimeout(300);

    await expect(page.locator('#calculator-view')).toHaveClass(/active/);
  });

  test('should show profile warning banner in tracker without profile', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('nutrimom_user_profile'));
    await page.click(NAV.trackerTab);
    await page.waitForTimeout(300);

    const banner = page.locator('#profile-warning-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Complete Your Profile First');
  });

  test('should hide profile warning banner when profile exists', async ({ page }) => {
    await fillProfile(page);
    await submitProfile(page);

    await page.click(NAV.trackerTab);
    await page.waitForTimeout(300);

    await expect(page.locator('#profile-warning-banner')).toBeHidden();
  });

  test('should navigate to tracker via CTA button in results', async ({ page }) => {
    await fillProfile(page);
    await submitProfile(page);

    const ctaButton = page.locator('.tracker-cta-card .nav-tab[data-target="tracker-view"]');
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    await page.waitForTimeout(300);

    await expect(page.locator('#tracker-view')).toHaveClass(/active/);
  });

  test('should navigate to calculator via warning banner button', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('nutrimom_user_profile'));
    await page.click(NAV.trackerTab);
    await page.waitForTimeout(300);

    const warningBtn = page.locator('#profile-warning-banner .nav-tab[data-target="calculator-view"]');
    await warningBtn.click();
    await page.waitForTimeout(300);

    await expect(page.locator('#calculator-view')).toHaveClass(/active/);
  });
});
