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
    this.onDayTransition = options.onDayTransition || null;
    
    // Load existing data from localStorage
    this.foodLog = this._loadFromStorage();
    
    // Ensure metadata exists
    this._ensureMeta();

    // Recalculate totals for all days to ensure consistency (handles legacy data/string bugs)
    this.getAllDates().forEach(date => {
      this._recalculateDailyTotals(date);
    });
    
    // Check for day transition on load
    this._checkDayTransition();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Metadata & Multi-Day Memory
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Ensure _meta key exists in foodLog
   * @private
   */
  _ensureMeta() {
    if (!this.foodLog._meta) {
      this.foodLog._meta = {
        version: '2.0',
        firstEntryDate: null,
        lastEntryDate: null,
        lastModified: null,
        totalDaysLogged: 0,
        totalMealsLogged: 0,
        syncStatus: 'local_only',
        lastSyncDate: null
      };
    }
  }

  /**
   * Update metadata after any foodLog mutation
   * @private
   */
  _updateMeta() {
    const dates = this.getAllDates();
    const totalMeals = dates.reduce((sum, d) => {
      return sum + (this.foodLog[d]?.meals?.length || 0);
    }, 0);

    this.foodLog._meta = {
      ...this.foodLog._meta,
      version: '2.0',
      firstEntryDate: dates.length > 0 ? dates[0] : null,
      lastEntryDate: dates.length > 0 ? dates[dates.length - 1] : null,
      lastModified: new Date().toISOString(),
      totalDaysLogged: dates.length,
      totalMealsLogged: totalMeals,
      syncStatus: this.foodLog._meta?.syncStatus || 'local_only'
    };
  }

  /**
   * Check if a new day has started since the last entry.
   * Marks previous days as completed.
   * @private
   */
  _checkDayTransition() {
    const today = this._getDateKey();
    const dates = this.getAllDates();
    let changed = false;

    dates.forEach(date => {
      if (date < today && this.foodLog[date] && !this.foodLog[date].completed) {
        this.foodLog[date].completed = true;
        this.foodLog[date].completedAt = new Date(date + 'T23:59:59.000Z').toISOString();
        changed = true;
      }
    });

    if (changed) {
      this._updateMeta();
      this._saveToStorage();
      if (this.onDayTransition) {
        this.onDayTransition(today);
      }
    }
  }

  /**
   * Get all logged dates (sorted ascending), excluding _meta
   * @returns {string[]} Array of date strings (YYYY-MM-DD)
   */
  getAllDates() {
    return Object.keys(this.foodLog)
      .filter(k => k !== '_meta' && /^\d{4}-\d{2}-\d{2}$/.test(k))
      .sort();
  }

  /**
   * Get number of days with logged data
   * @returns {number}
   */
  getDayCount() {
    return this.getAllDates().length;
  }

  /**
   * Get all days summary for table/list display
   * @returns {Array<Object>} Array of daily summaries sorted by date desc
   */
  getAllDaysSummary() {
    return this.getAllDates().map(date => {
      const day = this.foodLog[date];
      return {
        date: day.date,
        completed: day.completed || false,
        mealsCount: day.meals.length,
        mealTypes: [...new Set(day.meals.map(m => m.meal_type))],
        dailyTotals: day.dailyTotals || this._emptyTotals(),
        firstMealTime: day.meals.length > 0 ? day.meals[0].timestamp : null,
        lastMealTime: day.meals.length > 0 ? day.meals[day.meals.length - 1].timestamp : null
      };
    }).reverse(); // Most recent first
  }

  /**
   * Get weekly averages for a period ending on the given date
   * @param {string} endDate - End date (YYYY-MM-DD), defaults to today
   * @param {number} days - Number of days to average (default 7)
   * @returns {Object} Weekly averages and trends
   */
  getWeeklyAverages(endDate = null, days = 7) {
    const end = endDate || this._getDateKey();
    const startDate = new Date(end);
    startDate.setDate(startDate.getDate() - (days - 1));
    const start = this._formatDate(startDate);

    const logs = this.getLogRange(start, end);
    const daysWithData = logs.filter(d => d.meals.length > 0);

    if (daysWithData.length === 0) {
      return {
        period: { start, end },
        daysTracked: 0,
        daysTotal: days,
        averages: this._emptyTotals(),
        dailyData: [],
        trends: {}
      };
    }

    // Sum up all daily totals
    const sums = this._emptyTotals();
    const dailyData = [];

    daysWithData.forEach(day => {
      const t = day.dailyTotals;
      Object.keys(sums).forEach(key => {
        sums[key] += t[key] || 0;
      });
      dailyData.push({
        date: day.date,
        calories: t.energy_kcal || 0,
        protein: t.protein_g || 0,
        carbs: t.carbs_g || 0,
        fat: t.fat_g || 0,
        mealsCount: day.meals.length
      });
    });

    // Calculate averages
    const count = daysWithData.length;
    const averages = {};
    Object.keys(sums).forEach(key => {
      averages[key] = Math.round((sums[key] / count) * 10) / 10;
    });

    // Calculate trends (compare last 3 days vs first 3 days if enough data)
    const trends = {};
    if (daysWithData.length >= 4) {
      const half = Math.floor(daysWithData.length / 2);
      const firstHalf = daysWithData.slice(0, half);
      const secondHalf = daysWithData.slice(half);

      const avgFirst = firstHalf.reduce((s, d) => s + (d.dailyTotals.energy_kcal || 0), 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, d) => s + (d.dailyTotals.energy_kcal || 0), 0) / secondHalf.length;

      trends.calories = {
        direction: avgSecond > avgFirst ? 'up' : avgSecond < avgFirst ? 'down' : 'stable',
        change: Math.round(avgSecond - avgFirst)
      };

      const proteinFirst = firstHalf.reduce((s, d) => s + (d.dailyTotals.protein_g || 0), 0) / firstHalf.length;
      const proteinSecond = secondHalf.reduce((s, d) => s + (d.dailyTotals.protein_g || 0), 0) / secondHalf.length;
      trends.protein = {
        direction: proteinSecond > proteinFirst ? 'up' : proteinSecond < proteinFirst ? 'down' : 'stable',
        change: Math.round((proteinSecond - proteinFirst) * 10) / 10
      };
    }

    return {
      period: { start, end },
      daysTracked: count,
      daysTotal: days,
      averages,
      dailyData,
      trends
    };
  }

  /**
   * Get metadata
   * @returns {Object} Current metadata
   */
  getMeta() {
    return this.foodLog._meta || {};
  }

  /**
   * Import food log data (for restore/sync)
   * Merges imported data with existing, preferring newer entries
   * @param {Object} importedLog - Food log object to import
   * @returns {Object} Import summary
   */
  importFoodLog(importedLog) {
    let daysImported = 0;
    let mealsImported = 0;

    Object.keys(importedLog).forEach(key => {
      if (key === '_meta') return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;

      const imported = importedLog[key];
      if (!imported || !Array.isArray(imported.meals)) return;

      // If date doesn't exist, add entire day
      if (!this.foodLog[key]) {
        this.foodLog[key] = imported;
        daysImported++;
        mealsImported += imported.meals.length;
      } else {
        // Merge meals (avoid duplicates by id)
        const existingIds = new Set(this.foodLog[key].meals.map(m => m.id));
        imported.meals.forEach(meal => {
          if (!existingIds.has(meal.id)) {
            this.foodLog[key].meals.push(meal);
            mealsImported++;
          }
        });
        this._recalculateDailyTotals(key);
        if (!daysImported) daysImported++;
      }
    });

    this._updateMeta();
    this._saveToStorage();

    return { daysImported, mealsImported };
  }

  /**
   * Get export payload for server sync
   * @returns {Object} Serializable food log with metadata
   */
  getExportPayload() {
    this._updateMeta();
    return {
      version: '2.0',
      exportDate: new Date().toISOString(),
      foodLog: JSON.parse(JSON.stringify(this.foodLog))
    };
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
    
    // Check for day transition before adding
    this._checkDayTransition();
    
    if (!this.foodLog[date]) {
      this.foodLog[date] = {
        date,
        completed: false,
        completedAt: null,
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
    this._updateMeta();
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
    this._updateMeta();
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
    this._ensureMeta();
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
   * Format date as YYYY-MM-DD (Local Time)
   * @private
   */
  _formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      // Sum up macros from meal totals (ensure numeric addition)
      if (meal.totals) {
        totals.energy_kcal += parseFloat(meal.totals.energy_kcal) || 0;
        totals.protein_g += parseFloat(meal.totals.protein_g) || 0;
        totals.carbs_g += parseFloat(meal.totals.carbs_g) || 0;
        totals.fat_g += parseFloat(meal.totals.fat_g) || 0;
        totals.fiber_g += parseFloat(meal.totals.fiber_g) || 0;
        totals.sodium_mg += parseFloat(meal.totals.sodium_mg) || 0;
      }

      // Sum up micronutrients from individual items (ensure numeric addition)
      meal.food_items.forEach(item => {
        if (item.micronutrients) {
          totals.vitamin_a_ug += parseFloat(item.micronutrients.vitamin_a_ug) || 0;
          totals.vitamin_c_mg += parseFloat(item.micronutrients.vitamin_c_mg) || 0;
          totals.vitamin_d_ug += parseFloat(item.micronutrients.vitamin_d_ug) || 0;
          totals.folate_ug += parseFloat(item.micronutrients.folate_ug) || 0;
          totals.iron_mg += parseFloat(item.micronutrients.iron_mg) || 0;
          totals.calcium_mg += parseFloat(item.micronutrients.calcium_mg) || 0;
          totals.zinc_mg += parseFloat(item.micronutrients.zinc_mg) || 0;
          totals.omega3_mg += parseFloat(item.micronutrients.omega3_mg) || 0;
        }
      });
    });

    // Round values to 1 decimal place to avoid floating point issues
    Object.keys(totals).forEach(key => {
      totals[key] = Math.round(totals[key] * 10) / 10;
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
   * Extract target value from nutrient data (handles RDA, AI, MIN, AMDR)
   * @param {Object} targetData - Target data object with RDA/AI/MIN/AMDR keys
   * @returns {number|null} The target value or null
   */
  _extractTargetValue(targetData) {
    if (!targetData) return null;
    // Priority: target (explicitly set) > RDA > AI > MIN > AMDR_MIN
    if (typeof targetData.target === 'number') return targetData.target;
    if (typeof targetData.RDA === 'number') return targetData.RDA;
    if (typeof targetData.AI === 'number') return targetData.AI;
    if (typeof targetData.MIN === 'number') return targetData.MIN;
    if (typeof targetData.AMDR_MIN === 'number') return targetData.AMDR_MIN;
    return null;
  }

  /**
   * Compare daily intake against nutrient targets
   * @param {Object} targets - Nutrient targets from NutritionEngine (keyed by nutrient code)
   * @param {string} date - Date to compare (defaults to today)
   * @returns {Object} Comparison results with insights
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
      },
      insights: []
    };

    // Direct mapping from intake keys to target keys (they should match)
    // Intake keys from _emptyTotals() → Target keys from nutrient-targets.json
    const nutrientMapping = {
      'energy_kcal': 'energy_kcal',
      'protein_g': 'protein_g',
      'carbs_g': 'carbs_g',
      'fat_g': 'fat_g',
      'fiber_g': 'fiber_g',
      'calcium_mg': 'calcium_mg',
      'iron_mg': 'iron_mg',
      'zinc_mg': 'zinc_mg',
      'folate_ug': 'folate_dfe_ug',
      'vitamin_a_ug': 'vitamin_a_rae_ug',
      'vitamin_c_mg': 'vitamin_c_mg',
      'vitamin_d_ug': 'vitamin_d_ug',
      'omega3_mg': 'dha_mg'
    };

    // Track critical pregnancy nutrients for insights
    const criticalNutrients = ['folate_dfe_ug', 'iron_mg', 'calcium_mg', 'vitamin_d_ug', 'dha_mg', 'iodine_ug'];
    const criticalStatus = {};

    Object.entries(nutrientMapping).forEach(([intakeKey, targetKey]) => {
      const intakeValue = intake[intakeKey] || 0;
      const targetData = targets[targetKey];

      if (!targetData) {
        comparison.summary.noData.push(intakeKey);
        return;
      }

      // Extract the primary target value (RDA/AI/MIN)
      const targetValue = this._extractTargetValue(targetData);
      const ul = targetData.UL;
      const unit = targetData.unit || '';
      
      if (targetValue === null || targetValue === 0) {
        comparison.summary.noData.push(intakeKey);
        return;
      }

      const percentage = (intakeValue / targetValue) * 100;
      const status = this._getNutrientStatus(intakeValue, targetValue, ul);
      const remaining = Math.max(0, targetValue - intakeValue);

      comparison.nutrients[intakeKey] = {
        name: targetData.name || this._formatNutrientName(intakeKey),
        intake: intakeValue,
        target: targetValue,
        remaining: Math.round(remaining * 10) / 10,
        upper_limit: ul || null,
        percentage: Math.round(percentage * 10) / 10,
        unit,
        status,
        targetType: targetData.RDA ? 'RDA' : targetData.AI ? 'AI' : 'MIN'
      };

      // Track critical nutrient status
      if (criticalNutrients.includes(targetKey)) {
        criticalStatus[targetKey] = { percentage, status, name: targetData.name };
      }

      // Categorize
      if (percentage >= 80 && (!ul || intakeValue <= ul)) {
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

    // Generate pregnancy-specific insights
    comparison.insights = this._generateNutrientInsights(comparison, criticalStatus);

    return comparison;
  }

  /**
   * Generate actionable insights based on nutrient comparison
   * @private
   */
  _generateNutrientInsights(comparison, criticalStatus) {
    const insights = [];

    // Check critical nutrients for pregnancy
    Object.entries(criticalStatus).forEach(([code, data]) => {
      if (data.percentage < 50) {
        insights.push({
          type: 'critical',
          nutrient: data.name || code,
          message: `⚠️ ${data.name || code} is critically low (${Math.round(data.percentage)}%). This is essential during pregnancy.`,
          suggestion: this._getFoodSuggestion(code)
        });
      } else if (data.percentage < 80) {
        insights.push({
          type: 'warning',
          nutrient: data.name || code,
          message: `${data.name || code} is below target (${Math.round(data.percentage)}%).`,
          suggestion: this._getFoodSuggestion(code)
        });
      }
    });

    // Overall status insights
    if (comparison.summary.deficit.length === 0 && comparison.summary.exceeded.length === 0) {
      insights.push({
        type: 'success',
        message: '✓ Great job! Your nutrient intake looks balanced today.'
      });
    }

    if (comparison.summary.exceeded.length > 0) {
      insights.push({
        type: 'caution',
        message: `Some nutrients exceed upper limits: ${comparison.summary.exceeded.join(', ')}. Consider moderating intake.`
      });
    }

    return insights;
  }

  /**
   * Format nutrient code to human-readable name
   * @private
   */
  _formatNutrientName(code) {
    const names = {
      'energy_kcal': 'Calories',
      'protein_g': 'Protein',
      'carbs_g': 'Carbohydrates',
      'fat_g': 'Fat',
      'fiber_g': 'Fiber',
      'iron_mg': 'Iron',
      'calcium_mg': 'Calcium',
      'folate_ug': 'Folate',
      'folate_dfe_ug': 'Folate',
      'vitamin_a_ug': 'Vitamin A',
      'vitamin_a_rae_ug': 'Vitamin A',
      'vitamin_c_mg': 'Vitamin C',
      'vitamin_d_ug': 'Vitamin D',
      'zinc_mg': 'Zinc',
      'omega3_mg': 'Omega-3 (DHA)',
      'dha_mg': 'DHA (Omega-3)',
      'iodine_ug': 'Iodine',
      'choline_mg': 'Choline'
    };
    return names[code] || code.replace(/_/g, ' ');
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
