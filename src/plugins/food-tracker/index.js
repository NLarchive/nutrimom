/**
 * Food Tracker Plugin - Main Entry Point
 * 
 * Modular plugin system for LLM-powered food image analysis.
 * Integrates with NutriMom pregnancy nutrition calculator.
 * 
 * @author Nicolas Ivan Larenas Bustamante
 * @license CC-BY-NC-SA-4.0
 * @version 2.0.0
 * 
 * USAGE:
 * 
 * // Production usage (requires API key or manual prompt workflow)
 * const foodTracker = new FoodTrackerPlugin({
 *   containerId: 'food-tracker-container'
 * });
 * 
 * // With real API for direct analysis
 * const foodTracker = new FoodTrackerPlugin({
 *   containerId: 'food-tracker-container',
 *   apiProvider: 'openai',
 *   apiKey: 'your-api-key'
 * });
 * 
 * // With NutriMom integration
 * const foodTracker = new FoodTrackerPlugin({
 *   containerId: 'food-tracker-container',
 *   nutritionEngine: nutritionEngineInstance,
 *   userTargets: calculatedNutrientTargets
 * });
 */

class FoodTrackerPlugin {
  constructor(options = {}) {
    this.options = {
      containerId: options.containerId || 'food-tracker-container',
      storageKey: options.storageKey || 'nutrimom_food_log',
      apiProvider: options.apiProvider || null,
      apiKey: options.apiKey || null,
      nutritionEngine: options.nutritionEngine || null,
      userTargets: options.userTargets || null,
      onMealAdded: options.onMealAdded || null,
      onMealRemoved: options.onMealRemoved || null,
      ...options
    };

    this.engine = null;
    this.ui = null;
    this._initialized = false;
  }

  /**
   * Initialize the plugin
   * Call this after DOM is ready
   */
  init() {
    if (this._initialized) {
      console.warn('FoodTrackerPlugin already initialized');
      return this;
    }

    // Create engine (production mode - no mock fallback)
    this.engine = new FoodTrackerEngine({
      storageKey: this.options.storageKey,
      apiProvider: this.options.apiProvider,
      apiKey: this.options.apiKey,
      nutritionEngine: this.options.nutritionEngine,
      onUpdate: (dailyLog) => {
        if (this.options.onMealAdded) {
          this.options.onMealAdded(dailyLog);
        }
      }
    });

    // Create UI
    this.ui = new FoodTrackerUI({
      containerId: this.options.containerId,
      tracker: this.engine,
      nutritionEngine: this.options.nutritionEngine,
      userTargets: this.options.userTargets
    });

    this._initialized = true;
    return this;
  }

  /**
   * Update user's nutrient targets
   * Call this when user profile changes in main calculator
   * @param {Object} targets - Nutrient targets from NutritionEngine
   */
  setUserTargets(targets) {
    this.options.userTargets = targets;
    if (this.ui) {
      this.ui.setUserTargets(targets);
    }
    return this;
  }

  /**
   * Programmatically analyze an image
   * @param {File|Blob|string} image - Image to analyze
   * @param {string} mealType - Meal type (breakfast, lunch, dinner, snack)
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage(image, mealType = 'snack') {
    if (!this.engine) {
      throw new Error('Plugin not initialized. Call init() first.');
    }
    return this.engine.analyzeImage(image, mealType);
  }

  /**
   * Add analyzed food to the log
   * @param {Object} analysis - LLM analysis result
   * @param {string} imageDataUrl - Optional image preview
   * @returns {Object} Log entry
   */
  addToLog(analysis, imageDataUrl = null) {
    if (!this.engine) {
      throw new Error('Plugin not initialized. Call init() first.');
    }
    const entry = this.engine.addToLog(analysis, imageDataUrl);
    if (this.ui) {
      this.ui.refresh();
    }
    return entry;
  }

  /**
   * Get today's food log
   * @returns {Object} Daily log
   */
  getDailyLog() {
    if (!this.engine) {
      throw new Error('Plugin not initialized. Call init() first.');
    }
    return this.engine.getDailyLog();
  }

  /**
   * Compare intake against targets
   * @param {Object} targets - Nutrient targets (optional, uses stored targets)
   * @returns {Object} Comparison result
   */
  compareToTargets(targets = null) {
    if (!this.engine) {
      throw new Error('Plugin not initialized. Call init() first.');
    }
    return this.engine.compareToTargets(targets || this.options.userTargets);
  }

  /**
   * Generate daily summary report
   * @param {Object} targets - Nutrient targets (optional)
   * @returns {Object} Summary
   */
  getDailySummary(targets = null) {
    if (!this.engine) {
      throw new Error('Plugin not initialized. Call init() first.');
    }
    return this.engine.generateDailySummary(targets || this.options.userTargets);
  }

  /**
   * Clear all food log data
   */
  clearAll() {
    if (this.engine) {
      this.engine.clearAll();
    }
    if (this.ui) {
      this.ui.refresh();
    }
    return this;
  }

  /**
   * Get the underlying engine for advanced usage
   * @returns {FoodTrackerEngine}
   */
  getEngine() {
    return this.engine;
  }

  /**
   * Get the underlying UI component for advanced usage
   * @returns {FoodTrackerUI}
   */
  getUI() {
    return this.ui;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FoodTrackerPlugin,
    FoodTrackerEngine,
    FoodTrackerUI,
    LLMFoodConfig
  };
}

// Make globally available in browser
if (typeof window !== 'undefined') {
  window.FoodTrackerPlugin = FoodTrackerPlugin;
}
