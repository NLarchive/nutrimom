# NutriMom Data Cross-Check Report

**Date:** 2026-02-11  
**Primary source for comparison:** NIH ODS – Pregnancy (Health Professional Fact Sheet), updated April 3, 2025  
**Project file checked:** `data/nutrient-targets.json`  

---

## Summary

**All 30+ nutrient RDA/AI values and UL values for pregnancy match the NIH ODS authoritative source exactly.** No discrepancies found on numeric targets.

Minor design differences and a few notes are documented below.

---

## Pregnancy 14–18 Years — RDA/AI Comparison

| Nutrient | NutriMom | NIH ODS | Match |
|----------|----------|---------|-------|
| Biotin (μg) | AI 30 | AI 30 | ✅ |
| Calcium (mg) | RDA 1300, UL 3000 | RDA 1300, UL 3000 | ✅ |
| Chloride (mg) | AI 2300 | AI 2300 (2.3 g) | ✅ |
| Choline (mg) | AI 450 | AI 450 | ✅ |
| Chromium (μg) | AI 29 | AI 29 | ✅ |
| Copper (μg) | RDA 1000, UL 8000 | RDA 1000, UL 8000 | ✅ |
| Fluoride (mg) | AI 3, UL 10 | AI 3, UL 10 | ✅ |
| Folate (μg DFE) | RDA 600, UL 800 | RDA 600, UL 800 (supplemental only) | ✅ |
| Iodine (μg) | RDA 220, UL 900 | RDA 220, UL 900 | ✅ |
| Iron (mg) | RDA 27, UL 45 | RDA 27, UL 45 | ✅ |
| Magnesium (mg) | RDA 400 | RDA 400 | ✅ |
| Manganese (mg) | AI 2, UL 9 | AI 2, UL 9 | ✅ |
| Molybdenum (μg) | RDA 50, UL 1700 | RDA 50, UL 1700 | ✅ |
| Niacin (mg NE) | RDA 18, UL 30 | RDA 18, UL 30 (supplemental) | ✅ |
| ALA Omega-3 (g) | AI 1.4 | AI 1.4 | ✅ |
| Pantothenic acid (mg) | AI 6 | AI 6 | ✅ |
| Phosphorus (mg) | RDA 1250, UL 3500 | RDA 1250, UL 3500 | ✅ |
| Potassium (mg) | AI 2600 | AI 2600 | ✅ |
| Riboflavin (mg) | RDA 1.4 | RDA 1.4 | ✅ |
| Selenium (μg) | RDA 60, UL 400 | RDA 60, UL 400 | ✅ |
| Thiamin (mg) | RDA 1.4 | RDA 1.4 | ✅ |
| Vitamin A (μg RAE) | RDA 750, UL 2800 | RDA 750, UL 2800 (preformed only) | ✅ |
| Vitamin B6 (mg) | RDA 1.9, UL 80 | RDA 1.9, UL 80 | ✅ |
| Vitamin B12 (μg) | RDA 2.6 | RDA 2.6 | ✅ |
| Vitamin C (mg) | RDA 80, UL 1800 | RDA 80, UL 1800 | ✅ |
| Vitamin D (μg) | RDA 15, UL 100 | RDA 15, UL 100 | ✅ |
| Vitamin E (mg) | RDA 15, UL 800 | RDA 15, UL 800 (supplemental) | ✅ |
| Vitamin K (μg) | AI 75 | AI 75 | ✅ |
| Zinc (mg) | RDA 12, UL 34 | RDA 12, UL 34 | ✅ |

## Pregnancy 19–30 Years — RDA/AI Comparison

| Nutrient | NutriMom | NIH ODS | Match |
|----------|----------|---------|-------|
| Calcium (mg) | RDA 1000, UL 2500 | RDA 1000, UL 2500 | ✅ |
| Chromium (μg) | AI 30 | AI 30 | ✅ |
| Folate (μg DFE) | RDA 600, UL 1000 | RDA 600, UL 1000 | ✅ |
| Iodine (μg) | RDA 220, UL 1100 | RDA 220, UL 1100 | ✅ |
| Magnesium (mg) | RDA 350 | RDA 350 | ✅ |
| Vitamin A (μg RAE) | RDA 770, UL 3000 | RDA 770, UL 3000 | ✅ |
| Vitamin C (mg) | RDA 85, UL 2000 | RDA 85, UL 2000 | ✅ |
| Vitamin E (mg) | UL 1000 | UL 1000 | ✅ |
| Vitamin K (μg) | AI 90 | AI 90 | ✅ |
| Zinc (mg) | RDA 11, UL 40 | RDA 11, UL 40 | ✅ |
| Copper (μg) | RDA 1000, UL 10000 | RDA 1000, UL 10000 | ✅ |
| Manganese (mg) | AI 2, UL 11 | AI 2, UL 11 | ✅ |
| Molybdenum (μg) | RDA 50, UL 2000 | RDA 50, UL 2000 | ✅ |
| Niacin (mg NE) | RDA 18, UL 35 | RDA 18, UL 35 | ✅ |
| Vitamin B6 (mg) | RDA 1.9, UL 100 | RDA 1.9, UL 100 | ✅ |
| Choline (mg) | AI 450 | AI 450 | ✅ |
| Potassium (mg) | AI 2900 | AI 2900 | ✅ |
| Phosphorus (mg) | RDA 700, UL 3500 | RDA 700, UL 3500 | ✅ |

_(All remaining nutrients identical to 14-18 age band where no age-specific difference exists — all match.)_

## Pregnancy 31–50 Years — Key Differences from 19–30

| Nutrient | NutriMom | NIH ODS | Match |
|----------|----------|---------|-------|
| Magnesium (mg) | RDA 360 | RDA 360 | ✅ |

_(All other values identical to 19-30 band — all match.)_

---

## Design Notes & Observations

### 1. DHA/EPA Target Type
- **NIH ODS says:** "Intake recommendations for the long-chain omega-3s, including DHA and EPA, have not been established" — no formal RDA/AI.
- **NutriMom uses:** `"AI": 200` for DHA and `"AI": 50` for EPA in pregnancy stages.
- **Assessment:** Our project labels these as "AI" but they are actually evidence-based practical targets (Cochrane/expert consensus: 250 mg DHA+EPA/day minimum). Using `"REC"` would be more technically accurate, as the NIH ODS explicitly states no formal recommendation exists. However, the **numeric values are reasonable** given the expert guidance of 250 mg/day combined DHA+EPA with extra DHA in pregnancy.
- **Recommendation:** Consider changing target_type from `"AI"` to `"REC"` for `dha_mg` and `epa_mg` in pregnancy stages for semantic accuracy, and add a note referencing the Cochrane/expert basis.

### 2. Sodium Handling
- **NIH ODS says:** Sodium AI is 1500 mg/day during pregnancy (with no UL established — "ND").
- **NutriMom uses:** `"MAX": 2300` for sodium.
- **Assessment:** The 2300 mg comes from the NASEM Chronic Disease Risk Reduction (CDRR) intake level and DGA guidance, not the AI. Our project correctly uses "MAX" (not "UL") which is appropriate. The AI of 1500 mg is a lower baseline; the 2300 mg MAX represents the practical upper guidance. Both are valid — NutriMom takes the conservative-but-achievable approach.
- **Recommendation:** Consider adding an `"AI": 1500` alongside the MAX for completeness, along with a note.

### 3. Magnesium UL Scope
- **NIH ODS says:** "The UL for supplemental magnesium during pregnancy is 350 mg/day; dietary magnesium does not have a UL."
- **NutriMom:** Does not include a magnesium UL in pregnancy targets (correct behavior, since we track total dietary intake not supplement-only).
- **Assessment:** Correctly handled. ✅

### 4. Folate UL Scope
- **NIH ODS says:** UL of 800/1000 μg applies to supplemental folic acid only, not food folate.
- **NutriMom:** Lists UL as 800/1000 in the target data.
- **Assessment:** The numeric value is correct. A note clarifying "supplemental folic acid only" would improve accuracy for users.

### 5. Vitamin E UL Scope
- **NIH ODS says:** UL applies to supplemental alpha-tocopherol only.
- **NutriMom:** Lists UL as 800/1000 in the target data.
- **Assessment:** The numeric value is correct. Same note recommendation as folate.

### 6. Niacin UL Scope
- **NIH ODS says:** UL applies to supplemental niacin only (can cause flushing).
- **NutriMom:** Lists UL as 30/35 in the target data.
- **Assessment:** Correct value. Note about supplemental-only scope would improve accuracy.

---

## Food Composition Sources — Cross-Reference Availability

| Source | Status | Use for NutriMom |
|--------|--------|-----------------|
| USDA FoodData Central | API available (CC0 license) | Could integrate for real-time food lookup in food tracker |
| Health Canada CNF | Online search app, 2015 version | Cross-check Canadian food values |
| CIQUAL (France) | Downloadable XLS/XML, 3185 foods, 67 components | Validate international food composition |
| FAO/INFOODS PhyFoodComp | Phytate-specific database, 3377 entries | Specialized: phytate:mineral molar ratios |
| EFSA DRV Summary | PDF (not machine-parseable) | Manual EU DRV comparison |

---

## Conclusion

**All pregnancy nutrient RDA/AI and UL values in NutriMom match the NIH ODS authoritative source exactly.** The data is correctly sourced and verified.

**Minor improvements recommended:**
1. Reclassify `dha_mg` and `epa_mg` from `"AI"` to `"REC"` in pregnancy stages for semantic precision
2. Consider adding `"AI": 1500` for sodium alongside the existing `"MAX": 2300`
3. Add scope notes for UL values that apply only to supplements (folate, niacin, vitamin E, magnesium)

These are documentation/semantic improvements — no numeric corrections needed.
