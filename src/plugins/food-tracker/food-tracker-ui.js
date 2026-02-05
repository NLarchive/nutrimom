/**
 * Food Tracker UI Component
 * 
 * Handles the visual interface for:
 * - Image upload and camera capture
 * - Food analysis display
 * - Daily log view
 * - Nutrient comparison visualization
 * 
 * @author Nicolas Ivan Larenas Bustamante
 * @license CC-BY-NC-SA-4.0
 */

class FoodTrackerUI {
  constructor(options = {}) {
    this.containerId = options.containerId || 'food-tracker-container';
    this.tracker = options.tracker || new FoodTrackerEngine({});
    this.nutritionEngine = options.nutritionEngine || null;
    this.userTargets = options.userTargets || null;
    this.userContext = options.userContext || null;
    this.onProfileRequired = options.onProfileRequired || null;
    
    this.container = null;
    this.elements = {};
    
    // Schema validation constraints for security
    this.VALIDATION_LIMITS = {
      maxStringLength: 500,
      maxArrayLength: 50,
      maxNumericValue: 100000,
      minNumericValue: 0,
      allowedUnits: ['piece', 'gram', 'g', 'ml', 'cup', 'tablespoon', 'tbsp', 'teaspoon', 'tsp', 'slice', 'serving', 'oz', 'ounce', 'lb', 'pound'],
      allowedMealTypes: ['breakfast', 'lunch', 'dinner', 'snack'],
      allowedPrepMethods: ['raw', 'fried', 'grilled', 'baked', 'steamed', 'boiled', 'roasted', 'sauteed', 'unknown']
    };
    
    this._init();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Security & Validation
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Sanitize string input to prevent XSS and injection
   * @param {string} str - Input string
   * @param {number} maxLen - Maximum allowed length
   * @returns {string} Sanitized string
   */
  _sanitizeString(str, maxLen = this.VALIDATION_LIMITS.maxStringLength) {
    if (typeof str !== 'string') return '';
    // Remove HTML tags, trim, and limit length
    return str
      .replace(/<[^>]*>/g, '')
      .replace(/[<>"'&]/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }[char]))
      .trim()
      .slice(0, maxLen);
  }

  /**
   * Validate and sanitize numeric input
   * @param {any} value - Input value
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {number} Validated number or 0
   */
  _sanitizeNumber(value, min = this.VALIDATION_LIMITS.minNumericValue, max = this.VALIDATION_LIMITS.maxNumericValue) {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return 0;
    return Math.max(min, Math.min(max, num));
  }

  /**
   * Validate input against allowed values
   * @param {string} value - Input value
   * @param {Array} allowedValues - Array of allowed values
   * @param {string} defaultValue - Default if not in allowed list
   * @returns {string} Validated value
   */
  _validateEnum(value, allowedValues, defaultValue) {
    const sanitized = this._sanitizeString(value, 50).toLowerCase();
    return allowedValues.includes(sanitized) ? sanitized : defaultValue;
  }

  /**
   * Check if user profile is complete enough for food tracking
   * @returns {Object} { valid: boolean, missing: string[] }
   */
  _checkProfileComplete() {
    const missing = [];
    
    if (!this.userContext) {
      return { valid: false, missing: ['Complete profile in Calculator'] };
    }
    
    if (!this.userContext.age || this.userContext.age < 14) {
      missing.push('Age');
    }
    if (!this.userContext.weight || this.userContext.weight < 30) {
      missing.push('Weight');
    }
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Show profile warning if needed before storing data
   * @returns {boolean} True if profile is complete
   */
  _validateProfileBeforeStore() {
    const check = this._checkProfileComplete();
    
    if (!check.valid) {
      const confirmStore = confirm(
        `⚠️ Profile Incomplete\n\n` +
        `Missing: ${check.missing.join(', ')}\n\n` +
        `Without a complete profile, nutrient comparisons won't be accurate.\n\n` +
        `Do you want to add this meal anyway?`
      );
      return confirmStore;
    }
    
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────────

  _init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`Food tracker container #${this.containerId} not found`);
      return;
    }

    this._render();
    this._bindEvents();
    this._updateDailyView();
  }

  _render() {
    // Detect API configuration status
    const hasApi = this.tracker.apiProvider && this.tracker.apiKey;
    
    const apiStatusBlock = hasApi ? `
      <div class="api-status-banner api-connected">
        <span class="api-status-icon">✅</span>
        <div class="api-status-content">
          <strong>LLM Vision API Connected</strong>
          <p>Direct image analysis is available via <em>${this._sanitizeString(this.tracker.apiProvider)}</em>. You can also use the manual workflow below.</p>
        </div>
      </div>
    ` : `
      <div class="api-status-banner api-not-connected" id="ft-api-status">
        <span class="api-status-icon">ℹ️</span>
        <div class="api-status-content">
          <strong>No LLM Vision API Connected</strong>
          <p>Direct image analysis is not available. You can still track your meals using the <strong>manual AI workflow</strong>:</p>
          <ol>
            <li>Upload or take a photo of your meal</li>
            <li>Copy the AI prompt from the section below</li>
            <li>Use it with your image in <strong>ChatGPT</strong>, <strong>Gemini</strong>, or <strong>Claude</strong></li>
            <li>Paste the AI's JSON response back here to calculate nutrition</li>
          </ol>
        </div>
      </div>
    `;

    this.container.innerHTML = `${apiStatusBlock}
      <div class="food-tracker">
        <!-- Header -->
        <div class="tracker-header">
          <h2>🍽️ Daily Food Tracker</h2>
          <p class="tracker-subtitle">Track your meals and monitor nutrient intake</p>
        </div>

        <!-- Upload Section -->
        <div class="upload-section">
          <div class="upload-area" id="ft-upload-area">
            <div class="upload-icon">📷</div>
            <p>Drop food image here or click to upload</p>
            <p class="upload-hint">Supports JPG, PNG, WebP</p>
            <!-- Hidden file inputs - separate for camera and gallery -->
            <input type="file" id="ft-file-input" accept="image/*" hidden>
            <input type="file" id="ft-camera-input" accept="image/*" capture="environment" hidden>
          </div>
          
          <div class="upload-actions">
            <button class="btn btn-primary" id="ft-camera-btn">
              📸 Take Photo
            </button>
            <button class="btn btn-secondary" id="ft-browse-btn">
              📁 Browse Files
            </button>
          </div>

          <!-- Image Preview -->
          <div class="image-preview" id="ft-preview" style="display: none;">
            <img id="ft-preview-img" src="" alt="Food preview">
            <div class="preview-overlay">
              <button class="btn btn-small" id="ft-remove-preview">✕ Remove</button>
            </div>
          </div>

          <!-- Photo Title Input -->
          <div class="photo-title-section" id="ft-title-section">
            <label for="ft-photo-title">Photo Title (optional context):</label>
            <input type="text" id="ft-photo-title" class="text-input" 
                   placeholder="e.g., Homemade cod croquette, Spanish tapa..."
                   maxlength="200">
            <p class="input-hint">Add context to help the AI better identify your food</p>
          </div>

          <!-- Meal Type Selection -->
          <div class="meal-type-selector" id="ft-meal-selector">
            <label>Meal Type:</label>
            <div class="meal-options">
              <button class="meal-option" data-meal="breakfast">🌅 Breakfast</button>
              <button class="meal-option" data-meal="lunch">☀️ Lunch</button>
              <button class="meal-option" data-meal="dinner">🌙 Dinner</button>
              <button class="meal-option active" data-meal="snack">🍎 Snack</button>
            </div>
          </div>

          <!-- Analyze Button -->
          <button class="btn btn-analyze" id="ft-analyze-btn" style="display: none;">
            🔍 Analyze Food
          </button>
        </div>

        <!-- Manual LLM Section -->
        <div class="manual-llm-section" id="ft-manual-section">
          <h3>🤖 Use Your Own AI Model</h3>
          <p class="section-description">
            Copy the prompt below and use it with ChatGPT, Gemini, Claude, or any vision AI. 
            Then paste the response to calculate nutrition.
          </p>
          
          <!-- Prompt Generator -->
          <div class="prompt-generator">
            <label for="ft-prompt-output">AI Prompt (copy this along with your food image):</label>
            <textarea id="ft-prompt-output" class="prompt-textarea" readonly></textarea>
            <button class="btn btn-secondary" id="ft-copy-prompt">
              📋 Copy Prompt to Clipboard
            </button>
            <span class="copy-feedback" id="ft-copy-feedback"></span>
          </div>

          <!-- Response Parser -->
          <div class="response-parser">
            <label for="ft-llm-response">Paste AI Response Here:</label>
            <textarea id="ft-llm-response" class="response-textarea" 
                      placeholder="Paste the JSON response from your AI model here..."></textarea>
            <button class="btn btn-primary" id="ft-parse-response">
              📊 Parse & Calculate Nutrition
            </button>
            <div class="parse-error" id="ft-parse-error" style="display: none;"></div>
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-state" id="ft-loading" style="display: none;">
          <div class="spinner"></div>
          <p>Analyzing your food...</p>
        </div>

        <!-- Analysis Results -->
        <div class="analysis-results" id="ft-results" style="display: none;">
          <h3>Analysis Results</h3>
          <div class="results-content" id="ft-results-content"></div>
          <div class="results-actions">
            <button class="btn btn-primary" id="ft-add-to-log">✓ Add to Daily Log</button>
            <button class="btn btn-secondary" id="ft-discard">✕ Discard</button>
          </div>
        </div>

        <!-- Daily Summary -->
        <div class="daily-summary" id="ft-daily-summary">
          <h3>Today's Intake</h3>
          <div class="summary-content" id="ft-summary-content">
            <p class="empty-state">No meals logged today. Upload a food photo to get started!</p>
          </div>
        </div>

        <!-- Meals Log -->
        <div class="meals-log" id="ft-meals-log">
          <h3>Logged Meals</h3>
          <div class="meals-list" id="ft-meals-list">
            <!-- Meals will be rendered here -->
          </div>
        </div>

        <!-- Nutrient Comparison -->
        <div class="nutrient-comparison" id="ft-comparison" style="display: none;">
          <h3>Nutrient Status</h3>
          <div class="comparison-content" id="ft-comparison-content"></div>
        </div>
      </div>
    `;

    // Cache element references
    this.elements = {
      uploadArea: document.getElementById('ft-upload-area'),
      fileInput: document.getElementById('ft-file-input'),
      cameraInput: document.getElementById('ft-camera-input'),
      cameraBtn: document.getElementById('ft-camera-btn'),
      browseBtn: document.getElementById('ft-browse-btn'),
      preview: document.getElementById('ft-preview'),
      previewImg: document.getElementById('ft-preview-img'),
      removePreview: document.getElementById('ft-remove-preview'),
      titleSection: document.getElementById('ft-title-section'),
      photoTitle: document.getElementById('ft-photo-title'),
      mealSelector: document.getElementById('ft-meal-selector'),
      analyzeBtn: document.getElementById('ft-analyze-btn'),
      loading: document.getElementById('ft-loading'),
      results: document.getElementById('ft-results'),
      resultsContent: document.getElementById('ft-results-content'),
      addToLog: document.getElementById('ft-add-to-log'),
      discard: document.getElementById('ft-discard'),
      dailySummary: document.getElementById('ft-daily-summary'),
      summaryContent: document.getElementById('ft-summary-content'),
      mealsList: document.getElementById('ft-meals-list'),
      comparison: document.getElementById('ft-comparison'),
      comparisonContent: document.getElementById('ft-comparison-content'),
      // Manual LLM elements
      manualSection: document.getElementById('ft-manual-section'),
      promptOutput: document.getElementById('ft-prompt-output'),
      copyPrompt: document.getElementById('ft-copy-prompt'),
      copyFeedback: document.getElementById('ft-copy-feedback'),
      llmResponse: document.getElementById('ft-llm-response'),
      parseResponse: document.getElementById('ft-parse-response'),
      parseError: document.getElementById('ft-parse-error')
    };

    // Initialize the prompt
    this._updatePrompt();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Event Binding
  // ─────────────────────────────────────────────────────────────────────────────

  _bindEvents() {
    // File input change (gallery)
    this.elements.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this._handleFile(e.target.files[0]);
      }
    });

    // Camera input change (direct camera capture)
    this.elements.cameraInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this._handleFile(e.target.files[0]);
      }
    });

    // Browse button - opens gallery
    this.elements.browseBtn.addEventListener('click', () => {
      this.elements.fileInput.removeAttribute('capture');
      this.elements.fileInput.click();
    });

    // Camera button - opens camera directly on mobile
    this.elements.cameraBtn.addEventListener('click', () => {
      // Use dedicated camera input for better mobile support
      this.elements.cameraInput.click();
    });

    // Drag and drop
    this.elements.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.elements.uploadArea.classList.add('dragover');
    });

    this.elements.uploadArea.addEventListener('dragleave', () => {
      this.elements.uploadArea.classList.remove('dragover');
    });

    this.elements.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.elements.uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this._handleFile(e.dataTransfer.files[0]);
      }
    });

    // Click on upload area - opens gallery
    this.elements.uploadArea.addEventListener('click', () => {
      this.elements.fileInput.removeAttribute('capture');
      this.elements.fileInput.click();
    });

    // Remove preview
    this.elements.removePreview.addEventListener('click', () => {
      this._clearPreview();
    });

    // Photo title input - update prompt when changed
    this.elements.photoTitle.addEventListener('input', () => {
      this._updatePrompt();
    });

    // Meal type selection
    document.querySelectorAll('.meal-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.meal-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedMealType = btn.dataset.meal;
      });
    });

    // Analyze button
    this.elements.analyzeBtn.addEventListener('click', () => {
      this._analyzeFood();
    });

    // Add to log
    this.elements.addToLog.addEventListener('click', () => {
      this._addToLog();
    });

    // Discard
    this.elements.discard.addEventListener('click', () => {
      this._discardAnalysis();
    });

    // Copy prompt button
    this.elements.copyPrompt.addEventListener('click', () => {
      this._copyPromptToClipboard();
    });

    // Parse LLM response button
    this.elements.parseResponse.addEventListener('click', () => {
      this._parseLLMResponse();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Image Handling
  // ─────────────────────────────────────────────────────────────────────────────

  _handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    this.currentFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentImageData = e.target.result;
      this._showPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  _showPreview(dataUrl) {
    this.elements.previewImg.src = dataUrl;
    this.elements.preview.style.display = 'block';
    this.elements.analyzeBtn.style.display = 'block';
    this.elements.uploadArea.style.display = 'none';
    this._updatePrompt();
  }

  _clearPreview() {
    this.elements.preview.style.display = 'none';
    this.elements.analyzeBtn.style.display = 'none';
    this.elements.uploadArea.style.display = 'flex';
    this.elements.results.style.display = 'none';
    this.elements.fileInput.value = '';
    this.elements.cameraInput.value = '';
    this.elements.photoTitle.value = '';
    this.currentFile = null;
    this.currentImageData = null;
    this.currentAnalysis = null;
    this._updatePrompt();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Analysis
  // ─────────────────────────────────────────────────────────────────────────────

  async _analyzeFood() {
    if (!this.currentFile) return;

    this._showLoading(true);

    try {
      this.currentAnalysis = await this.tracker.analyzeImage(
        this.currentFile,
        this.selectedMealType
      );
      
      this._showResults(this.currentAnalysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Show user-friendly error with guidance
      if (error.message.includes('API_NOT_CONFIGURED')) {
        this._showAnalysisError(
          'No API Configured',
          'Direct image analysis requires an API key. Please use the <strong>manual workflow</strong> below:\n\n' +
          '1. Copy the AI prompt\n' +
          '2. Use ChatGPT, Gemini, or Claude with your food image\n' +
          '3. Paste the JSON response back here'
        );
      } else {
        this._showAnalysisError('Analysis Failed', error.message);
      }
    } finally {
      this._showLoading(false);
    }
  }

  /**
   * Show analysis error message
   */
  _showAnalysisError(title, message) {
    this.elements.results.style.display = 'block';
    this.elements.resultsContent.innerHTML = `
      <div class="analysis-error">
        <div class="error-icon">⚠️</div>
        <h4>${this._sanitizeString(title)}</h4>
        <p>${message}</p>
      </div>
    `;
    // Hide the add to log button for errors
    this.elements.addToLog.style.display = 'none';
    this.elements.discard.textContent = '✕ Close';
  }

  _showLoading(show) {
    this.elements.loading.style.display = show ? 'flex' : 'none';
    this.elements.analyzeBtn.disabled = show;
  }

  _showResults(analysis) {
    this.elements.results.style.display = 'block';
    this.elements.addToLog.style.display = 'inline-flex';
    this.elements.discard.textContent = '✕ Discard';
    
    const html = `
      <div class="analysis-confidence">
        Confidence: ${Math.round(analysis.confidence_overall * 100)}%
      </div>
      
      <div class="food-items-list">
        ${analysis.food_items.map(item => `
          <div class="food-item-card">
            <div class="food-item-header">
              <span class="food-name">${item.name}</span>
              <span class="food-quantity">${item.quantity} ${item.unit} (${item.estimated_weight_g}g)</span>
            </div>
            <div class="food-item-nutrients">
              <span class="nutrient">${item.nutrients.energy_kcal} kcal</span>
              <span class="nutrient">P: ${item.nutrients.protein_g}g</span>
              <span class="nutrient">C: ${item.nutrients.carbs_g}g</span>
              <span class="nutrient">F: ${item.nutrients.fat_g}g</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="meal-totals">
        <h4>Meal Totals</h4>
        <div class="totals-grid">
          <div class="total-item">
            <span class="total-value">${analysis.totals.energy_kcal}</span>
            <span class="total-label">Calories</span>
          </div>
          <div class="total-item">
            <span class="total-value">${analysis.totals.protein_g}g</span>
            <span class="total-label">Protein</span>
          </div>
          <div class="total-item">
            <span class="total-value">${analysis.totals.carbs_g}g</span>
            <span class="total-label">Carbs</span>
          </div>
          <div class="total-item">
            <span class="total-value">${analysis.totals.fat_g}g</span>
            <span class="total-label">Fat</span>
          </div>
          <div class="total-item">
            <span class="total-value">${analysis.totals.fiber_g}g</span>
            <span class="total-label">Fiber</span>
          </div>
        </div>
      </div>

      ${analysis.pregnancy_relevant_notes && analysis.pregnancy_relevant_notes.length > 0 ? `
        <div class="pregnancy-notes">
          <h4>🤰 Pregnancy Notes</h4>
          <ul>
            ${analysis.pregnancy_relevant_notes.map(note => `<li>${note}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${analysis.warnings && analysis.warnings.length > 0 ? `
        <div class="analysis-warnings">
          <h4>⚠️ Notes</h4>
          <ul>
            ${analysis.warnings.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;

    this.elements.resultsContent.innerHTML = html;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Log Management
  // ─────────────────────────────────────────────────────────────────────────────

  _addToLog() {
    if (!this.currentAnalysis) return;

    // Validate profile before storing
    if (!this._validateProfileBeforeStore()) {
      return; // User cancelled
    }

    this.tracker.addToLog(this.currentAnalysis, this.currentImageData);
    this._updateDailyView();
    this._clearPreview();
  }

  _discardAnalysis() {
    this._clearPreview();
  }

  _updateDailyView() {
    const dailyLog = this.tracker.getDailyLog();
    
    // Update summary
    if (dailyLog.meals.length === 0) {
      this.elements.summaryContent.innerHTML = `
        <p class="empty-state">No meals logged today. Upload a food photo to get started!</p>
      `;
    } else {
      const totals = dailyLog.dailyTotals;
      this.elements.summaryContent.innerHTML = `
        <div class="daily-totals-grid">
          <div class="daily-total">
            <span class="value">${Math.round(totals.energy_kcal)}</span>
            <span class="label">Calories</span>
          </div>
          <div class="daily-total">
            <span class="value">${totals.protein_g.toFixed(1)}g</span>
            <span class="label">Protein</span>
          </div>
          <div class="daily-total">
            <span class="value">${totals.carbs_g.toFixed(1)}g</span>
            <span class="label">Carbs</span>
          </div>
          <div class="daily-total">
            <span class="value">${totals.fat_g.toFixed(1)}g</span>
            <span class="label">Fat</span>
          </div>
          <div class="daily-total">
            <span class="value">${totals.fiber_g.toFixed(1)}g</span>
            <span class="label">Fiber</span>
          </div>
        </div>
      `;
    }

    // Update meals list
    if (dailyLog.meals.length === 0) {
      this.elements.mealsList.innerHTML = '';
    } else {
      this.elements.mealsList.innerHTML = dailyLog.meals.map(meal => `
        <div class="meal-card" data-meal-id="${meal.id}">
          <div class="meal-header">
            ${meal.imagePreview ? `<img src="${meal.imagePreview}" class="meal-thumb" alt="Meal">` : ''}
            <div class="meal-info">
              <span class="meal-type">${this._getMealTypeEmoji(meal.meal_type)} ${meal.meal_type}</span>
              <span class="meal-time">${this._formatTime(meal.timestamp)}</span>
            </div>
            <button class="remove-meal" data-id="${meal.id}">✕</button>
          </div>
          <div class="meal-foods">
            ${meal.food_items.slice(0, 3).map(item => item.name).join(', ')}
            ${meal.food_items.length > 3 ? `+${meal.food_items.length - 3} more` : ''}
          </div>
          <div class="meal-quick-stats">
            <span>${meal.totals.energy_kcal} kcal</span>
            <span>${meal.totals.protein_g}g protein</span>
          </div>
        </div>
      `).join('');

      // Bind remove buttons
      document.querySelectorAll('.remove-meal').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const mealId = btn.dataset.id;
          const date = this.tracker._getDateKey();
          this.tracker.removeFromLog(date, mealId);
          this._updateDailyView();
        });
      });
    }

    // Update nutrient comparison if targets available
    if (this.userTargets && dailyLog.meals.length > 0) {
      this._updateNutrientComparison();
    }
  }

  _updateNutrientComparison() {
    if (!this.userTargets) return;

    const comparison = this.tracker.compareToTargets(this.userTargets);
    this.elements.comparison.style.display = 'block';

    const nutrients = Object.entries(comparison.nutrients);
    
    this.elements.comparisonContent.innerHTML = `
      <div class="nutrient-bars">
        ${nutrients.map(([key, data]) => {
          const percent = Math.min(data.percentage || 0, 150);
          const statusClass = data.status;
          return `
            <div class="nutrient-bar-item">
              <div class="nutrient-bar-label">
                <span>${this._formatNutrientName(key)}</span>
                <span>${data.intake.toFixed(1)} / ${data.target} ${data.unit}</span>
              </div>
              <div class="nutrient-bar-track">
                <div class="nutrient-bar-fill ${statusClass}" style="width: ${percent}%"></div>
                <div class="nutrient-bar-target"></div>
              </div>
              <span class="nutrient-bar-percent">${Math.round(data.percentage || 0)}%</span>
            </div>
          `;
        }).join('')}
      </div>

      ${comparison.summary.deficit.length > 0 ? `
        <div class="comparison-alert deficit">
          <strong>Low intake:</strong> ${comparison.summary.deficit.map(n => this._formatNutrientName(n)).join(', ')}
        </div>
      ` : ''}

      ${comparison.summary.exceeded.length > 0 ? `
        <div class="comparison-alert exceeded">
          <strong>Exceeded:</strong> ${comparison.summary.exceeded.map(n => this._formatNutrientName(n)).join(', ')}
        </div>
      ` : ''}
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  _getMealTypeEmoji(type) {
    const emojis = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return emojis[type] || '🍽️';
  }

  _formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  _formatNutrientName(key) {
    const names = {
      'energy_kcal': 'Calories',
      'protein_g': 'Protein',
      'carbs_g': 'Carbs',
      'fat_g': 'Fat',
      'fiber_g': 'Fiber',
      'iron_mg': 'Iron',
      'calcium_mg': 'Calcium',
      'folate_ug': 'Folate',
      'vitamin_c_mg': 'Vitamin C',
      'vitamin_d_ug': 'Vitamin D',
      'vitamin_a_ug': 'Vitamin A',
      'zinc_mg': 'Zinc',
      'omega3_mg': 'Omega-3'
    };
    return names[key] || key;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Manual LLM Prompt & Response Handling
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generate the prompt for manual use with AI models
   */
  _getManualPrompt() {
    const photoTitle = this.elements.photoTitle?.value?.trim() || '';
    const titleContext = photoTitle 
      ? `\n\nPHOTO CONTEXT: The user identifies this image as "${photoTitle}". Use this as your primary identification guide.\n` 
      : '';

    // Generate dynamic user context string
    let userPersona = 'a general adult';
    if (this.userContext) {
      const parts = [];
      if (this.userContext.isPregnant) {
        parts.push(`PREGNANT woman (${this.userContext.pregnancyWeek} weeks)`);
      } else if (this.userContext.isLactating) {
        parts.push('BREASTFEEDING mother');
      }
      parts.push(`${this.userContext.age} years old`);
      parts.push(`${this.userContext.weight}kg`);
      userPersona = parts.join(', ');
    }

    return `FOOD IMAGE NUTRITIONAL ANALYSIS REQUEST

USER PROFILE: Analysis is for a ${userPersona}. 
Please tailor "pregnancy_relevant_notes" specifically to this profile.${titleContext}

ROLE: You are a highly precise nutrition expert and vision AI. 
TASK: Analyze the food image provided and estimate its nutritional content for the ENTIRE MEAL shown (NOT per 100g).

INSTRUCTIONS:
1. IDENTIFY: List all food items, ingredients, and toppings (e.g., "Homemade Cod Croquette", "Sesame seeds", "Olive oil").
2. QUANTIFY: Estimate portion sizes and total edible weight in grams for the whole plate.
3. CALCULATE: Provide full macro and micronutrient data for the entire portion.
4. VALIDATE: Ensure the 'totals' mathematically match the sum of 'food_items'.
5. PREGNANCY SPECIFIC: Focus on critical nutrients: Folate, Iron, Calcium, Zinc, Vitamin D, and Omega-3 (DHA/EPA).

CONSISTENCY RULES:
- All values MUST represent the total intake for the portion shown.
- Micronutrients are mandatory (use best estimates based on standard databases).
- If context says "Croqueta de bacalao", do not confuse it with "Falafel". Identification must follow PHOTO CONTEXT.

OUTPUT FORMAT (Respond with VALID JSON only):
{
  "food_items": [
    {
      "name": "Food item name",
      "quantity": 1,
      "unit": "piece|gram|ml|cup|tablespoon|slice|serving",
      "estimated_weight_g": 0,
      "preparation_method": "raw|fried|grilled|baked|steamed|boiled|roasted",
      "nutrients": {
        "energy_kcal": 0,
        "protein_g": 0,
        "carbs_g": 0,
        "fat_g": 0,
        "fiber_g": 0,
        "sugar_g": 0,
        "sodium_mg": 0,
        "saturated_fat_g": 0
      },
      "micronutrients": {
        "vitamin_a_ug": 0,
        "vitamin_c_mg": 0,
        "vitamin_d_ug": 0,
        "folate_ug": 0,
        "iron_mg": 0,
        "calcium_mg": 0,
        "zinc_mg": 0,
        "omega3_mg": 0
      }
    }
  ],
  "totals": {
    "energy_kcal": 0,
    "protein_g": 0,
    "carbs_g": 0,
    "fat_g": 0,
    "fiber_g": 0,
    "sodium_mg": 0
  },
  "meal_type": "breakfast|lunch|dinner|snack",
  "confidence_overall": 0.9,
  "warnings": ["Identify any risks like undercooked fish, excessive caffeine, etc."],
  "pregnancy_relevant_notes": ["Specific advice for a ${userPersona} regarding these items"]
}

FINAL CHECK: Ensure the JSON is valid and contains no preamble or postamble.`;
  }

  /**
   * Update the prompt display
   */
  _updatePrompt() {
    if (this.elements.promptOutput) {
      this.elements.promptOutput.value = this._getManualPrompt();
    }
  }

  /**
   * Copy prompt to clipboard
   */
  async _copyPromptToClipboard() {
    try {
      await navigator.clipboard.writeText(this._getManualPrompt());
      this.elements.copyFeedback.textContent = '✓ Copied!';
      this.elements.copyFeedback.classList.add('show');
      setTimeout(() => {
        this.elements.copyFeedback.classList.remove('show');
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      this.elements.promptOutput.select();
      document.execCommand('copy');
      this.elements.copyFeedback.textContent = '✓ Copied!';
      this.elements.copyFeedback.classList.add('show');
      setTimeout(() => {
        this.elements.copyFeedback.classList.remove('show');
      }, 2000);
    }
  }

  /**
   * Parse and validate LLM response with strict schema validation
   */
  _parseLLMResponse() {
    const responseText = this.elements.llmResponse.value.trim();
    this.elements.parseError.style.display = 'none';

    if (!responseText) {
      this._showParseError('Please paste the AI response first.');
      return;
    }

    // Security check: limit response size
    if (responseText.length > 50000) {
      this._showParseError('Response too large. Maximum 50KB allowed.');
      return;
    }

    try {
      // Try to extract JSON from the response (in case there's extra text)
      let jsonStr = responseText;
      
      // Try to find JSON object in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        throw new Error('Invalid JSON format. Make sure the response is valid JSON.');
      }

      // Strict schema validation
      const validationErrors = this._validateNutritionSchema(parsed);
      if (validationErrors.length > 0) {
        throw new Error(`Schema validation failed:\n• ${validationErrors.join('\n• ')}`);
      }

      // Build sanitized analysis object
      const analysis = this._buildSanitizedAnalysis(parsed);

      // Store and show results
      this.currentAnalysis = analysis;
      this._showResults(analysis);
      
      // Clear the response input
      this.elements.llmResponse.value = '';
      
      // Scroll to results
      this.elements.results.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('Parse error:', error);
      this._showParseError(error.message);
    }
  }

  /**
   * Validate nutrition data against strict schema
   * @param {Object} data - Parsed JSON data
   * @returns {Array} Array of validation error messages
   */
  _validateNutritionSchema(data) {
    const errors = [];
    const limits = this.VALIDATION_LIMITS;

    // Check required fields
    if (!data.food_items) {
      errors.push('Missing required field: food_items');
    } else if (!Array.isArray(data.food_items)) {
      errors.push('food_items must be an array');
    } else if (data.food_items.length === 0) {
      errors.push('food_items array cannot be empty');
    } else if (data.food_items.length > limits.maxArrayLength) {
      errors.push(`Too many food items (max ${limits.maxArrayLength})`);
    }

    if (!data.totals || typeof data.totals !== 'object') {
      errors.push('Missing required field: totals');
    }

    // Validate each food item
    if (Array.isArray(data.food_items)) {
      data.food_items.forEach((item, i) => {
        if (!item.name || typeof item.name !== 'string') {
          errors.push(`Item ${i + 1}: Missing or invalid name`);
        } else if (item.name.length > limits.maxStringLength) {
          errors.push(`Item ${i + 1}: Name too long (max ${limits.maxStringLength} chars)`);
        }

        if (item.quantity !== undefined) {
          const qty = parseFloat(item.quantity);
          if (isNaN(qty) || qty <= 0 || qty > limits.maxNumericValue) {
            errors.push(`Item ${i + 1}: Invalid quantity (must be 0-${limits.maxNumericValue})`);
          }
        }

        if (item.estimated_weight_g !== undefined) {
          const weight = parseFloat(item.estimated_weight_g);
          if (isNaN(weight) || weight < 0 || weight > limits.maxNumericValue) {
            errors.push(`Item ${i + 1}: Invalid weight (must be 0-${limits.maxNumericValue}g)`);
          }
        }

        // Validate nutrients
        if (item.nutrients) {
          this._validateNutrientObject(item.nutrients, `Item ${i + 1}`, errors);
        }

        if (item.micronutrients) {
          this._validateNutrientObject(item.micronutrients, `Item ${i + 1} micronutrients`, errors);
        }
      });
    }

    // Validate totals
    if (data.totals && typeof data.totals === 'object') {
      this._validateNutrientObject(data.totals, 'Totals', errors);
    }

    // Validate confidence
    if (data.confidence_overall !== undefined) {
      const conf = parseFloat(data.confidence_overall);
      if (isNaN(conf) || conf < 0 || conf > 1) {
        errors.push('confidence_overall must be between 0 and 1');
      }
    }

    return errors;
  }

  /**
   * Validate nutrient values in an object
   */
  _validateNutrientObject(obj, context, errors) {
    const limits = this.VALIDATION_LIMITS;
    const allowedNutrientKeys = [
      'energy_kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'sugar_g',
      'sodium_mg', 'saturated_fat_g', 'vitamin_a_ug', 'vitamin_c_mg',
      'vitamin_d_ug', 'folate_ug', 'iron_mg', 'calcium_mg', 'zinc_mg', 'omega3_mg'
    ];

    Object.entries(obj).forEach(([key, value]) => {
      // Check for unexpected keys (potential injection)
      if (!allowedNutrientKeys.includes(key)) {
        errors.push(`${context}: Unknown nutrient key "${this._sanitizeString(key, 30)}"`);
        return;
      }

      const num = parseFloat(value);
      if (isNaN(num)) {
        errors.push(`${context}: ${key} must be a number`);
      } else if (num < 0) {
        errors.push(`${context}: ${key} cannot be negative`);
      } else if (num > limits.maxNumericValue) {
        errors.push(`${context}: ${key} value too large (max ${limits.maxNumericValue})`);
      }
    });
  }

  /**
   * Build sanitized analysis object from parsed data
   */
  _buildSanitizedAnalysis(parsed) {
    const limits = this.VALIDATION_LIMITS;

    return {
      analysis_id: 'manual_' + Date.now(),
      timestamp: new Date().toISOString(),
      confidence_overall: this._sanitizeNumber(parsed.confidence_overall || 0.8, 0, 1),
      meal_type: this._validateEnum(parsed.meal_type, limits.allowedMealTypes, this.selectedMealType || 'snack'),
      food_items: parsed.food_items.slice(0, limits.maxArrayLength).map(item => ({
        name: this._sanitizeString(item.name || 'Unknown item', 200),
        quantity: this._sanitizeNumber(item.quantity || 1, 0.01, 1000),
        unit: this._validateEnum(item.unit, limits.allowedUnits, 'serving'),
        estimated_weight_g: this._sanitizeNumber(item.estimated_weight_g || 100, 0, 10000),
        confidence: this._sanitizeNumber(item.confidence || 0.8, 0, 1),
        preparation_method: this._validateEnum(item.preparation_method, limits.allowedPrepMethods, 'unknown'),
        nutrients: {
          energy_kcal: this._sanitizeNumber(item.nutrients?.energy_kcal),
          protein_g: this._sanitizeNumber(item.nutrients?.protein_g),
          carbs_g: this._sanitizeNumber(item.nutrients?.carbs_g),
          fat_g: this._sanitizeNumber(item.nutrients?.fat_g),
          fiber_g: this._sanitizeNumber(item.nutrients?.fiber_g),
          sugar_g: this._sanitizeNumber(item.nutrients?.sugar_g),
          sodium_mg: this._sanitizeNumber(item.nutrients?.sodium_mg),
          saturated_fat_g: this._sanitizeNumber(item.nutrients?.saturated_fat_g)
        },
        micronutrients: {
          vitamin_a_ug: this._sanitizeNumber(item.micronutrients?.vitamin_a_ug),
          vitamin_c_mg: this._sanitizeNumber(item.micronutrients?.vitamin_c_mg),
          vitamin_d_ug: this._sanitizeNumber(item.micronutrients?.vitamin_d_ug),
          folate_ug: this._sanitizeNumber(item.micronutrients?.folate_ug),
          iron_mg: this._sanitizeNumber(item.micronutrients?.iron_mg),
          calcium_mg: this._sanitizeNumber(item.micronutrients?.calcium_mg),
          zinc_mg: this._sanitizeNumber(item.micronutrients?.zinc_mg),
          omega3_mg: this._sanitizeNumber(item.micronutrients?.omega3_mg)
        }
      })),
      totals: {
        energy_kcal: this._sanitizeNumber(parsed.totals?.energy_kcal),
        protein_g: this._sanitizeNumber(parsed.totals?.protein_g),
        carbs_g: this._sanitizeNumber(parsed.totals?.carbs_g),
        fat_g: this._sanitizeNumber(parsed.totals?.fat_g),
        fiber_g: this._sanitizeNumber(parsed.totals?.fiber_g),
        sodium_mg: this._sanitizeNumber(parsed.totals?.sodium_mg)
      },
      warnings: Array.isArray(parsed.warnings) 
        ? parsed.warnings.slice(0, 10).map(w => this._sanitizeString(w, 500)) 
        : [],
      pregnancy_relevant_notes: Array.isArray(parsed.pregnancy_relevant_notes)
        ? parsed.pregnancy_relevant_notes.slice(0, 10).map(n => this._sanitizeString(n, 500))
        : []
    };
  }

  /**
   * Show parse error message
   */
  _showParseError(message) {
    this.elements.parseError.textContent = message;
    this.elements.parseError.style.display = 'block';
  }

  /**
   * Set user targets for nutrient comparison
   * @param {Object} targets - Nutrient targets from NutritionEngine
   */
  setUserTargets(targets) {
    this.userTargets = targets;
    this._updateDailyView();
  }

  /**
   * Set user profile context for better AI analysis
   * @param {Object} context - User profile data (age, weight, status, etc.)
   */
  setUserContext(context) {
    this.userContext = context;
    this._updatePrompt();
  }

  /**
   * Refresh the daily view
   */
  refresh() {
    this._updateDailyView();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FoodTrackerUI;
}

// Ensure global availability
if (typeof window !== 'undefined') {
  window.FoodTrackerUI = FoodTrackerUI;
}
