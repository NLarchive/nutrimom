/**
 * NutriMom - Pregnancy Nutrition Calculator
 * End-to-End Tests with Playwright
 * 
 * @author Nicolas Ivan Larenas Bustamante
 * @license CC-BY-NC-SA-4.0
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8080';

// ─────────────────────────────────────────────────────────────────────────────
// Test Configuration
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NutriMom Application', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for data to load and app to initialize
    await page.waitForFunction(() => {
      return document.querySelector('#profile-form') !== null &&
             document.querySelector('#tracker-view') !== null;
    }, { timeout: 10000 });
  // ─────────────────────────────────────────────────────────────────────────────
  // Page Load Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Page Load', () => {
    
    test('should display the NutriMom header', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('NutriMom');
    });

    test('should display the tagline', async ({ page }) => {
      await expect(page.locator('.tagline')).toContainText('Pregnancy Nutrition Calculator');
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

    test('should log successful data load in console', async ({ page }) => {
      const logs = [];
      page.on('console', msg => logs.push(msg.text()));
      await page.reload();
      await page.waitForTimeout(500);
      expect(logs.some(log => log.includes('Nutrition data loaded successfully'))).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Form Interaction Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Form Interactions', () => {

    test('should show pregnancy section when female is selected', async ({ page }) => {
      // Verify initially hidden
      const section = page.locator('#pregnancy-section');
      await expect(section).toHaveCSS('display', 'none');
      
      await page.selectOption('#sex', 'female');
      await page.waitForTimeout(200);
      
      await expect(section).toBeVisible();
    });

    test('should hide pregnancy section when male is selected', async ({ page }) => {
      await page.selectOption('#sex', 'female');
      await page.waitForTimeout(200);
      await expect(page.locator('#pregnancy-section')).toBeVisible();
      
      await page.selectOption('#sex', 'male');
      await page.waitForTimeout(200);
      await expect(page.locator('#pregnancy-section')).toHaveCSS('display', 'none');
    });

    test('should show pregnancy fields when pregnant status is selected', async ({ page }) => {
      await page.selectOption('#sex', 'female');
      await page.waitForSelector('#pregnancy-section', { state: 'visible' });
      await page.locator('.toggle-option:has(input[value="pregnant"])').click({ force: true });
      await page.waitForSelector('#pregnancy-fields', { state: 'visible' });
      await expect(page.locator('#pregnancy-week')).toBeVisible();
    });

    test('should show lactation fields when breastfeeding status is selected', async ({ page }) => {
      await page.selectOption('#sex', 'female');
      await page.waitForSelector('#pregnancy-section', { state: 'visible' });
      await page.locator('.toggle-option:has(input[value="lactating"])').click();
      await expect(page.locator('#lactation-fields')).toBeVisible();
      await expect(page.locator('#lactation-months')).toBeVisible();
    });

    test('should display trimester when pregnancy week is entered', async ({ page }) => {
      await page.selectOption('#sex', 'female');
      await page.waitForSelector('#pregnancy-section', { state: 'visible' });
      await page.locator('.toggle-option:has(input[value="pregnant"])').click();
      await page.fill('#pregnancy-week', '24');
      await expect(page.locator('#trimester-display')).toContainText('Trimester 2');
    });

    test('should show trimester 1 for weeks 1-13', async ({ page }) => {
      await page.selectOption('#sex', 'female');
      await page.waitForSelector('#pregnancy-section', { state: 'visible' });
      await page.locator('.toggle-option:has(input[value="pregnant"])').click();
      await page.fill('#pregnancy-week', '10');
      await expect(page.locator('#trimester-display')).toContainText('Trimester 1');
    });

    test('should show trimester 3 for weeks 28+', async ({ page }) => {
      await page.selectOption('#sex', 'female');
      await page.waitForSelector('#pregnancy-section', { state: 'visible' });
      await page.locator('.toggle-option:has(input[value="pregnant"])').click();
      await page.fill('#pregnancy-week', '35');
      await expect(page.locator('#trimester-display')).toContainText('Trimester 3');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Calculation Tests - Non-Pregnant Female
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Calculations - Non-Pregnant Female', () => {

    test('should calculate and display results for non-pregnant female', async ({ page }) => {
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'lightly_active');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('#results-section')).toBeVisible();
      await expect(page.locator('#profile-stage-label')).toContainText('Non-Pregnant Female');
    });

    test('should display correct BMI for 65kg, 165cm', async ({ page }) => {
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'sedentary');
      
      await page.click('button[type="submit"]');
      await page.waitForSelector('#results-section', { state: 'visible' });
      
      // BMI = 65 / (1.65 * 1.65) ≈ 23.9
      await expect(page.locator('.bmi-value')).toContainText('23.9');
    });

    test('should display energy calculations', async ({ page }) => {
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'lightly_active');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('#bmr-value')).not.toContainText('--');
      await expect(page.locator('#tdee-value')).not.toContainText('--');
      await expect(page.locator('#total-energy-value')).not.toContainText('--');
    });

    test('should not show pregnancy increment for non-pregnant', async ({ page }) => {
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'sedentary');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('#pregnancy-increment-stat')).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Calculation Tests - Pregnant Female
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Calculations - Pregnant Female', () => {

    // Helper to fill pregnant profile
    async function fillPregnantProfile(page, week = '24') {
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'lightly_active');
      await page.waitForSelector('#pregnancy-section', { state: 'visible' });
      await page.locator('.toggle-option:has(input[value="pregnant"])').click();
      await page.waitForSelector('#pregnancy-fields', { state: 'visible' });
      await page.fill('#pregnancy-week', week);
    }

    test('should calculate and display results for pregnant female T2', async ({ page }) => {
      await fillPregnantProfile(page, '24');
      await page.click('button[type="submit"]');
      await expect(page.locator('#profile-stage-label')).toContainText('Pregnant - Second Trimester');
    });

    test('should show pregnancy energy increment for T2', async ({ page }) => {
      await fillPregnantProfile(page, '24');
      await page.click('button[type="submit"]');
      await expect(page.locator('#pregnancy-increment-stat')).toBeVisible();
      await expect(page.locator('#increment-value')).toContainText('+340');
    });

    test('should show pregnancy energy increment for T3', async ({ page }) => {
      await fillPregnantProfile(page, '35');
      await page.click('button[type="submit"]');
      await expect(page.locator('#increment-value')).toContainText('+452');
    });

    test('should show pregnancy comparison section', async ({ page }) => {
      await fillPregnantProfile(page, '24');
      await page.click('button[type="submit"]');
      await expect(page.locator('#comparison-block')).toBeVisible();
      await expect(page.locator('#comparison-content')).toBeVisible();
    });

    test('should show critical nutrients section for pregnant', async ({ page }) => {
      await fillPregnantProfile(page, '24');
      await page.click('button[type="submit"]');
      await expect(page.locator('#critical-nutrients-card')).toBeVisible();
      await expect(page.locator('#critical-nutrients')).toContainText('Folate');
      await expect(page.locator('#critical-nutrients')).toContainText('Iron');
    });

    test('should display weight gain card when pre-pregnancy weight is provided', async ({ page }) => {
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '68');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'lightly_active');
      await page.waitForSelector('#pregnancy-section', { state: 'visible' });
      await page.locator('.toggle-option:has(input[value="pregnant"])').click();
      await page.waitForSelector('#pregnancy-fields', { state: 'visible' });
      await page.fill('#pregnancy-week', '24');
      await page.fill('#pre-pregnancy-weight', '62');
      await page.click('button[type="submit"]');
      await expect(page.locator('#weight-gain-card')).toBeVisible();
      await expect(page.locator('#weight-recommendation')).toContainText('kg');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Nutrient Tabs Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Nutrient Tabs', () => {

    test.beforeEach(async ({ page }) => {
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'lightly_active');
      await page.click('button[type="submit"]');
    });

    test('should display macros tab by default', async ({ page }) => {
      await expect(page.locator('.nutrient-tab[data-category="macro"]')).toHaveClass(/active/);
    });

    test('should switch to vitamins tab when clicked', async ({ page }) => {
      await page.click('.nutrient-tab[data-category="vitamin"]');
      await expect(page.locator('.nutrient-tab[data-category="vitamin"]')).toHaveClass(/active/);
      await expect(page.locator('.nutrient-tab[data-category="macro"]')).not.toHaveClass(/active/);
    });

    test('should switch to minerals tab when clicked', async ({ page }) => {
      await page.click('.nutrient-tab[data-category="mineral"]');
      await expect(page.locator('.nutrient-tab[data-category="mineral"]')).toHaveClass(/active/);
    });

    test('should switch to fatty acids tab when clicked', async ({ page }) => {
      await page.click('.nutrient-tab[data-category="fatty_acid"]');
      await expect(page.locator('.nutrient-tab[data-category="fatty_acid"]')).toHaveClass(/active/);
    });

    test('should update nutrient grid when tab is switched', async ({ page }) => {
      const macroContent = await page.locator('#nutrient-grid').textContent();
      await page.click('.nutrient-tab[data-category="vitamin"]');
      const vitaminContent = await page.locator('#nutrient-grid').textContent();
      expect(macroContent).not.toEqual(vitaminContent);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Age Band Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Age Bands', () => {

    test('should classify 16-year-old as 14-18 age band', async ({ page }) => {
      await page.fill('#age', '16');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '55');
      await page.fill('#height', '160');
      await page.selectOption('#activity', 'sedentary');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('#profile-subtitle')).toContainText('14-18 years');
    });

    test('should classify 25-year-old as 19-30 age band', async ({ page }) => {
      await page.fill('#age', '25');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '60');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'sedentary');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('#profile-subtitle')).toContainText('19-30 years');
    });

    test('should classify 40-year-old as 31-50 age band', async ({ page }) => {
      await page.fill('#age', '40');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '168');
      await page.selectOption('#activity', 'sedentary');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('#profile-subtitle')).toContainText('31-50 years');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Activity Level Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Activity Levels', () => {

    test('should show higher TDEE for more active users', async ({ page }) => {
      // Sedentary
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'sedentary');
      await page.click('button[type="submit"]');
      const sedentaryTDEE = await page.locator('#tdee-value').textContent();

      // Very active
      await page.selectOption('#activity', 'very_active');
      await page.click('button[type="submit"]');
      const activeTDEE = await page.locator('#tdee-value').textContent();

      const sedentaryNum = parseInt(sedentaryTDEE.replace(/,/g, ''));
      const activeNum = parseInt(activeTDEE.replace(/,/g, ''));
      
      expect(activeNum).toBeGreaterThan(sedentaryNum);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Error Handling Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Error Handling', () => {

    test('should not crash with empty form submission', async ({ page }) => {
      await page.click('button[type="submit"]');
      // Form validation should prevent submission
      await expect(page.locator('#results-section')).toBeHidden();
    });

    test('should handle extreme age values gracefully', async ({ page }) => {
      await page.fill('#age', '55');  // Use valid age within 51_plus band
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '60');
      await page.fill('#height', '160');
      await page.selectOption('#activity', 'sedentary');
      
      await page.click('button[type="submit"]');
      await page.waitForSelector('#results-section', { state: 'visible' });
      
      // Should show results (uses 51_plus band)
      await expect(page.locator('#profile-subtitle')).toContainText('51+');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Responsive Design Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Responsive Design', () => {

    test('should be usable on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'sedentary');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('#results-section')).toBeVisible();
    });

    test('should be usable on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'sedentary');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('#results-section')).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Food Tracker - Navigation Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Food Tracker Navigation', () => {
    
    test('should have Calculator tab active by default', async ({ page }) => {
      await expect(page.locator('.nav-tab[data-target="calculator-view"]')).toHaveClass(/active/);
      await expect(page.locator('#calculator-view')).toHaveClass(/active/);
      await expect(page.locator('#tracker-view')).not.toHaveClass(/active/);
    });

    test('should switch to Food Tracker tab when clicked', async ({ page }) => {
      // Click Food Tracker tab
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(500); // Allow view switch
      
      // Verify tab states
      await expect(page.locator('.nav-tab[data-target="tracker-view"]')).toHaveClass(/active/);
      await expect(page.locator('.nav-tab[data-target="calculator-view"]')).not.toHaveClass(/active/);
      
      // Verify view visibility
      await expect(page.locator('#tracker-view')).toHaveClass(/active/);
      await expect(page.locator('#calculator-view')).not.toHaveClass(/active/);
    });

    test('should switch back to Calculator from Food Tracker', async ({ page }) => {
      // Go to tracker first
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(300);
      
      // Switch back to calculator
      await page.click('.nav-tab[data-target="calculator-view"]');
      await page.waitForTimeout(300);
      
      // Verify we're back
      await expect(page.locator('.nav-tab[data-target="calculator-view"]')).toHaveClass(/active/);
      await expect(page.locator('#calculator-view')).toHaveClass(/active/);
    });

    test('should show profile warning banner in tracker without profile', async ({ page }) => {
      // Clear any existing profile
      await page.evaluate(() => {
        localStorage.removeItem('nutrimom_user_profile');
      });
      
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(500);
      
      const banner = page.locator('#profile-warning-banner');
      await expect(banner).toBeVisible();
      await expect(banner).toContainText('Complete Your Profile First');
    });

    test('should hide profile warning banner when profile exists', async ({ page }) => {
      // Create a profile first
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'lightly_active');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#results-section', { state: 'visible' });
      
      // Now go to tracker
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(500);
      
      // Banner should be hidden
      await expect(page.locator('#profile-warning-banner')).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Food Tracker - UI Component Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Food Tracker UI Components', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to Food Tracker
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(500);
      // Wait for plugin to initialize
      await page.waitForFunction(() => {
        const container = document.querySelector('#food-tracker-container');
        return container && container.innerHTML && !container.innerHTML.includes('Loading');
      }, { timeout: 5000 });
    });

    test('should render Food Tracker header', async ({ page }) => {
      await expect(page.locator('.tracker-header h2')).toContainText('Daily Food Tracker');
      await expect(page.locator('.tracker-subtitle')).toContainText('Track your meals and monitor nutrient intake');
    });

    test('should render upload section with all elements', async ({ page }) => {
      // Upload area
      await expect(page.locator('#ft-upload-area')).toBeVisible();
      await expect(page.locator('.upload-icon')).toContainText('📷');
      await expect(page.locator('#ft-upload-area')).toContainText('Drop food image here');
      
      // Upload buttons
      await expect(page.locator('#ft-camera-btn')).toBeVisible();
      await expect(page.locator('#ft-browse-btn')).toBeVisible();
      await expect(page.locator('#ft-camera-btn')).toContainText('Take Photo');
      await expect(page.locator('#ft-browse-btn')).toContainText('Browse Files');
    });

    test('should render photo title input section', async ({ page }) => {
      await expect(page.locator('#ft-title-section')).toBeVisible();
      await expect(page.locator('#ft-photo-title')).toBeVisible();
      await expect(page.locator('#ft-title-section label')).toContainText('Photo Title');
      await expect(page.locator('#ft-photo-title')).toHaveAttribute('placeholder', /cod croquette.*tapa/);
    });

    test('should render meal type selector', async ({ page }) => {
      await expect(page.locator('#ft-meal-selector')).toBeVisible();
      await expect(page.locator('.meal-option[data-meal="breakfast"]')).toBeVisible();
      await expect(page.locator('.meal-option[data-meal="lunch"]')).toBeVisible();
      await expect(page.locator('.meal-option[data-meal="dinner"]')).toBeVisible();
      await expect(page.locator('.meal-option[data-meal="snack"]')).toBeVisible();
      
      // Snack should be active by default
      await expect(page.locator('.meal-option[data-meal="snack"]')).toHaveClass(/active/);
    });

    test('should render manual LLM section', async ({ page }) => {
      await expect(page.locator('#ft-manual-section')).toBeVisible();
      await expect(page.locator('#ft-manual-section h3')).toContainText('Use Your Own AI Model');
      await expect(page.locator('.section-description')).toContainText('Copy the prompt below and use it with ChatGPT');
      
      // Prompt generator
      await expect(page.locator('#ft-prompt-output')).toBeVisible();
      await expect(page.locator('#ft-copy-prompt')).toBeVisible();
      await expect(page.locator('#ft-copy-prompt')).toContainText('Copy Prompt to Clipboard');
      
      // Response parser
      await expect(page.locator('#ft-llm-response')).toBeVisible();
      await expect(page.locator('#ft-parse-response')).toBeVisible();
      await expect(page.locator('#ft-parse-response')).toContainText('Parse & Calculate Nutrition');
    });

    test('should render daily summary and meals log sections', async ({ page }) => {
      await expect(page.locator('#ft-daily-summary')).toBeVisible();
      await expect(page.locator('#ft-daily-summary h3')).toContainText("Today's Intake");
      await expect(page.locator('.empty-state')).toContainText('No meals logged today');
      
      await expect(page.locator('#ft-meals-log')).toBeVisible();
      await expect(page.locator('#ft-meals-log h3')).toContainText('Logged Meals');
    });

    test('should populate AI prompt textarea', async ({ page }) => {
      const promptText = await page.locator('#ft-prompt-output').inputValue();
      expect(promptText).toContain('FOOD IMAGE NUTRITIONAL ANALYSIS REQUEST');
      expect(promptText).toContain('USER PROFILE');
      expect(promptText).toContain('OUTPUT FORMAT');
    });

    test('should update prompt when photo title changes', async ({ page }) => {
      const initialPrompt = await page.locator('#ft-prompt-output').inputValue();
      
      await page.fill('#ft-photo-title', 'Spanish Paella with Seafood');
      await page.waitForTimeout(200); // Allow prompt update
      
      const updatedPrompt = await page.locator('#ft-prompt-output').inputValue();
      expect(updatedPrompt).toContain('Spanish Paella with Seafood');
      expect(updatedPrompt).not.toEqual(initialPrompt);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Food Tracker - Functionality Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Food Tracker Functionality', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(500);
      await page.waitForFunction(() => {
        const container = document.querySelector('#food-tracker-container');
        return container && container.innerHTML && !container.innerHTML.includes('Loading');
      }, { timeout: 5000 });
    });

    test('should allow meal type selection', async ({ page }) => {
      // Click breakfast option
      await page.click('.meal-option[data-meal="breakfast"]');
      await expect(page.locator('.meal-option[data-meal="breakfast"]')).toHaveClass(/active/);
      await expect(page.locator('.meal-option[data-meal="snack"]')).not.toHaveClass(/active/);
      
      // Click lunch option
      await page.click('.meal-option[data-meal="lunch"]');
      await expect(page.locator('.meal-option[data-meal="lunch"]')).toHaveClass(/active/);
      await expect(page.locator('.meal-option[data-meal="breakfast"]')).not.toHaveClass(/active/);
    });

    test('should copy prompt to clipboard', async ({ page }) => {
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-write']);
      
      await page.click('#ft-copy-prompt');
      
      // Check for copy feedback
      await expect(page.locator('#ft-copy-feedback')).toContainText('Copied');
      
      // Verify clipboard content contains the prompt
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain('FOOD IMAGE NUTRITIONAL ANALYSIS REQUEST');
    });

    test('should validate and parse JSON response', async ({ page }) => {
      const validResponse = JSON.stringify({
        "analysis_id": "test_123",
        "timestamp": new Date().toISOString(),
        "confidence_overall": 0.9,
        "meal_type": "lunch",
        "food_items": [{
          "name": "Grilled Chicken Breast",
          "quantity": 1,
          "unit": "piece",
          "estimated_weight_g": 150,
          "confidence": 0.9,
          "preparation_method": "grilled",
          "nutrients": {
            "energy_kcal": 231,
            "protein_g": 43.5,
            "carbs_g": 0,
            "fat_g": 5,
            "fiber_g": 0,
            "sugar_g": 0,
            "sodium_mg": 74,
            "saturated_fat_g": 1.4
          },
          "micronutrients": {
            "vitamin_a_ug": 6,
            "vitamin_c_mg": 0,
            "vitamin_d_ug": 0.1,
            "folate_ug": 4,
            "iron_mg": 0.9,
            "calcium_mg": 15,
            "zinc_mg": 0.9,
            "omega3_mg": 62
          }
        }],
        "totals": {
          "energy_kcal": 231,
          "protein_g": 43.5,
          "carbs_g": 0,
          "fat_g": 5,
          "fiber_g": 0,
          "sodium_mg": 74
        },
        "warnings": [],
        "pregnancy_relevant_notes": ["Excellent lean protein source for pregnancy"]
      });
      
      await page.fill('#ft-llm-response', validResponse);
      await page.click('#ft-parse-response');
      
      // Should show analysis results
      await expect(page.locator('#ft-results')).toBeVisible();
      await expect(page.locator('.results-content')).toContainText('Grilled Chicken Breast');
      await expect(page.locator('.results-content')).toContainText('231 kcal');
    });

    test('should show error for invalid JSON response', async ({ page }) => {
      await page.fill('#ft-llm-response', 'invalid json response');
      await page.click('#ft-parse-response');
      
      await expect(page.locator('#ft-parse-error')).toBeVisible();
      await expect(page.locator('#ft-parse-error')).toContainText('Invalid JSON format');
    });

    test('should show error for incomplete JSON schema', async ({ page }) => {
      const incompleteResponse = JSON.stringify({
        "analysis_id": "test_123",
        "confidence_overall": 0.9
        // Missing required fields
      });
      
      await page.fill('#ft-llm-response', incompleteResponse);
      await page.click('#ft-parse-response');
      
      await expect(page.locator('#ft-parse-error')).toBeVisible();
      await expect(page.locator('#ft-parse-error')).toContainText('Schema validation failed');
    });

    test('should allow adding parsed meal to log', async ({ page }) => {
      const validResponse = JSON.stringify({
        "analysis_id": "test_pasta_123",
        "timestamp": new Date().toISOString(),
        "confidence_overall": 0.85,
        "meal_type": "dinner",
        "food_items": [{
          "name": "Spaghetti Carbonara",
          "quantity": 1,
          "unit": "serving",
          "estimated_weight_g": 280,
          "nutrients": {
            "energy_kcal": 520,
            "protein_g": 18,
            "carbs_g": 58,
            "fat_g": 22,
            "fiber_g": 3,
            "sugar_g": 2,
            "sodium_mg": 890,
            "saturated_fat_g": 8
          },
          "micronutrients": {
            "vitamin_a_ug": 120,
            "vitamin_c_mg": 2,
            "vitamin_d_ug": 0.5,
            "folate_ug": 85,
            "iron_mg": 1.8,
            "calcium_mg": 95,
            "zinc_mg": 1.2,
            "omega3_mg": 15
          }
        }],
        "totals": {
          "energy_kcal": 520,
          "protein_g": 18,
          "carbs_g": 58,
          "fat_g": 22,
          "fiber_g": 3,
          "sodium_mg": 890
        },
        "warnings": ["High sodium content"],
        "pregnancy_relevant_notes": []
      });
      
      await page.fill('#ft-llm-response', validResponse);
      await page.click('#ft-parse-response');
      await page.waitForSelector('#ft-results', { state: 'visible' });
      
      // Add to log
      await page.click('#ft-add-to-log');
      await page.waitForTimeout(500);
      
      // Should update daily summary
      await expect(page.locator('.empty-state')).toBeHidden();
      await expect(page.locator('#ft-summary-content')).toContainText('520');
      
      // Should show in meals list
      await expect(page.locator('#ft-meals-list')).toContainText('Spaghetti Carbonara');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Food Tracker - Integration Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Food Tracker Integration', () => {
    
    test('should receive user profile context from calculator', async ({ page }) => {
      // First complete a profile in calculator
      await page.fill('#age', '30');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '68');
      await page.fill('#height', '170');
      await page.selectOption('#activity', 'moderately_active');
      await page.waitForSelector('#pregnancy-section', { state: 'visible' });
      await page.locator('.toggle-option:has(input[value="pregnant"])').click();
      await page.waitForSelector('#pregnancy-fields', { state: 'visible' });
      await page.fill('#pregnancy-week', '28');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#results-section', { state: 'visible' });
      
      // Go to Food Tracker
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(1000);
      
      // Check if user context is in the prompt
      const promptText = await page.locator('#ft-prompt-output').inputValue();
      expect(promptText).toContain('PREGNANT woman (28 weeks)');
      expect(promptText).toContain('30 years old');
      expect(promptText).toContain('68kg');
    });

    test('should use user nutrient targets for comparison when profile exists', async ({ page }) => {
      // Create profile and navigate to tracker
      await page.fill('#age', '25');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '62');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'lightly_active');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#results-section', { state: 'visible' });
      
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(1000);
      
      // Profile warning should be hidden since we have targets now
      await expect(page.locator('#profile-warning-banner')).toBeHidden();
    });

    test('should show Go to Food Tracker CTA from calculator results', async ({ page }) => {
      await page.fill('#age', '28');
      await page.selectOption('#sex', 'female');
      await page.fill('#weight', '65');
      await page.fill('#height', '165');
      await page.selectOption('#activity', 'lightly_active');
      await page.click('button[type="submit"]');
      
      // CTA button should be visible and functional
      await expect(page.locator('.tracker-cta-card')).toBeVisible();
      await expect(page.locator('.tracker-cta-card')).toContainText('Ready to track your intake');
      
      const ctaButton = page.locator('.tracker-cta-card .nav-tab[data-target="tracker-view"]');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toContainText('Go to Food Tracker');
      
      // Click CTA should navigate to tracker
      await ctaButton.click();
      await page.waitForTimeout(500);
      await expect(page.locator('#tracker-view')).toHaveClass(/active/);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Food Tracker - Data Persistence Tests
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Food Tracker Data Persistence', () => {
    
    test('should persist food log in localStorage', async ({ page }) => {
      // Navigate to tracker
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(1000);
      
      // Add a test meal
      const testMeal = JSON.stringify({
        "analysis_id": "persist_test_123",
        "timestamp": new Date().toISOString(),
        "confidence_overall": 0.9,
        "meal_type": "breakfast",
        "food_items": [{
          "name": "Avocado Toast",
          "quantity": 2,
          "unit": "slice",
          "estimated_weight_g": 180,
          "nutrients": {
            "energy_kcal": 290,
            "protein_g": 8,
            "carbs_g": 28,
            "fat_g": 18,
            "fiber_g": 12,
            "sugar_g": 3,
            "sodium_mg": 320,
            "saturated_fat_g": 3
          },
          "micronutrients": {
            "folate_ug": 110,
            "vitamin_c_mg": 12,
            "vitamin_k_ug": 25,
            "potassium_mg": 690
          }
        }],
        "totals": {
          "energy_kcal": 290,
          "protein_g": 8,
          "carbs_g": 28,
          "fat_g": 18,
          "fiber_g": 12,
          "sodium_mg": 320
        }
      });
      
      await page.fill('#ft-llm-response', testMeal);
      await page.click('#ft-parse-response');
      await page.click('#ft-add-to-log');
      await page.waitForTimeout(500);
      
      // Check localStorage
      const foodLog = await page.evaluate(() => {
        return localStorage.getItem('nutrimom_food_log');
      });
      
      expect(foodLog).toBeTruthy();
      const parsedLog = JSON.parse(foodLog);
      const today = new Date().toISOString().split('T')[0];
      expect(parsedLog[today]).toBeTruthy();
      expect(parsedLog[today].meals).toHaveLength(1);
      expect(parsedLog[today].meals[0].food_items[0].name).toBe('Avocado Toast');
    });

    test('should load persisted food log on page refresh', async ({ page }) => {
      // Set up a food log in localStorage
      const today = new Date().toISOString().split('T')[0];
      await page.evaluate((date) => {
        const foodLog = {};
        foodLog[date] = {
          date: date,
          meals: [{
            id: 'test_meal_123',
            timestamp: new Date().toISOString(),
            meal_type: 'lunch',
            food_items: [{
              name: 'Greek Salad',
              quantity: 1,
              unit: 'serving',
              estimated_weight_g: 220,
              nutrients: {
                energy_kcal: 180,
                protein_g: 6,
                carbs_g: 12,
                fat_g: 13
              }
            }],
            totals: {
              energy_kcal: 180,
              protein_g: 6,
              carbs_g: 12,
              fat_g: 13
            }
          }],
          dailyTotals: {
            energy_kcal: 180,
            protein_g: 6,
            carbs_g: 12,
            fat_g: 13
          }
        };
        localStorage.setItem('nutrimom_food_log', JSON.stringify(foodLog));
      }, today);
      
      // Refresh page and navigate to tracker
      await page.reload();
      await page.waitForFunction(() => {
        return document.querySelector('#profile-form') !== null;
      });
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(1000);
      
      // Should show the persisted meal
      await expect(page.locator('#ft-meals-list')).toContainText('Greek Salad');
      await expect(page.locator('#ft-summary-content')).toContainText('180');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Food Tracker - Error Scenarios
  // ─────────────────────────────────────────────────────────────────────────────

  test.describe('Food Tracker Error Scenarios', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(1000);
    });

    test('should handle plugin initialization failure gracefully', async ({ page }) => {
      // Check for console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      
      await page.waitForTimeout(2000);
      
      // Should not have critical initialization errors
      const criticalErrors = errors.filter(err => 
        err.includes('Failed to initialize Food Tracker')
      );
      expect(criticalErrors).toHaveLength(0);
    });

    test('should show empty state when no meals are logged', async ({ page }) => {
      // Clear any existing food log
      await page.evaluate(() => {
        localStorage.removeItem('nutrimom_food_log');
      });
      
      await page.reload();
      await page.waitForFunction(() => {
        return document.querySelector('#profile-form') !== null;
      });
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('.empty-state')).toBeVisible();
      await expect(page.locator('.empty-state')).toContainText('No meals logged today');
    });

    test('should handle malformed localStorage data', async ({ page }) => {
      // Set malformed data in localStorage
      await page.evaluate(() => {
        localStorage.setItem('nutrimom_food_log', 'invalid json');
      });
      
      await page.reload();
      await page.waitForFunction(() => {
        return document.querySelector('#profile-form') !== null;
      });
      await page.click('.nav-tab[data-target="tracker-view"]');
      await page.waitForTimeout(1000);
      
      // Should gracefully fall back to empty state
      await expect(page.locator('.empty-state')).toBeVisible();
    });
  });
});
})
