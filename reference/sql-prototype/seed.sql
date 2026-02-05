-- Seed data: nutrients, life stages, age bands, week mapping, and baseline targets.
-- Notes:
-- - Targets are intended as starting defaults (not medical advice).
-- - Many micronutrient recommendations do not change by pregnancy week; weeks map to trimester.
-- - Energy needs are user-specific; we store trimester *increment* values as a separate nutrient.

BEGIN;

-- ---------- Life stages ----------
INSERT OR IGNORE INTO life_stage(code, name) VALUES
  ('female_nonpregnant', 'Female (non-pregnant)'),
  ('pregnant_t1', 'Pregnancy - Trimester 1 (Weeks 1-13)'),
  ('pregnant_t2', 'Pregnancy - Trimester 2 (Weeks 14-27)'),
  ('pregnant_t3', 'Pregnancy - Trimester 3 (Weeks 28-42)');

-- ---------- Age bands (app-facing) ----------
INSERT OR IGNORE INTO age_band(code, label, age_min_years, age_max_years) VALUES
  ('14_18', '14–18', 14, 18.999),
  ('19_30', '19–30', 19, 30.999),
  ('31_50', '31–50', 31, 50.999),
  ('51_plus', '51+', 51, NULL);

-- ---------- Nutrients (variables) ----------
INSERT OR IGNORE INTO nutrient(code, name, category, default_unit, sort_order) VALUES
  -- Macros / core tracking
  ('energy_kcal', 'Energy', 'macro', 'kcal', 10),
  ('energy_increment_kcal', 'Energy increment (pregnancy)', 'macro', 'kcal', 11),
  ('protein_g', 'Protein', 'macro', 'g', 20),
  ('carbs_g', 'Carbohydrate', 'macro', 'g', 30),
  ('fat_g', 'Total fat', 'macro', 'g', 40),
  ('fiber_g', 'Dietary fiber', 'macro', 'g', 50),
  ('water_l', 'Total water (all beverages + foods)', 'macro', 'L', 60),
  ('ala_omega3_g', 'Omega-3 (ALA)', 'macro', 'g', 70),
  ('dha_mg', 'DHA (omega-3)', 'macro', 'mg', 71),

  -- Minerals
  ('calcium_mg', 'Calcium', 'micro', 'mg', 110),
  ('iron_mg', 'Iron', 'micro', 'mg', 120),
  ('magnesium_mg', 'Magnesium', 'micro', 'mg', 130),
  ('phosphorus_mg', 'Phosphorus', 'micro', 'mg', 135),
  ('zinc_mg', 'Zinc', 'micro', 'mg', 140),
  ('iodine_ug', 'Iodine', 'micro', 'ug', 150),
  ('selenium_ug', 'Selenium', 'micro', 'ug', 160),
  ('copper_ug', 'Copper', 'micro', 'ug', 170),
  ('manganese_mg', 'Manganese', 'micro', 'mg', 180),
  ('chromium_ug', 'Chromium', 'micro', 'ug', 190),
  ('molybdenum_ug', 'Molybdenum', 'micro', 'ug', 200),
  ('potassium_mg', 'Potassium', 'micro', 'mg', 210),
  ('sodium_mg', 'Sodium', 'limit', 'mg', 220),
  ('chloride_mg', 'Chloride', 'micro', 'mg', 225),
  ('fluoride_mg', 'Fluoride', 'micro', 'mg', 226),

  -- Vitamins
  ('folate_dfe_ug', 'Folate (DFE)', 'micro', 'ug', 310),
  ('vitamin_a_rae_ug', 'Vitamin A (RAE)', 'micro', 'ug', 320),
  ('vitamin_c_mg', 'Vitamin C', 'micro', 'mg', 330),
  ('vitamin_d_ug', 'Vitamin D', 'micro', 'ug', 340),
  ('vitamin_e_mg', 'Vitamin E (alpha-tocopherol)', 'micro', 'mg', 350),
  ('vitamin_k_ug', 'Vitamin K', 'micro', 'ug', 360),
  ('thiamin_mg', 'Thiamin (B1)', 'micro', 'mg', 370),
  ('riboflavin_mg', 'Riboflavin (B2)', 'micro', 'mg', 380),
  ('niacin_mg_ne', 'Niacin (NE)', 'micro', 'mg', 390),
  ('vitamin_b6_mg', 'Vitamin B6', 'micro', 'mg', 400),
  ('vitamin_b12_ug', 'Vitamin B12', 'micro', 'ug', 410),
  ('choline_mg', 'Choline', 'micro', 'mg', 420),
  ('pantothenic_acid_mg', 'Pantothenic acid (B5)', 'micro', 'mg', 430),
  ('biotin_ug', 'Biotin (B7)', 'micro', 'ug', 440);

-- ---------- Pregnancy week mapping (1..42) ----------
WITH RECURSIVE w(week) AS (
  SELECT 1
  UNION ALL
  SELECT week + 1 FROM w WHERE week < 42
)
INSERT OR REPLACE INTO pregnancy_week(week_number, trimester, day_start, day_end, life_stage_id, label)
SELECT
  w.week,
  CASE
    WHEN w.week BETWEEN 1 AND 13 THEN 1
    WHEN w.week BETWEEN 14 AND 27 THEN 2
    ELSE 3
  END AS trimester,
  ((w.week - 1) * 7) + 1 AS day_start,
  (w.week * 7) AS day_end,
  (SELECT life_stage_id FROM life_stage WHERE code =
    CASE
      WHEN w.week BETWEEN 1 AND 13 THEN 'pregnant_t1'
      WHEN w.week BETWEEN 14 AND 27 THEN 'pregnant_t2'
      ELSE 'pregnant_t3'
    END
  ) AS life_stage_id,
  'Week ' || w.week || ' (T' ||
    (CASE
      WHEN w.week BETWEEN 1 AND 13 THEN 1
      WHEN w.week BETWEEN 14 AND 27 THEN 2
      ELSE 3
    END)
  || ')' AS label
FROM w;

-- ---------- Helper CTEs ----------
-- Targets are based on standard Dietary Reference Intakes (DRIs) commonly used in nutrition planning.
-- Store the reference in the source field for transparency.

-- Energy increment by trimester (kcal/day over nonpregnant baseline; baseline EER is user-specific).
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, basis, notes, source)
SELECT
  (SELECT nutrient_id FROM nutrient WHERE code='energy_increment_kcal'),
  ls.life_stage_id,
  ab.age_band_id,
  'AI',
  CASE ls.code WHEN 'female_nonpregnant' THEN 0 WHEN 'pregnant_t1' THEN 0 WHEN 'pregnant_t2' THEN 340 WHEN 'pregnant_t3' THEN 452 END,
  'kcal',
  'per_day',
  'Increment over nonpregnant baseline energy needs; baseline energy should be calculated from age/height/weight/activity.',
  'IOM/DRI (general trimester increments)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Protein (g/day)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, basis, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='protein_g'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE ls.code WHEN 'female_nonpregnant' THEN 46 ELSE 71 END,
       'g','per_day',
       'RDA; may need adjustment based on body size and clinical guidance.',
       'IOM/DRI (protein RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3')
  AND ab.code IN ('14_18','19_30','31_50','51_plus');

-- Carbohydrate (minimum g/day)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, basis, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='carbs_g'), ls.life_stage_id, ab.age_band_id,
       'MIN',
       CASE ls.code WHEN 'female_nonpregnant' THEN 130 ELSE 175 END,
       'g','per_day',
       'Minimum; total carbs depend on energy needs. Prefer high-fiber carbs.',
       'IOM/DRI (carbohydrate minimum)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3')
  AND ab.code IN ('14_18','19_30','31_50','51_plus');

-- Fat (AMDR % energy)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, basis, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='fat_g'), ls.life_stage_id, ab.age_band_id,
       tt.target_type, tt.value, '%', 'percent_energy',
       'Acceptable Macronutrient Distribution Range (AMDR).',
       'IOM/DRI (AMDR)'
FROM life_stage ls
JOIN age_band ab
JOIN (
  SELECT 'AMDR_MIN' AS target_type, 20 AS value
  UNION ALL
  SELECT 'AMDR_MAX', 35
) tt
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3')
  AND ab.code IN ('14_18','19_30','31_50','51_plus');

-- Fiber (AI g/day)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, basis, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='fiber_g'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 26
         WHEN ls.code='female_nonpregnant' AND ab.code IN ('19_30','31_50') THEN 25
         WHEN ls.code='female_nonpregnant' AND ab.code='51_plus' THEN 21
         ELSE 28
       END,
       'g','per_day',
       'Adequate Intake (AI). Increase gradually with fluids if currently low.',
       'IOM/DRI (fiber AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3')
  AND ab.code IN ('14_18','19_30','31_50','51_plus');

-- Water (AI L/day)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, basis, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='water_l'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 2.3
         WHEN ls.code='female_nonpregnant' AND ab.code IN ('19_30','31_50','51_plus') THEN 2.7
         ELSE 3.0
       END,
       'L','per_day',
       'Total water from foods + beverages.',
       'IOM/DRI (total water AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3')
  AND ab.code IN ('14_18','19_30','31_50','51_plus');

-- Omega-3 (ALA AI g/day)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, basis, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='ala_omega3_g'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE ls.code WHEN 'female_nonpregnant' THEN 1.1 ELSE 1.4 END,
       'g','per_day',
       'AI for ALA (plant omega-3).',
       'IOM/DRI (ALA AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3')
  AND ab.code IN ('14_18','19_30','31_50','51_plus');

-- DHA (AI mg/day) – guideline-style target for pregnancy planning.
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, basis, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='dha_mg'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE ls.code WHEN 'female_nonpregnant' THEN 0 ELSE 200 END,
       'mg','per_day',
       'Practical planning target often used for pregnancy (not an official RDA).',
       'Common prenatal nutrition guidelines (DHA planning target)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3')
  AND ab.code IN ('14_18','19_30','31_50','51_plus');

-- ---------- Micronutrients (RDA/AI; mostly trimester-invariant) ----------

-- Folate (DFE)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='folate_dfe_ug'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE ls.code WHEN 'female_nonpregnant' THEN 400 ELSE 600 END,
       'ug',
       'DFE = dietary folate equivalents. Prenatal folic acid supplementation may be provider-directed.',
       'IOM/DRI (folate RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Iron
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='iron_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 15
         WHEN ls.code='female_nonpregnant' AND ab.code IN ('19_30','31_50') THEN 18
         WHEN ls.code='female_nonpregnant' AND ab.code='51_plus' THEN 8
         ELSE 27
       END,
       'mg',
       'Iron needs are commonly higher in pregnancy; supplementation is often provider-directed.',
       'IOM/DRI (iron RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Iodine
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='iodine_ug'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE ls.code WHEN 'female_nonpregnant' THEN 150 ELSE 220 END,
       'ug',
       'Common prenatal target; consider iodized salt and provider guidance.',
       'IOM/DRI (iodine RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Calcium
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='calcium_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ab.code='14_18' THEN 1300
         WHEN ab.code IN ('19_30','31_50') THEN 1000
         ELSE 1200
       END,
       'mg',
       'Calcium RDA depends mostly on age; pregnancy does not increase RDA but needs to be met consistently.',
       'IOM/DRI (calcium RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin D
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_d_ug'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       15,
       'ug',
       '15 ug = 600 IU. Individual needs may differ based on labs and sun exposure.',
       'IOM/DRI (vitamin D RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin B12
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_b12_ug'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE ls.code WHEN 'female_nonpregnant' THEN 2.4 ELSE 2.6 END,
       'ug',
       'Important for vegans/vegetarians; may require fortified foods or supplements.',
       'IOM/DRI (B12 RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Choline
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='choline_mg'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 400
         WHEN ls.code='female_nonpregnant' THEN 425
         WHEN ls.code<>'female_nonpregnant' AND ab.code='14_18' THEN 450
         ELSE 450
       END,
       'mg',
       'AI; commonly under-consumed. Eggs and meats are major sources; consider provider guidance.',
       'IOM/DRI (choline AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Zinc
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='zinc_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' THEN 8
         WHEN ab.code='14_18' THEN 12
         ELSE 11
       END,
       'mg',
       'RDA differs by age; pregnancy increases needs.',
       'IOM/DRI (zinc RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Magnesium
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='magnesium_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 360
         WHEN ls.code='female_nonpregnant' AND ab.code='19_30' THEN 310
         WHEN ls.code='female_nonpregnant' AND ab.code IN ('31_50','51_plus') THEN 320
         WHEN ls.code<>'female_nonpregnant' AND ab.code='14_18' THEN 400
         WHEN ls.code<>'female_nonpregnant' AND ab.code='19_30' THEN 350
         ELSE 360
       END,
       'mg',
       'RDA varies by age; pregnancy increases needs modestly.',
       'IOM/DRI (magnesium RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Potassium (AI)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='potassium_mg'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE ls.code WHEN 'female_nonpregnant' THEN 2600 ELSE 2900 END,
       'mg',
       'AI. Emphasize potassium-rich foods unless medically contraindicated.',
       'DRI-style potassium AI (planning default)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Sodium (limit; MAX)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='sodium_mg'), ls.life_stage_id, ab.age_band_id,
       'MAX',
       2300,
       'mg',
       'General upper limit style target; individual guidance may differ (e.g., hypertension).',
       'Common public-health sodium guidance'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Phosphorus
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='phosphorus_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE WHEN ab.code='14_18' THEN 1250 ELSE 700 END,
       'mg',
       'RDA depends on age; pregnancy does not change RDA.',
       'IOM/DRI (phosphorus RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Chloride (AI)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='chloride_mg'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE
         WHEN ab.code='51_plus' AND ls.code='female_nonpregnant' THEN 2000
         ELSE 2300
       END,
       'mg',
       'AI.',
       'IOM/DRI (chloride AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Fluoride (AI)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='fluoride_mg'), ls.life_stage_id, ab.age_band_id,
       'AI',
       3,
       'mg',
       'AI. Intake depends strongly on local water fluoridation and dental products.',
       'IOM/DRI (fluoride AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Pantothenic acid (B5) (AI)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='pantothenic_acid_mg'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE ls.code WHEN 'female_nonpregnant' THEN 5 ELSE 6 END,
       'mg',
       'AI.',
       'IOM/DRI (pantothenic acid AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Biotin (B7) (AI)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='biotin_ug'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 25
         WHEN ls.code='female_nonpregnant' THEN 30
         ELSE 30
       END,
       'ug',
       'AI.',
       'IOM/DRI (biotin AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin A (RAE)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_a_rae_ug'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' THEN 700
         WHEN ab.code='14_18' THEN 750
         ELSE 770
       END,
       'ug',
       'RAE = retinol activity equivalents. Avoid high-dose preformed vitamin A unless provider-directed.',
       'IOM/DRI (vitamin A RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin C
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_c_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 65
         WHEN ls.code='female_nonpregnant' THEN 75
         WHEN ls.code<>'female_nonpregnant' AND ab.code='14_18' THEN 80
         ELSE 85
       END,
       'mg',
       'RDA differs by age and pregnancy.',
       'IOM/DRI (vitamin C RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin E
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_e_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       15,
       'mg',
       'RDA. Prefer food sources unless provider-directed.',
       'IOM/DRI (vitamin E RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin K (AI)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_k_ug'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE WHEN ab.code='14_18' THEN 75 ELSE 90 END,
       'ug',
       'AI; stable intake is important, especially if on anticoagulant therapy (provider guidance).',
       'IOM/DRI (vitamin K AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Thiamin (B1)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='thiamin_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 1.0
         WHEN ls.code='female_nonpregnant' THEN 1.1
         ELSE 1.4
       END,
       'mg',
       'RDA increases in pregnancy.',
       'IOM/DRI (thiamin RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Riboflavin (B2)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='riboflavin_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 1.0
         WHEN ls.code='female_nonpregnant' THEN 1.1
         ELSE 1.4
       END,
       'mg',
       'RDA increases in pregnancy.',
       'IOM/DRI (riboflavin RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Niacin (NE)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='niacin_mg_ne'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 14
         WHEN ls.code='female_nonpregnant' THEN 14
         ELSE 18
       END,
       'mg',
       'NE = niacin equivalents.',
       'IOM/DRI (niacin RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin B6
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_b6_mg'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 1.2
         WHEN ls.code='female_nonpregnant' AND ab.code IN ('19_30','31_50') THEN 1.3
         WHEN ls.code='female_nonpregnant' AND ab.code='51_plus' THEN 1.5
         ELSE 1.9
       END,
       'mg',
       'RDA increases in pregnancy.',
       'IOM/DRI (vitamin B6 RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Selenium
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='selenium_ug'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE ls.code WHEN 'female_nonpregnant' THEN 55 ELSE 60 END,
       'ug',
       'RDA increases slightly in pregnancy.',
       'IOM/DRI (selenium RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Copper
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='copper_ug'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE ls.code WHEN 'female_nonpregnant' THEN 900 ELSE 1000 END,
       'ug',
       'RDA increases in pregnancy.',
       'IOM/DRI (copper RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Manganese (AI)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='manganese_mg'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE ls.code WHEN 'female_nonpregnant' THEN 1.6 ELSE 2.0 END,
       'mg',
       'AI.',
       'IOM/DRI (manganese AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Chromium (AI)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='chromium_ug'), ls.life_stage_id, ab.age_band_id,
       'AI',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code IN ('19_30','31_50') THEN 25
         WHEN ls.code='female_nonpregnant' AND ab.code='51_plus' THEN 20
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 24
         ELSE 30
       END,
       'ug',
       'AI.',
       'IOM/DRI (chromium AI)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Molybdenum
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='molybdenum_ug'), ls.life_stage_id, ab.age_band_id,
       'RDA',
       CASE
         WHEN ls.code='female_nonpregnant' AND ab.code='14_18' THEN 43
         WHEN ls.code='female_nonpregnant' THEN 45
         ELSE 50
       END,
       'ug',
       'RDA increases in pregnancy.',
       'IOM/DRI (molybdenum RDA)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- ---------- Upper limits (UL) for safety (selected nutrients) ----------

-- Phosphorus UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='phosphorus_mg'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 3000 ELSE 4000 END,
       'mg',
       'UL.',
       'IOM/DRI (phosphorus UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Fluoride UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='fluoride_mg'), ls.life_stage_id, ab.age_band_id,
       'UL',
       10,
       'mg',
       'UL.',
       'IOM/DRI (fluoride UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin A UL (preformed retinol; planning guardrail)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_a_rae_ug'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 2800 ELSE 3000 END,
       'ug',
       'UL for preformed vitamin A (retinol). Food carotenoids are handled differently; use provider guidance for supplements.',
       'IOM/DRI (vitamin A UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Folate UL (synthetic folic acid from supplements/fortified foods)
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='folate_dfe_ug'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 800 ELSE 1000 END,
       'ug',
       'UL applies to folic acid (supplements/fortified foods), not naturally occurring food folate.',
       'IOM/DRI (folate UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin D UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_d_ug'), ls.life_stage_id, ab.age_band_id,
       'UL',
       100,
       'ug',
       'UL; individual supplementation should be provider/lab guided.',
       'IOM/DRI (vitamin D UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin C UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_c_mg'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 1800 ELSE 2000 END,
       'mg',
       'UL.',
       'IOM/DRI (vitamin C UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin E UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_e_mg'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 800 ELSE 1000 END,
       'mg',
       'UL.',
       'IOM/DRI (vitamin E UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Niacin UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='niacin_mg_ne'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 30 ELSE 35 END,
       'mg',
       'UL (supplemental niacin).',
       'IOM/DRI (niacin UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Vitamin B6 UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='vitamin_b6_mg'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 80 ELSE 100 END,
       'mg',
       'UL.',
       'IOM/DRI (vitamin B6 UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Zinc UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='zinc_mg'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 34 ELSE 40 END,
       'mg',
       'UL.',
       'IOM/DRI (zinc UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Iodine UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='iodine_ug'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 900 ELSE 1100 END,
       'ug',
       'UL.',
       'IOM/DRI (iodine UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Selenium UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='selenium_ug'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 280 ELSE 400 END,
       'ug',
       'UL.',
       'IOM/DRI (selenium UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Copper UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='copper_ug'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 8000 ELSE 10000 END,
       'ug',
       'UL.',
       'IOM/DRI (copper UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Molybdenum UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='molybdenum_ug'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE WHEN ab.code='14_18' THEN 1700 ELSE 2000 END,
       'ug',
       'UL.',
       'IOM/DRI (molybdenum UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Calcium UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='calcium_mg'), ls.life_stage_id, ab.age_band_id,
       'UL',
       CASE
         WHEN ab.code='14_18' THEN 3000
         WHEN ab.code IN ('19_30','31_50') THEN 2500
         ELSE 2000
       END,
       'mg',
       'UL.',
       'IOM/DRI (calcium UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

-- Iron UL
INSERT OR IGNORE INTO nutrient_target(nutrient_id, life_stage_id, age_band_id, target_type, value, unit, notes, source)
SELECT (SELECT nutrient_id FROM nutrient WHERE code='iron_mg'), ls.life_stage_id, ab.age_band_id,
       'UL',
       45,
       'mg',
       'UL; therapeutic iron may exceed this under medical supervision.',
       'IOM/DRI (iron UL)'
FROM life_stage ls
JOIN age_band ab
WHERE ls.code IN ('female_nonpregnant','pregnant_t1','pregnant_t2','pregnant_t3');

COMMIT;
