// @ts-check
const { test, expect } = require('@playwright/test');
const FoodTrackerEngine = require('../../plugins/food-tracker/food-tracker-engine.js');

test.describe('Manual JSON parsing & aggregation', () => {
  test('Aggregates micronutrients from parsed food_items correctly', async () => {
    const engine = new FoodTrackerEngine({ storageKey: 'test_food_log' });

    // Clear any existing test data
    engine.clearAll();

    const analysis = {
      analysis_id: 'manual_test_1',
      timestamp: new Date().toISOString(),
      confidence_overall: 0.9,
      meal_type: 'snack',
      food_items: [
        {
          name: 'Flour Tortilla (Medium)',
          quantity: 1,
          unit: 'piece',
          estimated_weight_g: 50,
          preparation_method: 'grilled',
          nutrients: {
            energy_kcal: 150,
            protein_g: 4,
            carbs_g: 25,
            fat_g: 4,
            fiber_g: 1.2,
            sugar_g: 0.5,
            sodium_mg: 320,
            saturated_fat_g: 1,
            potassium_mg: 60,
            magnesium_mg: 12
          },
          micronutrients: {
            folate_dfe_ug: 45,
            iron_mg: 1.4,
            calcium_mg: 40,
            vitamin_d_ug: 0,
            dha_mg: 0,
            epa_mg: 0,
            iodine_ug: 0,
            choline_mg: 4,
            vitamin_a_ug: 0,
            vitamin_b12_ug: 0,
            vitamin_b6_mg: 0.05,
            vitamin_c_mg: 0,
            vitamin_e_mg: 0.1,
            vitamin_k_ug: 0.5,
            zinc_mg: 0.3,
            selenium_ug: 8
          }
        },
        {
          name: 'Beef Steak',
          quantity: 1,
          unit: 'serving',
          estimated_weight_g: 80,
          preparation_method: 'grilled',
          nutrients: {
            energy_kcal: 200,
            protein_g: 21,
            carbs_g: 0,
            fat_g: 12,
            fiber_g: 0,
            sugar_g: 0,
            sodium_mg: 55,
            saturated_fat_g: 4.5,
            potassium_mg: 280,
            magnesium_mg: 18
          },
          micronutrients: {
            folate_dfe_ug: 6,
            iron_mg: 2.1,
            calcium_mg: 10,
            vitamin_d_ug: 0.1,
            dha_mg: 0,
            epa_mg: 0,
            iodine_ug: 2,
            choline_mg: 65,
            vitamin_a_ug: 0,
            vitamin_b12_ug: 1.8,
            vitamin_b6_mg: 0.4,
            vitamin_c_mg: 0,
            vitamin_e_mg: 0.2,
            vitamin_k_ug: 1.1,
            zinc_mg: 4.2,
            selenium_ug: 18
          }
        },
        {
          name: 'Pebre (Chilean Salsa)',
          quantity: 3,
          unit: 'tablespoon',
          estimated_weight_g: 45,
          preparation_method: 'raw',
          nutrients: {
            energy_kcal: 25,
            protein_g: 0.5,
            carbs_g: 4,
            fat_g: 1.2,
            fiber_g: 1.1,
            sugar_g: 2.1,
            sodium_mg: 180,
            saturated_fat_g: 0.2,
            potassium_mg: 120,
            magnesium_mg: 8
          },
          micronutrients: {
            folate_dfe_ug: 12,
            iron_mg: 0.3,
            calcium_mg: 15,
            vitamin_d_ug: 0,
            dha_mg: 0,
            epa_mg: 0,
            iodine_ug: 0,
            choline_mg: 3,
            vitamin_a_ug: 45,
            vitamin_b12_ug: 0,
            vitamin_b6_mg: 0.08,
            vitamin_c_mg: 12,
            vitamin_e_mg: 0.4,
            vitamin_k_ug: 6,
            zinc_mg: 0.1,
            selenium_ug: 0.2
          }
        }
      ],
      totals: {
        energy_kcal: 375,
        protein_g: 25.5,
        carbs_g: 29,
        fat_g: 17.2,
        fiber_g: 2.3,
        folate_dfe_ug: 63,
        iron_mg: 3.8,
        calcium_mg: 65,
        vitamin_b12_ug: 1.8,
        dha_mg: 0
      },
      warnings: [],
      pregnancy_relevant_notes: []
    };

    /** @type {any} */
    const entry = engine.addToLog(analysis);

    /** @type {any} */
    const day = engine.getDailyLog();
    expect(day.dailyTotals.energy_kcal).toBe(375);
    expect(day.dailyTotals.protein_g).toBe(25.5);

    // The meal entry should have computed totals that include micronutrients
    expect(entry.totals.folate_dfe_ug).toBeGreaterThan(0);
    expect(entry.totals.iron_mg).toBeGreaterThan(0);
    expect(entry.totals.choline_mg).toBeGreaterThan(0);
    expect(entry.totals.vitamin_b12_ug).toBeGreaterThan(0);

    // Daily totals should also reflect those micronutrients after recalculation
    expect(day.dailyTotals.folate_dfe_ug).toBeGreaterThan(0);
    expect(day.dailyTotals.iron_mg).toBeGreaterThan(0);
    expect(day.dailyTotals.choline_mg).toBeGreaterThan(0);
    expect(day.dailyTotals.vitamin_b12_ug).toBeGreaterThan(0);
  });
});