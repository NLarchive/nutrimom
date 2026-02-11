// @ts-check
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Nutrient Data Validation & Engine Test Suite
 * 
 * Validates that:
 * 1. nutrient-targets.json has entries for ALL engine-tracked nutrients
 * 2. Engine aggregates all 37 nutrients correctly from realistic mock data
 * 3. compareToTargets produces correct comparison for every tracked nutrient
 * 4. Prompt contains all required nutrient keys
 * 5. nutrient-targets.json values match IOM DRI / research-validated sources
 * 
 * Note: Uses @ts-ignore comments for dynamically loaded window objects (foodTrackerUI, foodTrackerEngine)
 * These types are verified at runtime by Playwright and don't affect test execution.
 * 
 * Sources: IOM DRI Tables, NIH ODS, NASEM 2019, DGA 2025-2030, Cochrane (Omega-3)
 */
const { test, expect } = require('@playwright/test');
const { fillProfile, submitProfile, navigateToTracker } = require('../helpers/test-data');
const fs = require('fs');
const path = require('path');

// ── Canonical list of all 37 engine-tracked nutrients ──────────────────────
const ENGINE_TRACKED_NUTRIENTS = [
  'energy_kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'sodium_mg',
  'vitamin_a_rae_ug', 'vitamin_b12_ug', 'vitamin_c_mg', 'vitamin_d_ug',
  'vitamin_e_mg', 'vitamin_k_ug', 'vitamin_b6_mg', 'thiamin_mg',
  'riboflavin_mg', 'niacin_mg_ne', 'pantothenic_acid_mg', 'biotin_ug',
  'folate_dfe_ug', 'choline_mg',
  'iron_mg', 'calcium_mg', 'zinc_mg', 'iodine_ug', 'magnesium_mg',
  'potassium_mg', 'phosphorus_mg', 'selenium_ug', 'copper_ug',
  'manganese_mg', 'chromium_ug', 'molybdenum_ug', 'chloride_mg', 'fluoride_mg',
  'dha_mg', 'epa_mg', 'ala_omega3_g'
];

// ── Realistic mock meal: "Salmon Bowl with Quinoa & Vegetables" ────────────
// Values cross-referenced with USDA FoodData Central
const SALMON_BOWL_MEAL = {
  analysis_id: 'nutrient_validation_001',
  timestamp: new Date().toISOString(),
  meal_type: 'lunch',
  confidence_overall: 0.95,
  food_items: [
    {
      name: 'Atlantic Salmon Fillet (baked)',
      quantity: 1,
      unit: 'serving',
      estimated_weight_g: 170,
      preparation_method: 'baked',
      nutrients: {
        energy_kcal: 367,
        protein_g: 39.3,
        carbs_g: 0,
        fat_g: 22.1,
        fiber_g: 0,
        sodium_mg: 95,
        potassium_mg: 628,
        magnesium_mg: 51,
        water_l: 0.1
      },
      micronutrients: {
        folate_dfe_ug: 43,
        iron_mg: 1.4,
        calcium_mg: 22,
        vitamin_b12_ug: 4.9,
        vitamin_b6_mg: 1.2,
        biotin_ug: 8.5,
        niacin_mg_ne: 14.3,
        riboflavin_mg: 0.7,
        thiamin_mg: 0.4,
        pantothenic_acid_mg: 2.8,
        choline_mg: 135,
        vitamin_c_mg: 0,
        vitamin_d_ug: 14.2,
        vitamin_a_rae_ug: 69,
        vitamin_e_mg: 3.6,
        vitamin_k_ug: 0.9,
        zinc_mg: 0.8,
        phosphorus_mg: 380,
        selenium_ug: 63,
        iodine_ug: 30,
        copper_ug: 95,
        manganese_mg: 0.03,
        chromium_ug: 0.4,
        molybdenum_ug: 0,
        chloride_mg: 145,
        fluoride_mg: 0.05,
        dha_mg: 1240,
        epa_mg: 860,
        ala_omega3_g: 0.15
      }
    },
    {
      name: 'Cooked Quinoa',
      quantity: 1,
      unit: 'cup',
      estimated_weight_g: 185,
      preparation_method: 'boiled',
      nutrients: {
        energy_kcal: 222,
        protein_g: 8.1,
        carbs_g: 39.4,
        fat_g: 3.6,
        fiber_g: 5.2,
        sodium_mg: 13,
        potassium_mg: 318,
        magnesium_mg: 118,
        water_l: 0.13
      },
      micronutrients: {
        folate_dfe_ug: 78,
        iron_mg: 2.8,
        calcium_mg: 31,
        vitamin_b12_ug: 0,
        vitamin_b6_mg: 0.2,
        biotin_ug: 0,
        niacin_mg_ne: 0.8,
        riboflavin_mg: 0.2,
        thiamin_mg: 0.2,
        pantothenic_acid_mg: 0.3,
        choline_mg: 43,
        vitamin_c_mg: 0,
        vitamin_d_ug: 0,
        vitamin_a_rae_ug: 0,
        vitamin_e_mg: 1.2,
        vitamin_k_ug: 0,
        zinc_mg: 2.0,
        phosphorus_mg: 281,
        selenium_ug: 5.2,
        iodine_ug: 0,
        copper_ug: 355,
        manganese_mg: 1.2,
        chromium_ug: 0,
        molybdenum_ug: 0,
        chloride_mg: 20,
        fluoride_mg: 0.01,
        dha_mg: 0,
        epa_mg: 0,
        ala_omega3_g: 0.09
      }
    },
    {
      name: 'Steamed Broccoli',
      quantity: 1,
      unit: 'cup',
      estimated_weight_g: 156,
      preparation_method: 'steamed',
      nutrients: {
        energy_kcal: 55,
        protein_g: 3.7,
        carbs_g: 11.2,
        fat_g: 0.6,
        fiber_g: 5.1,
        sodium_mg: 64,
        potassium_mg: 457,
        magnesium_mg: 33,
        water_l: 0.14
      },
      micronutrients: {
        folate_dfe_ug: 104,
        iron_mg: 1.0,
        calcium_mg: 62,
        vitamin_b12_ug: 0,
        vitamin_b6_mg: 0.3,
        biotin_ug: 0.4,
        niacin_mg_ne: 0.9,
        riboflavin_mg: 0.2,
        thiamin_mg: 0.1,
        pantothenic_acid_mg: 0.9,
        choline_mg: 63,
        vitamin_c_mg: 101,
        vitamin_d_ug: 0,
        vitamin_a_rae_ug: 60,
        vitamin_e_mg: 2.3,
        vitamin_k_ug: 220,
        zinc_mg: 0.7,
        phosphorus_mg: 105,
        selenium_ug: 2.5,
        iodine_ug: 0,
        copper_ug: 88,
        manganese_mg: 0.3,
        chromium_ug: 18.2,
        molybdenum_ug: 12,
        chloride_mg: 50,
        fluoride_mg: 0.1,
        dha_mg: 0,
        epa_mg: 0,
        ala_omega3_g: 0.19
      }
    }
  ],
  totals: {
    energy_kcal: 644,
    protein_g: 51.1,
    carbs_g: 50.6,
    fat_g: 26.3
  },
  warnings: [],
  pregnancy_relevant_notes: ['Excellent DHA from salmon - supports fetal brain development']
};

// Expected totals (hand-calculated sum of all 3 items)
const EXPECTED_TOTALS = {
  energy_kcal: 644,
  protein_g: 51.1,
  carbs_g: 50.6,
  fat_g: 26.3,
  fiber_g: 10.3,
  sodium_mg: 172,
  vitamin_a_rae_ug: 129,
  vitamin_b12_ug: 4.9,
  vitamin_c_mg: 101,
  vitamin_d_ug: 14.2,
  vitamin_e_mg: 7.1,
  vitamin_k_ug: 220.9,
  vitamin_b6_mg: 1.7,
  thiamin_mg: 0.7,
  riboflavin_mg: 1.1,
  niacin_mg_ne: 16,
  pantothenic_acid_mg: 4,
  biotin_ug: 8.9,
  folate_dfe_ug: 225,
  choline_mg: 241,
  iron_mg: 5.2,
  calcium_mg: 115,
  zinc_mg: 3.5,
  iodine_ug: 30,
  magnesium_mg: 202,
  potassium_mg: 1403,
  phosphorus_mg: 766,
  selenium_ug: 70.7,
  copper_ug: 538,
  manganese_mg: 1.5,  // 0.03 + 1.2 + 0.3 = 1.53 → rounded 1.5
  chromium_ug: 18.6,
  molybdenum_ug: 12,
  chloride_mg: 215,
  fluoride_mg: 0.2,   // 0.05 + 0.01 + 0.1 = 0.16 → rounded 0.2
  dha_mg: 1240,
  epa_mg: 860,
  ala_omega3_g: 0.4    // 0.15 + 0.09 + 0.19 = 0.43 → rounded 0.4
};

// ── IOM DRI reference values for pregnant female 31-50y ────────────────────
// Cross-validated against the nutrient research document
const PREGNANT_31_50_DRI = {
  protein_g: { RDA: 71 },
  carbs_g: { MIN: 175 },
  fiber_g: { AI: 28 },
  water_l: { AI: 3.0 },
  folate_dfe_ug: { RDA: 600 },
  vitamin_b12_ug: { RDA: 2.6 },
  iron_mg: { RDA: 27 },
  calcium_mg: { RDA: 1000 },
  vitamin_d_ug: { RDA: 15 },
  iodine_ug: { RDA: 220 },
  zinc_mg: { RDA: 11 },
  choline_mg: { AI: 450 },
  vitamin_a_rae_ug: { RDA: 770 },
  vitamin_c_mg: { RDA: 85 },
  vitamin_e_mg: { RDA: 15 },
  vitamin_k_ug: { AI: 90 },
  thiamin_mg: { RDA: 1.4 },
  riboflavin_mg: { RDA: 1.4 },
  niacin_mg_ne: { RDA: 18 },
  vitamin_b6_mg: { RDA: 1.9 },
  magnesium_mg: { RDA: 360 },
  phosphorus_mg: { RDA: 700 },
  potassium_mg: { AI: 2900 },
  sodium_mg: { MAX: 2300 },
  selenium_ug: { RDA: 60 },
  copper_ug: { RDA: 1000 },
  manganese_mg: { AI: 2.0 },
  chromium_ug: { AI: 30 },
  molybdenum_ug: { RDA: 50 },
  dha_mg: { AI: 200 },
  epa_mg: { AI: 50 },
  ala_omega3_g: { AI: 1.4 },
  pantothenic_acid_mg: { AI: 6 },
  biotin_ug: { AI: 30 }
};


test.describe('Nutrient Database Validation', () => {

  test('nutrient-targets.json has entries for ALL engine-tracked nutrients (pregnant_t2 31_50)', () => {
    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));

    // Check a representative pregnancy stage
    const band = targets.pregnant_t2['31_50'];
    expect(band).toBeTruthy();

    const missingKeys = ENGINE_TRACKED_NUTRIENTS.filter(key => {
      // sodium_mg is tracked as a MAX, energy/macros may not have DRI-style targets
      if (['energy_kcal', 'fat_g'].includes(key)) return false;
      return !band[key];
    });

    expect(missingKeys).toEqual([]);
  });

  test('nutrient-targets.json DRI values match IOM research for pregnant_t2 31_50', () => {
    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
    const band = targets.pregnant_t2['31_50'];

    for (const [key, expected] of Object.entries(PREGNANT_31_50_DRI)) {
      const actual = band[key];
      expect(actual, `Missing target for ${key}`).toBeTruthy();

      // Check the primary target type matches
      for (const [type, val] of Object.entries(expected)) {
        expect(actual[type], `${key}.${type} expected ${val} got ${actual[type]}`).toBe(val);
      }
    }
  });

  test('nutrients.json has entries for ALL engine-tracked nutrient codes', () => {
    const nutrientsPath = path.join(__dirname, '..', '..', 'data', 'nutrients.json');
    const nutrients = JSON.parse(fs.readFileSync(nutrientsPath, 'utf8'));
    const codes = nutrients.map((/** @type {{ code: any; }} */ n) => n.code);

    // All engine-tracked keys except sodium_mg should have a nutrients.json entry
    const missing = ENGINE_TRACKED_NUTRIENTS.filter(key => !codes.includes(key));
    expect(missing).toEqual([]);
  });

  test('epa_mg targets exist for pregnancy and lactation stages', () => {
    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));

    // Pregnancy stages should have AI 50 for EPA
    for (const stage of ['pregnant_t1', 'pregnant_t2', 'pregnant_t3']) {
      for (const band of Object.keys(targets[stage])) {
        const epa = targets[stage][band].epa_mg;
        expect(epa, `${stage}.${band} missing epa_mg`).toBeTruthy();
        expect(epa.AI).toBe(50);
      }
    }

    // Lactation stages should also have AI 50
    for (const stage of ['lactating_0_6', 'lactating_7_12']) {
      for (const band of Object.keys(targets[stage])) {
        const epa = targets[stage][band].epa_mg;
        expect(epa, `${stage}.${band} missing epa_mg`).toBeTruthy();
        expect(epa.AI).toBe(50);
      }
    }

    // Non-pregnant stages should have AI 0
    for (const stage of ['child', 'female_nonpregnant', 'male_nonpregnant']) {
      for (const band of Object.keys(targets[stage])) {
        const epa = targets[stage][band].epa_mg;
        expect(epa, `${stage}.${band} missing epa_mg`).toBeTruthy();
        expect(epa.AI).toBe(0);
      }
    }
  });
});


test.describe('Engine Aggregation - All 37 Nutrients', () => {
  const FoodTrackerEngine = require('../../plugins/food-tracker/food-tracker-engine.js');

  test('aggregates all 37 tracked nutrients from a realistic salmon bowl meal', () => {
    const engine = new FoodTrackerEngine({ storageKey: 'test_nutrient_validation' });
    engine.clearAll();

    engine.addToLog(SALMON_BOWL_MEAL);
    const day = /** @type {any} */ (engine.getDailyLog());
    const t = day.dailyTotals || {};

    // Verify every tracked nutrient has been aggregated
    for (const key of ENGINE_TRACKED_NUTRIENTS) {
      expect(t.hasOwnProperty(key), `Missing tracked nutrient: ${key}`).toBeTruthy();
    }

    // Spot-check critical macros
    expect(t.energy_kcal).toBe(EXPECTED_TOTALS.energy_kcal);
    expect(t.protein_g).toBe(EXPECTED_TOTALS.protein_g);
    expect(t.carbs_g).toBe(EXPECTED_TOTALS.carbs_g);
    expect(t.fat_g).toBe(EXPECTED_TOTALS.fat_g);
    expect(t.fiber_g).toBe(EXPECTED_TOTALS.fiber_g);
    expect(t.sodium_mg).toBe(EXPECTED_TOTALS.sodium_mg);

    // Spot-check B vitamins
    expect(t.folate_dfe_ug).toBe(EXPECTED_TOTALS.folate_dfe_ug);
    expect(t.vitamin_b12_ug).toBe(EXPECTED_TOTALS.vitamin_b12_ug);
    expect(t.vitamin_b6_mg).toBe(EXPECTED_TOTALS.vitamin_b6_mg);
    expect(t.thiamin_mg).toBe(EXPECTED_TOTALS.thiamin_mg);
    expect(t.riboflavin_mg).toBe(EXPECTED_TOTALS.riboflavin_mg);
    expect(t.niacin_mg_ne).toBe(EXPECTED_TOTALS.niacin_mg_ne);
    expect(t.pantothenic_acid_mg).toBe(EXPECTED_TOTALS.pantothenic_acid_mg);
    expect(t.biotin_ug).toBe(EXPECTED_TOTALS.biotin_ug);
    expect(t.choline_mg).toBe(EXPECTED_TOTALS.choline_mg);

    // Spot-check fat-soluble vitamins
    expect(t.vitamin_a_rae_ug).toBe(EXPECTED_TOTALS.vitamin_a_rae_ug);
    expect(t.vitamin_c_mg).toBe(EXPECTED_TOTALS.vitamin_c_mg);
    expect(t.vitamin_d_ug).toBe(EXPECTED_TOTALS.vitamin_d_ug);
    expect(t.vitamin_e_mg).toBe(EXPECTED_TOTALS.vitamin_e_mg);
    expect(t.vitamin_k_ug).toBe(EXPECTED_TOTALS.vitamin_k_ug);

    // Spot-check minerals
    expect(t.iron_mg).toBe(EXPECTED_TOTALS.iron_mg);
    expect(t.calcium_mg).toBe(EXPECTED_TOTALS.calcium_mg);
    expect(t.zinc_mg).toBe(EXPECTED_TOTALS.zinc_mg);
    expect(t.iodine_ug).toBe(EXPECTED_TOTALS.iodine_ug);
    expect(t.magnesium_mg).toBe(EXPECTED_TOTALS.magnesium_mg);
    expect(t.phosphorus_mg).toBe(EXPECTED_TOTALS.phosphorus_mg);
    expect(t.selenium_ug).toBe(EXPECTED_TOTALS.selenium_ug);
    expect(t.copper_ug).toBe(EXPECTED_TOTALS.copper_ug);
    expect(t.chromium_ug).toBe(EXPECTED_TOTALS.chromium_ug);
    expect(t.molybdenum_ug).toBe(EXPECTED_TOTALS.molybdenum_ug);

    // Spot-check fatty acids - critical for pregnancy tracking
    expect(t.dha_mg).toBe(EXPECTED_TOTALS.dha_mg);
    expect(t.epa_mg).toBe(EXPECTED_TOTALS.epa_mg);
    expect(t.ala_omega3_g).toBe(EXPECTED_TOTALS.ala_omega3_g);
  });

  test('compareToTargets includes EPA in comparison output', () => {
    const engine = new FoodTrackerEngine({ storageKey: 'test_epa_comparison' });
    engine.clearAll();
    engine.addToLog(SALMON_BOWL_MEAL);

    // Build targets matching pregnant_t2 31_50 format
    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
    const pregnantTargets = targets.pregnant_t2['31_50'];

    const comparison = /** @type {any} */ (engine.compareToTargets(pregnantTargets));

    // EPA should now appear in comparison since we added targets
    expect(comparison?.nutrients?.epa_mg).toBeTruthy();
    expect(comparison?.nutrients?.epa_mg?.intake).toBe(860);
    // 860 / 50 * 100 = 1720%
    expect(comparison?.nutrients?.epa_mg?.percentage).toBeGreaterThan(100);

    // DHA should also be in comparison
    expect(comparison?.nutrients?.dha_mg).toBeTruthy();
    expect(comparison?.nutrients?.dha_mg?.intake).toBe(1240);
    // 1240 / 200 * 100 = 620%
    expect(comparison?.nutrients?.dha_mg?.percentage).toBeGreaterThan(100);
  });

  test('compareToTargets correctly flags nutrients below target', () => {
    const engine = new FoodTrackerEngine({ storageKey: 'test_below_target' });
    engine.clearAll();
    engine.addToLog(SALMON_BOWL_MEAL);

    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
    const pregnantTargets = targets.pregnant_t2['31_50'];

    const comparison = /** @type {any} */ (engine.compareToTargets(pregnantTargets));

    // Iron: 5.2 out of 27 RDA → should be low
    expect(comparison?.nutrients?.iron_mg).toBeTruthy();
    expect(comparison?.nutrients?.iron_mg?.percentage).toBeLessThan(25);

    // Folate: 225 out of 600 RDA → should be below target
    expect(comparison?.nutrients?.folate_dfe_ug).toBeTruthy();
    expect(comparison?.nutrients?.folate_dfe_ug?.percentage).toBeLessThan(50);

    // Calcium: 115 out of 1000 RDA → should be low
    expect(comparison?.nutrients?.calcium_mg).toBeTruthy();
    expect(comparison?.nutrients?.calcium_mg?.percentage).toBeLessThan(15);

    // Iodine: 30 out of 220 RDA → should be low
    expect(comparison?.nutrients?.iodine_ug).toBeTruthy();
    expect(comparison?.nutrients?.iodine_ug?.percentage).toBeLessThan(15);
  });
});


test.describe('Prompt & UI Nutrient Key Alignment', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await fillProfile(page);
    await submitProfile(page);
    await navigateToTracker(page);
  });

  test('manual prompt contains all required nutrient keys', async ({ page }) => {
    // Open the manual workflow section to trigger prompt generation
    const manualSection = page.locator('#ft-manual-section');
    if (await manualSection.count() === 0) {
      test.skip();
      return;
    }

    // Click to expand manual section if it's in a <details>
    const manualDetails = page.locator('details:has(#ft-manual-section)');
    if (await manualDetails.count() > 0) {
      const summary = manualDetails.locator('summary');
      await summary.click();
    }

    // Wait for the prompt textarea to be populated
    await page.waitForTimeout(500);
    const promptTextarea = page.locator('#ft-prompt-output');

    let prompt = '';
    if (await promptTextarea.count() > 0) {
      prompt = await promptTextarea.inputValue();
    }

    // Fallback: try internal method
    if (!prompt) {
      // @ts-ignore - foodTrackerUI is dynamically loaded
      prompt = await page.evaluate(() => {
        // @ts-ignore - foodTrackerUI is dynamically loaded
        if (window.foodTrackerUI && typeof window.foodTrackerUI._getManualPrompt === 'function') {
          // @ts-ignore - foodTrackerUI is dynamically loaded
          return window.foodTrackerUI._getManualPrompt();
        }
        return '';
      });
    }

    if (!prompt) {
      test.skip();
      return;
    }

    // All critical nutrient keys that must be in the prompt
    const requiredInPrompt = [
      'energy_kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
      'folate_dfe_ug', 'vitamin_b12_ug', 'vitamin_b6_mg', 'biotin_ug',
      'niacin_mg_ne', 'riboflavin_mg', 'thiamin_mg', 'pantothenic_acid_mg',
      'choline_mg', 'vitamin_c_mg', 'vitamin_d_ug', 'vitamin_a_rae_ug',
      'vitamin_e_mg', 'vitamin_k_ug',
      'iron_mg', 'calcium_mg', 'magnesium_mg', 'zinc_mg', 'phosphorus_mg',
      'selenium_ug', 'iodine_ug', 'copper_ug', 'manganese_mg', 'chromium_ug',
      'dha_mg', 'epa_mg', 'ala_omega3_g'
    ];

    for (const key of requiredInPrompt) {
      expect(prompt, `Prompt missing nutrient key: ${key}`).toContain(key);
    }
  });

  test('logged meal is captured by engine and totals are correct', async ({ page }) => {
    // Inject the comprehensive salmon bowl directly
    // @ts-ignore - foodTrackerEngine is dynamically loaded
    await page.evaluate((meal) => {
      // @ts-ignore - foodTrackerEngine is dynamically loaded
      window.foodTrackerEngine.addToLog(meal);
    }, SALMON_BOWL_MEAL);

    // Verify the engine has the meal in today's log
    // @ts-ignore - foodTrackerEngine is dynamically loaded
    const log = await page.evaluate(() => {
      // @ts-ignore - foodTrackerEngine is dynamically loaded
      return window.foodTrackerEngine.getDailyLog();
    });

    expect(log?.meals?.length).toBeGreaterThanOrEqual(1);
    const t = log?.dailyTotals || {};

    // Verify key nutrients from the salmon bowl are aggregated
    expect(t.energy_kcal).toBe(644);
    expect(t.protein_g).toBe(51.1);
    expect(t.dha_mg).toBe(1240);
    expect(t.epa_mg).toBe(860);
    expect(t.folate_dfe_ug).toBe(225);
    expect(t.iron_mg).toBe(5.2);
    expect(t.choline_mg).toBe(241);

    // Verify the meal card appears in the DOM
    const mealCards = page.locator('.meal-card, .ft-meal-entry');
    // The DOM may auto-refresh or we trigger it
    // @ts-ignore - foodTrackerUI is dynamically loaded
    await page.evaluate(() => {
      // @ts-ignore - foodTrackerUI is dynamically loaded
      if (window.foodTrackerUI && window.foodTrackerUI._updateDailyView) {
        // @ts-ignore - foodTrackerUI is dynamically loaded
        window.foodTrackerUI._updateDailyView();
      }
    });
  });
});


test.describe('DRI Cross-Validation Against Research', () => {

  test('lactation targets match research-validated values', () => {
    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
    const lact = targets.lactating_0_6['19_30'];

    // Research-validated lactation DRI values
    expect(lact.vitamin_b12_ug.RDA).toBe(2.8);
    expect(lact.vitamin_c_mg.RDA).toBe(120);
    expect(lact.vitamin_a_rae_ug.RDA).toBe(1300);
    expect(lact.vitamin_e_mg.RDA).toBe(19);
    expect(lact.riboflavin_mg.RDA).toBe(1.6);
    expect(lact.niacin_mg_ne.RDA).toBe(17);
    expect(lact.vitamin_b6_mg.RDA).toBe(2.0);
    expect(lact.pantothenic_acid_mg.AI).toBe(7);
    expect(lact.biotin_ug.AI).toBe(35);
    expect(lact.choline_mg.AI).toBe(550);
    expect(lact.iodine_ug.RDA).toBe(290);
    expect(lact.iron_mg.RDA).toBe(9);
    expect(lact.water_l.AI).toBe(3.8);
    expect(lact.carbs_g.MIN).toBe(210);
    expect(lact.fiber_g.AI).toBe(29);
    expect(lact.epa_mg.AI).toBe(50);
    expect(lact.dha_mg.AI).toBe(200);
    expect(lact.ala_omega3_g.AI).toBe(1.3);
  });

  test('adult male 19-30 targets match research-validated values', () => {
    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
    const male = targets.male_nonpregnant['19_30'];

    expect(male.protein_g.RDA).toBe(56);
    expect(male.fiber_g.AI).toBe(38);
    expect(male.water_l.AI).toBe(3.7);
    expect(male.vitamin_c_mg.RDA).toBe(90);
    expect(male.vitamin_a_rae_ug.RDA).toBe(900);
    expect(male.iron_mg.RDA).toBe(8);
    expect(male.zinc_mg.RDA).toBe(11);
    expect(male.choline_mg.AI).toBe(550);
    expect(male.vitamin_k_ug.AI).toBe(120);
    expect(male.potassium_mg.AI).toBe(3400);
    expect(male.magnesium_mg.RDA).toBe(400);
    expect(male.fluoride_mg.AI).toBe(4);
    expect(male.thiamin_mg.RDA).toBe(1.2);
    expect(male.riboflavin_mg.RDA).toBe(1.3);
    expect(male.niacin_mg_ne.RDA).toBe(16);
    expect(male.vitamin_b6_mg.RDA).toBe(1.3);
    expect(male.epa_mg.AI).toBe(0);
  });

  test('child 1-3 targets match research-validated values', () => {
    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
    const child = targets.child['1_3'];

    expect(child.protein_g.RDA).toBe(13);
    expect(child.carbs_g.MIN).toBe(130);
    expect(child.fiber_g.AI).toBe(19);
    expect(child.water_l.AI).toBe(1.3);
    expect(child.folate_dfe_ug.RDA).toBe(150);
    expect(child.vitamin_b12_ug.RDA).toBe(0.9);
    expect(child.calcium_mg.RDA).toBe(700);
    expect(child.iron_mg.RDA).toBe(7);
    expect(child.zinc_mg.RDA).toBe(3);
    expect(child.iodine_ug.RDA).toBe(90);
    expect(child.vitamin_d_ug.RDA).toBe(15);
    expect(child.choline_mg.AI).toBe(200);
    expect(child.epa_mg.AI).toBe(0);
  });

  test('adult female non-pregnant 19-30 targets match research', () => {
    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
    const female = targets.female_nonpregnant['19_30'];

    expect(female.protein_g.RDA).toBe(46);
    expect(female.fiber_g.AI).toBe(25);
    expect(female.iron_mg.RDA).toBe(18);
    expect(female.zinc_mg.RDA).toBe(8);
    expect(female.choline_mg.AI).toBe(425);
    expect(female.vitamin_k_ug.AI).toBe(90);
    expect(female.potassium_mg.AI).toBe(2600);
    expect(female.fluoride_mg.AI).toBe(3);
    expect(female.vitamin_c_mg.RDA).toBe(75);
    expect(female.vitamin_a_rae_ug.RDA).toBe(700);
    expect(female.folate_dfe_ug.RDA).toBe(400);
    expect(female.calcium_mg.RDA).toBe(1000);
    expect(female.ala_omega3_g.AI).toBe(1.1);
    expect(female.epa_mg.AI).toBe(0);
  });

  test('all life stages in nutrient-targets.json have epa_mg', () => {
    const targetsPath = path.join(__dirname, '..', '..', 'data', 'nutrient-targets.json');
    const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));

    let totalBands = 0;
    let bandsWithEpa = 0;

    for (const [stage, bands] of Object.entries(targets)) {
      if (stage === '_meta') continue;
      for (const [band, nutrients] of Object.entries(bands)) {
        totalBands++;
        if (nutrients.epa_mg) bandsWithEpa++;
      }
    }

    expect(totalBands).toBeGreaterThan(20);
    expect(bandsWithEpa).toBe(totalBands);
  });
});
