# 🤰 NutriMom - Pregnancy Nutrition Calculator

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Tests](https://img.shields.io/badge/tests-playwright-brightgreen)](./tests)
[![Status](https://img.shields.io/badge/status-MVP%20Complete-success)](./project-state.json)

A client-side web application providing **personalized daily nutrition recommendations** for pregnant and lactating women based on the Institute of Medicine (IOM) Dietary Reference Intakes.

**Author:** Nicolas Ivan Larenas Bustamante

![NutriMom Screenshot](/.playwright-mcp/page-2026-02-03T15-42-25-434Z.png)

---

## ✨ Features

- 🧮 **Personalized energy calculations** using Mifflin-St Jeor equation
- 🤰 **Pregnancy-specific adjustments** by trimester (T1: 0, T2: +340, T3: +452 kcal)
- 🥗 **35+ nutrient targets** with RDA, AI, and Upper Limits
- 📊 **Visual comparison** showing changes from pre-pregnancy baseline
- ⚖️ **Weight gain recommendations** based on pre-pregnancy BMI (IOM 2009)
- 🔒 **100% client-side** - no data sent to servers, privacy-first
- 📱 **Responsive design** - works on mobile, tablet, and desktop
- 🎯 **Critical nutrients highlight** for pregnancy (Folate, Iron, DHA, etc.)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/nicolaslarenas/nutrimom.git
cd nutrimom

# Install dependencies (for testing only)
npm install

# Start local server
npm start

# Open http://localhost:8080 in your browser
```

Or simply:

```bash
# Using Python
cd src && python -m http.server 8080
```

---

## 📁 Project Structure

```
nutrimom/
├── src/
│   ├── index.html                  # Main application
│   ├── css/styles.css              # Styling
│   ├── js/
│   │   ├── nutrition-engine.js     # Core calculation engine
│   │   └── app.js                  # UI controller
│   └── data/                       # JSON data files
│       ├── nutrients.json          # 38 nutrients with descriptions
│       ├── nutrient-targets.json   # RDA/AI/UL by life-stage
│       ├── age-bands.json          # Age range definitions
│       ├── life-stages.json        # Pregnancy/lactation stages
│       ├── pregnancy_weeks.json    # Week→trimester mapping
│       └── formulas.json           # Equations and factors
├── tests/
│   └── nutrimom.spec.js            # Playwright E2E tests
├── docs/
│   ├── project-research-analysis.md   # Business analysis & research
│   ├── pregnancy-nutrition-guide.md   # Week-by-week guide
│   └── nutrient-reference-tables.md   # Complete nutrient tables
├── project-state.json              # Task tracking
├── playwright.config.js            # Test configuration
└── package.json
```

---

## 🧪 Testing

```bash
# Run all E2E tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see the browser)
npm run test:headed

# Debug tests
npm run test:debug
```

---
---

## 📊 How It Works

### Calculation Flow

```
User Input → Age Band → Life Stage → Lookup Targets
     ↓
BMR (Mifflin-St Jeor) → TDEE (×Activity) → +Pregnancy Increment
     ↓
Personalized Nutrition Plan
```

### Energy Calculations

| Component | Formula |
|-----------|---------|
| **BMR (Female)** | `10 × weight_kg + 6.25 × height_cm - 5 × age - 161` |
| **TDEE** | `BMR × Activity Factor (1.2 - 1.9)` |
| **Total (Pregnant)** | `TDEE + Trimester Increment (0/340/452)` |

### Life Stages

| Stage | Weeks | Energy Increment |
|-------|-------|------------------|
| Non-pregnant | - | 0 kcal |
| Trimester 1 | 1-13 | 0 kcal |
| Trimester 2 | 14-27 | +340 kcal |
| Trimester 3 | 28-42 | +452 kcal |
| Lactating 0-6mo | - | +330 kcal |
| Lactating 7-12mo | - | +400 kcal |

---

## 🔌 API Usage

```javascript
const engine = new NutritionEngine();
await engine.loadData('./data');

// Get personalized plan
const plan = engine.getNutritionPlan({
  ageYears: 28,
  sex: 'female',
  weightKg: 65,
  heightCm: 165,
  activityLevel: 'lightly_active',
  isPregnant: true,
  pregnancyWeek: 24,
});

console.log(plan.energy.totalEnergy); // 2238 kcal
console.log(plan.targets.protein_g.RDA); // 71g
```

---

## 📚 Documentation

- [Project Research & Business Analysis](./docs/project-research-analysis.md)
- [Pregnancy Nutrition Guide](./docs/pregnancy-nutrition-guide.md)
- [Nutrient Reference Tables](./docs/nutrient-reference-tables.md)
- [User Input Variables](./docs/user-input-variables.md)

---

## 📈 Project Status

See [project-state.json](./project-state.json) for detailed task tracking.

| Phase | Status |
|-------|--------|
| Core Development | ✅ Complete |
| UI Design | ✅ Complete |
| Data Research | ✅ Complete |
| E2E Testing | 🔄 In Progress |
| Documentation | 🔄 In Progress |
| Production Deploy | ⏳ Pending |

---

## 🔬 Data Sources

| Source | Usage |
|--------|-------|
| [IOM Dietary Reference Intakes](https://www.nap.edu/catalog/11537) | RDA, AI, UL values |
| [IOM Weight Gain Guidelines (2009)](https://www.nap.edu/catalog/12584) | Pregnancy weight gain |
| [Mifflin-St Jeor (1990)](https://pubmed.ncbi.nlm.nih.gov/2305711/) | BMR equation |

---

## ⚠️ Disclaimer

This calculator provides **general nutrition guidance** based on IOM Dietary Reference Intakes. Individual needs may vary. **Always consult with a healthcare provider or registered dietitian** for personalized medical and nutrition advice.

This tool is **not intended to diagnose, treat, cure, or prevent any disease**.

---

## 📄 License

This project is licensed under **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International** (CC BY-NC-SA 4.0).

- ✅ Free to use and modify for non-commercial purposes
- ✅ Must give appropriate credit
- ✅ Must share adaptations under same license
- ❌ Commercial use requires separate license

See [LICENSE](./LICENSE) for full terms.

Copyright © 2026 Nicolas Ivan Larenas Bustamante

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss.

---

## 📧 Contact

**Nicolas Ivan Larenas Bustamante**

For commercial licensing inquiries, please contact the project maintainer.

