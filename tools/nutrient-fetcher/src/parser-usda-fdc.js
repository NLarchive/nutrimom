/**
 * Nutrient Fetcher — USDA FoodData Central API Parser
 *
 * Fetches food nutrient profiles from the USDA FDC REST API and normalizes
 * them into the project's nutrient-code format.
 *
 * Requires an API key via env var USDA_FDC_API_KEY.
 * Get a free key: https://fdc.nal.usda.gov/api-guide
 */

'use strict';

const { fetchJson } = require('./fetcher');
const { USDA_NUTRIENT_MAP } = require('./config');

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

/**
 * Fetch detailed nutrient data for a specific food by FDC ID.
 *
 * @param {number} fdcId
 * @param {string} [apiKey]  Defaults to env USDA_FDC_API_KEY
 * @returns {Promise<object>}  Normalized food nutrient profile
 */
async function fetchFood(fdcId, apiKey) {
  const key = apiKey || process.env.USDA_FDC_API_KEY;
  if (!key) {
    throw new Error(
      'USDA FDC API key required — set USDA_FDC_API_KEY env var.\n' +
      'Get a free key at https://fdc.nal.usda.gov/api-guide'
    );
  }

  const url = `${BASE_URL}/food/${fdcId}?api_key=${key}`;
  const data = await fetchJson(url);

  return normalizeFood(data);
}

/**
 * Search for foods by query string.
 *
 * @param {string} query
 * @param {object} [opts]
 * @param {number} [opts.pageSize=5]
 * @param {string} [opts.apiKey]
 * @returns {Promise<Array>}
 */
async function searchFoods(query, opts = {}) {
  const key = opts.apiKey || process.env.USDA_FDC_API_KEY;
  if (!key) {
    throw new Error('USDA FDC API key required — set USDA_FDC_API_KEY env var.');
  }

  const pageSize = opts.pageSize || 5;
  const params = new URLSearchParams({
    query,
    pageSize: String(pageSize),
    api_key: key,
  });

  const url = `${BASE_URL}/foods/search?${params}`;
  const data = await fetchJson(url);

  return (data.foods || []).map(f => ({
    fdcId:       f.fdcId,
    description: f.description,
    dataType:    f.dataType,
    brandOwner:  f.brandOwner || null,
  }));
}

/**
 * Fetch nutrient data for multiple foods (from config defaults or custom list).
 *
 * @param {Array<{query: string, fdcId: number}>} foods
 * @param {string} [apiKey]
 * @returns {Promise<object>}  Snapshot object with _meta and foods
 */
async function fetchMultiple(foods, apiKey) {
  const results = {};
  const errors = [];

  for (const food of foods) {
    try {
      const profile = await fetchFood(food.fdcId, apiKey);
      results[food.fdcId] = {
        query: food.query,
        ...profile,
      };
    } catch (err) {
      errors.push({ fdcId: food.fdcId, query: food.query, error: err.message });
    }
  }

  return {
    _meta: {
      source_id:      'usda-fdc',
      source_url:     BASE_URL,
      fetched_at:     new Date().toISOString(),
      foods_fetched:  Object.keys(results).length,
      foods_failed:   errors.length,
      parser_version: '1.0.0',
    },
    foods: sortObjectKeys(results),
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Normalize a raw USDA FDC API food response into our format.
 */
function normalizeFood(raw) {
  const nutrients = {};

  const rawNutrients = raw.foodNutrients || [];

  for (const fn of rawNutrients) {
    const nutrientNumber = fn.nutrient?.number ? parseInt(fn.nutrient.number, 10) : null;
    const nutrientId     = fn.nutrient?.id || nutrientNumber;
    const code = USDA_NUTRIENT_MAP[nutrientId] || USDA_NUTRIENT_MAP[nutrientNumber];

    if (!code) continue;

    const amount = fn.amount ?? fn.value ?? null;
    if (amount === null || amount === undefined) continue;

    // Keep the one with the highest amount if duplicated (e.g., vitamin A)
    if (nutrients[code] !== undefined && nutrients[code] >= amount) continue;

    nutrients[code] = amount;
  }

  // Sort keys alphabetically
  const sorted = {};
  for (const key of Object.keys(nutrients).sort()) {
    sorted[key] = nutrients[key];
  }

  return {
    fdcId:       raw.fdcId,
    description: raw.description,
    dataType:    raw.dataType,
    servingSize: raw.servingSize || null,
    servingUnit: raw.servingSizeUnit || null,
    nutrients:   sorted,
  };
}

function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  return sorted;
}

module.exports = {
  fetchFood,
  searchFoods,
  fetchMultiple,
  normalizeFood,
};
