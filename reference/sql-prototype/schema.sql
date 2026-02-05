-- SQLite schema for nutrition planning + pregnancy week mapping.
-- Designed for: normal vs pregnancy targets by age band; week-of-pregnancy selects trimester targets.

PRAGMA foreign_keys = ON;

-- ---------- Core reference tables ----------

CREATE TABLE IF NOT EXISTS nutrient (
	nutrient_id INTEGER PRIMARY KEY,
	code TEXT NOT NULL UNIQUE,              -- e.g. "protein_g", "folate_dfe_ug"
	name TEXT NOT NULL,                     -- human label
	category TEXT NOT NULL CHECK (category IN ('macro','micro','limit')),
	default_unit TEXT NOT NULL,             -- e.g. g, mg, ug, L, kcal
	sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS life_stage (
	life_stage_id INTEGER PRIMARY KEY,
	code TEXT NOT NULL UNIQUE,              -- "female_nonpregnant", "pregnant_t1", "pregnant_t2", "pregnant_t3"
	name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS age_band (
	age_band_id INTEGER PRIMARY KEY,
	code TEXT NOT NULL UNIQUE,              -- "14_18", "19_30", "31_50", "51_plus"
	label TEXT NOT NULL,
	age_min_years REAL NOT NULL,
	age_max_years REAL                       -- NULL means open-ended
);

-- Nutrient targets (RDA/AI/UL/MIN/MAX/AMDR) per life stage + age band.
CREATE TABLE IF NOT EXISTS nutrient_target (
	target_id INTEGER PRIMARY KEY,
	nutrient_id INTEGER NOT NULL REFERENCES nutrient(nutrient_id) ON DELETE CASCADE,
	life_stage_id INTEGER NOT NULL REFERENCES life_stage(life_stage_id) ON DELETE CASCADE,
	age_band_id INTEGER NOT NULL REFERENCES age_band(age_band_id) ON DELETE CASCADE,
	target_type TEXT NOT NULL CHECK (target_type IN ('RDA','AI','UL','MIN','MAX','AMDR_MIN','AMDR_MAX')),
	value REAL NOT NULL,
	unit TEXT NOT NULL,
	basis TEXT NOT NULL DEFAULT 'per_day',   -- extensible: per_day, percent_energy
	notes TEXT,
	source TEXT
);

-- ---------- Pregnancy week mapping ----------

CREATE TABLE IF NOT EXISTS pregnancy_week (
	week_number INTEGER PRIMARY KEY CHECK (week_number BETWEEN 1 AND 42),
	trimester INTEGER NOT NULL CHECK (trimester IN (1,2,3)),
	day_start INTEGER NOT NULL,
	day_end INTEGER NOT NULL,
	life_stage_id INTEGER NOT NULL REFERENCES life_stage(life_stage_id),
	label TEXT NOT NULL
);

-- ---------- Optional: user + logging (for later LLM/image integration) ----------

CREATE TABLE IF NOT EXISTS user_profile (
	user_id TEXT PRIMARY KEY,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	display_name TEXT,
	birth_date TEXT,                        -- ISO date
	height_cm REAL,
	pre_pregnancy_weight_kg REAL,
	current_weight_kg REAL,
	activity_level TEXT,                    -- e.g. sedentary/light/moderate/active
	dietary_preferences_json TEXT,           -- JSON array
	allergies_json TEXT,                    -- JSON array
	medical_flags_json TEXT                 -- JSON object (e.g. anemia, gestational_diabetes)
);

CREATE TABLE IF NOT EXISTS pregnancy_profile (
	user_id TEXT PRIMARY KEY REFERENCES user_profile(user_id) ON DELETE CASCADE,
	is_pregnant INTEGER NOT NULL DEFAULT 0,
	pregnancy_start_date TEXT,              -- LMP or conception proxy
	due_date TEXT,
	multiples_count INTEGER NOT NULL DEFAULT 1,
	provider_notes_json TEXT
);

CREATE TABLE IF NOT EXISTS intake_log (
	intake_log_id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
	logged_at TEXT NOT NULL,                -- ISO datetime
	source_type TEXT NOT NULL CHECK (source_type IN ('manual','image','barcode','import')),
	image_path TEXT,
	llm_provider TEXT,
	llm_model TEXT,
	extraction_confidence REAL,
	raw_extraction_json TEXT,               -- raw LLM output
	normalized_items_json TEXT,             -- normalized foods/portions
	totals_nutrients_json TEXT              -- totals keyed by nutrient code
);

-- ---------- Convenience views ----------

-- Get trimester for any week.
CREATE VIEW IF NOT EXISTS v_pregnancy_week AS
SELECT
	pw.week_number,
	pw.trimester,
	pw.day_start,
	pw.day_end,
	ls.code AS life_stage_code,
	pw.label
FROM pregnancy_week pw
JOIN life_stage ls ON ls.life_stage_id = pw.life_stage_id;

-- Get targets (tall) for a life stage + age band.
CREATE VIEW IF NOT EXISTS v_nutrient_targets AS
SELECT
	ls.code AS life_stage_code,
	ab.code AS age_band_code,
	n.code AS nutrient_code,
	n.name AS nutrient_name,
	nt.target_type,
	nt.value,
	nt.unit,
	nt.basis,
	nt.notes,
	nt.source
FROM nutrient_target nt
JOIN nutrient n ON n.nutrient_id = nt.nutrient_id
JOIN life_stage ls ON ls.life_stage_id = nt.life_stage_id
JOIN age_band ab ON ab.age_band_id = nt.age_band_id;

-- Return targets as a JSON object (nutrient_code -> {type,value,unit,basis}) for easy app consumption.
-- Note: If multiple target_type rows exist for the same nutrient, the last one wins.
CREATE VIEW IF NOT EXISTS v_targets_json AS
SELECT
	ls.code AS life_stage_code,
	ab.code AS age_band_code,
	json_group_object(
		n.code,
		json_object('target_type', nt.target_type, 'value', nt.value, 'unit', nt.unit, 'basis', nt.basis)
	) AS targets_json
FROM nutrient_target nt
JOIN nutrient n ON n.nutrient_id = nt.nutrient_id
JOIN life_stage ls ON ls.life_stage_id = nt.life_stage_id
JOIN age_band ab ON ab.age_band_id = nt.age_band_id
GROUP BY ls.code, ab.code;

