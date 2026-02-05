-- Example queries for selecting normal vs pregnancy targets.

-- 1) What trimester is week 22?
SELECT * FROM v_pregnancy_week WHERE week_number = 22;

-- 2) Get all targets (tall rows) for age 19-30, pregnancy trimester 2:
SELECT *
FROM v_nutrient_targets
WHERE life_stage_code = 'pregnant_t2'
  AND age_band_code = '19_30'
ORDER BY nutrient_code, target_type;

-- 3) Get JSON target object for age 31-50, nonpregnant:
SELECT targets_json
FROM v_targets_json
WHERE life_stage_code = 'female_nonpregnant'
  AND age_band_code = '31_50';

-- 4) Week-based selection: pick the pregnancy target set for week 10 and age band 19-30.
WITH wk AS (
  SELECT life_stage_code
  FROM v_pregnancy_week
  WHERE week_number = 10
)
SELECT vz.targets_json
FROM wk
JOIN v_targets_json vz ON vz.life_stage_code = wk.life_stage_code
WHERE vz.age_band_code = '19_30';

-- 5) Compute simple deltas: pregnancy week 10 vs nonpregnant for the same age band.
-- (This produces tall rows; UI can format it as a comparison table.)
WITH wk AS (
  SELECT life_stage_code
  FROM v_pregnancy_week
  WHERE week_number = 10
),
base AS (
  SELECT nutrient_code, target_type, value AS base_value, unit
  FROM v_nutrient_targets
  WHERE life_stage_code = 'female_nonpregnant'
    AND age_band_code = '19_30'
),
preg AS (
  SELECT nutrient_code, target_type, value AS preg_value, unit
  FROM v_nutrient_targets
  WHERE life_stage_code = (SELECT life_stage_code FROM wk)
    AND age_band_code = '19_30'
)
SELECT
  COALESCE(preg.nutrient_code, base.nutrient_code) AS nutrient_code,
  COALESCE(preg.target_type, base.target_type) AS target_type,
  base.base_value,
  preg.preg_value,
  (preg.preg_value - base.base_value) AS delta,
  COALESCE(preg.unit, base.unit) AS unit
FROM base
LEFT JOIN preg
  ON preg.nutrient_code = base.nutrient_code
 AND preg.target_type = base.target_type
ORDER BY nutrient_code, target_type;
