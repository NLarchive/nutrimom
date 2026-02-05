/**
 * Pregnancy Nutrition Engine
 * Static JavaScript engine for calculating personalized nutrition needs
 * 
 * @license MIT
 */

class NutritionEngine {
  constructor() {
    this.data = {
      nutrients: null,
      targets: null,
      ageBands: null,
      lifeStages: null,
      pregnancyWeeks: null,
      formulas: null,
    };
    this.loaded = false;
  }

  /**
   * Load all JSON data files
   * @param {string} basePath - Base path to data directory
   */
  async loadData(basePath = './data') {
    const files = [
      'nutrients',
      'nutrient-targets',
      'age-bands',
      'life-stages',
      'pregnancy_weeks',
      'formulas',
    ];

    const promises = files.map(async (file) => {
      const response = await fetch(`${basePath}/${file}.json`);
      if (!response.ok) throw new Error(`Failed to load ${file}.json`);
      return response.json();
    });

    const [nutrients, targets, ageBands, lifeStages, pregnancyWeeks, formulas] =
      await Promise.all(promises);

    this.data.nutrients = nutrients;
    this.data.targets = targets;
    this.data.ageBands = ageBands;
    this.data.lifeStages = lifeStages;
    this.data.pregnancyWeeks = pregnancyWeeks;
    this.data.formulas = formulas;
    this.loaded = true;
  }

  /**
   * Set data directly (for testing or pre-loaded data)
   */
  setData(data) {
    this.data = { ...this.data, ...data };
    this.loaded = true;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AGE & LIFE STAGE DETERMINATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Determine age band from age in years
   * @param {number} age - Age in years
   * @returns {string} Age band code (e.g., "19_30")
   */
  getAgeBand(age) {
    // ageBands is a direct array, not an object with age_bands property
    const bands = Array.isArray(this.data.ageBands) 
      ? this.data.ageBands 
      : this.data.ageBands.age_bands || [];
    
    for (const band of bands) {
      const maxAge = band.age_max === null ? 999 : band.age_max;
      if (age >= band.age_min && age <= maxAge) {
        return band.code;
      }
    }
    // Default to adult band if out of range
    return age < 14 ? '14_18' : '51_plus';
  }

  /**
   * Determine life stage from user profile
   * @param {Object} profile - User profile
   * @param {string} profile.sex - "female" or "male"
   * @param {boolean} profile.isPregnant - Is the user pregnant
   * @param {number} profile.pregnancyWeek - Week of pregnancy (1-42)
   * @param {boolean} profile.isLactating - Is the user lactating
   * @param {number} profile.lactationMonths - Months postpartum
   * @returns {string} Life stage code
   */
  getLifeStage(profile) {
    const { sex, isPregnant, pregnancyWeek, isLactating, lactationMonths } = profile;

    if (sex === 'male') {
      return 'male_adult';
    }

    if (isLactating) {
      return lactationMonths <= 6 ? 'lactating_0_6' : 'lactating_7_12';
    }

    if (isPregnant && pregnancyWeek) {
      const weeks = Array.isArray(this.data.pregnancyWeeks) 
        ? this.data.pregnancyWeeks 
        : this.data.pregnancyWeeks?.weeks || [];
      const weekData = weeks.find((w) => w.week === pregnancyWeek);
      if (weekData) {
        return weekData.life_stage;
      }
      // Fallback based on week number
      if (pregnancyWeek <= 13) return 'pregnant_t1';
      if (pregnancyWeek <= 27) return 'pregnant_t2';
      return 'pregnant_t3';
    }

    return 'female_nonpregnant';
  }

  /**
   * Get trimester from pregnancy week
   * @param {number} week - Pregnancy week (1-42)
   * @returns {number} Trimester (1, 2, or 3)
   */
  getTrimester(week) {
    if (week <= 13) return 1;
    if (week <= 27) return 2;
    return 3;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ENERGY CALCULATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
   * @param {Object} params
   * @param {string} params.sex - "female" or "male"
   * @param {number} params.weightKg - Weight in kilograms
   * @param {number} params.heightCm - Height in centimeters
   * @param {number} params.ageYears - Age in years
   * @returns {number} BMR in kcal/day
   */
  calculateBMR({ sex, weightKg, heightCm, ageYears }) {
    // Mifflin-St Jeor Equation
    // Male:   10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) + 5
    // Female: 10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) − 161

    const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    return sex === 'male' ? base + 5 : base - 161;
  }

  /**
   * Calculate Total Daily Energy Expenditure
   * @param {number} bmr - Basal Metabolic Rate
   * @param {string} activityLevel - Activity level code
   * @returns {number} TDEE in kcal/day
   */
  calculateTDEE(bmr, activityLevel) {
    const factors = this.data.formulas.activity_factors;
    // Map UI activity levels to JSON keys
    const activityMap = {
      'sedentary': 'sedentary',
      'lightly_active': 'light',
      'moderately_active': 'moderate',
      'very_active': 'active',
      'extra_active': 'very_active'
    };
    const key = activityMap[activityLevel] || activityLevel;
    const factorObj = factors[key] || factors.sedentary;
    // Factor can be an object with .factor property or a direct number
    const factor = typeof factorObj === 'object' ? factorObj.factor : factorObj;
    return bmr * factor;
  }

  /**
   * Get pregnancy energy increment based on trimester
   * @param {string} lifeStage - Life stage code
   * @returns {number} Additional kcal needed
   */
  getPregnancyEnergyIncrement(lifeStage) {
    const increments = this.data.formulas.pregnancy_energy_increments;
    const lactation = this.data.formulas.lactation_energy_increments;
    
    // Map life stage codes to trimester keys
    const stageMap = {
      'pregnant_t1': 'trimester_1',
      'pregnant_t2': 'trimester_2',
      'pregnant_t3': 'trimester_3',
      'lactating_0_6': 'months_0_6',
      'lactating_7_12': 'months_7_12'
    };
    
    const key = stageMap[lifeStage];
    if (!key) return 0;
    
    // Check pregnancy increments first
    if (increments[key]) {
      return increments[key].increment_kcal || 0;
    }
    // Check lactation increments
    if (lactation && lactation[key]) {
      return lactation[key].increment_kcal || 0;
    }
    return 0;
  }

  /**
   * Calculate total daily energy needs
   * @param {Object} profile - User profile
   * @returns {Object} Energy breakdown
   */
  calculateEnergyNeeds(profile) {
    const {
      sex,
      weightKg,
      heightCm,
      ageYears,
      activityLevel,
      isPregnant,
      pregnancyWeek,
      prePregnancyWeightKg,
    } = profile;

    // Use pre-pregnancy weight for pregnant users if available
    const weightForBMR = isPregnant && prePregnancyWeightKg ? prePregnancyWeightKg : weightKg;

    const bmr = this.calculateBMR({
      sex,
      weightKg: weightForBMR,
      heightCm,
      ageYears,
    });

    const tdee = this.calculateTDEE(bmr, activityLevel);

    const lifeStage = this.getLifeStage(profile);
    const pregnancyIncrement = this.getPregnancyEnergyIncrement(lifeStage);

    const totalEnergy = Math.round(tdee + pregnancyIncrement);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      pregnancyIncrement,
      totalEnergy,
      lifeStage,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NUTRIENT TARGETS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get all nutrient targets for a specific life stage and age band
   * @param {string} lifeStage - Life stage code
   * @param {string} ageBand - Age band code
   * @returns {Object} Nutrient targets keyed by nutrient code
   */
  getNutrientTargets(lifeStage, ageBand) {
    // this.data.targets is the nutrient-targets.json content
    // Life stages are at the root level (e.g., pregnant_t2, female_nonpregnant)
    const targets = this.data.targets;

    // Handle male_adult - map to female_nonpregnant targets (simplified approach)
    const effectiveLifeStage = lifeStage === 'male_adult' ? 'female_nonpregnant' : lifeStage;

    if (!targets[effectiveLifeStage]) {
      console.warn(`Life stage "${effectiveLifeStage}" not found in targets`);
      return {};
    }

    if (!targets[effectiveLifeStage][ageBand]) {
      console.warn(`Age band "${ageBand}" not found for life stage "${effectiveLifeStage}"`);
      return {};
    }

    return targets[effectiveLifeStage][ageBand];
  }

  /**
   * Get personalized nutrition plan for a user
   * @param {Object} profile - User profile
   * @returns {Object} Complete nutrition plan
   */
  getNutritionPlan(profile) {
    const { ageYears } = profile;

    const ageBand = this.getAgeBand(ageYears);
    const lifeStage = this.getLifeStage(profile);
    const energy = this.calculateEnergyNeeds(profile);
    const targets = this.getNutrientTargets(lifeStage, ageBand);

    // Enrich targets with nutrient metadata
    const enrichedTargets = {};
    // nutrients.json is a plain array
    const nutrients = Array.isArray(this.data.nutrients) ? this.data.nutrients : this.data.nutrients?.nutrients || [];

    for (const [code, target] of Object.entries(targets)) {
      const nutrientInfo = nutrients.find((n) => n.code === code);
      enrichedTargets[code] = {
        ...target,
        name: nutrientInfo?.name || code,
        category: nutrientInfo?.category || 'other',
        description: nutrientInfo?.description || '',
        importancePregnancy: nutrientInfo?.importance_pregnancy || '',
        foodSources: nutrientInfo?.food_sources || [],
      };
    }

    // Override energy target with calculated value
    if (enrichedTargets.energy_kcal) {
      enrichedTargets.energy_kcal.target = energy.totalEnergy;
    }

    return {
      profile: {
        ageYears: profile.ageYears,
        sex: profile.sex,
        weightKg: profile.weightKg,
        heightCm: profile.heightCm,
        activityLevel: profile.activityLevel,
        isPregnant: profile.isPregnant || false,
        pregnancyWeek: profile.pregnancyWeek || null,
        trimester: profile.pregnancyWeek ? this.getTrimester(profile.pregnancyWeek) : null,
      },
      classification: {
        ageBand,
        lifeStage,
        lifeStageLabel: this.getLifeStageLabel(lifeStage),
      },
      energy,
      targets: enrichedTargets,
    };
  }

  /**
   * Get human-readable label for life stage
   * @param {string} code - Life stage code
   * @returns {string} Human-readable label
   */
  getLifeStageLabel(code) {
    const labels = {
      female_nonpregnant: 'Non-Pregnant Female',
      pregnant_t1: 'Pregnant - First Trimester',
      pregnant_t2: 'Pregnant - Second Trimester',
      pregnant_t3: 'Pregnant - Third Trimester',
      lactating_0_6: 'Lactating (0-6 months postpartum)',
      lactating_7_12: 'Lactating (7-12 months postpartum)',
      male_adult: 'Adult Male',
    };
    return labels[code] || code;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPARISONS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Compare nutrient targets between two life stages
   * @param {string} ageBand - Age band code
   * @param {string} baseLifeStage - Base life stage to compare from
   * @param {string} compareLifeStage - Life stage to compare to
   * @returns {Array} Comparison results
   */
  compareLifeStages(ageBand, baseLifeStage, compareLifeStage) {
    const baseTargets = this.getNutrientTargets(baseLifeStage, ageBand);
    const compareTargets = this.getNutrientTargets(compareLifeStage, ageBand);
    const nutrients = Array.isArray(this.data.nutrients) ? this.data.nutrients : this.data.nutrients?.nutrients || [];

    const comparisons = [];

    for (const nutrient of nutrients) {
      const code = nutrient.code;
      const baseValue = baseTargets[code]?.target || baseTargets[code]?.RDA || baseTargets[code]?.AI;
      const compareValue =
        compareTargets[code]?.target || compareTargets[code]?.RDA || compareTargets[code]?.AI;

      if (baseValue === undefined && compareValue === undefined) continue;

      const difference = compareValue - (baseValue || 0);
      const percentChange = baseValue ? ((difference / baseValue) * 100).toFixed(1) : null;

      comparisons.push({
        code,
        name: nutrient.name,
        category: nutrient.category,
        unit: nutrient.unit,
        baseValue: baseValue || 0,
        compareValue: compareValue || 0,
        difference,
        percentChange: percentChange ? parseFloat(percentChange) : null,
        increased: difference > 0,
        decreased: difference < 0,
        unchanged: difference === 0,
      });
    }

    return comparisons;
  }

  /**
   * Get pregnancy vs non-pregnancy comparison
   * @param {number} ageYears - Age in years
   * @param {number} pregnancyWeek - Week of pregnancy
   * @returns {Array} Comparison results
   */
  getPregnancyComparison(ageYears, pregnancyWeek) {
    const ageBand = this.getAgeBand(ageYears);
    const pregnantLifeStage = this.getLifeStage({
      sex: 'female',
      isPregnant: true,
      pregnancyWeek,
    });

    return this.compareLifeStages(ageBand, 'female_nonpregnant', pregnantLifeStage);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WEIGHT & BMI
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate BMI
   * @param {number} weightKg - Weight in kilograms
   * @param {number} heightCm - Height in centimeters
   * @returns {number} BMI value
   */
  calculateBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  }

  /**
   * Get BMI category
   * @param {number} bmi - BMI value
   * @returns {string} BMI category
   */
  getBMICategory(bmi) {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  /**
   * Get recommended pregnancy weight gain based on pre-pregnancy BMI
   * @param {number} prePregnancyBMI - Pre-pregnancy BMI
   * @param {boolean} isMultiples - Is carrying twins/multiples
   * @returns {Object} Weight gain recommendations
   */
  getPregnancyWeightGainRecommendation(prePregnancyBMI, isMultiples = false) {
    const recommendations = this.data.formulas.pregnancy_weight_gain_recommendations;
    const category = this.getBMICategory(prePregnancyBMI);
    
    const source = isMultiples ? recommendations.twins : recommendations.singleton;
    const rec = source[category] || source.normal;

    return {
      bmiCategory: category,
      minKg: rec.total_kg_min,
      maxKg: rec.total_kg_max,
      weeklyT2T3Kg: rec.weekly_t2_t3_kg,
      isMultiples,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INTAKE TRACKING (CLIENT-SIDE)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate remaining nutrients needed for the day
   * @param {Object} targets - Target nutrients from getNutritionPlan
   * @param {Object} consumed - Consumed nutrients (keyed by code)
   * @returns {Object} Remaining nutrients needed
   */
  calculateRemaining(targets, consumed) {
    const remaining = {};

    for (const [code, target] of Object.entries(targets)) {
      const targetValue = target.target || target.RDA || target.AI || 0;
      const consumedValue = consumed[code] || 0;
      const remainingValue = Math.max(0, targetValue - consumedValue);

      remaining[code] = {
        ...target,
        target: targetValue,
        consumed: consumedValue,
        remaining: remainingValue,
        percentComplete: targetValue > 0 ? Math.round((consumedValue / targetValue) * 100) : 0,
        exceeds: consumedValue > targetValue,
        exceedsUL: target.UL && consumedValue > target.UL,
      };
    }

    return remaining;
  }

  /**
   * Analyze food intake from LLM extraction results
   * @param {Object} extraction - LLM food extraction result
   * @param {Object} targets - User's nutrient targets
   * @returns {Object} Analysis results
   */
  analyzeIntake(extraction, targets) {
    const consumed = extraction.totals_nutrients || {};
    const analysis = this.calculateRemaining(targets, consumed);

    // Find deficiencies and excesses
    const deficiencies = [];
    const excesses = [];
    const onTrack = [];

    for (const [code, data] of Object.entries(analysis)) {
      if (data.percentComplete < 80) {
        deficiencies.push({ code, ...data });
      } else if (data.exceedsUL) {
        excesses.push({ code, ...data });
      } else {
        onTrack.push({ code, ...data });
      }
    }

    return {
      byNutrient: analysis,
      deficiencies: deficiencies.sort((a, b) => a.percentComplete - b.percentComplete),
      excesses,
      onTrack,
      overallScore: this.calculateOverallScore(analysis),
    };
  }

  /**
   * Calculate overall nutrition score
   * @param {Object} analysis - Analysis results from calculateRemaining
   * @returns {number} Score from 0-100
   */
  calculateOverallScore(analysis) {
    const weights = {
      macro: 2,
      vitamin: 1,
      mineral: 1.5,
      fatty_acid: 1,
      other: 0.5,
    };

    let totalWeight = 0;
    let weightedSum = 0;

    for (const data of Object.values(analysis)) {
      const weight = weights[data.category] || 1;
      const score = Math.min(100, data.percentComplete);
      weightedSum += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get all nutrients organized by category
   * @returns {Object} Nutrients grouped by category
   */
  getNutrientsByCategory() {
    const nutrients = Array.isArray(this.data.nutrients) ? this.data.nutrients : this.data.nutrients?.nutrients || [];
    const grouped = {};

    for (const nutrient of nutrients) {
      if (!grouped[nutrient.category]) {
        grouped[nutrient.category] = [];
      }
      grouped[nutrient.category].push(nutrient);
    }

    return grouped;
  }

  /**
   * Get pregnancy week information
   * @param {number} week - Week number (1-42)
   * @returns {Object} Week information
   */
  getWeekInfo(week) {
    const weeks = Array.isArray(this.data.pregnancyWeeks) ? this.data.pregnancyWeeks : this.data.pregnancyWeeks?.weeks || [];
    return weeks.find((w) => w.week === week);
  }

  /**
   * Get nutrients with specific importance for pregnancy
   * @returns {Array} Nutrients critical during pregnancy
   */
  getCriticalPregnancyNutrients() {
    const nutrients = Array.isArray(this.data.nutrients) ? this.data.nutrients : this.data.nutrients?.nutrients || [];
    return nutrients.filter((n) => n.importance_pregnancy);
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NutritionEngine;
}

if (typeof window !== 'undefined') {
  window.NutritionEngine = NutritionEngine;
}
