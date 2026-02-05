/**
 * Food Tracker Engine
 * 
 * Core engine for food tracking functionality:
 * - Image analysis via LLM vision API
 * - Daily food log management (localStorage)
 * - Nutrient comparison against targets
 * - Plugin integration with main NutritionEngine
 * 
 * @author Nicolas Ivan Larenas Bustamante
 * @license CC-BY-NC-SA-4.0
 */

class FoodTrackerEngine {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'nutrimom_food_log';
    this.apiProvider = options.apiProvider || null;
    this.apiKey = options.apiKey || null;
    this.nutritionEngine = options.nutritionEngine || null;
    this.onUpdate = options.onUpdate || null;
    
    // Load existing data from localStorage
    this.foodLog = this._loadFromStorage();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Image Analysis
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Analyze a food image using LLM vision API
   * @param {File|Blob|string} image - Image file, blob, or base64 string
   * @param {string} mealType - Optional meal type hint (breakfast, lunch, dinner, snack)
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage(image, mealType = null) {
    // Production mode: require API configuration
    if (!this.apiProvider || !this.apiKey) {
      throw new Error('API_NOT_CONFIGURED: No LLM API configured. Please use the manual prompt workflow: copy the prompt, use your preferred AI (ChatGPT, Gemini, Claude), and paste the response.');
    }

    try {
      let imageBase64;
      
      // Convert image to base64 if needed
      if (typeof image === 'string') {
        imageBase64 = image.replace(/^data:image\/\w+;base64,/, '');
      } else {
        imageBase64 = await this._fileToBase64(image);
      }

      // Call actual LLM API
      const analysisResult = await this._callLLMApi(imageBase64, mealType);

      // Validate response against schema
      const validationResult = this._validateResponse(analysisResult);
      if (!validationResult.valid) {
        throw new Error(`Invalid LLM response: ${validationResult.errors.join(', ')}`);
      }

      return analysisResult;
    } catch (error) {
      console.error('Food analysis failed:', error);
      throw error;
    }
  }

  /**
   * Convert file to base64
   * @private
   */
  async _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Call LLM API for image analysis
   * @private
   */
  async _callLLMApi(imageBase64, mealType) {
    const config = LLMFoodConfig.apiProviders[this.apiProvider];
    if (!config) {
      throw new Error(`Unknown API provider: ${this.apiProvider}`);
    }

    const requestBody = config.buildRequest(imageBase64, config, this.apiKey);
    
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add auth headers based on provider
    if (this.apiProvider === 'openai') {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (this.apiProvider === 'anthropic') {
      headers['x-api-key'] = this.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const endpoint = this.apiProvider === 'google' 
      ? `${config.endpoint}?key=${this.apiKey}`
      : config.endpoint;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Extract response based on provider format
    let content;
    if (this.apiProvider === 'openai') {
      content = data.choices[0].message.content;
    } else if (this.apiProvider === 'anthropic') {
      content = data.content[0].text;
    } else if (this.apiProvider === 'google') {
      content = data.candidates[0].content.parts[0].text;
    }

    return JSON.parse(content);
  }

  /**
   * Validate LLM response against schema
   * @private
   */
  _validateResponse(response) {
    const errors = [];
    
    // Required fields
    if (!response.analysis_id) errors.push('Missing analysis_id');
    if (!response.timestamp) errors.push('Missing timestamp');
    if (typeof response.confidence_overall !== 'number') errors.push('Missing confidence_overall');
    if (!Array.isArray(response.food_items)) errors.push('Missing food_items array');
    if (!response.totals) errors.push('Missing totals object');

    // Validate food items
    if (response.food_items) {
      response.food_items.forEach((item, i) => {
        if (!item.name) errors.push(`Food item ${i}: missing name`);
        if (!item.nutrients) errors.push(`Food item ${i}: missing nutrients`);
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Food Log Management (localStorage)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Add analyzed meal to daily log
   * @param {Object} analysis - LLM analysis result
   * @param {string} imageDataUrl - Optional image preview (base64 data URL)
   * @returns {Object} The saved log entry
   */
  addToLog(analysis, imageDataUrl = null) {
    const date = this._getDateKey();
    
    if (!this.foodLog[date]) {
      this.foodLog[date] = {
        date,
        meals: [],
        dailyTotals: this._emptyTotals()
      };
    }

    const entry = {
      id: analysis.analysis_id,
      timestamp: analysis.timestamp || new Date().toISOString(),
      meal_type: analysis.meal_type || 'snack',
      food_items: analysis.food_items,
      totals: analysis.totals,
      imagePreview: imageDataUrl,
      warnings: analysis.warnings || [],
      pregnancy_relevant_notes: analysis.pregnancy_relevant_notes || []
    };

    this.foodLog[date].meals.push(entry);
    this._recalculateDailyTotals(date);
    this._saveToStorage();

    if (this.onUpdate) {
      this.onUpdate(this.foodLog[date]);
    }

    return entry;
  }

  /**
   * Remove a meal from the log
   * @param {string} date - Date key (YYYY-MM-DD)
   * @param {string} mealId - Meal analysis_id
   */
  removeFromLog(date, mealId) {
    if (!this.foodLog[date]) return;

    this.foodLog[date].meals = this.foodLog[date].meals.filter(m => m.id !== mealId);
    this._recalculateDailyTotals(date);
    this._saveToStorage();

    if (this.onUpdate) {
      this.onUpdate(this.foodLog[date]);
    }
  }

  /**
   * Get food log for a specific date
   * @param {string} date - Date key (YYYY-MM-DD), defaults to today
   * @returns {Object} Daily log entry
   */
  getDailyLog(date = null) {
    const key = date || this._getDateKey();
    return this.foodLog[key] || {
      date: key,
      meals: [],
      dailyTotals: this._emptyTotals()
    };
  }

  /**
   * Get food log for date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Array} Array of daily logs
   */
  getLogRange(startDate, endDate) {
    const logs = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const key = this._formatDate(current);
      logs.push(this.getDailyLog(key));
      current.setDate(current.getDate() + 1);
    }

    return logs;
  }

  /**
   * Clear all food log data
   */
  clearAll() {
    this.foodLog = {};
    this._saveToStorage();
  }

  /**
   * Get current date key
   * @private
   */
  _getDateKey() {
    return this._formatDate(new Date());
  }

  /**
   * Format date as YYYY-MM-DD
   * @private
   */
  _formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Create empty totals object
   * @private
   */
  _emptyTotals() {
    return {
      energy_kcal: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      sodium_mg: 0,
      // Micronutrients
      vitamin_a_ug: 0,
      vitamin_c_mg: 0,
      vitamin_d_ug: 0,
      folate_ug: 0,
      iron_mg: 0,
      calcium_mg: 0,
      zinc_mg: 0,
      omega3_mg: 0
    };
  }

  /**
   * Recalculate daily totals from meals
   * @private
   */
  _recalculateDailyTotals(date) {
    const dayLog = this.foodLog[date];
    if (!dayLog) return;

    const totals = this._emptyTotals();

    dayLog.meals.forEach(meal => {
      // Sum up macros from meal totals
      if (meal.totals) {
        totals.energy_kcal += meal.totals.energy_kcal || 0;
        totals.protein_g += meal.totals.protein_g || 0;
        totals.carbs_g += meal.totals.carbs_g || 0;
        totals.fat_g += meal.totals.fat_g || 0;
        totals.fiber_g += meal.totals.fiber_g || 0;
        totals.sodium_mg += meal.totals.sodium_mg || 0;
      }

      // Sum up micronutrients from individual items
      meal.food_items.forEach(item => {
        if (item.micronutrients) {
          totals.vitamin_a_ug += item.micronutrients.vitamin_a_ug || 0;
          totals.vitamin_c_mg += item.micronutrients.vitamin_c_mg || 0;
          totals.vitamin_d_ug += item.micronutrients.vitamin_d_ug || 0;
          totals.folate_ug += item.micronutrients.folate_ug || 0;
          totals.iron_mg += item.micronutrients.iron_mg || 0;
          totals.calcium_mg += item.micronutrients.calcium_mg || 0;
          totals.zinc_mg += item.micronutrients.zinc_mg || 0;
          totals.omega3_mg += item.micronutrients.omega3_mg || 0;
        }
      });
    });

    dayLog.dailyTotals = totals;
  }

  /**
   * Load food log from localStorage
   * @private
   */
  _loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('Failed to load food log from storage:', e);
      return {};
    }
  }

  /**
   * Save food log to localStorage
   * @private
   */
  _saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.foodLog));
    } catch (e) {
      console.error('Failed to save food log to storage:', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Nutrient Comparison
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Compare daily intake against nutrient targets
   * @param {Object} targets - Nutrient targets from NutritionEngine
   * @param {string} date - Date to compare (defaults to today)
   * @returns {Object} Comparison results
   */
  compareToTargets(targets, date = null) {
    const dayLog = this.getDailyLog(date);
    const intake = dayLog.dailyTotals;
    
    const comparison = {
      date: dayLog.date,
      status: 'ok', // ok, warning, deficit
      nutrients: {},
      summary: {
        met: [],
        exceeded: [],
        deficit: [],
        noData: []
      }
    };

    // Map our intake nutrients to target nutrients
    const nutrientMapping = {
      'energy_kcal': 'energy',
      'protein_g': 'protein',
      'carbs_g': null, // No direct target
      'fat_g': null, // No direct target
      'fiber_g': 'fibre',
      'calcium_mg': 'calcium',
      'iron_mg': 'iron',
      'zinc_mg': 'zinc',
      'folate_ug': 'folate',
      'vitamin_a_ug': 'vitamin_a',
      'vitamin_c_mg': 'vitamin_c',
      'vitamin_d_ug': 'vitamin_d',
      'omega3_mg': 'omega3_dha_epa'
    };

    Object.entries(nutrientMapping).forEach(([intakeKey, targetKey]) => {
      if (!targetKey) return; // Skip nutrients without targets

      const intakeValue = intake[intakeKey] || 0;
      const target = targets[targetKey];

      if (!target) {
        comparison.summary.noData.push(intakeKey);
        return;
      }

      const rdi = target.rdi || target.ai;
      const ul = target.ul;
      const percentage = rdi ? (intakeValue / rdi) * 100 : null;

      comparison.nutrients[intakeKey] = {
        intake: intakeValue,
        target: rdi,
        upper_limit: ul,
        percentage,
        unit: target.unit,
        status: this._getNutrientStatus(intakeValue, rdi, ul)
      };

      // Categorize
      if (percentage === null) {
        comparison.summary.noData.push(intakeKey);
      } else if (percentage >= 80 && (!ul || intakeValue <= ul)) {
        comparison.summary.met.push(intakeKey);
      } else if (ul && intakeValue > ul) {
        comparison.summary.exceeded.push(intakeKey);
        comparison.status = 'warning';
      } else if (percentage < 80) {
        comparison.summary.deficit.push(intakeKey);
        if (percentage < 50) {
          comparison.status = 'deficit';
        }
      }
    });

    return comparison;
  }

  /**
   * Get nutrient status based on intake vs targets
   * @private
   */
  _getNutrientStatus(intake, rdi, ul) {
    if (!rdi) return 'unknown';
    
    const percentage = (intake / rdi) * 100;
    
    if (ul && intake > ul) return 'exceeded';
    if (percentage >= 100) return 'optimal';
    if (percentage >= 80) return 'adequate';
    if (percentage >= 50) return 'low';
    return 'deficient';
  }

  /**
   * Generate daily summary report
   * @param {Object} targets - Nutrient targets from NutritionEngine
   * @param {string} date - Date (defaults to today)
   * @returns {Object} Summary report
   */
  generateDailySummary(targets, date = null) {
    const dayLog = this.getDailyLog(date);
    const comparison = this.compareToTargets(targets, date);

    // Collect all pregnancy warnings from meals
    const pregnancyNotes = [];
    dayLog.meals.forEach(meal => {
      if (meal.pregnancy_relevant_notes) {
        pregnancyNotes.push(...meal.pregnancy_relevant_notes);
      }
    });

    return {
      date: dayLog.date,
      mealsLogged: dayLog.meals.length,
      totalCalories: dayLog.dailyTotals.energy_kcal,
      macroBreakdown: {
        protein: dayLog.dailyTotals.protein_g,
        carbs: dayLog.dailyTotals.carbs_g,
        fat: dayLog.dailyTotals.fat_g,
        fiber: dayLog.dailyTotals.fiber_g
      },
      nutrientStatus: comparison.status,
      nutrientsDeficit: comparison.summary.deficit,
      nutrientsMet: comparison.summary.met,
      nutrientsExceeded: comparison.summary.exceeded,
      pregnancyNotes: [...new Set(pregnancyNotes)], // Dedupe
      recommendations: this._generateRecommendations(comparison, targets)
    };
  }

  /**
   * Generate nutritional recommendations based on comparison
   * @private
   */
  _generateRecommendations(comparison, targets) {
    const recommendations = [];

    comparison.summary.deficit.forEach(nutrient => {
      const data = comparison.nutrients[nutrient];
      if (!data) return;

      const remaining = data.target - data.intake;
      recommendations.push({
        nutrient,
        type: 'increase',
        message: `Consider adding more ${this._getFoodSuggestion(nutrient)} to reach your ${nutrient.replace('_', ' ')} target.`,
        deficit: remaining.toFixed(1),
        unit: data.unit
      });
    });

    comparison.summary.exceeded.forEach(nutrient => {
      const data = comparison.nutrients[nutrient];
      if (!data) return;

      recommendations.push({
        nutrient,
        type: 'reduce',
        message: `You've exceeded the upper limit for ${nutrient.replace('_', ' ')}. Consider reducing intake.`,
        excess: (data.intake - data.upper_limit).toFixed(1),
        unit: data.unit
      });
    });

    return recommendations;
  }

  /**
   * Get food suggestions for deficient nutrients
   * @private
   */
  _getFoodSuggestion(nutrient) {
    const suggestions = {
      'iron_mg': 'iron-rich foods like spinach, legumes, or lean red meat',
      'calcium_mg': 'calcium-rich foods like dairy, fortified plant milk, or leafy greens',
      'folate_ug': 'folate-rich foods like leafy greens, legumes, or fortified cereals',
      'vitamin_c_mg': 'vitamin C sources like citrus fruits, bell peppers, or berries',
      'vitamin_d_ug': 'vitamin D sources like fatty fish, fortified foods, or egg yolks',
      'vitamin_a_ug': 'vitamin A sources like sweet potato, carrots, or leafy greens',
      'zinc_mg': 'zinc-rich foods like meat, legumes, or seeds',
      'protein_g': 'protein sources like lean meat, fish, eggs, legumes, or tofu',
      'fiber_g': 'fiber-rich foods like whole grains, vegetables, fruits, or legumes',
      'omega3_mg': 'omega-3 sources like fatty fish, walnuts, or flaxseed'
    };

    return suggestions[nutrient] || 'nutrient-rich foods';
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FoodTrackerEngine;
}

// Ensure global availability
if (typeof window !== 'undefined') {
  window.FoodTrackerEngine = FoodTrackerEngine;
}
