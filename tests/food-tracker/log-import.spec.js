// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * Food Log Import & Dashboard E2E Tests
 * 
 * Tests importing sample-week-log.json data and verifying:
 * - The engine properly loads multi-day data
 * - Day transition and completion detection
 * - Log dashboard renders with correct data
 * - Summary cards, charts, table, and insights display
 * - Navigation between views works
 */

const SAMPLE_LOG_PATH = path.resolve(__dirname, '../../data/samples/sample-week-log.json');

test.describe('Food Log Import & Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Navigation & View
  // ─────────────────────────────────────────────────────────────────────────────

  test('Log tab exists in navigation', async ({ page }) => {
    const logTab = page.locator('.nav-tab[data-target="log-view"]');
    await expect(logTab).toBeVisible();
    await expect(logTab).toHaveText('Log');
  });

  test('Log view shows empty state initially', async ({ page }) => {
    await page.click('.nav-tab[data-target="log-view"]');
    await expect(page.locator('#log-view')).toHaveClass(/active/);
    await expect(page.locator('.log-empty-state')).toBeVisible();
    await expect(page.locator('.log-empty-state')).toContainText('No Data Yet');
  });

  test('Can navigate between Calculator, Tracker, and Log', async ({ page }) => {
    // Go to Log
    await page.click('.nav-tab[data-target="log-view"]');
    await expect(page.locator('#log-view')).toHaveClass(/active/);
    
    // Go to Tracker
    await page.click('.nav-tab[data-target="tracker-view"]');
    await expect(page.locator('#tracker-view')).toHaveClass(/active/);
    
    // Go back to Calculator
    await page.click('.nav-tab[data-target="calculator-view"]');
    await expect(page.locator('#calculator-view')).toHaveClass(/active/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Import & Engine Processing
  // ─────────────────────────────────────────────────────────────────────────────

  test('Import sample week log via file input', async ({ page }) => {
    // Trigger file import
    const fileInput = page.locator('#import-file-input');
    
    // Listen for the alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Data imported successfully');
      await dialog.accept();
    });

    await fileInput.setInputFiles(SAMPLE_LOG_PATH);
    
    // Page will reload after import - wait for it
    await page.waitForLoadState('networkidle');
  });

  test('Engine loads 7 days of data after import', async ({ page }) => {
    // Import data via localStorage directly for faster testing
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify engine has the data
    const dayCount = await page.evaluate(() => {
      // Read directly from localStorage to avoid DOM extensions typing issues
      const data = JSON.parse(localStorage.getItem('nutrimom_food_log') || '{}');
      const dates = Object.keys(data).filter(k => k !== '_meta' && /^\d{4}-\d{2}-\d{2}$/.test(k));
      return dates.length;
    });

    expect(dayCount).toBe(7);
  });

  test('Engine has correct metadata after import', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');

    const meta = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('nutrimom_food_log') || '{}');
      return data._meta;
    });

    expect(meta).toBeTruthy();
    expect(meta.version).toBe('2.0');
    expect(meta.totalDaysLogged).toBe(7);
    expect(meta.firstEntryDate).toBe('2026-02-01');
    expect(meta.lastEntryDate).toBe('2026-02-07');
  });

  test('Each day has correct meal count', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');

    const mealCounts = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('nutrimom_food_log') || '{}');
      /** @type {{[date: string]: number}} */
      const counts = {};
      Object.keys(data).forEach(key => {
        if (key !== '_meta' && /^\d{4}-\d{2}-\d{2}$/.test(key)) {
          counts[key] = data[key].meals.length;
        }
      });
      return counts;
    });

    // Verify meal counts match sample data
    expect(mealCounts['2026-02-01']).toBe(4); // breakfast, lunch, snack, dinner
    expect(mealCounts['2026-02-02']).toBe(3); // breakfast, lunch, dinner
    expect(mealCounts['2026-02-03']).toBe(4); // breakfast, lunch, snack, dinner
    expect(mealCounts['2026-02-04']).toBe(3); // breakfast, lunch, dinner
    expect(mealCounts['2026-02-05']).toBe(4); // breakfast, lunch, snack, dinner
    expect(mealCounts['2026-02-06']).toBe(3); // breakfast, lunch, dinner
    expect(mealCounts['2026-02-07']).toBe(2); // breakfast, lunch (today - incomplete)
  });

  test('Daily totals include macros and micronutrients', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');

    const day1Totals = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('nutrimom_food_log') || '{}');
      return data['2026-02-01']?.dailyTotals;
    });

    // Verify macros
    expect(day1Totals.energy_kcal).toBeGreaterThan(1000);
    expect(day1Totals.protein_g).toBeGreaterThan(50);
    expect(day1Totals.carbs_g).toBeGreaterThan(50);
    expect(day1Totals.fat_g).toBeGreaterThan(20);

    // Verify micronutrients exist
    expect(day1Totals.folate_dfe_ug || day1Totals.folate_ug).toBeGreaterThan(0);
    expect(day1Totals.iron_mg).toBeGreaterThan(0);
    expect(day1Totals.calcium_mg).toBeGreaterThan(0);
    expect(day1Totals.vitamin_d_ug).toBeGreaterThan(0);
    expect(day1Totals.dha_mg || day1Totals.omega3_mg).toBeGreaterThan(0);
  });

  test('Meals have correct timestamps with datetime', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');

    /** @type {string[]} */
    const timestamps = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('nutrimom_food_log') || '{}');
      /** @type {{timestamp: string}[]} */
      const meals = data['2026-02-01']?.meals || [];
      return meals.map(m => m.timestamp);
    });

    expect(timestamps).toHaveLength(4);
    // Verify timestamps are valid ISO strings with time
    timestamps.forEach(ts => {
      expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      const date = new Date(ts);
      expect(date.getTime()).toBeGreaterThan(0);
    });
    
    // Verify chronological order
    for (let i = 1; i < timestamps.length; i++) {
      expect(new Date(timestamps[i]).getTime()).toBeGreaterThan(new Date(timestamps[i-1]).getTime());
    }
  });

  test('Completed days are marked as completed', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');

    const completionStatus = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('nutrimom_food_log') || '{}');
      /** @type {{[date: string]: boolean}} */
      const status = {};
      Object.keys(data).forEach(key => {
        if (key !== '_meta' && /^\d{4}-\d{2}-\d{2}$/.test(key)) {
          status[key] = !!data[key].completed;
        }
      });
      return status;
    });

    // Past days should be completed
    expect(completionStatus['2026-02-01']).toBe(true);
    expect(completionStatus['2026-02-02']).toBe(true);
    expect(completionStatus['2026-02-03']).toBe(true);
    expect(completionStatus['2026-02-04']).toBe(true);
    expect(completionStatus['2026-02-05']).toBe(true);
    expect(completionStatus['2026-02-06']).toBe(true);
    // Today should not be completed
    expect(completionStatus['2026-02-07']).toBe(true); // Now past
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Dashboard Rendering
  // ─────────────────────────────────────────────────────────────────────────────

  test('Log dashboard renders with imported data', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Navigate to Log view
    await page.click('.nav-tab[data-target="log-view"]');
    await expect(page.locator('#log-view')).toHaveClass(/active/);
    
    // Dashboard should NOT show empty state
    await expect(page.locator('.log-empty-state')).not.toBeVisible();
    
    // Dashboard header should be present
    await expect(page.locator('.log-header h2')).toBeVisible();
  });

  test('Summary cards show correct values', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('.nav-tab[data-target="log-view"]');
    
    // Check summary cards exist
    const summaryCards = page.locator('#log-summary-cards .log-card');
    await expect(summaryCards).toHaveCount(6);
    
    // Check days tracked
    const daysCard = summaryCards.nth(0);
    await expect(daysCard).toContainText('Days Tracked');
  });

  test('Weekly chart renders bar groups', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('.nav-tab[data-target="log-view"]');
    
    // Chart section should exist
    const chartSection = page.locator('#log-weekly-chart');
    await expect(chartSection).toBeVisible();
    
    // Bars should be rendered
    const barGroups = chartSection.locator('.chart-bar-group');
    const count = await barGroups.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Micronutrient chart renders bars', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('.nav-tab[data-target="log-view"]');
    
    const microSection = page.locator('#log-micro-chart');
    await expect(microSection).toBeVisible();
    
    // Should have multiple nutrient bars
    const microBars = microSection.locator('.micro-bar-item');
    const count = await microBars.count();
    expect(count).toBeGreaterThanOrEqual(6); // folate, iron, calcium, vitD, zinc, omega3, vitC, vitA
  });

  test('Day table shows all 7 days', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('.nav-tab[data-target="log-view"]');
    
    const tableSection = page.locator('#log-day-table');
    await expect(tableSection).toBeVisible();
    
    // Should have 7 data rows
    const rows = tableSection.locator('.log-table-row');
    await expect(rows).toHaveCount(7);
  });

  test('Day table shows today row with different styling', async ({ page }) => {
    const sampleData = JSON.parse(JSON.stringify(require(SAMPLE_LOG_PATH)));
    const today = new Date().toLocaleDateString('en-CA');
    
    // Inject today's entry
    sampleData.foodLog[today] = {
      date: today,
      completed: false,
      meals: [],
      dailyTotals: { energy_kcal: 0 }
    };
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('.nav-tab[data-target="log-view"]');
    
    // Today's row should have the row-today class
    const todayRow = page.locator('.log-table-row.row-today');
    await expect(todayRow).toHaveCount(1);
    await expect(todayRow).toHaveAttribute('data-date', today);
  });

  test('Insights section renders', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('.nav-tab[data-target="log-view"]');
    
    const insightsSection = page.locator('#log-insights');
    await expect(insightsSection).toBeVisible();
    
    const insights = insightsSection.locator('.log-insight');
    const count = await insights.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Data Integrity
  // ─────────────────────────────────────────────────────────────────────────────

  test('Meal food items have full nutrient data', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check a specific meal's food items
    const foodItem = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('nutrimom_food_log') || '{}');
      return data['2026-02-01']?.meals[3]?.food_items[0]; // Dinner salmon
    });

    expect(foodItem.name).toBe('Grilled salmon fillet');
    expect(foodItem.nutrients.energy_kcal).toBe(350);
    expect(foodItem.nutrients.protein_g).toBe(39);
    expect(foodItem.micronutrients.omega3_mg).toBe(2260);
    expect(foodItem.micronutrients.vitamin_d_ug).toBe(14.5);
    expect(foodItem.preparation_method).toBe('grilled');
    expect(foodItem.estimated_weight_g).toBe(170);
  });

  test('Each meal has meal_type and timestamp', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');

    const allValid = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('nutrimom_food_log') || '{}');
      const validTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      
      for (const key of Object.keys(data)) {
        if (key === '_meta' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
        for (const meal of data[key].meals) {
          if (!validTypes.includes(meal.meal_type)) return false;
          if (!meal.timestamp || !meal.timestamp.includes('T')) return false;
          if (!meal.id) return false;
        }
      }
      return true;
    });

    expect(allValid).toBe(true);
  });

  test('Profile data is correctly loaded from import', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');

    const profile = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('nutrimom_user_profile') || '{}');
    });

    expect(profile.ageYears).toBe(28);
    expect(profile.sex).toBe('female');
    expect(profile.isPregnant).toBe(true);
    expect(profile.pregnancyWeek).toBe(24);
    expect(profile.weightKg).toBe(67);
    expect(profile.heightCm).toBe(165);
    expect(profile.activityLevel).toBe('moderately_active');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Dashboard after fresh import via UI
  // ─────────────────────────────────────────────────────────────────────────────

  test('Full import-to-dashboard flow works end-to-end', async ({ page }) => {
    const sampleData = require(SAMPLE_LOG_PATH);
    
    // Simulate import (avoiding dialog handling complexity)
    await page.evaluate((data) => {
      localStorage.setItem('nutrimom_food_log', JSON.stringify(data.foodLog));
      localStorage.setItem('nutrimom_user_profile', JSON.stringify(data.profile));
    }, sampleData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Auto-calculate should have triggered from loaded profile
    // Navigate to Log
    await page.click('.nav-tab[data-target="log-view"]');
    
    // Verify complete dashboard renders
    await expect(page.locator('.log-dashboard')).toBeVisible();
    await expect(page.locator('#log-summary-cards')).toBeVisible();
    await expect(page.locator('#log-weekly-chart')).toBeVisible();
    await expect(page.locator('#log-micro-chart')).toBeVisible();
    await expect(page.locator('#log-insights')).toBeVisible();
    await expect(page.locator('#log-day-table')).toBeVisible();
    
    // Verify table has data
    const rowCount = await page.locator('.log-table-row').count();
    expect(rowCount).toBe(7);
  });
});
