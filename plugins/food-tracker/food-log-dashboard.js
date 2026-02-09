/**
 * Food Log Dashboard Component
 * 
 * Renders a historical view of tracked food data:
 * - Summary stats cards
 * - Daily log table with macro/micronutrient columns
 * - Weekly calorie/protein bar charts (CSS-based)
 * - Nutrient trend insights
 * 
 * @author Nicolas Ivan Larenas Bustamante
 * @license CC-BY-NC-SA-4.0
 */

class FoodLogDashboard {
  constructor(options = {}) {
    this.containerId = options.containerId || 'food-log-dashboard';
    this.tracker = options.tracker || null;
    this.userTargets = options.userTargets || null;
    
    this.container = null;
    this._initialized = false;
  }

  /**
   * Initialize the dashboard (call after DOM is ready)
   */
  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.warn(`Food log dashboard container #${this.containerId} not found`);
      return;
    }
    this._initialized = true;
    this.render();
  }

  /**
   * Set user targets for comparison
   */
  setUserTargets(targets) {
    this.userTargets = targets;
    if (this._initialized) this.render();
  }

  /**
   * Re-render the entire dashboard
   */
  render() {
    if (!this.container || !this.tracker) return;

    const allDays = this.tracker.getAllDaysSummary();
    const meta = this.tracker.getMeta();
    const weeklyAvg = this.tracker.getWeeklyAverages();

    if (allDays.length === 0) {
      this.container.innerHTML = this._renderEmptyState();
      return;
    }

    this.container.innerHTML = `
      <div class="log-dashboard">
        <div class="log-header">
          <h2>📊 Nutrition Log</h2>
          <p class="log-subtitle">Your daily nutrition history at a glance</p>
        </div>

        ${this._renderSummaryCards(meta, weeklyAvg)}
        ${this._renderWeeklyChart(weeklyAvg)}
        ${this._renderMicronutrientChart(weeklyAvg)}
        ${this._renderInsights(weeklyAvg, allDays)}
        ${this._renderDayTable(allDays)}
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Empty State
  // ─────────────────────────────────────────────────────────────────────────────

  _renderEmptyState() {
    return `
      <div class="log-dashboard">
        <div class="log-header">
          <h2>📊 Nutrition Log</h2>
          <p class="log-subtitle">Your daily nutrition history at a glance</p>
        </div>
        <div class="log-empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Data Yet</h3>
          <p>Start tracking your meals in the <strong>Food Tracker</strong> tab, or import saved data using the 📂 button above.</p>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Summary Cards
  // ─────────────────────────────────────────────────────────────────────────────

  _renderSummaryCards(meta, weeklyAvg) {
    const avgCal = Math.round(weeklyAvg.averages.energy_kcal || 0);
    const avgProtein = Math.round((weeklyAvg.averages.protein_g || 0) * 10) / 10;
    const avgIron = Math.round((weeklyAvg.averages.iron_mg || 0) * 10) / 10;
    const avgFolate = Math.round(weeklyAvg.averages.folate_dfe_ug || weeklyAvg.averages.folate_ug || 0);

    return `
      <div class="log-summary-cards" id="log-summary-cards">
        <div class="log-card">
          <div class="log-card-icon">📅</div>
          <div class="log-card-value">${meta.totalDaysLogged || 0}</div>
          <div class="log-card-label">Days Tracked</div>
        </div>
        <div class="log-card">
          <div class="log-card-icon">🍽️</div>
          <div class="log-card-value">${meta.totalMealsLogged || 0}</div>
          <div class="log-card-label">Total Meals</div>
        </div>
        <div class="log-card">
          <div class="log-card-icon">🔥</div>
          <div class="log-card-value">${avgCal.toLocaleString()}</div>
          <div class="log-card-label">Avg Calories/Day</div>
        </div>
        <div class="log-card">
          <div class="log-card-icon">💪</div>
          <div class="log-card-value">${avgProtein}g</div>
          <div class="log-card-label">Avg Protein/Day</div>
        </div>
        <div class="log-card accent-folate">
          <div class="log-card-icon">🧬</div>
          <div class="log-card-value">${avgFolate}µg</div>
          <div class="log-card-label">Avg Folate/Day</div>
        </div>
        <div class="log-card accent-iron">
          <div class="log-card-icon">🩸</div>
          <div class="log-card-value">${avgIron}mg</div>
          <div class="log-card-label">Avg Iron/Day</div>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Weekly Bar Chart (Calories & Protein)
  // ─────────────────────────────────────────────────────────────────────────────

  _renderWeeklyChart(weeklyAvg) {
    if (weeklyAvg.dailyData.length === 0) return '';

    const maxCal = Math.max(...weeklyAvg.dailyData.map(d => d.calories), 1);
    const maxProtein = Math.max(...weeklyAvg.dailyData.map(d => d.protein), 1);

    // Target lines
    let calTarget = 0;
    let proteinTarget = 0;
    if (this.userTargets) {
      calTarget = this._extractTarget(this.userTargets.energy_kcal);
      proteinTarget = this._extractTarget(this.userTargets.protein_g);
    }

    const chartMax = Math.max(maxCal, calTarget) * 1.1;
    const proteinChartMax = Math.max(maxProtein, proteinTarget) * 1.1;

    const calBars = weeklyAvg.dailyData.map(d => {
      const pct = (d.calories / chartMax) * 100;
      const dayLabel = this._shortDayName(d.date);
      const status = calTarget && d.calories >= calTarget * 0.8 ? 'on-track' : 'below';
      return `
        <div class="chart-bar-group">
          <div class="chart-bar-value">${d.calories}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill ${status}" style="height: ${pct}%"></div>
          </div>
          <div class="chart-bar-label">${dayLabel}</div>
        </div>
      `;
    }).join('');

    const proteinBars = weeklyAvg.dailyData.map(d => {
      const pct = (d.protein / proteinChartMax) * 100;
      const dayLabel = this._shortDayName(d.date);
      const status = proteinTarget && d.protein >= proteinTarget * 0.8 ? 'on-track' : 'below';
      return `
        <div class="chart-bar-group">
          <div class="chart-bar-value">${d.protein}g</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill protein ${status}" style="height: ${pct}%"></div>
          </div>
          <div class="chart-bar-label">${dayLabel}</div>
        </div>
      `;
    }).join('');

    const calTargetPct = calTarget ? (calTarget / chartMax) * 100 : 0;
    const protTargetPct = proteinTarget ? (proteinTarget / proteinChartMax) * 100 : 0;

    return `
      <div class="log-section" id="log-weekly-chart">
        <h3>📈 Weekly Overview</h3>
        <div class="log-charts-row">
          <div class="log-chart-container">
            <h4>Daily Calories (kcal)</h4>
            <div class="chart-wrapper">
              <div class="chart-bars">${calBars}</div>
              ${calTarget ? `<div class="chart-target-line" style="bottom: ${calTargetPct}%"><span>Target: ${calTarget}</span></div>` : ''}
            </div>
          </div>
          <div class="log-chart-container">
            <h4>Daily Protein (g)</h4>
            <div class="chart-wrapper">
              <div class="chart-bars">${proteinBars}</div>
              ${proteinTarget ? `<div class="chart-target-line" style="bottom: ${protTargetPct}%"><span>Target: ${proteinTarget}g</span></div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Micronutrient Average Chart
  // ─────────────────────────────────────────────────────────────────────────────

  _renderMicronutrientChart(weeklyAvg) {
    if (weeklyAvg.daysTracked === 0) return '';

    const micronutrients = [
      { key: 'folate_dfe_ug', name: 'Folate', unit: 'µg', targetKey: 'folate_dfe_ug', color: '#48bb78' },
      { key: 'iron_mg', name: 'Iron', unit: 'mg', targetKey: 'iron_mg', color: '#e53e3e' },
      { key: 'calcium_mg', name: 'Calcium', unit: 'mg', targetKey: 'calcium_mg', color: '#4299e1' },
      { key: 'dha_mg', name: 'DHA', unit: 'mg', targetKey: 'dha_mg', color: '#319795' },
      { key: 'iodine_ug', name: 'Iodine', unit: 'µg', targetKey: 'iodine_ug', color: '#d69e2e' },
      { key: 'choline_mg', name: 'Choline', unit: 'mg', targetKey: 'choline_mg', color: '#9b2c2c' },
      { key: 'vitamin_d_ug', name: 'Vitamin D', unit: 'µg', targetKey: 'vitamin_d_ug', color: '#ecc94b' },
      { key: 'zinc_mg', name: 'Zinc', unit: 'mg', targetKey: 'zinc_mg', color: '#9f7aea' },
      { key: 'vitamin_b12_ug', name: 'Vit B12', unit: 'µg', targetKey: 'vitamin_b12_ug', color: '#805ad5' },
      { key: 'vitamin_b6_mg', name: 'Vit B6', unit: 'mg', targetKey: 'vitamin_b6_mg', color: '#ed64a6' },
      { key: 'vitamin_a_rae_ug', name: 'Vitamin A', unit: 'µg', targetKey: 'vitamin_a_rae_ug', color: '#667eea' },
      { key: 'magnesium_mg', name: 'Magnesium', unit: 'mg', targetKey: 'magnesium_mg', color: '#38b2ac' },
      { key: 'selenium_ug', name: 'Selenium', unit: 'µg', targetKey: 'selenium_ug', color: '#38a169' }
    ];

    const bars = micronutrients.map(n => {
      // Handle key mapping if necessary (historical fallback)
      const avg = weeklyAvg.averages[n.key] || weeklyAvg.averages[n.key.replace('_dfe', '').replace('_rae', '')] || 0;
      const target = this.userTargets ? this._extractTarget(this.userTargets[n.targetKey]) : 0;
      const pct = target > 0 ? Math.min((avg / target) * 100, 150) : 0;
      const status = pct >= 100 ? 'met' : pct >= 80 ? 'close' : pct >= 50 ? 'low' : 'deficient';

      return `
        <div class="micro-bar-item">
          <div class="micro-bar-label">
            <span class="micro-name">${n.name}</span>
            <span class="micro-values">${Math.round(avg * 10) / 10} / ${target || '?'} ${n.unit}</span>
          </div>
          <div class="micro-bar-track">
            <div class="micro-bar-fill micro-${status}" style="width: ${Math.min(pct, 100)}%; background-color: ${n.color}"></div>
          </div>
          <span class="micro-pct micro-${status}">${target > 0 ? Math.round(pct) + '%' : 'N/A'}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="log-section" id="log-micro-chart">
        <h3>🧪 Average Daily Micronutrients</h3>
        <p class="section-note">Average intake across ${weeklyAvg.daysTracked} tracked days vs. daily targets</p>
        <div class="micro-bars-container">${bars}</div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Insights
  // ─────────────────────────────────────────────────────────────────────────────

  _renderInsights(weeklyAvg, allDays) {
    const insights = [];

    // Consistency insight
    if (weeklyAvg.daysTracked > 0) {
      const consistency = Math.round((weeklyAvg.daysTracked / weeklyAvg.daysTotal) * 100);
      if (consistency >= 90) {
        insights.push({ type: 'success', icon: '⭐', message: `Excellent tracking consistency! ${weeklyAvg.daysTracked}/${weeklyAvg.daysTotal} days logged.` });
      } else if (consistency >= 60) {
        insights.push({ type: 'info', icon: '📊', message: `Good tracking: ${weeklyAvg.daysTracked}/${weeklyAvg.daysTotal} days logged this week.` });
      } else {
        insights.push({ type: 'warning', icon: '📝', message: `Only ${weeklyAvg.daysTracked}/${weeklyAvg.daysTotal} days logged. Try to track more consistently for better insights.` });
      }
    }

    // Calorie trend
    if (weeklyAvg.trends.calories) {
      const t = weeklyAvg.trends.calories;
      if (t.direction === 'up' && t.change > 100) {
        insights.push({ type: 'info', icon: '📈', message: `Calorie intake trending up (+${t.change} kcal avg) over the week.` });
      } else if (t.direction === 'down' && t.change < -100) {
        insights.push({ type: 'warning', icon: '📉', message: `Calorie intake trending down (${t.change} kcal avg). Ensure you're eating enough during pregnancy.` });
      }
    }

    // Protein check
    if (this.userTargets) {
      const protTarget = this._extractTarget(this.userTargets.protein_g);
      if (protTarget && weeklyAvg.averages.protein_g) {
        const protPct = (weeklyAvg.averages.protein_g / protTarget) * 100;
        if (protPct < 80) {
          insights.push({ type: 'critical', icon: '⚠️', message: `Average protein intake is ${Math.round(protPct)}% of target. Protein is crucial for fetal growth.` });
        }
      }

      // Critical pregnancy nutrients
      const folateTarget = this._extractTarget(this.userTargets.folate_dfe_ug);
      if (folateTarget && weeklyAvg.averages.folate_ug) {
        const pct = (weeklyAvg.averages.folate_ug / folateTarget) * 100;
        if (pct < 60) {
          insights.push({ type: 'critical', icon: '🧬', message: `Folate intake is only ${Math.round(pct)}% of target. Consider folate-rich foods or supplements.` });
        }
      }

      const ironTarget = this._extractTarget(this.userTargets.iron_mg);
      if (ironTarget && weeklyAvg.averages.iron_mg) {
        const pct = (weeklyAvg.averages.iron_mg / ironTarget) * 100;
        if (pct < 60) {
          insights.push({ type: 'critical', icon: '🩸', message: `Iron intake is only ${Math.round(pct)}% of target. Iron is essential for increased blood volume.` });
        }
      }

      const iodineTarget = this._extractTarget(this.userTargets.iodine_ug);
      if (iodineTarget && weeklyAvg.averages.iodine_ug) {
        const pct = (weeklyAvg.averages.iodine_ug / iodineTarget) * 100;
        if (pct < 60) {
          insights.push({ type: 'critical', icon: '🧠', message: `Iodine intake is low (${Math.round(pct)}%). Iodine is vital for fetal brain and thyroid development.` });
        }
      }

      const cholineTarget = this._extractTarget(this.userTargets.choline_mg);
      if (cholineTarget && weeklyAvg.averages.choline_mg) {
        const pct = (weeklyAvg.averages.choline_mg / cholineTarget) * 100;
        if (pct < 60) {
          insights.push({ type: 'critical', icon: '🥚', message: `Choline intake is only ${Math.round(pct)}% of target. Choline supports fetal brain and spinal cord development.` });
        }
      }
    }

    // Meal variety
    const allMealTypes = new Set();
    allDays.forEach(d => d.mealTypes.forEach(t => allMealTypes.add(t)));
    if (allMealTypes.size >= 3) {
      insights.push({ type: 'success', icon: '🌈', message: 'Good meal variety! Logging breakfast, lunch, and dinner helps ensure balanced nutrition.' });
    }

    if (insights.length === 0) {
      insights.push({ type: 'info', icon: '💡', message: 'Keep tracking your meals to get personalized nutrition insights.' });
    }

    return `
      <div class="log-section" id="log-insights">
        <h3>💡 Weekly Insights</h3>
        <div class="log-insights-list">
          ${insights.map(i => `
            <div class="log-insight log-insight-${i.type}">
              <span class="insight-icon">${i.icon}</span>
              <p>${i.message}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Day Table
  // ─────────────────────────────────────────────────────────────────────────────

  _renderDayTable(allDays) {
    const rows = allDays.map(day => {
      const t = day.dailyTotals;
      const dateObj = new Date(day.date + 'T12:00:00');
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const statusIcon = day.completed ? '✅' : '🕐';
      const mealIcons = day.mealTypes.map(mt => this._mealEmoji(mt)).join(' ');

      return `
        <tr class="log-table-row ${!day.completed ? 'row-today' : ''}" data-date="${day.date}">
          <td class="col-status">${statusIcon}</td>
          <td class="col-date">
            <span class="day-name">${dayName}</span>
            <span class="date-str">${dateStr}</span>
          </td>
          <td class="col-meals">${mealIcons} <span class="meals-count">${day.mealsCount}</span></td>
          <td class="col-cal">${Math.round(t.energy_kcal)}</td>
          <td class="col-protein">${(t.protein_g || 0).toFixed(1)}</td>
          <td class="col-carbs">${(t.carbs_g || 0).toFixed(1)}</td>
          <td class="col-fat">${(t.fat_g || 0).toFixed(1)}</td>
          <td class="col-iron">${(t.iron_mg || 0).toFixed(1)}</td>
          <td class="col-folate">${Math.round(t.folate_dfe_ug || t.folate_ug || 0)}</td>
          <td class="col-calcium">${Math.round(t.calcium_mg || 0)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="log-section" id="log-day-table">
        <h3>📋 Daily Breakdown</h3>
        <div class="log-table-wrapper">
          <table class="log-table">
            <thead>
              <tr>
                <th></th>
                <th>Date</th>
                <th>Meals</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fat (g)</th>
                <th>Iron (mg)</th>
                <th>Folate (µg)</th>
                <th>Calcium (mg)</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  _extractTarget(targetData) {
    if (!targetData) return 0;
    if (typeof targetData === 'number') return targetData;
    if (typeof targetData.target === 'number') return targetData.target;
    if (typeof targetData.RDA === 'number') return targetData.RDA;
    if (typeof targetData.AI === 'number') return targetData.AI;
    if (typeof targetData.MIN === 'number') return targetData.MIN;
    return 0;
  }

  _shortDayName(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  _mealEmoji(type) {
    const emojis = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
    return emojis[type] || '🍽️';
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FoodLogDashboard;
}

if (typeof window !== 'undefined') {
  window.FoodLogDashboard = FoodLogDashboard;
}
