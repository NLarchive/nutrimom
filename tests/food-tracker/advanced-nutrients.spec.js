const { test, expect } = require('@playwright/test');
const { fillProfile, submitProfile, navigateToTracker } = require('../helpers/test-data');

test.describe('Advanced Nutrient Tracking', () => {
  // Test data with nested micronutrients structure
  const complexMealData = {
    analysis_id: "test_complex_meal_1",
    timestamp: new Date().toISOString(),
    meal_type: "snack",
    confidence_overall: 0.92,
    food_items: [
      {
        "name": "Flour Tortilla (Medium)",
        "quantity": 1,
        "unit": "piece",
        "nutrients": {
          "energy_kcal": 150,
          "protein_g": 4,
          "carbs_g": 25,
          "fat_g": 4,
          "fiber_g": 1.2,
          "sugar_g": 0.5,
          "sodium_mg": 320,
          "saturated_fat_g": 1,
          "potassium_mg": 60,
          "magnesium_mg": 12
        },
        "micronutrients": {
          "folate_dfe_ug": 45,
          "iron_mg": 1.4,
          "calcium_mg": 40,
          "vitamin_d_ug": 0,
          "vitamin_b6_mg": 0.05,
          "zinc_mg": 0.3,
          "selenium_ug": 8
        }
      },
      {
        "name": "Beef Steak (Carne Asada)",
        "quantity": 1,
        "unit": "serving",
        "nutrients": {
          "energy_kcal": 200,
          "protein_g": 21,
          "carbs_g": 0,
          "fat_g": 12,
          "sodium_mg": 55,
          "potassium_mg": 280,
          "magnesium_mg": 18
        },
        "micronutrients": {
          "folate_dfe_ug": 6,
          "iron_mg": 2.1,
          "calcium_mg": 10,
          "vitamin_b6_mg": 0.4,
          "zinc_mg": 4.2,
          "selenium_ug": 18
        }
      }
    ],
    // The totals object here is deliberately slightly off or matching to verify calc source
    totals: {
      "energy_kcal": 350,
      "protein_g": 25
    },
    warnings: [],
    pregnancy_relevant_notes: []
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await fillProfile(page);
    await submitProfile(page);
    await navigateToTracker(page);
  });

  test('should correctly track advanced vitamins and minerals from nested micronutrients', async ({ page }) => {
    // Inject the complex meal directly into the engine
    await page.evaluate((meal) => {
      window.foodTrackerEngine.addToLog(meal);
    }, complexMealData);

    // Get the daily log from the engine
    const log = await page.evaluate(() => {
      return window.foodTrackerEngine.getDailyLog();
    });

    const t = log.dailyTotals;

    // Verify Summation Logic
    
    // 1. Check if Vitamin B6 (newly tracked) is present and correct
    // Item 1: 0.05, Item 2: 0.4 => Total: 0.45 -> Rounded 0.5
    expect(t.vitamin_b6_mg).toBe(0.5);

    // 2. Check Selenium
    // Item 1: 8, Item 2: 18 => Total: 26
    expect(t.selenium_ug).toBe(26);

    // 3. Check Magnesium (was in main 'nutrients' object)
    // Item 1: 12, Item 2: 18 => Total: 30
    expect(t.magnesium_mg).toBe(30);

    // 4. Check Iron (standard nutrient)
    // Item 1: 1.4, Item 2: 2.1 => Total: 3.5
    expect(t.iron_mg).toBe(3.5);

    // 5. Check Macros
    // Energy: 150 + 200 = 350
    expect(t.energy_kcal).toBe(350);
  });

  test('should not double count micronutrients if present in both totals and items', async ({ page }) => {
    const mealWithTotals = {
      ...complexMealData,
      totals: {
        "energy_kcal": 350,
        "protein_g": 25,
        "iron_mg": 3.5 // If engine used this + items, result would be 7.0
      }
    };

    await page.evaluate((meal) => {
      window.foodTrackerEngine.addToLog(meal);
    }, mealWithTotals);

    const log = await page.evaluate(() => {
      return window.foodTrackerEngine.getDailyLog();
    });

    // Should be exactly 3.5 (sum of items), NOT 7.0 (sum of items + totals)
    expect(log.dailyTotals.iron_mg).toBe(3.5);
  });
});
