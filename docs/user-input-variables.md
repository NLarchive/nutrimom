# User Input Variables

Complete reference for all variables the user can provide to the nutrition calculator.

---

## Required Fields

### age_years
- **Type**: Number
- **Range**: 14-120
- **Description**: User's current age in years
- **Used for**: Determining age band for nutrient targets, BMR calculation

### sex
- **Type**: String
- **Values**: `female`, `male`
- **Description**: Biological sex
- **Note**: Currently female-focused; male support planned
- **Used for**: BMR equation selection, nutrient target selection

### weight_kg
- **Type**: Number
- **Range**: 30-300
- **Description**: Current body weight in kilograms
- **Conversion**: lbs × 0.453592 = kg
- **Used for**: BMR calculation, BMI calculation

### height_cm
- **Type**: Number
- **Range**: 100-250
- **Description**: Height in centimeters
- **Conversion**: inches × 2.54 = cm
- **Used for**: BMR calculation, BMI calculation

### activity_level
- **Type**: String
- **Values**: 
  - `sedentary` - Little/no exercise, desk job (×1.2)
  - `light` - Light exercise 1-3 days/week (×1.375)
  - `moderate` - Moderate exercise 3-5 days/week (×1.55)
  - `active` - Hard exercise 6-7 days/week (×1.725)
  - `very_active` - Very hard exercise or physical job (×1.9)
- **Used for**: TDEE calculation from BMR

---

## Pregnancy Fields

### is_pregnant
- **Type**: Boolean
- **Default**: false
- **Description**: Whether user is currently pregnant
- **Effect**: Enables pregnancy-specific calculations and targets

### pregnancy_week
- **Type**: Integer
- **Range**: 1-42
- **Required if**: `is_pregnant = true`
- **Description**: Current week of pregnancy (counted from LMP)
- **Used for**: Determining trimester → life stage → nutrient targets

**Week to Trimester Mapping**:
| Weeks | Trimester | Life Stage | Energy Increment |
|-------|-----------|------------|------------------|
| 1-13 | 1 | pregnant_t1 | +0 kcal |
| 14-27 | 2 | pregnant_t2 | +340 kcal |
| 28-42 | 3 | pregnant_t3 | +452 kcal |

### pre_pregnancy_weight_kg
- **Type**: Number
- **Range**: 30-300
- **Required**: No (but recommended for pregnant users)
- **Description**: Weight before pregnancy
- **Used for**: Pre-pregnancy BMI → weight gain recommendations

### multiples_count
- **Type**: Integer
- **Range**: 1-4
- **Default**: 1
- **Description**: Number of fetuses
- **Values**: 1 (singleton), 2 (twins), 3 (triplets), 4 (quadruplets)
- **Effect**: Twins add ~300 kcal/day extra; affects weight gain targets

---

## Lactation Fields

### is_lactating
- **Type**: Boolean
- **Default**: false
- **Description**: Whether user is currently breastfeeding
- **Effect**: Enables lactation-specific energy/nutrient adjustments

### lactation_months
- **Type**: Integer
- **Range**: 0-24
- **Required if**: `is_lactating = true`
- **Description**: Months since delivery
- **Used for**: Determining lactation period (0-6 months vs 7-12 months)

**Lactation Energy Needs**:
| Period | Energy Increment |
|--------|------------------|
| 0-6 months (exclusive BF) | +500 kcal |
| 7-12 months (partial BF) | +400 kcal |

---

## Optional Profile Fields

### dietary_pattern
- **Type**: String
- **Values**: `omnivore`, `vegetarian`, `vegan`, `pescatarian`, `other`
- **Default**: `omnivore`
- **Description**: General dietary pattern
- **Effect**: Affects food suggestions (not RDA values)
- **Notes**: 
  - Vegans need B12 supplementation
  - DHA from algae oil (not fish)
  - Focus on plant iron sources + vitamin C

### medical_conditions
- **Type**: Array of strings
- **Values**:
  - `anemia` - Iron deficiency; may need therapeutic iron
  - `gestational_diabetes` - Carb management important
  - `preeclampsia` - Monitor sodium, calcium, magnesium
  - `hyperemesis` - Severe nausea; focus on tolerated foods
  - `celiac` - Gluten-free; watch B vitamins and iron
  - `lactose_intolerance` - Alternative calcium sources
  - `kidney_disease` - May need protein/phosphorus limits
  - `thyroid_disorder` - Iodine considerations
  - `none` - No relevant conditions
- **Default**: `["none"]`
- **Effect**: Displays relevant warnings/considerations

### supplements
- **Type**: Array of objects
- **Structure**: `{ nutrient_code, amount, unit }`
- **Example**: `[{ "nutrient_code": "folate_dfe_ug", "amount": 400, "unit": "μg" }]`
- **Default**: `[]`
- **Description**: Current supplements being taken
- **Effect**: Can factor into total intake vs. food-only targets

---

## Calculated Values

These are computed from inputs, not entered by user:

### age_band
Derived from `age_years`:
- 14 ≤ age < 19 → `14_18`
- 19 ≤ age < 31 → `19_30`
- 31 ≤ age < 51 → `31_50`
- 51 ≤ age → `51_plus`

### life_stage
Derived from `is_pregnant` and `pregnancy_week`:
- Not pregnant → `female_nonpregnant`
- Pregnant weeks 1-13 → `pregnant_t1`
- Pregnant weeks 14-27 → `pregnant_t2`
- Pregnant weeks 28-42 → `pregnant_t3`

### trimester
Derived from `pregnancy_week`:
- Weeks 1-13 → 1
- Weeks 14-27 → 2
- Weeks 28-42 → 3

### bmi
Calculated: `weight_kg / (height_cm/100)²`

### bmi_category
Derived from BMI:
- < 18.5 → underweight
- 18.5-24.9 → normal
- 25-29.9 → overweight
- ≥ 30 → obese

### bmr_kcal
Mifflin-St Jeor equation:
- Female: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age_years) - 161`

### tdee_kcal
BMR × activity factor

### total_energy_kcal
TDEE + pregnancy/lactation increment (if applicable)
