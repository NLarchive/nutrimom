# 🤰 NutriMom - Pregnancy Nutrition Calculator

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Tests](https://img.shields.io/badge/tests-playwright-brightgreen)](./tests)
[![Status](https://img.shields.io/badge/status-MVP%20Complete-success)](./project-state.json)

A client-side web application providing **personalized daily nutrition targets** for pregnant and lactating women using Dietary Reference Intake (DRI) tables (RDA/AI/UL) and pregnancy-specific guidance from major public-health and evidence-review sources.

**Author:** Nicolas Ivan Larenas Bustamante

live page 
https://nlarchive.github.io/nutrimom/

---

> Note: While this project began with IOM/National Academies DRIs, the targets and warnings are cross-checked against pregnancy-specific guidance (NIH Office of Dietary Supplements, Dietary Guidelines for Americans 2025–2030, and Cochrane evidence reviews where relevant).

## ✨ Features

- 🧮 **Personalized energy calculations** using Mifflin-St Jeor equation
- 🤰 **Pregnancy-specific adjustments** by trimester (T1: 0, T2: +340, T3: +452 kcal)
- 🥗 **37+ nutrient targets** with RDA, AI, UL, and optional recommendations
- 📊 **Visual comparison** showing changes from pre-pregnancy baseline
- ⚖️ **Weight gain recommendations** based on pre-pregnancy BMI (IOM 2009)
- 🔒 **100% client-side** - no data sent to servers, privacy-first
- 📱 **Responsive design** - works on mobile, tablet, and desktop
- 🎯 **Critical nutrients highlight** for pregnancy (Folate, Iron, DHA/EPA (REC), Iodine, etc.)
- 📸 **Food Tracker with LLM integration** - analyze meals via AI or manual input
- 🎊 **Daily completion celebration** - achievements unlocked when hitting nutrition goals
- 🧪 **350+ comprehensive E2E tests** - Chromium, Firefox & WebKit coverage

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
python -m http.server 8080
```

---

## 📁 Project Structure

```
nutrimom/
├── index.html                      # Main application
├── css/styles.css                  # Styling
├── js/
│   ├── nutrition-engine.js         # Core calculation engine
│   ├── app.js                      # UI controller
│   └── food-tracker.js             # Food tracker UI integration
├── plugins/food-tracker/           # Food Tracker Plugin
│   ├── food-tracker-engine.js      # Core tracker logic & aggregation
│   ├── food-tracker-ui.js          # UI rendering & interaction
│   ├── food-tracker.css            # Tracker-specific styles
│   ├── llm-config.js               # LLM API configurations
│   └── mock-responses.js           # Test data
├── data/                           # JSON data files
│   ├── nutrients.json              # 37+ nutrients with descriptions
│   ├── nutrient-targets.json       # RDA/AI/UL/REC by life-stage & age-band
│   ├── age-bands.json              # Age range definitions
│   ├── life-stages.json            # Pregnancy/lactation stages
│   ├── pregnancy_weeks.json        # Week→trimester mapping
│   └── formulas.json               # Equations and factors
├── tests/
│   ├── calculator/                 # Nutrition calculator tests (50+)
│   ├── food-tracker/               # Food tracker tests (150+)
│   ├── navigation/                 # View switching tests (20+)
│   ├── helpers/test-data.js        # Shared test utilities
│   └── nutrimom-basic.spec.js      # Integration tests
├── docs/
│   ├── project-research-analysis.md   # Business analysis & research
│   ├── pregnancy-nutrition-guide.md   # Week-by-week guide
│   └── nutrient-reference-tables.md   # Complete nutrient tables
├── reference/sql-prototype/        # Future database schema
├── project-state.json              # Task tracking & roadmap
├── CONTRIBUTING.md                 # Contribution guidelines
├── playwright.config.js            # Test configuration
└── package.json
```

---

## 🧪 Testing

**350+ tests running** | Chromium, Firefox, WebKit | Full E2E coverage

```bash
# Run all E2E tests
npm test

# Run specific test suite
npm test tests/calculator
npm test tests/food-tracker
npm test tests/navigation

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see the browser)
npm run test:headed

# Debug tests
npm run test:debug

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- **Calculator Tests**: 50+ tests covering profile input, BMR calculation, TDEE, trimester adjustments
- **Food Tracker Tests**: 150+ tests covering meal logging, nutrient aggregation, LLM integration, data validation
- **Navigation Tests**: 20+ tests covering view switching, profile state management
- **Integration Tests**: Full workflow tests from profile creation to nutrition plan generation

---
---

## 📊 How It Works

### Nutrition Plan Generation

```
User Input (Age, Weight, Height, Activity)
     ↓
Age Band Classification (e.g., "19-30")
     ↓
Life Stage Determination (Pregnant T2, Lactating, etc.)
     ↓
BMR Calculation (Mifflin-St Jeor equation)
     ↓
activities Factor Applied (1.2 - 1.9)
     ↓
Trimester/Lactation Increment Added
     ↓
37+ Nutrient Targets Looked Up from nutrient-targets.json
     ↓
Personalized Nutrition Plan Generated
```

### Food Tracking Flow

```
Food Image/Manual Entry
     ↓
LLM Analysis (OpenAI/Anthropic/Google) or Manual Prompt
     ↓
JSON Response Validation
     ↓
Nutrient Aggregation (37+ nutrients)
     ↓
Comparison Against Plan Targets
     ↓
Real-time Dashboard Update + Progress Tracking
     ↓
Celebration Modal (when daily targets met)
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

See [project-state.json](./project-state.json) for detailed task tracking (40+ completed tasks, 15+ in active development).

| Phase | Status | Details |
|-------|--------|----------|
| Core Calculator | ✅ Complete | Energy, macros, 37+ micronutrients |
| Food Tracker | ✅ Complete | LLM integration, meal logging, persistence |
| UI/UX | ✅ Complete | Responsive design, celebration features |
- E2E Testing | ✅ Complete | 350+ tests across 3 browsers |
| Data Validation | ✅ Complete | DRI-based (IOM/NASEM), cross-checked with ODS/DGA/Cochrane where relevant. |
| Documentation | ✅ Complete | Research guides, API docs, contribution guidelines |
| GitHub Ready | ✅ Complete | Contributing guidelines, license compliance |
| Production Deploy | 🚀 Ready | Deployed to GitHub Pages

**Latest Features (Current Sprint):**
- ✨ Evidence-based recommendations (REC) when no formal RDA/AI exists (e.g., DHA/EPA guidance)
- 🎊 Day completion celebration with fireworks animation modal
- 🐛 localStorage compatibility for non-browser environments

---

## 🔬 Data sources (validated hierarchy)

### 1 · Core nutrient targets (RDA / AI / UL) — all life stages

| Source | Coverage | What we use it for |
|--------|----------|--------------------|
| **National Academies DRIs (IOM/NASEM)** | Infants → 70 +, male/female, pregnancy, lactation | Baseline RDA, AI, UL, EAR, AMDR for every life-stage × age-band. The single most important numeric anchor for the database. |
| **EFSA Dietary Reference Values (EU)** | Same life stages, EU jurisdiction | Independent cross-check; enables multi-jurisdiction support (DRI_US_CA vs EFSA_EU). |
| **WHO/FAO Vitamin & Mineral Requirements** | Global, all age groups | Global perspective; ensures our DRIs do not conflict with WHO/FAO population-level ranges. |
| **NIH ODS – General DRI overview** | All nutrients | Curated DRI tables and DV tables; secondary practitioner-friendly reference. |
| **NIH ODS – Pregnancy (Health Professional)** | Pregnancy / lactation | Pregnancy-specific supplement context (folate, iron, iodine, vitamin D, choline, omega‑3, vitamin A safety). |

### 2 · Life-stage & pregnancy context

| Source | What we use it for |
|--------|--------------------||
| **NIH ODS – Pregnancy (Health Professional)** | Detailed supplement considerations and safety context during pregnancy/lactation. |
| **NHS – Vitamins and nutrition in pregnancy** | Plain-English consumer-level reference for UI text and examples. |
| **IOM/NASEM Gestational Weight Gain (2009)** | BMI-based pregnancy weight gain targets and weekly gain ranges. |

### 3 · Food-based dietary patterns

| Source | What we use it for |
|--------|--------------------||
| **Dietary Guidelines for Americans 2025–2030** | Pattern-level guidance (added sugars, sodium, saturated fat caps), used for dashboard messaging and warnings across all ages. |

### 4 · Evidence reviews (for REC-type nutrients)

| Source | What we use it for |
|--------|--------------------||
| **Cochrane – Omega‑3 in pregnancy** | Evidence-based REC recommendations and preterm-birth risk warnings for EPA/DHA. |

### 5 · Equations

| Source | What we use it for |
|--------|--------------------||
| **Mifflin–St Jeor (1990)** | BMR equation for energy estimation. |

---

## 🔎 Reference lookups (verify our numbers)

These links let users cross-check nutrient targets and food nutrient composition against authoritative databases.

### Nutrient targets (RDA / AI / UL)

- **National Academies DRIs (U.S./Canada, all life stages)** — the primary numeric reference:
  - DRI reference tables (all nutrients, all life stages): https://www.ncbi.nlm.nih.gov/books/NBK208874/
  - RDA/AI Elements (2019, includes Na/K update): https://www.ncbi.nlm.nih.gov/books/NBK545442/table/appJ_tab3/?report=objectonly
  - RDA/AI Vitamins: https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t2/?report=objectonly
  - RDA/AI Macronutrients: https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t4/?report=objectonly
  - UL Elements: https://www.ncbi.nlm.nih.gov/books/NBK545442/table/appJ_tab9/?report=objectonly
  - UL Vitamins: https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t7/?report=objectonly
  - AMDR (macronutrient distribution ranges): https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t5/?report=objectonly
- **NIH ODS – Nutrient recommendations overview:** https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx
- **EFSA Dietary Reference Values (EU):** https://www.efsa.europa.eu/sites/default/files/2017_09_DRVs_summary_report.pdf
- **WHO/FAO – Vitamin and mineral requirements in human nutrition (global):** https://hftag.org/content/user_files/2023/06/FAO_WHO-2004-Vitamin-and-mineral-requirements-in-human-nutrition.pdf

### Life-stage & pregnancy context

- **NIH ODS – Pregnancy (Health Professional):** https://ods.od.nih.gov/factsheets/Pregnancy-HealthProfessional/
- **NHS – Vitamins, supplements, and nutrition in pregnancy:** https://www.nhs.uk/pregnancy/keeping-well/vitamins-supplements-and-nutrition/

### Food-based dietary patterns

- **Dietary Guidelines for Americans 2025–2030 (overview & discussion, Harvard Nutrition Source):** https://nutritionsource.hsph.harvard.edu/2026/01/09/dietary-guidelines-for-americans-2025-2030/
- **DGA announcement (ADA News summary):** https://adanews.ada.org/ada-news/2026/january/hhs-usda-release-2025-2030-dietary-guidelines/
- **DRI explanation on ODPHP (connects DRIs and guidelines):** https://odphp.health.gov/our-work/nutrition-physical-activity/dietary-guidelines/dietary-reference-intakes

### Evidence reviews (omega‑3 in pregnancy)

- **Cochrane – Omega‑3 fatty acid addition during pregnancy:** https://www.cochrane.org/evidence/CD003402_omega-3-fatty-acid-addition-during-pregnancy

### Food nutrient composition (for all foods, all users)

- **USDA FoodData Central (search UI):** https://fdc.nal.usda.gov
- **USDA FoodData Central (API guide):** https://fdc.nal.usda.gov/api-guide/
- **Health Canada – Canadian Nutrient File (CNF):** https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data.html
- **CIQUAL Food Composition Table (France/ANSES, 2020):** https://zenodo.org/records/4770600
- **FAO/INFOODS global composition resources** (example — phytate DB): https://www.izincg.org/new-blog-1/global-food-composition-database-for-phytate

### Source ↔ persona coverage

| Persona | Primary targets | Pattern guidance | Food composition |
|---------|----------------|------------------|------------------|
| **Infants / Children / Teens** | DRIs (NCBI tables, 0–18 y, both sexes) + WHO/FAO | DGA 2025–2030 | USDA FDC, CNF, CIQUAL |
| **Adult men & women (19–59)** | DRIs + EFSA DRVs per sex & age band | DGA 2025–2030 | USDA FDC, CNF, CIQUAL |
| **Older adults (60 +)** | DRIs 51–70 + 70 + categories (higher vitamin D, calcium) | DGA + WHO healthy diet | USDA FDC, CNF, CIQUAL |
| **Pregnancy & Lactation** | DRIs + NIH ODS pregnancy fact sheet + NHS pregnancy | DGA pregnancy section + Cochrane (EPA/DHA) | USDA FDC, CNF, CIQUAL |
| **Any diet pattern** | Same numeric targets | — | All food DBs are diet-neutral |

---

## 🎯 Targets vs. evidence-based recommendations (important)

Not all nutrients have a formal RDA/AI for every life stage, and some nutrients are mainly governed by upper limits. NutriMom supports three target types:

- **DRI Targets (RDA/AI):** official baseline targets used for % completion in the UI.
- **UL / Limit-only nutrients:** shown as a “limit” (e.g., sodium often matters more as a maximum than a minimum).
- **Evidence-based recommendations (REC):** used when strong evidence exists but no formal DRI target is available for a given life stage.

Example: **Omega‑3 (EPA/DHA) in pregnancy**
EPA/DHA often have no formal RDA/AI in some tables, but high-quality evidence supports pregnancy-specific recommendations and risk messaging.
NutriMom uses Cochrane’s pregnancy evidence review to support “REC”-style guidance and warnings in pregnancy/lactation profiles.

Example: **Added sugar messaging**
DGA 2025–2030 states no amount of added sugars is recommended as part of a healthy diet and introduces practical “per-meal” guidance; NutriMom uses this for UI messaging and warnings (not as a DRI % target).

---

## 🧾 Food Tracker data note (accuracy and verification)

Food tracking uses nutrient values from standard food composition sources (e.g., FoodData Central) and/or user-entered labels, then compares totals against DRI targets. For independent verification of food nutrient values, use FoodData Central search or API links above.

---

## ⚠️ Medical & data disclaimer (minor update)

This calculator provides general guidance based on DRIs and pregnancy-specific public-health sources. It does not replace clinical care, and supplement decisions (iron, iodine, vitamin D, omega‑3, high-dose folic acid, etc.) should be individualized with a clinician.

---

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

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:
- Development workflow
- Code standards
- Testing requirements
- PR process
- Issue templates

**Quick Start for Contributors:**
```bash
# 1. Fork and clone
git clone https://github.com/your-username/nutrimom.git
cd nutrimom

# 2. Install dependencies
npm install

# 3. Make your changes in a feature branch
git checkout -b feature/your-feature

# 4. Run tests to ensure nothing breaks
npm test

# 5. Commit with clear messages
git commit -m "feat: add your feature description"

# 6. Push and open a Pull Request
git push origin feature/your-feature
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the complete guide.

---

## 📧 Contact

**Nicolas Ivan Larenas Bustamante**

For commercial licensing inquiries, please contact the project maintainer.

