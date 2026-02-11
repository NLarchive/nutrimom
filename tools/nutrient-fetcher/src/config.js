/**
 * Nutrient Fetcher — Source Configuration
 *
 * Defines all authoritative sources, nutrient-code mappings, and output paths.
 */

'use strict';

const path = require('node:path');

// ── Paths ────────────────────────────────────────────────────────────────────
const PROJECT_ROOT   = path.resolve(__dirname, '..', '..', '..');
const DATA_DIR       = path.join(PROJECT_ROOT, 'data');
const REFERENCE_DIR  = path.join(DATA_DIR, 'reference');
const SNAPSHOTS_DIR  = path.join(REFERENCE_DIR, 'snapshots');
const PROJECT_TARGETS_FILE = path.join(DATA_DIR, 'nutrient-targets.json');

// ── Source definitions ───────────────────────────────────────────────────────
const SOURCES = {
  // ─── 1. Core nutrient targets (RDA/AI/UL) all life stages ────────────────

  'ncbi-dri-elements': {
    id:          'ncbi-dri-elements',
    name:        'National Academies DRI – RDA/AI Elements (2019, includes Na/K)',
    url:         'https://www.ncbi.nlm.nih.gov/books/NBK545442/table/appJ_tab3/?report=objectonly',
    parser:      'ncbi-dri',
    type:        'nutrient-targets',
    schedule:    'quarterly',
    description: 'RDA/AI for Ca, Cr, Cu, F, I, Fe, Mg, Mn, Mo, P, Se, Zn, K, Na, Cl — all life stages',
    tableKind:   'rda',
  },
  'ncbi-dri-vitamins': {
    id:          'ncbi-dri-vitamins',
    name:        'National Academies DRI – RDA/AI Vitamins',
    url:         'https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t2/?report=objectonly',
    parser:      'ncbi-dri',
    type:        'nutrient-targets',
    schedule:    'quarterly',
    description: 'RDA/AI for Vit A, C, D, E, K, thiamin, riboflavin, niacin, B6, folate, B12, pantothenic acid, biotin, choline — all life stages',
    tableKind:   'rda',
  },
  'ncbi-dri-macros': {
    id:          'ncbi-dri-macros',
    name:        'National Academies DRI – RDA/AI Macronutrients',
    url:         'https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t4/?report=objectonly',
    parser:      'ncbi-dri',
    type:        'nutrient-targets',
    schedule:    'quarterly',
    description: 'RDA/AI for carbs, fiber, fat (linoleic, ALA), protein, water — all life stages',
    tableKind:   'rda',
  },
  'ncbi-dri-ul-elements': {
    id:          'ncbi-dri-ul-elements',
    name:        'National Academies DRI – UL Elements',
    url:         'https://www.ncbi.nlm.nih.gov/books/NBK545442/table/appJ_tab9/?report=objectonly',
    parser:      'ncbi-dri',
    type:        'nutrient-targets',
    schedule:    'quarterly',
    description: 'Tolerable Upper Intake Levels for minerals — all life stages',
    tableKind:   'ul',
  },
  'ncbi-dri-ul-vitamins': {
    id:          'ncbi-dri-ul-vitamins',
    name:        'National Academies DRI – UL Vitamins',
    url:         'https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t7/?report=objectonly',
    parser:      'ncbi-dri',
    type:        'nutrient-targets',
    schedule:    'quarterly',
    description: 'Tolerable Upper Intake Levels for vitamins — all life stages',
    tableKind:   'ul',
  },

  // ─── Pregnancy-specific (existing) ───────────────────────────────────────

  'nih-ods-pregnancy': {
    id:          'nih-ods-pregnancy',
    name:        'NIH ODS – Pregnancy (Health Professional)',
    url:         'https://ods.od.nih.gov/factsheets/Pregnancy-HealthProfessional/',
    parser:      'nih-ods',
    type:        'nutrient-targets',
    schedule:    'monthly',
    description: 'RDA, AI, UL for 30+ micronutrients during pregnancy (Table 1 & 2)',
  },

  // ─── Food composition ────────────────────────────────────────────────────

  'usda-fdc': {
    id:          'usda-fdc',
    name:        'USDA FoodData Central',
    url:         'https://api.nal.usda.gov/fdc/v1',
    parser:      'usda-fdc',
    type:        'food-composition',
    schedule:    'quarterly',
    description: 'Food nutrient composition via REST API',
    apiKeyEnv:   'USDA_FDC_API_KEY',
    defaultFoods: [
      { query: 'salmon atlantic raw',   fdcId: 175167 },
      { query: 'spinach raw',           fdcId: 168462 },
      { query: 'egg whole raw',         fdcId: 171287 },
      { query: 'lentils cooked boiled', fdcId: 172421 },
      { query: 'milk whole',            fdcId: 171265 },
    ],
  },

  // ─── Manual / PDF / dataset sources (no automated parser) ────────────────

  'efsa-drvs': {
    id:          'efsa-drvs',
    name:        'EFSA Dietary Reference Values Summary (2017)',
    url:         'https://www.efsa.europa.eu/sites/default/files/2017_09_DRVs_summary_report.pdf',
    parser:      null,
    type:        'nutrient-targets',
    schedule:    'yearly',
    description: 'EU DRV summary tables (PDF – manual extraction required)',
    automated:   false,
  },
  'who-fao-vitamins': {
    id:          'who-fao-vitamins',
    name:        'WHO/FAO – Vitamin & Mineral Requirements in Human Nutrition (2nd ed.)',
    url:         'https://hftag.org/content/user_files/2023/06/FAO_WHO-2004-Vitamin-and-mineral-requirements-in-human-nutrition.pdf',
    parser:      null,
    type:        'nutrient-targets',
    schedule:    'yearly',
    description: 'Global population nutrient intake requirements (PDF – manual extraction)',
    automated:   false,
  },
  'ciqual-anses': {
    id:          'ciqual-anses',
    name:        'CIQUAL Food Composition Table 2020 (ANSES, France)',
    url:         'https://zenodo.org/records/4770600',
    parser:      null,
    type:        'food-composition',
    schedule:    'yearly',
    description: '3 185 foods × 67 components (XLS/XML download from Zenodo)',
    automated:   false,
  },
  'health-canada-cnf': {
    id:          'health-canada-cnf',
    name:        'Health Canada – Canadian Nutrient File (CNF)',
    url:         'https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data.html',
    parser:      null,
    type:        'food-composition',
    schedule:    'yearly',
    description: 'Official Canadian food composition database (web app – manual search)',
    automated:   false,
  },
};

// ── NIH ODS nutrient-name → project nutrient-code mapping ────────────────────
const NIH_NUTRIENT_MAP = {
  'biotin':                          'biotin_ug',
  'calcium':                         'calcium_mg',
  'chloride':                        'chloride_mg',
  'choline':                         'choline_mg',
  'chromium':                        'chromium_ug',
  'copper':                          'copper_ug',
  'fluoride':                        'fluoride_mg',
  'folate':                          'folate_dfe_ug',
  'iodine':                          'iodine_ug',
  'iron':                            'iron_mg',
  'magnesium':                       'magnesium_mg',
  'manganese':                       'manganese_mg',
  'molybdenum':                      'molybdenum_ug',
  'niacin':                          'niacin_mg_ne',
  'omega-3 fatty acids':             'ala_omega3_g',
  'omega-3 fatty acids (ala only)':  'ala_omega3_g',
  'omega-3 fatty acids (ala)':       'ala_omega3_g',
  'pantothenic acid':                'pantothenic_acid_mg',
  'phosphorus':                      'phosphorus_mg',
  'potassium':                       'potassium_mg',
  'riboflavin':                      'riboflavin_mg',
  'selenium':                        'selenium_ug',
  'sodium':                          'sodium_mg',
  'thiamin':                         'thiamin_mg',
  'vitamin a':                       'vitamin_a_rae_ug',
  'vitamin b12':                     'vitamin_b12_ug',
  'vitamin b6':                      'vitamin_b6_mg',
  'vitamin c':                       'vitamin_c_mg',
  'vitamin d':                       'vitamin_d_ug',
  'vitamin e':                       'vitamin_e_mg',
  'vitamin k':                       'vitamin_k_ug',
  'zinc':                            'zinc_mg',
  'boron':                           'boron_mg',
};

// ── USDA FDC nutrient-number → project nutrient-code mapping ─────────────────
const USDA_NUTRIENT_MAP = {
  1003: 'protein_g',
  1004: 'fat_g',
  1005: 'carbs_g',
  1008: 'energy_kcal',
  1079: 'fiber_g',
  1087: 'calcium_mg',
  1089: 'iron_mg',
  1090: 'magnesium_mg',
  1091: 'phosphorus_mg',
  1092: 'potassium_mg',
  1093: 'sodium_mg',
  1095: 'zinc_mg',
  1098: 'copper_ug',
  1101: 'manganese_mg',
  1103: 'selenium_ug',
  1104: 'vitamin_a_rae_ug',
  1106: 'vitamin_a_rae_ug',  // retinol
  1109: 'vitamin_e_mg',
  1114: 'vitamin_d_ug',
  1162: 'vitamin_c_mg',
  1165: 'thiamin_mg',
  1166: 'riboflavin_mg',
  1167: 'niacin_mg_ne',
  1170: 'vitamin_b6_mg',
  1177: 'folate_dfe_ug',
  1178: 'vitamin_b12_ug',
  1180: 'choline_mg',
  1185: 'vitamin_k_ug',
  1100: 'iodine_ug',
  1096: 'chromium_ug',
  1102: 'molybdenum_ug',
  1099: 'fluoride_mg',
  1186: 'biotin_ug',
  1170: 'vitamin_b6_mg',
};

// ── NCBI DRI table column definitions (fixed column order per table) ─────────
// Each entry maps a 0-based column index to a project nutrient code.
// `convertToMg` means the table value is in grams and must be multiplied by 1000.
const NCBI_TABLE_COLUMNS = {
  'ncbi-dri-vitamins': [
    { code: 'vitamin_a_rae_ug' },
    { code: 'vitamin_c_mg' },
    { code: 'vitamin_d_ug' },
    { code: 'vitamin_e_mg' },
    { code: 'vitamin_k_ug' },
    { code: 'thiamin_mg' },
    { code: 'riboflavin_mg' },
    { code: 'niacin_mg_ne' },
    { code: 'vitamin_b6_mg' },
    { code: 'folate_dfe_ug' },
    { code: 'vitamin_b12_ug' },
    { code: 'pantothenic_acid_mg' },
    { code: 'biotin_ug' },
    { code: 'choline_mg' },
  ],
  'ncbi-dri-elements': [
    { code: 'calcium_mg' },
    { code: 'chromium_ug' },
    { code: 'copper_ug' },
    { code: 'fluoride_mg' },
    { code: 'iodine_ug' },
    { code: 'iron_mg' },
    { code: 'magnesium_mg' },
    { code: 'manganese_mg' },
    { code: 'molybdenum_ug' },
    { code: 'phosphorus_mg' },
    { code: 'selenium_ug' },
    { code: 'zinc_mg' },
    { code: 'potassium_mg' },
    { code: 'sodium_mg' },
    { code: 'chloride_mg', convertToMg: true },   // table uses g/d
  ],
  'ncbi-dri-macros': [
    { code: 'water_l' },
    { code: 'carbs_g' },
    { code: 'fiber_g' },
    { code: 'fat_g' },               // total fat (AI for infants only)
    { code: 'linoleic_acid_g' },      // not in project 37, captured for reference
    { code: 'ala_omega3_g' },
    { code: 'protein_g' },
  ],
  'ncbi-dri-ul-vitamins': [
    { code: 'vitamin_a_rae_ug' },     // preformed only
    { code: 'vitamin_c_mg' },
    { code: 'vitamin_d_ug' },
    { code: 'vitamin_e_mg' },         // supplemental α-tocopherol
    { code: null },                   // vitamin K — no UL established
    { code: null },                   // thiamin — no UL established
    { code: null },                   // riboflavin — no UL established
    { code: 'niacin_mg_ne' },
    { code: 'vitamin_b6_mg' },
    { code: 'folate_dfe_ug' },        // synthetic forms only
    { code: null },                   // vitamin B12 — no UL established
    { code: null },                   // pantothenic acid — no UL established
    { code: null },                   // biotin — no UL established
    { code: 'choline_mg', convertToMg: true },  // table uses g/d
    { code: null },                   // carotenoids — no UL established
  ],
  'ncbi-dri-ul-elements': [
    { code: null },                   // arsenic — no UL
    { code: 'boron_mg' },
    { code: 'calcium_mg' },
    { code: null },                   // chromium — no UL
    { code: 'copper_ug' },
    { code: 'fluoride_mg' },
    { code: 'iodine_ug' },
    { code: 'iron_mg' },
    { code: 'magnesium_mg' },         // pharmacological agent only
    { code: 'manganese_mg' },
    { code: 'molybdenum_ug' },
    { code: 'nickel_mg' },            // not in project 37
    { code: 'phosphorus_mg', convertToMg: true }, // table uses g/d
    { code: null },                   // potassium — no UL
    { code: 'selenium_ug' },
    { code: null },                   // silicon — no UL
    { code: null },                   // sulfate — no UL
    { code: 'vanadium_mg' },          // adults only, not in project 37
    { code: 'zinc_mg' },
    { code: null },                   // sodium — no UL (has CDRR)
    { code: 'chloride_mg', convertToMg: true },  // table uses g/d
  ],
};

// ── NCBI DRI life-stage group → project life-stage mapping ───────────────────
// NCBI group headers map to one or more project life-stage keys.
// Pregnancy/Lactation in NCBI aren't trimester/period-specific, so we fan out.
const NCBI_LIFE_STAGE_MAP = {
  'Infants':   [{ stage: 'infant' }],
  'Children':  [{ stage: 'child' }],
  'Males':     [{ stage: 'male_nonpregnant' }],
  'Females':   [{ stage: 'female_nonpregnant' }],
  'Pregnancy': [
    { stage: 'pregnant_t1' },
    { stage: 'pregnant_t2' },
    { stage: 'pregnant_t3' },
  ],
  'Lactation': [
    { stage: 'lactating_0_6' },
    { stage: 'lactating_7_12' },
  ],
};

// ── NCBI age-band text → project age-band code mapping ──────────────────────
const NCBI_AGE_BAND_MAP = {
  '0–6 mo':   '0_6',
  '0-6 mo':   '0_6',
  '6–12 mo':  '6_12',
  '6-12 mo':  '6_12',
  '7–12 mo':  '7_12',
  '7-12 mo':  '7_12',
  '1–3 y':    '1_3',
  '1-3 y':    '1_3',
  '4–8 y':    '4_8',
  '4-8 y':    '4_8',
  '9–13 y':   '9_13',
  '9-13 y':   '9_13',
  '14–18 y':  '14_18',
  '14-18 y':  '14_18',
  '14–18':    '14_18',
  '14-18':    '14_18',
  '19–30 y':  '19_30',
  '19-30 y':  '19_30',
  '31–50 y':  '31_50',
  '31-50 y':  '31_50',
  '31−50 y':  '31_50',   // minus sign variant
  '51–70 y':  '51_70',
  '51-70 y':  '51_70',
  '> 70 y':   '71_plus',
  '>70 y':    '71_plus',
};

// ── Project age-band collapsing (NCBI splits 51+ into 51–70 and >70) ────────
// For life stages that only have a single "51_plus" band, pick the conservative
// value (lower for RDA/AI = 51–70, higher for UL = max of both).
const NCBI_AGE_COLLAPSE = {
  '51_70':   '51_plus',
  '71_plus': '51_plus',
};

module.exports = {
  PROJECT_ROOT,
  DATA_DIR,
  REFERENCE_DIR,
  SNAPSHOTS_DIR,
  PROJECT_TARGETS_FILE,
  SOURCES,
  NIH_NUTRIENT_MAP,
  USDA_NUTRIENT_MAP,
  NCBI_TABLE_COLUMNS,
  NCBI_LIFE_STAGE_MAP,
  NCBI_AGE_BAND_MAP,
  NCBI_AGE_COLLAPSE,
};
