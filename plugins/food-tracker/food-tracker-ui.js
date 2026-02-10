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
    
    const apiStatusBanner = hasApi ? `
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
          <strong>Personal AI Tracker Mode (D.I.Y.)</strong>
          <p>No direct API connected? No problem! You can turn any AI (ChatGPT, Gemini, Claude) into your dedicated pregnancy nutrition assistant:</p>
          
          <div class="diy-instructions-highlight">
            <span class="diy-pro-tip">💡 How to create your dedicated tracker:</span>
            <ol>
              <li><strong>Initial Setup:</strong> Copy the AI prompt from the section below and paste it into a new chat with your favorite AI. Send it once to "train" the chat.</li>
              <li><strong>Track Anything:</strong> From now on, just send that same chat your food photos, dish titles, or even lists of ingredients.</li>
              <li><strong>Get Instant Data:</strong> The AI will respond with a structured JSON block specifically for this system.</li>
              <li><strong>Sync Progress:</strong> Paste that AI response back here to instantly calculate and track your daily nutrient targets!</li>
            </ol>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = `
      <div class="food-tracker">
        <!-- Header -->
        <div class="tracker-header">
          <h2>🍽️ Daily Food Tracker</h2>
          <p class="tracker-subtitle">Track your meals & automated nutritional analysis</p>
        </div>

        <!-- Global Meal Context -->
        <div class="tracker-global-settings">
          <div class="meal-type-selector" id="ft-meal-selector">
            <label>I am logging:</label>
            <div class="meal-options">
              <button class="meal-option" data-meal="breakfast">🌅 Breakfast</button>
              <button class="meal-option" data-meal="lunch">☀️ Lunch</button>
              <button class="meal-option" data-meal="dinner">🌙 Dinner</button>
              <button class="meal-option active" data-meal="snack">🍎 Snack</button>
            </div>
          </div>
        </div>

        <!-- Manual AI Tracker (Dropdown) -->
        <details class="tracker-workflow-dropdown manual-workflow" ${!hasApi ? 'open' : ''}>
          <summary class="workflow-summary">
            <div class="summary-title">
              <span class="summary-icon">🤖</span>
              <strong>Manual AI Tracker (D.I.Y.)</strong>
            </div>
            <span class="summary-badge ${!hasApi ? 'badge-recommended' : 'badge-optional'}">${!hasApi ? 'Recommended' : 'Optional'}</span>
          </summary>
          <div class="workflow-content">
            ${apiStatusBanner}
            
            <div class="manual-llm-section" id="ft-manual-section">
              <h3>🤖 Your Dedicated AI Nutritionist</h3>
              <p class="section-description">
                <strong>Step 1:</strong> Copy the prompt below and paste it into <strong>ChatGPT, Gemini, or Claude</strong>.<br>
                <strong>Step 2:</strong> Once sent, your AI chat becomes a dedicated tracker—just send it photos or food names anytime.<br>
                <strong>Step 3:</strong> Paste the AI's JSON code response here to sync your nutrition progress.
              </p>
              
              <div class="prompt-generator">
                <label for="ft-prompt-output">AI Prompt (copy this along with your food image):</label>
                <textarea id="ft-prompt-output" class="prompt-textarea" readonly></textarea>
                <button class="btn btn-secondary" id="ft-copy-prompt">
                  📋 Copy Prompt to Clipboard
                </button>
                <span class="copy-feedback" id="ft-copy-feedback"></span>
              </div>

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
          </div>
        </details>

        <!-- Automated AI Analysis (Dropdown) -->
        <details class="tracker-workflow-dropdown auto-workflow" ${hasApi ? 'open' : ''}>
          <summary class="workflow-summary">
            <div class="summary-title">
              <span class="summary-icon">🔍</span>
              <strong>Automated AI Analysis</strong>
            </div>
            <span class="summary-badge ${hasApi ? 'badge-connected' : 'badge-unavailable'}">${hasApi ? 'Connected' : 'No API'}</span>
          </summary>
          <div class="workflow-content">
            ${!hasApi ? `
              <div class="api-warning-info">
                <span class="warning-icon">⚠️</span>
                <p><strong>Note:</strong> Automated image analysis requires a connected Vision LLM API. 
                Use the <strong>Manual AI Tracker</strong> above to analyze images for free using ChatGPT/Gemini.</p>
              </div>
            ` : ''}

            <div class="automated-analysis-form">
              <!-- Photo Title Input (First) -->
              <div class="photo-title-section" id="ft-title-section">
                <label for="ft-photo-title">Photo Title (optional context):</label>
                <input type="text" id="ft-photo-title" class="text-input" 
                       placeholder="e.g., Homemade cod croquette, Spanish tapa..."
                       maxlength="200">
                <p class="input-hint">Add context to help the AI better identify your food</p>
              </div>

              <!-- Upload Section (Second) -->
              <div class="upload-section">
                <div class="upload-area" id="ft-upload-area">
                  <div class="upload-icon">📷</div>
                  <p>Drop food image here or click to upload</p>
                  <p class="upload-hint">Supports JPG, PNG, WebP</p>
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

                <div class="image-preview" id="ft-preview" style="display: none;">
                  <img id="ft-preview-img" src="" alt="Food preview">
                  <div class="preview-overlay">
                    <button class="btn btn-small" id="ft-remove-preview">✕ Remove</button>
                  </div>
                </div>
              </div>

              <!-- Meal Type Selection -->
              <button class="btn btn-analyze" id="ft-analyze-btn" style="display: none;">
                🔍 Analyze Food
              </button>
            </div>
          </div>
        </details>

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
            <details class="micros-dropdown">
              <summary>Micronutrients <small>Set profile to view micronutrient status</small></summary>
              <div class="micros-content">
                <p class="small">Create or load a profile to view micronutrient status.</p>
              </div>
            </details>
          </div>
        </div>

        <!-- Nutrient Comparison -->
        <div class="nutrient-comparison" id="ft-comparison" style="display: none;">
          <h3>Nutrient Status</h3>
          <div class="comparison-content" id="ft-comparison-content"></div>
        </div>

        <!-- Meals Log -->
        <div class="meals-log" id="ft-meals-log">
          <h3>Logged Meals</h3>
          <div class="meals-list" id="ft-meals-list">
            <!-- Meals will be rendered here -->
          </div>
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
        this._updatePrompt(); // Update prompt when meal type changes
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
    if (dailyLog.meals.length === 0 && !this.userTargets) {
      this.elements.summaryContent.innerHTML = `
        <p class="empty-state">No meals logged today. Upload a food photo to get started!</p>
        <details class="micros-dropdown">
          <summary>Micronutrients <small>Set profile to view micronutrient status</small></summary>
          <div class="micros-content">
            <p class="small">Create or load a profile to view micronutrient status.</p>
          </div>
        </details>
      `;
    } else {
      const totals = dailyLog.dailyTotals;
      const getLeft = (key, intake) => {
        if (!this.userTargets) return null;
        
        // Handle target key mapping (intake keys might differ from target keys)
        const mapping = {
          'folate_ug': 'folate_dfe_ug',
          'vitamin_a_ug': 'vitamin_a_rae_ug',
          'omega3_mg': 'dha_mg'
        };
        const targetKey = mapping[key] || key;
        
        if (!this.userTargets[targetKey]) return null;
        
        const target = this.tracker._extractTargetValue(this.userTargets[targetKey]);
        if (target === null) return null;
        
        const left = Math.max(0, target - intake);
        return { 
          left: left < 1 ? left.toFixed(2) : left.toFixed(1), 
          target: target.toFixed(0),
          isMet: left <= 0
        };
      };

      const macroSummary = [
        { key: 'energy_kcal', label: 'Calories', val: totals.energy_kcal },
        { key: 'protein_g', label: 'Protein', val: totals.protein_g },
        { key: 'carbs_g', label: 'Carbs', val: totals.carbs_g },
        { key: 'fat_g', label: 'Fat', val: totals.fat_g },
        { key: 'fiber_g', label: 'Fiber', val: totals.fiber_g }
      ];

      // Add critical pregnancy micronutrients if not yet met
      const criticalMicros = [
        { key: 'iron_mg', label: 'Iron' },
        { key: 'folate_dfe_ug', label: 'Folate' },
        { key: 'calcium_mg', label: 'Calcium' },
        { key: 'dha_mg', label: 'DHA' },
        { key: 'iodine_ug', label: 'Iodine' },
        { key: 'choline_mg', label: 'Choline' },
        { key: 'vitamin_d_ug', label: 'Vitamin D' }
      ];

      criticalMicros.forEach(m => {
        const val = totals[m.key] || 0;
        const leftData = getLeft(m.key, val);
        if (leftData && !leftData.isMet) {
          macroSummary.push({ ...m, val });
        }
      });

      this.elements.summaryContent.innerHTML = `
        <div class="daily-totals-grid">
          ${macroSummary.map(m => {
            const leftData = getLeft(m.key, m.val);
            const valDisplay = m.val === 0 ? '0' : m.val < 10 ? m.val.toFixed(1) : Math.round(m.val);
            return `
              <div class="daily-total ${leftData && leftData.isMet ? 'goal-met' : ''}">
                <span class="value">${valDisplay}</span>
                <span class="label">${m.label}</span>
                ${leftData ? `
                  <div class="left-to-eat ${leftData.isMet ? 'met' : 'pending'}">
                    <span class="left-val">${leftData.isMet ? '✓' : leftData.left}</span>
                    <span class="left-label">${leftData.isMet ? 'Goal Met' : 'Left'}</span>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Grouped Micronutrients (collapsed for clarity) -->
        <details class="micros-dropdown">
          <summary class="micros-summary">Micronutrients <small>${this.userTargets ? 'Click to expand and view categories' : 'Set profile to view micronutrient status'}</small></summary>
          <div class="micros-content">
            ${this.userTargets ? (() => {
              // Use existing comparison to present grouped categories with concise status
              const comparison = this.tracker.compareToTargets(this.userTargets);
              const groups = this._groupNutrients(Object.fromEntries(Object.entries(comparison.nutrients)));
              return Object.entries(groups).map(([cat, items]) => {
                const scored = items.filter(([, d]) => d && !d.isLimitOnly && !d.isInfoOnly);
                const total = scored.length;
                const met = scored.filter(([, d]) => d && d.percentage >= 100).length;
                return `
                  <details class="nutrient-category">
                    <summary>${cat} <small class="category-summary">${met}/${total} met</small></summary>
                    <div class="category-items">
                      ${items.map(([key, data]) => {
                        const intakeDisplay = data.intake === 0 ? '0' : data.intake < 10 ? data.intake.toFixed(1) : Math.round(data.intake);
                        const unit = data.unit || '';
                        const name = data.name || this._formatNutrientName(key);
                        if (data.isLimitOnly) {
                          const maxDisplay = data.target === null ? '-' : (data.target < 10 ? Number(data.target).toFixed(1) : Math.round(data.target));
                          const pct = data.percentage === null ? null : Math.round(data.percentage);
                          return `
                            <div class="micro-item">
                              <span class="micro-name">${name}</span>
                              <span class="micro-values">${intakeDisplay} ${unit} • max ${maxDisplay}${pct !== null ? ` • ${pct}%` : ''}</span>
                            </div>
                          `;
                        }
                        if (data.isInfoOnly) {
                          return `
                            <div class="micro-item">
                              <span class="micro-name">${name}</span>
                              <span class="micro-values">${intakeDisplay} ${unit} • no target</span>
                            </div>
                          `;
                        }
                        return `
                          <div class="micro-item">
                            <span class="micro-name">${name}</span>
                            <span class="micro-values">${intakeDisplay} ${unit} • ${Math.round(data.percentage || 0)}%</span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </details>
                `;
              }).join('');
            })() : '<p class="small">Create or load a profile to view micronutrient status.</p>'}
          </div>
        </details>
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
    if (this.userTargets) {
      this._updateNutrientComparison();
    }
  }

  _updateNutrientComparison() {
    if (!this.userTargets) return;

    const comparison = this.tracker.compareToTargets(this.userTargets);
    
    this.elements.comparison.style.display = 'block';

    const nutrients = Object.entries(comparison.nutrients);
    
    // Build insights HTML
    const insightsHtml = comparison.insights && comparison.insights.length > 0 ? `
      <div class="nutrient-insights">
        ${comparison.insights.map(insight => `
          <div class="insight-item insight-${insight.type}">
            <p>${insight.message}</p>
            ${insight.suggestion ? `<small>💡 Try: ${insight.suggestion}</small>` : ''}
          </div>
        `).join('')}
      </div>
    ` : '';

    // Group nutrients into categories for a cleaner, collapsible UI
    const nutrientObj = Object.fromEntries(nutrients);
    const groups = this._groupNutrients(nutrientObj);

    const groupedHtml = Object.entries(groups).map(([cat, items]) => {
      const scored = items.filter(([, d]) => d && !d.isLimitOnly && !d.isInfoOnly);
      const total = scored.length;
      const met = scored.filter(([, d]) => d && d.percentage >= 100).length;
      const avg = total ? Math.round(scored.reduce((s, [, d]) => s + (d && d.percentage || 0), 0) / total) : 0;

      const isOpen = cat === 'Macronutrients' ? 'open' : '';
      return `
        <details class="nutrient-category" ${isOpen}>
          <summary>${cat} <small class="category-summary">${met}/${total} met • ${avg}% avg</small></summary>
          <div class="category-items">
            ${items.map(([key, data]) => {
              const displayName = data.name || this._formatNutrientName(key);
              const statusClass = data.status;
              const isLimitOnly = !!data.isLimitOnly;
              const isInfoOnly = !!data.isInfoOnly;
              const isOptional = !!data.isOptional;
              const pctRaw = typeof data.percentage === 'number' ? data.percentage : 0;
              const percent = Math.min(pctRaw || 0, 150);
              const isMet = !isLimitOnly && !isInfoOnly && !isOptional && data.percentage >= 100;
              const intakeDisplay = data.intake === 0 ? '0' : data.intake < 10 ? data.intake.toFixed(1) : Math.round(data.intake);
              const unit = data.unit || '';
              const targetDisplay = data.target === null || data.target === undefined ? '-' : (data.target < 10 ? Number(data.target).toFixed(1) : Math.round(data.target));
              const valuesText = isInfoOnly
                ? `${intakeDisplay} ${unit} • no target`
                : isLimitOnly
                  ? `${intakeDisplay} ${unit} / max ${targetDisplay}`
                  : isOptional
                    ? `${intakeDisplay} ${unit} / ${targetDisplay} (optional)`
                    : `${data.intake.toFixed(1)} ${unit} / ${targetDisplay}`;
              return `
                <div class="nutrient-bar-item small">
                  <div class="nutrient-bar-label">
                    <strong>${displayName}</strong>
                    <span class="nutrient-bar-values">${valuesText}</span>
                  </div>
                  <div class="nutrient-bar-track-container">
                    <div class="nutrient-bar-track">
                      <div class="nutrient-bar-fill ${statusClass} ${isOptional ? 'optional' : ''}" style="width: ${percent}%"></div>
                    </div>
                  </div>
                  <div class="nutrient-remaining-column ${isMet ? 'met' : 'pending'}">
                    <span class="remaining-value">${isMet ? '✓' : (isLimitOnly || isInfoOnly ? '—' : data.remaining)}</span>
                    <span class="remaining-unit">${unit}</span>
                  </div>
                  <span class="nutrient-bar-percent ${statusClass}">${isInfoOnly ? '—' : `${Math.round(pctRaw || 0)}%`}</span>
                </div>
              `;
            }).join('')}
          </div>
        </details>
      `;
    }).join('');

    this.elements.comparisonContent.innerHTML = `
      <div class="nutrient-comparison-header">
        <span>Nutrient</span>
        <span>Goal Progress</span>
        <span>Left to Eat</span>
        <span>%</span>
      </div>

      <div class="nutrient-groups">
        ${groupedHtml}
      </div>

      ${insightsHtml}

      ${comparison.summary.deficit.length > 0 ? `
        <div class="comparison-alert deficit">
          <strong>⚠️ Below target:</strong> ${comparison.summary.deficit.map(n => this._formatNutrientName(n)).join(', ')}
        </div>
      ` : ''}

      ${comparison.summary.exceeded.length > 0 ? `
        <div class="comparison-alert exceeded">
          <strong>⚡ Exceeded limit:</strong> ${comparison.summary.exceeded.map(n => this._formatNutrientName(n)).join(', ')}
        </div>
      ` : ''}

      ${comparison.summary.met.length > 0 ? `
        <div class="comparison-alert success">
          <strong>✓ On track:</strong> ${comparison.summary.met.map(n => this._formatNutrientName(n)).join(', ')}
        </div>
      ` : ''}
    `;
    
    // Check for Day Complete Celebration
    if (comparison.isDayComplete) {
      this._checkForCelebration();
    }
  }

  /**
   * Check if celebration should be shown
   * @private
   */
  _checkForCelebration() {
    const today = new Date().toISOString().split('T')[0];
    const key = `celebration_shown_${today}`;
    if (!localStorage.getItem(key)) {
      this._showCelebration();
      localStorage.setItem(key, 'true');
    }
  }

  /**
   * Show celebration modal with fireworks
   * @private
   */
  _showCelebration() {
    // Create modal if not exists
    let modal = document.querySelector('.ft-celebration-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'ft-celebration-modal';
      modal.innerHTML = `
        <div class="pyro">
          <div class="before"></div>
          <div class="after"></div>
        </div>
        <div class="ft-celebration-content">
          <span class="ft-celebration-icon">🎉</span>
          <h3 class="ft-celebration-title">Daily Goals Met!</h3>
          <p class="ft-celebration-text">Congratulations! You've hit all your nutrient targets for today. Keep up the amazing work for you and your baby!</p>
          <button class="ft-close-celebration">Continue</button>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Bind close
      const closeBtn = modal.querySelector('.ft-close-celebration');
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 500); // Remove after fade out
      });
    }
    
    // Show with slight delay
    setTimeout(() => {
      modal.classList.add('visible');
    }, 100);
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
      'water_l': 'Water',
      'sodium_mg': 'Sodium',
      // B Vitamins
      'thiamin_mg': 'Thiamin (B1)',
      'riboflavin_mg': 'Riboflavin (B2)',
      'niacin_mg_ne': 'Niacin (B3)',
      'pantothenic_acid_mg': 'Pantothenic Acid (B5)',
      'vitamin_b6_mg': 'Vitamin B6',
      'biotin_ug': 'Biotin (B7)',
      'folate_dfe_ug': 'Folate (DFE)',
      'vitamin_b12_ug': 'Vitamin B12',
      'choline_mg': 'Choline',
      // Vitamins
      'vitamin_a_rae_ug': 'Vitamin A (RAE)',
      'vitamin_c_mg': 'Vitamin C',
      'vitamin_d_ug': 'Vitamin D',
      'vitamin_e_mg': 'Vitamin E',
      'vitamin_k_ug': 'Vitamin K',
      // Minerals
      'iron_mg': 'Iron',
      'calcium_mg': 'Calcium',
      'magnesium_mg': 'Magnesium',
      'zinc_mg': 'Zinc',
      'potassium_mg': 'Potassium',
      'phosphorus_mg': 'Phosphorus',
      'selenium_ug': 'Selenium',
      'iodine_ug': 'Iodine',
      'copper_ug': 'Copper',
      'manganese_mg': 'Manganese',
      'chromium_ug': 'Chromium',
      'molybdenum_ug': 'Molybdenum',
      'chloride_mg': 'Chloride',
      'fluoride_mg': 'Fluoride',
      // Fatty Acids
      'dha_mg': 'DHA (Omega-3)',
      'epa_mg': 'EPA (Omega-3)',
      'ala_omega3_g': 'ALA (Omega-3)'
    };
    return names[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Nutrient Grouping Helpers (for compact UI)
  // ─────────────────────────────────────────────────────────────────────────────

  _nutrientCategoryMap() {
    return {
      'Macronutrients': ['energy_kcal','protein_g','carbs_g','fat_g','fiber_g','water_l'],
      'B Vitamins': ['thiamin_mg','riboflavin_mg','niacin_mg_ne','pantothenic_acid_mg','vitamin_b6_mg','biotin_ug','folate_dfe_ug','vitamin_b12_ug','choline_mg'],
      'Vitamins': ['vitamin_a_rae_ug','vitamin_c_mg','vitamin_d_ug','vitamin_e_mg','vitamin_k_ug'],
      'Minerals': ['iron_mg','calcium_mg','magnesium_mg','zinc_mg','potassium_mg','phosphorus_mg','selenium_ug','iodine_ug','copper_ug','manganese_mg','chromium_ug','molybdenum_ug','sodium_mg','chloride_mg','fluoride_mg'],
      'Fatty Acids': ['dha_mg','epa_mg','ala_omega3_g']
    };
  }

  _groupNutrients(nutrientsObj) {
    const map = this._nutrientCategoryMap();
    const groups = {};
    for (const [cat, keys] of Object.entries(map)) {
      groups[cat] = keys.map(k => [k, nutrientsObj[k]]).filter(([k, d]) => d !== undefined && d !== null);
    }
    // include any remaining nutrients under 'Other'
    const mappedKeys = new Set(Object.values(map).flat());
    const others = Object.entries(nutrientsObj).filter(([k]) => !mappedKeys.has(k));
    if (others.length) groups['Other'] = others;
    return groups;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Manual LLM Prompt & Response Handling
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generate the prompt for manual use with AI models
   */
  _getManualPrompt() {
    const photoTitle = this.elements.photoTitle?.value?.trim() || '';
    const mealType = this.selectedMealType || 'snack';
    const titleContext = photoTitle 
      ? `\n\nPHOTO CONTEXT: The user identifies this image as "${photoTitle}". Use this as your primary identification guide.\n` 
      : '';
    const mealTypedContext = `\nMEAL TYPE: This is for ${mealType.toUpperCase()}.\n`;

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
Please tailor "pregnancy_relevant_notes" specifically to this profile.${mealTypedContext}${titleContext}

ROLE: You are a highly precise nutrition expert and vision AI. 
TASK: Analyze the food image provided and estimate its nutritional content for the ENTIRE MEAL shown (NOT per 100g).

CRITICAL REQUIREMENTS:
1. IDENTIFY: List all food items, ingredients, and toppings (e.g., "Homemade Cod Croquette", "Sesame seeds", "Olive oil").
2. QUANTIFY: Estimate portion sizes and total edible weight in grams for the whole plate.
3. CALCULATE: Provide FULL macro and micronutrient data for the entire portion - this is MANDATORY.
4. VALIDATE: Ensure the 'totals' mathematically match the sum of 'food_items'.
5. REQUIRED NUTRIENTS: You MUST include realistic estimates for the following macros and micronutrients (even approximate). Do not omit or set them to null/zero if you can reasonably estimate them.

- Macronutrients: energy_kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, saturated_fat_g, sodium_mg, potassium_mg, water_l
- B-complex vitamins: thiamin_mg (B1), riboflavin_mg (B2), niacin_mg_ne (B3), pantothenic_acid_mg (B5), vitamin_b6_mg, biotin_ug (B7), folate_dfe_ug, vitamin_b12_ug, choline_mg
- Other vitamins: vitamin_a_rae_ug, vitamin_c_mg, vitamin_d_ug, vitamin_e_mg, vitamin_k_ug
- Minerals: iron_mg, calcium_mg, magnesium_mg, zinc_mg, phosphorus_mg, selenium_ug, iodine_ug, copper_ug, manganese_mg, chromium_ug
- Fatty acids & omega-3s: dha_mg, epa_mg, ala_omega3_g

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
        "saturated_fat_g": 0,
        "sodium_mg": 0,
        "potassium_mg": 0,
        "magnesium_mg": 0,
        "water_l": 0
      },
      "micronutrients": {
        "folate_dfe_ug": 0,
        "iron_mg": 0,
        "calcium_mg": 0,
        "vitamin_b12_ug": 0,
        "vitamin_b6_mg": 0,
        "biotin_ug": 0,
        "niacin_mg_ne": 0,
        "riboflavin_mg": 0,
        "thiamin_mg": 0,
        "pantothenic_acid_mg": 0,
        "choline_mg": 0,
        "vitamin_c_mg": 0,
        "vitamin_d_ug": 0,
        "vitamin_a_rae_ug": 0,
        "vitamin_e_mg": 0,
        "vitamin_k_ug": 0,
        "zinc_mg": 0,
        "phosphorus_mg": 0,
        "selenium_ug": 0,
        "iodine_ug": 0,
        "copper_ug": 0,
        "manganese_mg": 0,
        "chromium_ug": 0,
        "dha_mg": 0,
        "epa_mg": 0,
        "ala_omega3_g": 0
      }
    }
  ],
  "totals": {
    "energy_kcal": 0,
    "protein_g": 0,
    "carbs_g": 0,
    "fat_g": 0,
    "fiber_g": 0,
    "sugar_g": 0,
    "folate_dfe_ug": 0,
    "iron_mg": 0,
    "calcium_mg": 0,
    "vitamin_b12_ug": 0,
    "vitamin_b6_mg": 0,
    "vitamin_c_mg": 0,
    "vitamin_d_ug": 0,
    "dha_mg": 0,
    "epa_mg": 0,
    "ala_omega3_g": 0
  },
  "meal_type": "breakfast|lunch|dinner|snack",
  "confidence_overall": 0.9,
  "warnings": ["Identify any risks like undercooked fish, excessive caffeine, etc."],
  "pregnancy_relevant_notes": ["Specific advice for a ${userPersona} regarding these items"]
}

IMPORTANT: Micronutrients are ESSENTIAL for accurate tracking. Use standard nutritional databases (USDA, etc.) to estimate realistic values. Do not omit them.

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
        } else {
          errors.push(`Item ${i + 1}: Missing micronutrients object - micronutrients are required for accurate tracking`);
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
      'sodium_mg', 'saturated_fat_g', 'potassium_mg', 'magnesium_mg',
      'vitamin_a_rae_ug', 'vitamin_a_ug', 'vitamin_c_mg', 'vitamin_d_ug', 
      'folate_dfe_ug', 'folate_ug', 'iron_mg', 'calcium_mg', 'zinc_mg', 
      'dha_mg', 'epa_mg', 'omega3_mg', 'iodine_ug', 'choline_mg',
      'vitamin_b12_ug', 'vitamin_b6_mg', 'vitamin_k_ug', 'vitamin_e_mg', 'selenium_ug'
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
          saturated_fat_g: this._sanitizeNumber(item.nutrients?.saturated_fat_g),
          potassium_mg: this._sanitizeNumber(item.nutrients?.potassium_mg),
          magnesium_mg: this._sanitizeNumber(item.nutrients?.magnesium_mg)
        },
        micronutrients: {
          vitamin_a_rae_ug: this._sanitizeNumber(item.micronutrients?.vitamin_a_rae_ug || item.micronutrients?.vitamin_a_ug),
          vitamin_c_mg: this._sanitizeNumber(item.micronutrients?.vitamin_c_mg),
          vitamin_d_ug: this._sanitizeNumber(item.micronutrients?.vitamin_d_ug),
          folate_dfe_ug: this._sanitizeNumber(item.micronutrients?.folate_dfe_ug || item.micronutrients?.folate_ug),
          iron_mg: this._sanitizeNumber(item.micronutrients?.iron_mg),
          calcium_mg: this._sanitizeNumber(item.micronutrients?.calcium_mg),
          zinc_mg: this._sanitizeNumber(item.micronutrients?.zinc_mg),
          dha_mg: this._sanitizeNumber(item.micronutrients?.dha_mg || item.micronutrients?.omega3_mg),
          epa_mg: this._sanitizeNumber(item.micronutrients?.epa_mg),
          iodine_ug: this._sanitizeNumber(item.micronutrients?.iodine_ug),
          choline_mg: this._sanitizeNumber(item.micronutrients?.choline_mg),
          vitamin_b12_ug: this._sanitizeNumber(item.micronutrients?.vitamin_b12_ug),
          vitamin_b6_mg: this._sanitizeNumber(item.micronutrients?.vitamin_b6_mg),
          vitamin_k_ug: this._sanitizeNumber(item.micronutrients?.vitamin_k_ug),
          vitamin_e_mg: this._sanitizeNumber(item.micronutrients?.vitamin_e_mg),
          selenium_ug: this._sanitizeNumber(item.micronutrients?.selenium_ug)
        }
      })),
      totals: {
        energy_kcal: this._sanitizeNumber(parsed.totals?.energy_kcal),
        protein_g: this._sanitizeNumber(parsed.totals?.protein_g),
        carbs_g: this._sanitizeNumber(parsed.totals?.carbs_g),
        fat_g: this._sanitizeNumber(parsed.totals?.fat_g),
        fiber_g: this._sanitizeNumber(parsed.totals?.fiber_g),
        sodium_mg: this._sanitizeNumber(parsed.totals?.sodium_mg),
        folate_dfe_ug: this._sanitizeNumber(parsed.totals?.folate_dfe_ug || parsed.totals?.folate_ug),
        iron_mg: this._sanitizeNumber(parsed.totals?.iron_mg),
        calcium_mg: this._sanitizeNumber(parsed.totals?.calcium_mg),
        vitamin_b12_ug: this._sanitizeNumber(parsed.totals?.vitamin_b12_ug),
        dha_mg: this._sanitizeNumber(parsed.totals?.dha_mg || parsed.totals?.omega3_mg)
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
