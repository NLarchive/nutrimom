/**
 * NutriMom Nutrition Engine
 * Static JavaScript engine for calculating personalized nutrition needs
 * Supports all ages (1+), both sexes, pregnancy, and lactation
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
    // Default fallback
    if (age < 1) return '1_3';
    return '51_plus';
  }

  /**
   * Check if age is within reproductive range for pregnancy/lactation
   * @param {number} age - Age in years
   * @returns {boolean}
   */
  isReproductiveAge(age) {
    return age >= 14 && age <= 50;
  }

  /**
   * Determine life stage from user profile
   * @param {Object} profile - User profile
   * @param {string} profile.sex - "female" or "male"
   * @param {number} profile.ageYears - Age in years
   * @param {boolean} profile.isPregnant - Is the user pregnant
   * @param {number} profile.pregnancyWeek - Week of pregnancy (1-42)
   * @param {boolean} profile.isLactating - Is the user lactating
   * @param {number} profile.lactationMonths - Months postpartum
   * @returns {string} Life stage code
   */
  getLifeStage(profile) {
    const { sex, ageYears, isPregnant, pregnancyWeek, isLactating, lactationMonths } = profile;
    const age = ageYears || 30;

    // Children ages 1-8: sex-neutral "child" stage
    if (age < 9) {
      return 'child';
    }

    // Males 9+: always male_nonpregnant
    if (sex === 'male') {
      return 'male_nonpregnant';
    }

    // Females 9+: check pregnancy/lactation (only if reproductive age)
    if (isLactating && this.isReproductiveAge(age)) {
      return lactationMonths <= 6 ? 'lactating_0_6' : 'lactating_7_12';
    }

    if (isPregnant && pregnancyWeek && this.isReproductiveAge(age)) {
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
   * Calculate Basal Metabolic Rate
   * Uses Schofield/WHO equations for children (< 19), Mifflin-St Jeor for adults (19+)
   * @param {Object} params
   * @param {string} params.sex - "female" or "male"
   * @param {number} params.weightKg - Weight in kilograms
   * @param {number} params.heightCm - Height in centimeters
   * @param {number} params.ageYears - Age in years
   * @returns {number} BMR in kcal/day
   */
  calculateBMR({ sex, weightKg, heightCm, ageYears }) {
    // Children and adolescents (< 19): Schofield/WHO weight-only equations
    if (ageYears < 19) {
      return this._calculateChildBMR(sex, weightKg, ageYears);
    }

    // Adults (19+): Mifflin-St Jeor Equation
    const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    return sex === 'male' ? base + 5 : base - 161;
  }

  /**
   * Calculate BMR for children/adolescents using Schofield equations
   * @private
   */
  _calculateChildBMR(sex, weightKg, ageYears) {
    // Schofield equations (weight-only)
    if (sex === 'male') {
      if (ageYears < 3)  return 59.512 * weightKg - 30.4;
      if (ageYears < 10) return 22.706 * weightKg + 504.3;
      return 17.686 * weightKg + 658.2; // 10-18
    } else {
      if (ageYears < 3)  return 58.317 * weightKg - 31.1;
      if (ageYears < 10) return 20.315 * weightKg + 485.9;
      return 13.384 * weightKg + 692.6; // 10-18
    }
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
    const targets = this.data.targets;

    if (!targets[lifeStage]) {
      console.warn(`Life stage "${lifeStage}" not found in targets`);
      return {};
    }

    if (!targets[lifeStage][ageBand]) {
      console.warn(`Age band "${ageBand}" not found for life stage "${lifeStage}"`);
      return {};
    }

    return targets[lifeStage][ageBand];
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

    // Calculate protein_g based on RDA per kg body weight
    const proteinTarget = enrichedTargets.protein_g;
    if (proteinTarget && profile.weightKg) {
      const rdaPerKg = this.data.formulas.macronutrient_calculations.protein_rda_per_kg;
      let rdaKey = lifeStage;
      if (lifeStage.startsWith('pregnant')) rdaKey = 'pregnant';
      else if (lifeStage.startsWith('lactating')) rdaKey = 'lactating';
      else if (lifeStage === 'child') rdaKey = 'child';
      else if (lifeStage === 'male_nonpregnant') rdaKey = 'male_nonpregnant';
      else rdaKey = 'female_nonpregnant';
      const rdaPerKgValue = rdaPerKg[rdaKey] || 0.8;
      const calculatedProtein = Math.round(rdaPerKgValue * profile.weightKg);
      proteinTarget.target = calculatedProtein;
      proteinTarget.note = `Calculated as ${rdaPerKgValue} g/kg × ${profile.weightKg} kg = ${calculatedProtein} g`;
    }

    // Calculate water_l based on ml per kg body weight
    const waterTarget = enrichedTargets.water_l;
    if (waterTarget && profile.weightKg) {
      const mlPerKg = this.data.formulas.macronutrient_calculations.water_ml_per_kg;
      let waterKey = lifeStage;
      if (lifeStage.startsWith('pregnant')) waterKey = 'pregnant';
      else if (lifeStage.startsWith('lactating')) waterKey = 'lactating';
      else if (lifeStage === 'child') waterKey = 'child';
      else if (lifeStage === 'male_nonpregnant') waterKey = 'male_nonpregnant';
      else waterKey = 'female_nonpregnant';
      const mlPerKgValue = mlPerKg[waterKey] || 45;
      const calculatedWater = (mlPerKgValue * profile.weightKg) / 1000;
      waterTarget.target = Math.round(calculatedWater * 10) / 10; // to 1 decimal
      waterTarget.note = `Calculated as ${mlPerKgValue} ml/kg × ${profile.weightKg} kg = ${calculatedWater.toFixed(1)} L`;
    }

    // Ensure energy_kcal target exists and is synchronized with calculations
    if (!enrichedTargets.energy_kcal) {
      const energyNutrient = nutrients.find(n => n.code === 'energy_kcal');
      enrichedTargets.energy_kcal = {
        name: energyNutrient?.name || 'Energy',
        category: energyNutrient?.category || 'macro',
        unit: 'kcal',
        target: energy.totalEnergy
      };
    } else {
      enrichedTargets.energy_kcal.target = energy.totalEnergy;
    }

    // Convert AMDR % to grams for fat_g if defined as %
    const fatTarget = enrichedTargets.fat_g;
    if (fatTarget && fatTarget.unit === '%' && (fatTarget.AMDR_MIN || fatTarget.AMDR_MAX)) {
      const percent = fatTarget.AMDR_MIN || 20; // Default to 20% if only max is defined (unlikely)
      fatTarget.target = Math.round((energy.totalEnergy * (percent / 100)) / 9);
      fatTarget.unit = 'g';
      fatTarget.note = `Based on ${percent}% of ${energy.totalEnergy} kcal energy target`;
    }

    // Convert AMDR % to grams for carbs if it doesn't already have a gram-based target
    const carbTarget = enrichedTargets.carbs_g;
    if (proteinTarget && fatTarget && carbTarget) {
      const proteinKcal = (proteinTarget.target || proteinTarget.RDA || 0) * 4;
      const fatKcal = fatTarget.target * 9;
      const remainingKcal = energy.totalEnergy - proteinKcal - fatKcal;
      if (remainingKcal > 0) {
        carbTarget.target = Math.round(remainingKcal / 4);
        carbTarget.unit = 'g';
        carbTarget.note = `Calculated as remaining energy after protein (${proteinKcal} kcal) and fat (${fatKcal} kcal)`;
      }
    }

    // Adjust fiber_g target based on energy intake (14g per 1000 kcal)
    const fiberTarget = enrichedTargets.fiber_g;
    if (fiberTarget) {
      const calculatedFiber = Math.round((energy.totalEnergy / 1000) * 14);
      const driFiber = fiberTarget.AI || fiberTarget.target || 25;
      // Use the higher of calculated or DRI to ensure adequacy
      fiberTarget.target = Math.max(calculatedFiber, driFiber);
      fiberTarget.note = `Target is the higher of DRI (${driFiber}g) or rule-of-thumb (14g/1000kcal = ${calculatedFiber}g)`;
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
      child: 'Child',
      female_nonpregnant: 'Female',
      male_nonpregnant: 'Male',
      pregnant_t1: 'Pregnant - First Trimester',
      pregnant_t2: 'Pregnant - Second Trimester',
      pregnant_t3: 'Pregnant - Third Trimester',
      lactating_0_6: 'Lactating (0-6 months postpartum)',
      lactating_7_12: 'Lactating (7-12 months postpartum)',
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
