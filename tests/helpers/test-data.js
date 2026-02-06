/**
 * Shared test data and utility functions for NutriMom Playwright tests
 * 
 * @author Nicolas Ivan Larenas Bustamante
 * @license CC-BY-NC-SA-4.0
 */

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Selectors (specific to avoid ambiguity with multiple .nav-tab)
// ─────────────────────────────────────────────────────────────────────────────

const NAV = {
  calculatorTab: 'nav.main-nav button[data-target="calculator-view"]',
  trackerTab: 'nav.main-nav button[data-target="tracker-view"]',
  logo: 'a.logo',
};

// ─────────────────────────────────────────────────────────────────────────────
// Valid Meal JSON Responses (for manual workflow testing)
// ─────────────────────────────────────────────────────────────────────────────

const VALID_MEAL_CHICKEN = {
  analysis_id: 'test_chicken_123',
  timestamp: new Date().toISOString(),
  confidence_overall: 0.9,
  meal_type: 'lunch',
  food_items: [{
    name: 'Grilled Chicken Breast',
    quantity: 1,
    unit: 'piece',
    estimated_weight_g: 150,
    confidence: 0.9,
    preparation_method: 'grilled',
    nutrients: {
      energy_kcal: 231,
      protein_g: 43.5,
      carbs_g: 0,
      fat_g: 5,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 74,
      saturated_fat_g: 1.4
    },
    micronutrients: {
      vitamin_a_ug: 6,
      vitamin_c_mg: 0,
      vitamin_d_ug: 0.1,
      folate_ug: 4,
      iron_mg: 0.9,
      calcium_mg: 15,
      zinc_mg: 0.9,
      omega3_mg: 62
    }
  }],
  totals: {
    energy_kcal: 231,
    protein_g: 43.5,
    carbs_g: 0,
    fat_g: 5,
    fiber_g: 0,
    sodium_mg: 74
  },
  warnings: [],
  pregnancy_relevant_notes: ['Excellent lean protein source for pregnancy']
};

const VALID_MEAL_PASTA = {
  analysis_id: 'test_pasta_456',
  timestamp: new Date().toISOString(),
  confidence_overall: 0.85,
  meal_type: 'dinner',
  food_items: [{
    name: 'Spaghetti Carbonara',
    quantity: 1,
    unit: 'serving',
    estimated_weight_g: 280,
    nutrients: {
      energy_kcal: 520,
      protein_g: 18,
      carbs_g: 58,
      fat_g: 22,
      fiber_g: 3,
      sugar_g: 2,
      sodium_mg: 890,
      saturated_fat_g: 8
    },
    micronutrients: {
      vitamin_a_ug: 120,
      vitamin_c_mg: 2,
      vitamin_d_ug: 0.5,
      folate_ug: 85,
      iron_mg: 1.8,
      calcium_mg: 95,
      zinc_mg: 1.2,
      omega3_mg: 15
    }
  }],
  totals: {
    energy_kcal: 520,
    protein_g: 18,
    carbs_g: 58,
    fat_g: 22,
    fiber_g: 3,
    sodium_mg: 890
  },
  warnings: ['High sodium content'],
  pregnancy_relevant_notes: []
};

const VALID_MEAL_AVOCADO = {
  analysis_id: 'test_avocado_789',
  timestamp: new Date().toISOString(),
  confidence_overall: 0.88,
  meal_type: 'breakfast',
  food_items: [{
    name: 'Avocado Toast',
    quantity: 2,
    unit: 'slice',
    estimated_weight_g: 180,
    nutrients: {
      energy_kcal: 290,
      protein_g: 8,
      carbs_g: 28,
      fat_g: 18,
      fiber_g: 12,
      sugar_g: 3,
      sodium_mg: 320,
      saturated_fat_g: 3
    },
    micronutrients: {
      vitamin_a_ug: 15,
      vitamin_c_mg: 12,
      vitamin_d_ug: 0,
      folate_ug: 110,
      iron_mg: 1.2,
      calcium_mg: 30,
      zinc_mg: 0.8,
      omega3_mg: 50
    }
  }],
  totals: {
    energy_kcal: 290,
    protein_g: 8,
    carbs_g: 28,
    fat_g: 18,
    fiber_g: 12,
    sodium_mg: 320
  },
  warnings: [],
  pregnancy_relevant_notes: ['Good source of folate and healthy fats']
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wait for the app to fully load and initialize
 */
async function waitForAppLoad(page) {
  // Wait for form to be in the DOM
  await page.waitForSelector('#profile-form', { timeout: 15000 });
  // Wait for food tracker plugin to initialize (element exists in DOM, but may be hidden in tracker view)
  await page.waitForSelector('#food-tracker-container .food-tracker', { state: 'attached', timeout: 15000 });
}

/**
 * Navigate to the Food Tracker view and wait for it to be ready
 */
async function navigateToTracker(page) {
  await page.click(NAV.trackerTab);
  // Wait for the tracker header to be visible (proves the view switched and content is rendered)
  await page.waitForSelector('.tracker-header h2', { state: 'visible', timeout: 10000 });
}

/**
 * Fill a standard non-pregnant female profile
 */
async function fillProfile(page, opts = {}) {
  const age = opts.age || '28';
  const weight = opts.weight || '65';
  const height = opts.height || '165';
  const activity = opts.activity || 'lightly_active';

  await page.fill('#age', age);
  // Sex is now pre-fixed to "female" and hidden in the UI
  await page.fill('#weight', weight);
  await page.fill('#height', height);
  await page.selectOption('#activity', activity);
}

/**
 * Fill a pregnant female profile and submit
 */
async function fillPregnantProfile(page, week = '24') {
  await fillProfile(page);
  await page.waitForSelector('#pregnancy-section', { state: 'visible' });
  await page.locator('.toggle-option:has(input[value="pregnant"])').click();
  await page.waitForSelector('#pregnancy-fields', { state: 'visible' });
  await page.fill('#pregnancy-week', week);
}

/**
 * Submit the profile form and wait for results
 */
async function submitProfile(page) {
  await page.click('button[type="submit"]');
  await page.waitForSelector('#results-section', { state: 'visible' });
}

/**
 * Add a meal via manual workflow (paste JSON and parse)
 */
async function addMealViaManualWorkflow(page, mealData) {
  const json = typeof mealData === 'string' ? mealData : JSON.stringify(mealData);
  await page.fill('#ft-llm-response', json);
  await page.click('#ft-parse-response');
  await page.waitForSelector('#ft-results', { state: 'visible' });
}

module.exports = {
  NAV,
  VALID_MEAL_CHICKEN,
  VALID_MEAL_PASTA,
  VALID_MEAL_AVOCADO,
  waitForAppLoad,
  navigateToTracker,
  fillProfile,
  fillPregnantProfile,
  submitProfile,
  addMealViaManualWorkflow
};
