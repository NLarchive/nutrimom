/**
 * NutriMom - Pregnancy Nutrition Calculator
 * Main application controller
 */
document.addEventListener('DOMContentLoaded', async () => {
  const engine = new NutritionEngine();
  let currentPlan = null;
  let currentCategory = 'macro';
  let foodTracker = null;

  // Storage keys
  const STORAGE_KEYS = {
    profile: 'nutrimom_user_profile',
    plan: 'nutrimom_nutrition_plan',
    foodLog: 'nutrimom_food_log'
  };

  // DOM Elements
  const form = document.getElementById('profile-form');
  const sexSelect = document.getElementById('sex');
  const pregnancySection = document.getElementById('pregnancy-section');
  const pregnancyFields = document.getElementById('pregnancy-fields');
  const lactationFields = document.getElementById('lactation-fields');
  const resultsSection = document.getElementById('results-section');
  const nutrientTabs = document.getElementById('nutrient-tabs');
  const pregnancyWeekInput = document.getElementById('pregnancy-week');
  const trimesterDisplay = document.getElementById('trimester-display');
  const views = document.querySelectorAll('.view-content');
  const profileWarningBanner = document.getElementById('profile-warning-banner');

  // Data management buttons
  const exportBtn = document.getElementById('btn-export-data');
  const importBtn = document.getElementById('btn-import-data');
  const clearBtn = document.getElementById('btn-clear-data');
  const importFileInput = document.getElementById('import-file-input');

  // Load data FIRST before initializing plugin
  try {
    await engine.loadData('./data');
    console.log('Nutrition data loaded successfully');
  } catch (err) {
    console.error('Failed to load data:', err);
    alert('Failed to load nutrition data. Please refresh.');
    return;
  }

  // Navigation Logic
  function switchView(target) {
    if (!target) return;
    
    // Update active state on ALL nav-tabs
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.target === target);
    });
    
    // Update visibility of views
    views.forEach(v => {
      v.classList.toggle('active', v.id === target);
    });

    // Show profile warning if navigating to tracker without profile
    if (target === 'tracker-view') {
      const hasProfile = localStorage.getItem(STORAGE_KEYS.profile);
      if (profileWarningBanner) {
        profileWarningBanner.style.display = hasProfile ? 'none' : 'flex';
      }
      if (foodTracker) {
        foodTracker.getUI().refresh();
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.nav-tab');
    if (tab) {
      e.preventDefault();
      switchView(tab.dataset.target);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Data Export/Import/Clear
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Sanitize string for safe storage/display
   */
  function sanitizeString(str, maxLen = 500) {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
  }

  /**
   * Sanitize number input
   */
  function sanitizeNumber(value, min = 0, max = 100000) {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return null;
    return Math.max(min, Math.min(max, num));
  }

  /**
   * Export all user data to JSON file
   */
  function exportUserData() {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        profile: JSON.parse(localStorage.getItem(STORAGE_KEYS.profile) || 'null'),
        plan: JSON.parse(localStorage.getItem(STORAGE_KEYS.plan) || 'null'),
        foodLog: JSON.parse(localStorage.getItem(STORAGE_KEYS.foodLog) || '{}')
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutrimom-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('✓ Data exported successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    }
  }

  /**
   * Import user data from JSON file
   */
  function importUserData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Limit file size (1MB)
        if (e.target.result.length > 1048576) {
          throw new Error('File too large (max 1MB)');
        }

        const data = JSON.parse(e.target.result);

        // Validate structure
        if (!data.version || !data.exportDate) {
          throw new Error('Invalid backup file format');
        }

        // Validate and sanitize profile data
        if (data.profile) {
          const profile = data.profile;
          const sanitizedProfile = {
            ageYears: sanitizeNumber(profile.ageYears, 14, 60),
            sex: ['male', 'female'].includes(profile.sex) ? profile.sex : null,
            weightKg: sanitizeNumber(profile.weightKg, 30, 250),
            heightCm: sanitizeNumber(profile.heightCm, 100, 250),
            activityLevel: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'].includes(profile.activityLevel) 
              ? profile.activityLevel : null,
            isPregnant: profile.isPregnant === true,
            pregnancyWeek: sanitizeNumber(profile.pregnancyWeek, 1, 42),
            prePregnancyWeightKg: sanitizeNumber(profile.prePregnancyWeightKg, 30, 250),
            isLactating: profile.isLactating === true,
            lactationMonths: sanitizeNumber(profile.lactationMonths, 0, 24),
            isMultiples: profile.isMultiples === true
          };
          localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(sanitizedProfile));
        }

        if (data.plan) {
          localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(data.plan));
        }

        if (data.foodLog && typeof data.foodLog === 'object') {
          localStorage.setItem(STORAGE_KEYS.foodLog, JSON.stringify(data.foodLog));
        }

        // Reload page to apply imported data
        alert('✓ Data imported successfully! The page will reload.');
        location.reload();

      } catch (err) {
        console.error('Import failed:', err);
        alert(`Import failed: ${err.message}`);
      }
    };
    reader.onerror = () => alert('Failed to read file');
    reader.readAsText(file);
  }

  /**
   * Clear all user data
   */
  function clearAllData() {
    if (!confirm('⚠️ Clear All Data?\n\nThis will permanently delete:\n• Your profile\n• Nutrition calculations\n• Food log history\n\nThis cannot be undone.')) {
      return;
    }

    if (!confirm('Are you absolutely sure? All your data will be lost.')) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.profile);
      localStorage.removeItem(STORAGE_KEYS.plan);
      localStorage.removeItem(STORAGE_KEYS.foodLog);
      
      alert('✓ All data cleared. The page will reload.');
      location.reload();
    } catch (err) {
      console.error('Clear failed:', err);
      alert('Failed to clear data.');
    }
  }

  // Bind data management events
  if (exportBtn) exportBtn.addEventListener('click', exportUserData);
  if (importBtn) importBtn.addEventListener('click', () => importFileInput?.click());
  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        importUserData(e.target.files[0]);
        e.target.value = ''; // Reset for next import
      }
    });
  }
  if (clearBtn) clearBtn.addEventListener('click', clearAllData);

  // ─────────────────────────────────────────────────────────────────────────────
  // Load Saved Profile
  // ─────────────────────────────────────────────────────────────────────────────
  
  function loadSavedProfile() {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.profile);
      if (!savedProfile) return;

      const profile = JSON.parse(savedProfile);
      
      // Populate form fields
      if (profile.ageYears) document.getElementById('age').value = profile.ageYears;
      if (profile.sex) {
        document.getElementById('sex').value = profile.sex;
        if (profile.sex === 'female') {
          pregnancySection.style.display = 'block';
        }
      }
      if (profile.weightKg) document.getElementById('weight').value = profile.weightKg;
      if (profile.heightCm) document.getElementById('height').value = profile.heightCm;
      if (profile.activityLevel) document.getElementById('activity').value = profile.activityLevel;
      
      // Set pregnancy/lactation status
      if (profile.isPregnant) {
        document.querySelector('input[name="status"][value="pregnant"]').checked = true;
        pregnancyFields.style.display = 'block';
        if (profile.pregnancyWeek) {
          document.getElementById('pregnancy-week').value = profile.pregnancyWeek;
          const trimester = engine.getTrimester(profile.pregnancyWeek);
          trimesterDisplay.textContent = `Trimester ${trimester}`;
        }
        if (profile.prePregnancyWeightKg) {
          document.getElementById('pre-pregnancy-weight').value = profile.prePregnancyWeightKg;
        }
        if (profile.isMultiples) {
          document.getElementById('is-twins').checked = true;
        }
      } else if (profile.isLactating) {
        document.querySelector('input[name="status"][value="lactating"]').checked = true;
        lactationFields.style.display = 'block';
        if (profile.lactationMonths) {
          document.getElementById('lactation-months').value = profile.lactationMonths;
        }
      }

      // Auto-calculate if we have enough data
      const savedPlan = localStorage.getItem(STORAGE_KEYS.plan);
      if (savedPlan && profile.ageYears && profile.sex && profile.weightKg && profile.heightCm && profile.activityLevel) {
        // Trigger calculation with saved data
        setTimeout(() => {
          calculateAndDisplay();
        }, 100);
      }

      console.log('Loaded saved profile');
    } catch (err) {
      console.error('Failed to load saved profile:', err);
    }
  }

  // Load saved profile after data is ready
  loadSavedProfile();

  // ONLY NOW initialize Food Tracker Plugin (after engine data is loaded and profile is restored)
  try {
    foodTracker = new FoodTrackerPlugin({
      containerId: 'food-tracker-container',
      nutritionEngine: engine
    });
    foodTracker.init();
    console.log('Food Tracker Plugin initialized successfully');
  } catch (err) {
    console.error('Failed to initialize Food Tracker Plugin:', err);
  }

  // Sex change - show/hide pregnancy section
  sexSelect.addEventListener('change', () => {
    pregnancySection.style.display = sexSelect.value === 'female' ? 'block' : 'none';
  });

  // Status radio buttons
  document.querySelectorAll('input[name="status"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      pregnancyFields.style.display = e.target.value === 'pregnant' ? 'block' : 'none';
      lactationFields.style.display = e.target.value === 'lactating' ? 'block' : 'none';
    });
  });

  // Pregnancy week change - show trimester
  pregnancyWeekInput.addEventListener('input', () => {
    const week = parseInt(pregnancyWeekInput.value);
    if (week >= 1 && week <= 42) {
      const trimester = engine.getTrimester(week);
      trimesterDisplay.textContent = `Trimester ${trimester}`;
    } else {
      trimesterDisplay.textContent = '';
    }
  });

  // Tab switching
  nutrientTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.nutrient-tab');
    if (tab) {
      document.querySelectorAll('.nutrient-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      if (currentPlan) displayNutrientGrid(currentPlan.targets, currentCategory);
    }
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateAndDisplay();
  });

  function calculateAndDisplay() {
    const status = document.querySelector('input[name="status"]:checked')?.value || 'none';
    const profile = {
      ageYears: parseInt(document.getElementById('age').value),
      sex: document.getElementById('sex').value,
      weightKg: parseFloat(document.getElementById('weight').value),
      heightCm: parseFloat(document.getElementById('height').value),
      activityLevel: document.getElementById('activity').value,
      isPregnant: status === 'pregnant',
      pregnancyWeek: parseInt(document.getElementById('pregnancy-week').value) || null,
      prePregnancyWeightKg: parseFloat(document.getElementById('pre-pregnancy-weight').value) || null,
      isLactating: status === 'lactating',
      lactationMonths: parseInt(document.getElementById('lactation-months').value) || null,
      isMultiples: document.getElementById('is-twins')?.checked || false
    };

    currentPlan = engine.getNutritionPlan(profile);
    
    // Save profile and plan to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(currentPlan));
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
    
    // Update Food Tracker with new targets and profile context
    if (foodTracker) {
      foodTracker.setUserTargets(currentPlan.targets);
      // Pass the profile context to the UI for better LLM prompts
      foodTracker.getUI().setUserContext({
        lifeStage: currentPlan.classification.lifeStageLabel,
        age: profile.ageYears,
        weight: profile.weightKg,
        height: profile.heightCm,
        isPregnant: profile.isPregnant,
        pregnancyWeek: profile.pregnancyWeek,
        isLactating: profile.isLactating
      });
    }

    // Hide profile warning banner since profile is now complete
    if (profileWarningBanner) {
      profileWarningBanner.style.display = 'none';
    }

    displayProfileCard(currentPlan, profile);
    displayEnergy(currentPlan.energy, profile.isPregnant);
    displayNutrientGrid(currentPlan.targets, currentCategory);
    
    // Pregnancy-specific displays
    const weightCard = document.getElementById('weight-gain-card');
    const comparisonBlock = document.getElementById('comparison-block');
    const criticalCard = document.getElementById('critical-nutrients-card');
    
    if (profile.isPregnant && profile.pregnancyWeek && profile.prePregnancyWeightKg) {
      displayWeightGain(profile);
      weightCard.style.display = 'block';
    } else {
      weightCard.style.display = 'none';
    }
    
    if (profile.isPregnant && profile.pregnancyWeek) {
      const comparison = engine.getPregnancyComparison(profile.ageYears, profile.pregnancyWeek);
      displayComparison(comparison);
      comparisonBlock.style.display = 'block';
      
      displayCriticalNutrients(currentPlan.targets);
      criticalCard.style.display = 'block';
    } else {
      comparisonBlock.style.display = 'none';
      criticalCard.style.display = 'none';
    }

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function displayProfileCard(plan, profile) {
    const avatar = document.getElementById('profile-avatar');
    const stageLabel = document.getElementById('profile-stage-label');
    const subtitle = document.getElementById('profile-subtitle');
    const bmiDisplay = document.getElementById('profile-bmi-display');

    const bmi = engine.calculateBMI(profile.weightKg, profile.heightCm);
    const bmiCategory = engine.getBMICategory(bmi);
    
    avatar.textContent = profile.isPregnant ? '🤰' : profile.isLactating ? '🤱' : '👩';
    stageLabel.textContent = plan.classification.lifeStageLabel;
    subtitle.textContent = `${formatAgeBand(plan.classification.ageBand)} • ${formatActivity(profile.activityLevel)}`;
    bmiDisplay.querySelector('.bmi-value').textContent = bmi;
    bmiDisplay.querySelector('.bmi-label').textContent = `BMI (${bmiCategory})`;
  }

  function displayEnergy(energy, isPregnant) {
    document.getElementById('bmr-value').textContent = energy.bmr.toLocaleString();
    document.getElementById('tdee-value').textContent = energy.tdee.toLocaleString();
    document.getElementById('total-energy-value').textContent = energy.totalEnergy.toLocaleString();
    
    const incrementStat = document.getElementById('pregnancy-increment-stat');
    if (isPregnant && energy.pregnancyIncrement > 0) {
      document.getElementById('increment-value').textContent = '+' + energy.pregnancyIncrement;
      incrementStat.style.display = 'block';
    } else {
      incrementStat.style.display = 'none';
    }
  }

  function displayWeightGain(profile) {
    const preBMI = engine.calculateBMI(profile.prePregnancyWeightKg, profile.heightCm);
    const rec = engine.getPregnancyWeightGainRecommendation(preBMI, profile.isMultiples);
    const container = document.getElementById('weight-recommendation');
    
    container.innerHTML = `
      <div class="weight-range">
        <div class="weight-range-label">Recommended total weight gain</div>
        <div class="weight-range-value">${rec.minKg} - ${rec.maxKg} kg</div>
      </div>
      ${rec.weeklyT2T3Kg ? `
      <div class="weight-weekly">
        <div class="weight-weekly-value">${rec.weeklyT2T3Kg} kg/week</div>
        <div class="weight-weekly-label">T2 & T3 rate</div>
      </div>` : ''}
    `;
  }

  function displayNutrientGrid(targets, category) {
    const grid = document.getElementById('nutrient-grid');
    const filtered = Object.entries(targets).filter(([_, d]) => d.category === category);
    
    if (filtered.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:var(--gray-500);">No nutrients in this category</p>';
      return;
    }
    
    grid.innerHTML = filtered.map(([code, data]) => {
      const target = data.target || data.RDA || data.AI || '-';
      const ul = data.UL;
      const sources = data.foodSources || [];
      
      return `
        <div class="nutrient-item">
          <div>
            <div class="nutrient-name">${data.name}</div>
            ${data.importancePregnancy ? `<div class="nutrient-importance">${truncate(data.importancePregnancy, 80)}</div>` : ''}
          </div>
          <div class="nutrient-target">
            <span class="nutrient-target-value">${formatNum(target)}</span>
            <span class="nutrient-target-unit">${data.unit || ''}</span>
          </div>
          <div class="nutrient-ul">
            ${ul ? `<div class="nutrient-ul-label">Upper Limit</div><div class="nutrient-ul-value">${formatNum(ul)} ${data.unit || ''}</div>` : '<div class="nutrient-ul-value">-</div>'}
          </div>
          ${sources.length > 0 ? `<div class="food-tags">${sources.slice(0,4).map(s => `<span class="food-tag">${s}</span>`).join('')}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function displayComparison(comparison) {
    const container = document.getElementById('comparison-content');
    const increased = comparison.filter(c => c.increased && c.percentChange > 0)
      .sort((a, b) => b.percentChange - a.percentChange)
      .slice(0, 10);
    
    if (increased.length === 0) {
      container.innerHTML = '<p>No significant changes from non-pregnant targets.</p>';
      return;
    }
    
    container.innerHTML = increased.map(c => `
      <div class="comparison-item">
        <div class="comparison-nutrient">${c.name}</div>
        <div class="comparison-from">${formatNum(c.baseValue)} ${c.unit}</div>
        <div class="comparison-to">${formatNum(c.compareValue)} ${c.unit}</div>
        <div class="comparison-change ${c.difference < 0 ? 'down' : ''}">
          ${c.difference > 0 ? '↑' : '↓'} ${Math.abs(c.percentChange)}%
        </div>
      </div>
    `).join('');
  }

  function displayCriticalNutrients(targets) {
    const critical = ['folate_dfe_ug', 'iron_mg', 'calcium_mg', 'vitamin_d_ug', 'dha_mg', 'iodine_ug'];
    const container = document.getElementById('critical-nutrients');
    
    const items = critical
      .filter(code => targets[code])
      .map(code => targets[code]);
    
    container.innerHTML = items.map(n => `
      <div class="critical-item">
        <div class="critical-name">${n.name}</div>
        <div class="critical-reason">${truncate(n.importancePregnancy || n.description || '', 100)}</div>
      </div>
    `).join('');
  }

  // Helpers
  function formatAgeBand(code) {
    const labels = { '14_18': '14-18 years', '19_30': '19-30 years', '31_50': '31-50 years', '51_plus': '51+ years' };
    return labels[code] || code;
  }
  
  function formatActivity(level) {
    const labels = { sedentary: 'Sedentary', lightly_active: 'Lightly Active', moderately_active: 'Moderately Active', very_active: 'Very Active', extra_active: 'Extra Active' };
    return labels[level] || level;
  }
  
  function formatNum(val) {
    if (typeof val !== 'number') return val;
    if (val >= 1000) return val.toLocaleString();
    if (val < 1 && val > 0) return val.toFixed(2);
    return Math.round(val * 10) / 10;
  }
  
  function truncate(str, max) {
    if (!str) return '';
    return str.length <= max ? str : str.slice(0, max) + '...';
  }
});
