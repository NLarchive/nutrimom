# Project Specification: web-maternity
Generated: 2026-05-16 21:04
<!-- To update this file, run: python D:\tool\extract_project_spec\app.py --root D:\web\web-health\web-maternity -->

## Folder structure

.github
.github/workflows
css
data
data/reference
data/reference/snapshots
data/reference/snapshots/ncbi-dri-elements
data/reference/snapshots/ncbi-dri-macros
data/reference/snapshots/ncbi-dri-ul-elements
data/reference/snapshots/ncbi-dri-ul-vitamins
data/reference/snapshots/ncbi-dri-vitamins
data/reference/snapshots/nih-ods-pregnancy
data/samples
docs
js
plugins
plugins/food-tracker
reference
reference/sql-prototype
schemas
tests
tests/calculator
tests/food-tracker
tests/helpers
tests/navigation
tools
tools/nutrient-fetcher
tools/nutrient-fetcher/src
tools/nutrient-fetcher/tests
tools/nutrient-fetcher/tests/fixtures
tools/scripts
.github/workflows/ci.yml
.github/workflows/deploy.yml
.gitignore
AGENTS.md
CONTRIBUTING.md
css/styles.css
data/age-bands.json
data/formulas.json
data/life-stages.json
data/nutrient-targets.json
data/nutrients.json
data/pregnancy_weeks.json
data/reference/cross-check-all-life-stages.json
data/reference/cross-check-report.md
data/reference/nih-ods-pregnancy-targets.json
data/reference/snapshots/ncbi-dri-elements/latest.json
data/reference/snapshots/ncbi-dri-macros/latest.json
data/reference/snapshots/ncbi-dri-ul-elements/latest.json
data/reference/snapshots/ncbi-dri-ul-vitamins/latest.json
data/reference/snapshots/ncbi-dri-vitamins/latest.json
data/reference/snapshots/nih-ods-pregnancy/2026-02-11T19-10-49Z.json
data/reference/snapshots/nih-ods-pregnancy/latest.json
data/reference/sources-index.json
data/samples/child-2yo.json
data/samples/pregnant-38yo-19w.json
data/samples/sample-week-log.json
data/samples/standard-female-40yo.json
data/samples/standard-male-40yo.json
data/user-input-schema.json
docs/non-formal-target-nutrients.md
docs/nutrient-reference-tables.md
docs/nutrient-research-2026.md
docs/pregnancy-nutrition-guide.md
docs/project-research-analysis.md
docs/user-input-variables.md
index.html
js/app.js
js/nutrition-engine.js
LICENSE
package.json
playwright.config.js
plugins/food-tracker/croqueta-casera-de-bacalao-bardetodos-unidad.webp
plugins/food-tracker/demo.html
plugins/food-tracker/food-log-dashboard.css
plugins/food-tracker/food-log-dashboard.js
plugins/food-tracker/food-tracker-engine.js
plugins/food-tracker/food-tracker-ui.js
plugins/food-tracker/food-tracker.css
plugins/food-tracker/index.js
plugins/food-tracker/llm-config.js
plugins/food-tracker/mock-responses.js
plugins/food-tracker/README.md
project-state.json
README.md
reference/sql-prototype/example-queries.sql
reference/sql-prototype/README.md
reference/sql-prototype/schema.sql
reference/sql-prototype/seed.sql
schemas/llm_food_extraction.schema.json
tests/calculator/calculations.spec.js
tests/calculator/nutrient-tabs.spec.js
tests/calculator/profile-form.spec.js
tests/food-tracker/advanced-nutrients.spec.js
tests/food-tracker/api-status.spec.js
tests/food-tracker/log-import.spec.js
tests/food-tracker/manual-parse.spec.js
tests/food-tracker/manual-workflow.spec.js
tests/food-tracker/meal-log.spec.js
tests/food-tracker/nutrient-data-validation.spec.js
tests/food-tracker/ui-components.spec.js
tests/helpers/test-data.js
tests/navigation/view-switching.spec.js
tests/nutrimom-basic.spec.js
tests/nutrimom.spec.js
tools/nutrient-fetcher/package.json
tools/nutrient-fetcher/README.md
tools/nutrient-fetcher/src/cli.js
tools/nutrient-fetcher/src/comparator.js
tools/nutrient-fetcher/src/config.js
tools/nutrient-fetcher/src/cross-check-all.js
tools/nutrient-fetcher/src/fetcher.js
tools/nutrient-fetcher/src/parser-ncbi-dri.js
tools/nutrient-fetcher/src/parser-nih-ods.js
tools/nutrient-fetcher/src/parser-usda-fdc.js
tools/nutrient-fetcher/src/storage.js
tools/nutrient-fetcher/src/update-db-2026-02.js
tools/nutrient-fetcher/tests/comparator.test.js
tools/nutrient-fetcher/tests/fetcher.test.js
tools/nutrient-fetcher/tests/fixtures/nih-ods-sample.html
tools/nutrient-fetcher/tests/parser-ncbi-dri.test.js
tools/nutrient-fetcher/tests/parser-nih-ods.test.js
tools/nutrient-fetcher/tests/storage.test.js
tools/scripts/audit-missing-targets.js

---

## File Structures

structure from .gitignore:  (no extractable definitions)

structure from AGENTS.md:  (no extractable definitions)

structure from CONTRIBUTING.md:
    [file-summary] Contributing to NutriMom
    [trust-moderate] [heading-1] # Contributing to NutriMom
    [trust-moderate] [heading-2] ## 🤝 Code of Conduct
    [trust-moderate] [heading-2] ## 🎯 Ways to Contribute
    [trust-moderate] [heading-3] ### 1. **Report Bugs**
    [trust-moderate] [heading-2] ## Description
    [trust-moderate] [heading-2] ## Steps to Reproduce
    [trust-moderate] [heading-2] ## Expected Behavior
    [trust-moderate] [heading-2] ## Actual Behavior
    [trust-moderate] [heading-2] ## Environment
    [trust-moderate] [heading-3] ### 2. **Suggest Enhancements**
    [trust-moderate] [heading-2] ## Description
    [trust-moderate] [heading-2] ## Motivation
    [trust-moderate] [heading-2] ## Proposed Solution
    [trust-moderate] [heading-2] ## Alternatives Considered
    [trust-moderate] [heading-2] ## Examples
    [trust-moderate] [heading-3] ### 3. **Improve Documentation**
    [trust-moderate] [heading-3] ### 4. **Code Contributions**
    [trust-moderate] [heading-2] ## 💻 Development Setup
    [trust-moderate] [heading-3] ### Prerequisites
    [trust-moderate] [heading-3] ### Initial Setup
    [trust-moderate] [heading-1] # 1. Fork the repository on GitHub
    [trust-moderate] [heading-1] # Visit https://github.com/nicolaslarenas/nutrimom and click "Fork"
    [trust-moderate] [heading-1] # 2. Clone your fork
    [trust-moderate] [heading-1] # 3. Add upstream remote (for syncing)
    [trust-moderate] [heading-1] # 4. Install dependencies
    [trust-moderate] [heading-1] # 5. Verify setup
    [trust-moderate] [heading-3] ### Running the Application
    [trust-moderate] [heading-1] # Start development server
    [trust-moderate] [heading-1] # Server runs at http://localhost:8080
    [trust-moderate] [heading-3] ### Running Tests
    [trust-moderate] [heading-1] # Run all tests
    [trust-moderate] [heading-1] # Run specific test suite
    [trust-moderate] [heading-1] # Run in UI mode (interactive)
    [trust-moderate] [heading-1] # Run in headed mode (see browser)
    [trust-moderate] [heading-1] # Debug mode
    [trust-moderate] [heading-2] ## 📋 Coding Standards
    [trust-moderate] [heading-3] ### Style Guide
    [trust-moderate] [heading-3] ### File Organization
    [trust-moderate] [heading-2] ## ✅ Testing Requirements
    [trust-moderate] [heading-3] ### Test Coverage Goals
    [trust-moderate] [heading-3] ### Writing Tests
    [trust-moderate] [heading-3] ### Running Tests Before PR
    [trust-moderate] [heading-1] # Run all tests (must pass)
    [trust-moderate] [heading-1] # Optional: check coverage
    [trust-moderate] [heading-2] ## 📝 Commit Conventions
    [trust-moderate] [heading-3] ### Format
    [trust-moderate] [heading-3] ### Types
    [trust-moderate] [heading-3] ### Scope (optional)
    [trust-moderate] [heading-3] ### Examples
    [trust-moderate] [heading-2] ## 🔄 Pull Request Process
    [trust-moderate] [heading-3] ### Before Starting
    [trust-moderate] [heading-1] # or
    [trust-moderate] [heading-3] ### Development Workflow
    [trust-moderate] [heading-1] # 1. Make your changes
    [trust-moderate] [heading-1] # 2. Test thoroughly
    [trust-moderate] [heading-1] # 3. Commit with conventional messages
    [trust-moderate] [heading-1] # 4. Keep branch updated with upstream
    [trust-moderate] [heading-1] # 5. Push to your fork
    [trust-moderate] [heading-3] ### Submitting PRs
    [trust-moderate] [heading-2] ## Description
    [trust-moderate] [heading-2] ## Type of Change
    [trust-moderate] [heading-2] ## Related Issues
    [trust-moderate] [heading-2] ## Changes Made
    [trust-moderate] [heading-2] ## Testing
    [trust-moderate] [heading-2] ## Checklist
    [trust-moderate] [heading-3] ### Review Process
    [trust-moderate] [heading-3] ### Merging
    [trust-moderate] [heading-2] ## 🔍 Code Review Checklist
    [trust-moderate] [heading-2] ## 📚 Project Structure Quick Reference
    [trust-moderate] [heading-2] ## 🚀 Getting Help
    [trust-moderate] [heading-2] ## 📄 Licensing
    [trust-moderate] [heading-2] ## 🎓 Learning Resources
    [trust-moderate] [heading-3] ### Pregnancy Nutrition
    [trust-moderate] [heading-3] ### Development
    [trust-moderate] [heading-2] ## 🙏 Attribution
    [trust-moderate] [heading-2] ## ❓ FAQ
    [trust-moderate] [heading-2] ## 📊 Contribution Statistics

structure from LICENSE:  (no extractable definitions)

structure from README.md:
    [file-summary] 🤰 NutriMom - Pregnancy Nutrition Calculator
    [trust-moderate] [heading-1] # 🤰 NutriMom - Pregnancy Nutrition Calculator
    [trust-moderate] [heading-2] ## ✨ Features
    [trust-moderate] [heading-2] ## 🚀 Quick Start
    [trust-moderate] [heading-1] # Clone the repository
    [trust-moderate] [heading-1] # Install dependencies (for testing only)
    [trust-moderate] [heading-1] # Start local server
    [trust-moderate] [heading-1] # Open http://localhost:8080 in your browser
    [trust-moderate] [heading-1] # Using Python
    [trust-moderate] [heading-2] ## 📁 Project Structure
    [trust-moderate] [heading-2] ## 🧪 Testing
    [trust-moderate] [heading-1] # Run all E2E tests
    [trust-moderate] [heading-1] # Run specific test suite
    [trust-moderate] [heading-1] # Run tests with UI
    [trust-moderate] [heading-1] # Run tests in headed mode (see the browser)
    [trust-moderate] [heading-1] # Debug tests
    [trust-moderate] [heading-1] # Generate coverage report
    [trust-moderate] [heading-2] ## 📊 How It Works
    [trust-moderate] [heading-3] ### Nutrition Plan Generation
    [trust-moderate] [heading-3] ### Food Tracking Flow
    [trust-moderate] [heading-3] ### Energy Calculations
    [trust-moderate] [heading-3] ### Life Stages
    [trust-moderate] [heading-2] ## 🔌 API Usage
    [trust-moderate] [heading-2] ## 📚 Documentation
    [trust-moderate] [heading-2] ## 📈 Project Status
    [trust-moderate] [heading-2] ## 🔬 Data sources (validated hierarchy)
    [trust-moderate] [heading-3] ### 1 · Core nutrient targets (RDA / AI / UL) — all life stages
    [trust-moderate] [heading-3] ### 2 · Life-stage & pregnancy context
    [trust-moderate] [heading-3] ### 3 · Food-based dietary patterns
    [trust-moderate] [heading-3] ### 4 · Evidence reviews (for REC-type nutrients)
    [trust-moderate] [heading-3] ### 5 · Equations
    [trust-moderate] [heading-2] ## 🔎 Reference lookups (verify our numbers)
    [trust-moderate] [heading-3] ### Nutrient targets (RDA / AI / UL)
    [trust-moderate] [heading-3] ### Life-stage & pregnancy context
    [trust-moderate] [heading-3] ### Food-based dietary patterns
    [trust-moderate] [heading-3] ### Evidence reviews (omega‑3 in pregnancy)
    [trust-moderate] [heading-3] ### Food nutrient composition (for all foods, all users)
    [trust-moderate] [heading-3] ### Source ↔ persona coverage
    [trust-moderate] [heading-2] ## 🎯 Targets vs. evidence-based recommendations (important)
    [trust-moderate] [heading-2] ## 🧾 Food Tracker data note (accuracy and verification)
    [trust-moderate] [heading-2] ## ⚠️ Medical & data disclaimer (minor update)
    [trust-moderate] [heading-2] ## ⚠️ Disclaimer
    [trust-moderate] [heading-2] ## 📄 License
    [trust-moderate] [heading-2] ## 🤝 Contributing
    [trust-moderate] [heading-1] # 1. Fork and clone
    [trust-moderate] [heading-1] # 2. Install dependencies
    [trust-moderate] [heading-1] # 3. Make your changes in a feature branch
    [trust-moderate] [heading-1] # 4. Run tests to ensure nothing breaks
    [trust-moderate] [heading-1] # 5. Commit with clear messages
    [trust-moderate] [heading-1] # 6. Push and open a Pull Request
    [trust-moderate] [heading-2] ## 📧 Contact

structure from index.html:
    [file-summary] NutriMom - Nutrition Calculator
    [title] <title>NutriMom - Nutrition Calculator</title>
    [section] <header id="header">
    [heading-1] <h1>NutriMom</h1>
    [section] <nav id="main-nav">
    [section] <main id="main">
    [section] <section id="input-section">
    [heading-2] <h2>Your Profile</h2>
    [heading-3] <h3>Basic Information</h3>
    [heading-3] <h3>👶 Pregnancy & Lactation Status</h3>
    [section] <section id="results-section">
    [heading-3] <h3>Your Profile</h3>
    [heading-2] <h2>Daily Energy Needs</h2>
    [heading-2] <h2>Recommended Weight Gain</h2>
    [heading-2] <h2>Daily Nutrient Targets</h2>
    [heading-2] <h2>Changes During Pregnancy</h2>
    [heading-2] <h2>Focus On These Nutrients</h2>
    [heading-3] <h3>Ready to track your intake?</h3>
    [section] <section id="section">
    [section] <section id="section">
    [section] <footer id="footer">

structure from package.json:
    [file-summary] nutrimom - NutriMom - Pregnancy Nutrition Calculator based on IOM Dietary Reference Intakes
    [json-key] name: "nutrimom"
    [json-key] version: "1.0.0"
    [json-key] description: "NutriMom - Pregnancy Nutrition Calculator based on IOM Dieta..."
    [json-key] main: "index.html"
    [json-key] scripts: {start, test, test:all, test:ui, test:headed, +2 more}
    [json-key] repository: {type, url}
    [json-key] keywords: [9 items]
    [json-key] author: "Nicolas Ivan Larenas Bustamante"
    [json-key] license: "CC-BY-NC-SA-4.0"
    [json-key] devDependencies: {@playwright/test, http-server}
    [json-key] engines: {node}

structure from playwright.config.js:  (no extractable definitions)

structure from project-state.json:
    [file-summary] NutriMom - Universal Nutrition Calculator project tracking and task management
    [json-key] template_type: "project_task_template"
    [json-key] version: "1.0"
    [json-key] description: "NutriMom - Universal Nutrition Calculator project tracking a..."
    [json-key] project: {name, description, start_date, end_date, status, +3 more}
    [json-key] categories: [6 items]
    [json-key] workers: [2 items]
    [json-key] tasks: [53 items]
    [json-key] milestones: [20 items]
    [json-key] required_fields: [6 items]
    [json-key] optional_fields: [12 items]

structure from .github/workflows/ci.yml:
    [file-summary] CI - Playwright Tests
    [yaml-key] name: "CI - Playwright Tests"
    [yaml-key] True: {push, pull_request}
    [yaml-key] jobs: {test}
    [yaml-job] job: test (7 steps)

structure from .github/workflows/deploy.yml:
    [file-summary] Deploy to GitHub Pages
    [yaml-key] name: "Deploy to GitHub Pages"
    [yaml-key] True: {push, workflow_dispatch}
    [yaml-key] permissions: {contents, pages, id-token}
    [yaml-key] concurrency: {group, cancel-in-progress}
    [yaml-key] jobs: {test, deploy}
    [yaml-job] job: test (5 steps)
    [yaml-job] job: deploy (4 steps)

structure from css/styles.css:
    [file-summary] ───────────────────────────────────────────────────────────────────────────── Pregnancy Nutrition Calculator Styles ─────────────────────────────────────────────────────────────────────────────
    [note] [warning] Tree-sitter CSS backend is unavailable; CSS extraction is running in regex fallback mode.
    [section] /* Colors */
    [css-variable] --primary
    [css-variable] --primary-dark
    [css-variable] --primary-light
    [css-variable] --secondary
    [css-variable] --success
    [css-variable] --warning
    [css-variable] --danger
    [css-variable] --info
    [section] /* Neutrals */
    [css-variable] --gray-50
    [css-variable] --gray-100
    [css-variable] --gray-200
    [css-variable] --gray-300
    [css-variable] --gray-400
    [css-variable] --gray-500
    [css-variable] --gray-600
    [css-variable] --gray-700
    [css-variable] --gray-800
    [css-variable] --gray-900
    [section] /* Spacing */
    [css-variable] --space-xs
    [css-variable] --space-sm
    [css-variable] --space-md
    [css-variable] --space-lg
    [css-variable] --space-xl
    [css-variable] --space-2xl
    [section] /* Border Radius */
    [css-variable] --radius-sm
    [css-variable] --radius-md
    [css-variable] --radius-lg
    [css-variable] --radius-full
    [section] /* Shadows */
    [css-variable] --shadow-sm
    [css-variable] --shadow-md
    [css-variable] --shadow-lg
    [section] /* Fonts */
    [css-variable] --font-sans
    [css-variable] --font-mono
    [selector] .app
    [selector] .header
    [selector] .header h1
    [selector] .subtitle
    [selector] .main
    [selector] .footer
    [selector] #food-tracker-container
    [selector] .card
    [selector] .card h2
    [selector] .card h3
    [selector] .form-grid
    [selector] .form-group
    [selector] .form-group label
    [selector] .form-group select
    [selector] .form-group select option
    [selector] .form-group select.multiline-select
    [section] /* enable wrapping where supported */
    [section] /* ensure two full text lines */
    [selector] .form-group.multiline
    [selector] .form-group select:focus
    [selector] .checkbox-label
    [selector] .checkbox-label input[type="checkbox"]
    [selector] .pregnancy-section
    [selector] .pregnancy-section h3
    [selector] .lactation-fields
    [selector] .btn
    [selector] .btn-primary
    [selector] .btn-primary:hover
    [selector] .btn-primary:active
    [selector] .results-section
    [selector] .result-block
    [selector] .result-block:last-child
    [section] /* Summary Grid */
    [selector] .summary-grid
    [selector] .summary-item
    [selector] .summary-item .label
    [selector] .summary-item .value
    [section] /* Energy Breakdown */
    [selector] .energy-breakdown
    [selector] .energy-item
    [selector] .energy-item.highlight
    [selector] .energy-item .value
    [selector] .energy-item .unit
    [selector] .energy-item .label
    [section] /* Tabs */
    [selector] .tabs
    [selector] .tab
    [selector] .tab:hover
    [selector] .tab.active
    [section] /* Nutrient Table */
    [selector] .nutrient-table-container
    [selector] .nutrient-table
    [selector] .nutrient-table td
    [selector] .nutrient-table th
    [selector] .nutrient-table tr:hover
    [selector] .nutrient-table .target-value
    [selector] .nutrient-table .ul-value
    [selector] .food-sources
    [selector] .food-tag
    [section] /* Comparison */
    [selector] .comparison-container
    [selector] .comparison-table
    [selector] .comparison-table td
    [selector] .comparison-table th
    [selector] .comparison-table .increase
    [selector] .comparison-table .decrease
    [selector] .comparison-table .unchanged
    [selector] .change-badge
    [selector] .change-badge.up
    [selector] .change-badge.down
    [section] /* Header */
    [selector] .header-content
    [selector] .logo
    [selector] .logo:hover
    [selector] .logo-icon
    [selector] .logo-text h1
    [selector] .main-nav
    [section] /* Nav Tabs & Header Navigation */
    [selector] .nav-tab
    [selector] .nav-tab:hover
    [selector] .nav-tab.active
    [section] /* Data Actions (Export/Import/Clear) */
    [selector] .data-actions
    [selector] .btn-icon
    [selector] .btn-icon:hover
    [selector] .btn-icon.btn-danger:hover
    [section] /* Profile Warning Banner */
    [selector] .profile-warning-banner
    [selector] .profile-warning-banner .warning-icon
    [selector] .profile-warning-banner .warning-content
    [selector] .profile-warning-banner .warning-content strong
    [selector] .profile-warning-banner .warning-content p
    [selector] .profile-warning-banner .btn-sm
    [section] /* Analysis Error Display */
    [selector] .analysis-error
    [selector] .analysis-error .error-icon
    [selector] .analysis-error h4
    [selector] .analysis-error p
    [section] /* Tracker CTA Card */
    [selector] .tracker-cta-card
    [selector] .tracker-cta-content
    [selector] .cta-info
    [selector] .cta-icon
    [selector] .cta-text h3
    [selector] .cta-text p
    [section] /* Sections */
    [selector] .section
    [selector] .section-header
    [selector] .section-icon
    [selector] .section-header h2
    [section] /* Form Cards */
    [selector] .form-card
    [selector] .form-card-title
    [selector] .title-icon
    [selector] .form-row
    [selector] .form-group-full
    [selector] .label-text
    [selector] .label-hint
    [selector] .input-helper
    [section] /* Toggle Options */
    [selector] .toggle-group
    [selector] .toggle-option
    [selector] .toggle-option input
    [selector] .toggle-label
    [selector] .toggle-icon
    [selector] .toggle-text
    [selector] .toggle-option input:checked + .toggle-label
    [selector] .toggle-option input:checked + .toggle-label .toggle-text
    [selector] .toggle-option:hover .toggle-label
    [section] /* Conditional Fields */
    [selector] .conditional-fields
    [selector] .checkbox-inline
    [selector] .checkbox-inline input[type="checkbox"]
    [section] /* Buttons */
    [selector] .btn-lg
    [section] /* Results Section */
    [selector] .result-card
    [section] /* Profile Card */
    [selector] .profile-card
    [selector] .profile-card::before
    [selector] .profile-header
    [selector] .profile-avatar
    [selector] .profile-info
    [selector] .profile-info h3
    [selector] .profile-subtitle
    [selector] .profile-bmi
    [selector] .bmi-value
    [selector] .bmi-label
    [section] /* Energy Grid */
    [selector] .energy-grid
    [selector] .energy-stat
    [selector] .energy-stat.primary
    [selector] .energy-stat.accent
    [selector] .energy-stat.accent .stat-value
    [selector] .stat-value
    [selector] .energy-stat.primary .stat-value
    [selector] .stat-label
    [selector] .energy-stat.primary .stat-label
    [selector] .stat-desc
    [selector] .energy-stat.primary .stat-desc
    [section] /* Weight Recommendation */
    [selector] .weight-recommendation
    [selector] .weight-range
    [selector] .weight-range-label
    [selector] .weight-range-value
    [selector] .weight-weekly
    [selector] .weight-weekly-value
    [selector] .weight-weekly-label
    [section] /* Nutrient Tabs */
    [selector] .nutrient-tabs
    [selector] .nutrient-tab
    [selector] .tab-icon
    [selector] .nutrient-tab:hover
    [selector] .nutrient-tab.active
    [section] /* Nutrient Grid */
    [selector] .nutrient-grid
    [selector] .nutrient-item
    [selector] .nutrient-name
    [selector] .nutrient-importance
    [selector] .nutrient-target
    [selector] .nutrient-target-value
    [selector] .nutrient-target-unit
    [selector] .nutrient-target-type
    [selector] .nutrient-ul
    [selector] .nutrient-ul-label
    [selector] .nutrient-ul-value
    [selector] .food-tags
    [selector] .comparison-intro
    [selector] .comparison-list
    [selector] .comparison-item
    [selector] .comparison-nutrient
    [selector] .comparison-from, .comparison-to
    [selector] .comparison-to
    [selector] .comparison-change
    [selector] .comparison-change.down
    [section] /* Critical Nutrients */
    [selector] .critical-grid
    [selector] .critical-item
    [selector] .critical-name
    [selector] .critical-reason
    [selector] .critical-more-btn
    [selector] .critical-more-btn:hover
    [selector] .critical-modal-overlay
    [selector] .critical-modal
    [selector] .critical-modal-header
    [selector] .critical-modal-header h3
    [selector] .critical-modal-close
    [selector] .critical-modal-body
    [selector] .view-content
    [selector] .view-content.active
    [section] /* Ensure main content takes up space and is visible */
    [section] /* Force minimum height */
    [section] /* App container should be a flexbox to push footer down */
    [section] /* Footer Improvements */
    [selector] .footer-content
    [selector] .disclaimer
    [selector] .credits
    [section] /* Responsive Updates */

structure from data/age-bands.json:
    [json-array] [7 items]

structure from data/formulas.json:
    [json-key] _meta: {description, sources}
    [json-key] bmr_equations: {mifflin_st_jeor, schofield, harris_benedict_revised}
    [json-key] activity_factors: {description, sedentary, light, moderate, active, +1 more}
    [json-key] pregnancy_energy_increments: {description, trimester_1, trimester_2, trimester_3, multiples_adjustment}
    [json-key] lactation_energy_increments: {months_0_6, months_7_12}
    [json-key] bmi_calculation: {formula, categories}
    [json-key] pregnancy_weight_gain_recommendations: {description, singleton, twins}
    [json-key] macronutrient_calculations: {protein_rda_per_kg, water_ml_per_kg, protein_from_rda, fat_from_amdr, carbs_from_energy}

structure from data/life-stages.json:
    [json-array] [8 items]

structure from data/nutrient-targets.json:
    [json-key] _meta: {description, target_types, sources, last_updated, last_cross_check}
    [json-key] child: {1_3, 4_8}
    [json-key] female_nonpregnant: {9_13, 14_18, 19_30, 31_50, 51_plus}
    [json-key] male_nonpregnant: {9_13, 14_18, 19_30, 31_50, 51_plus}
    [json-key] pregnant_t1: {14_18, 19_30, 31_50}
    [json-key] pregnant_t2: {14_18, 19_30, 31_50}
    [json-key] pregnant_t3: {14_18, 19_30, 31_50}
    [json-key] lactating_0_6: {14_18, 19_30, 31_50}
    [json-key] lactating_7_12: {14_18, 19_30, 31_50}

structure from data/nutrients.json:
    [json-array] [38 items]

structure from data/pregnancy_weeks.json:
    [json-array] [42 items]

structure from data/user-input-schema.json:
    [file-summary] User Profile Input - Variables the user provides to calculate personalized nutrition needs
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "user-input-schema.json"
    [json-key] title: "User Profile Input"
    [json-key] description: "Variables the user provides to calculate personalized nutrit..."
    [json-key] type: "object"
    [json-key] required: [5 items]
    [json-key] properties: {age_years, sex, weight_kg, height_cm, activity_level, +9 more}
    [json-key] allOf: [1 items]

structure from data/reference/cross-check-all-life-stages.json:
    [json-key] _meta: {generatedAt, sourcesFetched, projectFile}
    [json-key] summary: {matches, mismatches, ncbiOnlyKeys, ndValueCases}
    [json-key] mismatches: [115 items]
    [json-key] ncbiOnly: [3 items]
    [json-key] ndValues: [0 items]

structure from data/reference/cross-check-report.md:
    [file-summary] NutriMom Data Cross-Check Report
    [trust-moderate] [heading-1] # NutriMom Data Cross-Check Report
    [trust-moderate] [heading-2] ## Summary
    [trust-moderate] [heading-2] ## Pregnancy 14–18 Years — RDA/AI Comparison
    [trust-moderate] [heading-2] ## Pregnancy 19–30 Years — RDA/AI Comparison
    [trust-moderate] [heading-2] ## Pregnancy 31–50 Years — Key Differences from 19–30
    [trust-moderate] [heading-2] ## Design Notes & Observations
    [trust-moderate] [heading-3] ### 1. DHA/EPA Target Type
    [trust-moderate] [heading-3] ### 2. Sodium Handling
    [trust-moderate] [heading-3] ### 3. Magnesium UL Scope
    [trust-moderate] [heading-3] ### 4. Folate UL Scope
    [trust-moderate] [heading-3] ### 5. Vitamin E UL Scope
    [trust-moderate] [heading-3] ### 6. Niacin UL Scope
    [trust-moderate] [heading-2] ## Food Composition Sources — Cross-Reference Availability
    [trust-moderate] [heading-2] ## Conclusion

structure from data/reference/nih-ods-pregnancy-targets.json:
    [json-key] _meta: {source, url, fetched, updated_by_source, description, +1 more}
    [json-key] recommended_intakes_pregnancy: {14_18, 19_50}
    [json-key] upper_limits_pregnancy: {14_18, 19_50}
    [json-key] key_nutrient_guidance: {calcium, choline, folate, iodine, iron, +7 more}

structure from data/reference/sources-index.json:
    [json-key] _meta: {description, created, purpose}
    [json-key] nutrient_target_sources: [2 items]
    [json-key] food_composition_sources: [4 items]

structure from data/reference/snapshots/ncbi-dri-elements/latest.json:
    [json-key] _meta: {source, sourceName, url, fetchedAt, tableKind, +1 more}
    [json-key] groups: {Infants, Children, Males, Females, Pregnancy, +1 more}

structure from data/reference/snapshots/ncbi-dri-macros/latest.json:
    [json-key] _meta: {source, sourceName, url, fetchedAt, tableKind, +1 more}
    [json-key] groups: {Infants, Children, Males, Females, Pregnancy, +1 more}

structure from data/reference/snapshots/ncbi-dri-ul-elements/latest.json:
    [json-key] _meta: {source, sourceName, url, fetchedAt, tableKind, +1 more}
    [json-key] groups: {Infants, Children, Males, Females, Pregnancy, +1 more}

structure from data/reference/snapshots/ncbi-dri-ul-vitamins/latest.json:
    [json-key] _meta: {source, sourceName, url, fetchedAt, tableKind, +1 more}
    [json-key] groups: {Infants, Children, Males, Females, Pregnancy, +1 more}

structure from data/reference/snapshots/ncbi-dri-vitamins/latest.json:
    [json-key] _meta: {source, sourceName, url, fetchedAt, tableKind, +1 more}
    [json-key] groups: {Infants, Children, Males, Females, Pregnancy, +1 more}

structure from data/reference/snapshots/nih-ods-pregnancy/2026-02-11T19-10-49Z.json:
    [json-key] _meta: {source_id, source_url, fetched_at, page_last_updated, parser_version}
    [json-key] nutrients: {pregnant_14_18, pregnant_19_50}

structure from data/reference/snapshots/nih-ods-pregnancy/latest.json:
    [json-key] _meta: {source_id, source_url, fetched_at, page_last_updated, parser_version}
    [json-key] nutrients: {pregnant_14_18, pregnant_19_50}

structure from data/samples/child-2yo.json:
    [json-key] version: "2.0"
    [json-key] exportDate: "2026-02-10T22:00:00.000Z"
    [json-key] profile: {ageYears, sex, weightKg, heightCm, activityLevel, +6 more}
    [json-key] plan: null
    [json-key] foodLog: {_meta, 2026-02-03, 2026-02-04, 2026-02-05, 2026-02-06, +4 more}

structure from data/samples/pregnant-38yo-19w.json:
    [json-key] version: "2.0"
    [json-key] exportDate: "2026-02-10T22:00:00.000Z"
    [json-key] profile: {ageYears, sex, weightKg, heightCm, activityLevel, +6 more}
    [json-key] plan: null
    [json-key] foodLog: {_meta, 2026-02-03, 2026-02-04, 2026-02-05, 2026-02-06, +4 more}

structure from data/samples/sample-week-log.json:
    [json-key] version: "2.0"
    [json-key] exportDate: "2026-02-10T22:00:00.000Z"
    [json-key] profile: {ageYears, sex, weightKg, heightCm, activityLevel, +6 more}
    [json-key] plan: null
    [json-key] foodLog: {_meta, 2026-02-04, 2026-02-05, 2026-02-06, 2026-02-07, +3 more}

structure from data/samples/standard-female-40yo.json:
    [json-key] version: "2.0"
    [json-key] exportDate: "2026-02-10T22:00:00.000Z"
    [json-key] profile: {ageYears, sex, weightKg, heightCm, activityLevel, +6 more}
    [json-key] plan: null
    [json-key] foodLog: {_meta, 2026-02-03, 2026-02-04, 2026-02-05, 2026-02-06, +4 more}

structure from data/samples/standard-male-40yo.json:
    [json-key] version: "2.0"
    [json-key] exportDate: "2026-02-10T10:00:00.000Z"
    [json-key] profile: {ageYears, sex, weightKg, heightCm, activityLevel, +6 more}
    [json-key] plan: null
    [json-key] foodLog: {_meta, 2026-02-03, 2026-02-04, 2026-02-05, 2026-02-06, +4 more}

structure from docs/non-formal-target-nutrients.md:
    [file-summary] Nutrients Without Formal RDA/AI Targets (or MAX-only)
    [trust-moderate] [heading-1] # Nutrients Without Formal RDA/AI Targets (or MAX-only)
    [trust-moderate] [heading-2] ## Why “target = 0” hides nutrients today
    [trust-moderate] [heading-2] ## Categories of non-standard targets
    [trust-moderate] [heading-3] ### A) MAX-only nutrients (Limit-only)
    [trust-moderate] [heading-3] ### B) Evidence-supported but no formal DRI (Info-only)
    [trust-moderate] [heading-2] ## Implementation model (Tiered)
    [trust-moderate] [heading-2] ## JSON schema guidance
    [trust-moderate] [heading-2] ## UI rules
    [trust-moderate] [heading-2] ## Future candidates (not yet tracked)

structure from docs/nutrient-reference-tables.md:
    [file-summary] Complete Nutrient Reference Tables
    [trust-moderate] [heading-1] # Complete Nutrient Reference Tables
    [trust-moderate] [heading-2] ## Table of Contents
    [trust-moderate] [heading-2] ## Macronutrients
    [trust-moderate] [heading-3] ### Protein (g/day) - RDA
    [trust-moderate] [heading-3] ### Carbohydrate (g/day) - Minimum
    [trust-moderate] [heading-3] ### Fat (% energy) - AMDR
    [trust-moderate] [heading-3] ### Fiber (g/day) - AI
    [trust-moderate] [heading-3] ### Water (L/day) - AI
    [trust-moderate] [heading-3] ### Omega-3 ALA (g/day) - AI
    [trust-moderate] [heading-3] ### DHA (mg/day) - Planning Target
    [trust-moderate] [heading-2] ## Vitamins
    [trust-moderate] [heading-3] ### Folate (μg DFE/day) - RDA
    [trust-moderate] [heading-3] ### Vitamin B12 (μg/day) - RDA
    [trust-moderate] [heading-3] ### Vitamin B6 (mg/day) - RDA
    [trust-moderate] [heading-3] ### Thiamin B1 (mg/day) - RDA
    [trust-moderate] [heading-3] ### Riboflavin B2 (mg/day) - RDA
    [trust-moderate] [heading-3] ### Niacin B3 (mg NE/day) - RDA
    [trust-moderate] [heading-3] ### Vitamin A (μg RAE/day) - RDA
    [trust-moderate] [heading-3] ### Vitamin C (mg/day) - RDA
    [trust-moderate] [heading-3] ### Vitamin D (μg/day) - RDA
    [trust-moderate] [heading-3] ### Vitamin E (mg/day) - RDA
    [trust-moderate] [heading-3] ### Vitamin K (μg/day) - AI
    [trust-moderate] [heading-3] ### Choline (mg/day) - AI
    [trust-moderate] [heading-3] ### Pantothenic Acid (mg/day) - AI
    [trust-moderate] [heading-3] ### Biotin (μg/day) - AI
    [trust-moderate] [heading-2] ## Minerals
    [trust-moderate] [heading-3] ### Iron (mg/day) - RDA
    [trust-moderate] [heading-3] ### Calcium (mg/day) - RDA
    [trust-moderate] [heading-3] ### Iodine (μg/day) - RDA
    [trust-moderate] [heading-3] ### Zinc (mg/day) - RDA
    [trust-moderate] [heading-3] ### Magnesium (mg/day) - RDA
    [trust-moderate] [heading-3] ### Phosphorus (mg/day) - RDA
    [trust-moderate] [heading-3] ### Selenium (μg/day) - RDA
    [trust-moderate] [heading-3] ### Copper (μg/day) - RDA
    [trust-moderate] [heading-3] ### Manganese (mg/day) - AI
    [trust-moderate] [heading-3] ### Chromium (μg/day) - AI
    [trust-moderate] [heading-3] ### Molybdenum (μg/day) - RDA
    [trust-moderate] [heading-3] ### Potassium (mg/day) - AI
    [trust-moderate] [heading-3] ### Sodium (mg/day) - Maximum
    [trust-moderate] [heading-2] ## Pregnancy Changes Summary
    [trust-moderate] [heading-3] ### Nutrients with MAJOR Increases (>40%)
    [trust-moderate] [heading-3] ### Nutrients with Moderate Increases (10-40%)
    [trust-moderate] [heading-3] ### Nutrients UNCHANGED
    [trust-moderate] [heading-3] ### New Targets in Pregnancy

structure from docs/nutrient-research-2026.md:  (no extractable definitions)

structure from docs/pregnancy-nutrition-guide.md:
    [file-summary] Pregnancy Nutrition: Week-by-Week Guide
    [trust-moderate] [heading-1] # Pregnancy Nutrition: Week-by-Week Guide
    [trust-moderate] [heading-2] ## How Pregnancy Changes Nutrition Needs
    [trust-moderate] [heading-2] ## Trimester Overview
    [trust-moderate] [heading-3] ### Trimester 1 (Weeks 1-13)
    [trust-moderate] [heading-3] ### Trimester 2 (Weeks 14-27)
    [trust-moderate] [heading-3] ### Trimester 3 (Weeks 28-42)
    [trust-moderate] [heading-2] ## Comparison Table: Normal vs Pregnancy
    [trust-moderate] [heading-2] ## Special Considerations
    [trust-moderate] [heading-3] ### Teenagers (14-18)
    [trust-moderate] [heading-3] ### Vegetarians/Vegans
    [trust-moderate] [heading-3] ### Gestational Diabetes
    [trust-moderate] [heading-3] ### Anemia
    [trust-moderate] [heading-3] ### Multiples (Twins+)
    [trust-moderate] [heading-2] ## References

structure from docs/project-research-analysis.md:
    [file-summary] NutriMom - Project Research & Business Analysis
    [trust-moderate] [heading-1] # NutriMom - Project Research & Business Analysis
    [trust-moderate] [heading-2] ## Executive Summary
    [trust-moderate] [heading-2] ## 1. Problem Statement
    [trust-moderate] [heading-3] ### 1.1 The Global Challenge
    [trust-moderate] [heading-3] ### 1.2 The Information Gap
    [trust-moderate] [heading-3] ### 1.3 Target Users
    [trust-moderate] [heading-2] ## 2. Solution Overview
    [trust-moderate] [heading-3] ### 2.1 Core Features
    [trust-moderate] [heading-3] ### 2.2 Technical Architecture
    [trust-moderate] [heading-3] ### 2.3 Data Sources
    [trust-moderate] [heading-2] ## 3. SWOT Analysis
    [trust-moderate] [heading-3] ### 3.1 Strengths
    [trust-moderate] [heading-3] ### 3.2 Weaknesses
    [trust-moderate] [heading-3] ### 3.3 Opportunities
    [trust-moderate] [heading-3] ### 3.4 Threats
    [trust-moderate] [heading-2] ## 4. Competitive Analysis
    [trust-moderate] [heading-3] ### 4.1 Market Landscape
    [trust-moderate] [heading-3] ### 4.2 Differentiation
    [trust-moderate] [heading-2] ## 5. Technical Specifications
    [trust-moderate] [heading-3] ### 5.1 Calculation Methods
    [trust-moderate] [heading-4] #### BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
    [trust-moderate] [heading-4] #### TDEE (Total Daily Energy Expenditure)
    [trust-moderate] [heading-4] #### Pregnancy Energy Increments (IOM)
    [trust-moderate] [heading-4] #### BMI Categories
    [trust-moderate] [heading-3] ### 5.2 Data Schema
    [trust-moderate] [heading-4] #### Nutrient Target Structure
    [trust-moderate] [heading-4] #### Life Stages Supported
    [trust-moderate] [heading-3] ### 5.3 Browser Compatibility
    [trust-moderate] [heading-2] ## 6. Business Model Options
    [trust-moderate] [heading-3] ### 6.1 Non-Commercial (Current)
    [trust-moderate] [heading-3] ### 6.2 Freemium (Potential)
    [trust-moderate] [heading-3] ### 6.3 B2B Licensing (Potential)
    [trust-moderate] [heading-3] ### 6.4 Sponsorship (Potential)
    [trust-moderate] [heading-2] ## 7. Future Roadmap
    [trust-moderate] [heading-3] ### Phase 1: Foundation (Complete) ✅
    [trust-moderate] [heading-3] ### Phase 2: Quality Assurance (In Progress) 🔄
    [trust-moderate] [heading-3] ### Phase 3: Enhancement (Planned) 📋
    [trust-moderate] [heading-3] ### Phase 4: AI Integration (Future) 🔮
    [trust-moderate] [heading-3] ### Phase 5: Platform Expansion (Future) 🚀
    [trust-moderate] [heading-2] ## 8. Key Metrics & Success Criteria
    [trust-moderate] [heading-3] ### 8.1 Technical Metrics
    [trust-moderate] [heading-3] ### 8.2 User Metrics (Future)
    [trust-moderate] [heading-3] ### 8.3 Health Impact Metrics (Long-term)
    [trust-moderate] [heading-2] ## 9. Risk Assessment
    [trust-moderate] [heading-3] ### 9.1 Technical Risks
    [trust-moderate] [heading-3] ### 9.2 Legal/Compliance Risks
    [trust-moderate] [heading-3] ### 9.3 Business Risks
    [trust-moderate] [heading-2] ## 10. Conclusions
    [trust-moderate] [heading-3] ### 10.1 Project Viability
    [trust-moderate] [heading-3] ### 10.2 Key Success Factors
    [trust-moderate] [heading-3] ### 10.3 Recommendations
    [trust-moderate] [heading-3] ### 10.4 Final Assessment
    [trust-moderate] [heading-2] ## References

structure from docs/user-input-variables.md:
    [file-summary] User Input Variables
    [trust-moderate] [heading-1] # User Input Variables
    [trust-moderate] [heading-2] ## Required Fields
    [trust-moderate] [heading-3] ### age_years
    [trust-moderate] [heading-3] ### sex
    [trust-moderate] [heading-3] ### weight_kg
    [trust-moderate] [heading-3] ### height_cm
    [trust-moderate] [heading-3] ### activity_level
    [trust-moderate] [heading-2] ## Pregnancy Fields
    [trust-moderate] [heading-3] ### is_pregnant
    [trust-moderate] [heading-3] ### pregnancy_week
    [trust-moderate] [heading-3] ### pre_pregnancy_weight_kg
    [trust-moderate] [heading-3] ### multiples_count
    [trust-moderate] [heading-2] ## Lactation Fields
    [trust-moderate] [heading-3] ### is_lactating
    [trust-moderate] [heading-3] ### lactation_months
    [trust-moderate] [heading-2] ## Optional Profile Fields
    [trust-moderate] [heading-3] ### dietary_pattern
    [trust-moderate] [heading-3] ### medical_conditions
    [trust-moderate] [heading-3] ### supplements
    [trust-moderate] [heading-2] ## Calculated Values
    [trust-moderate] [heading-3] ### age_band
    [trust-moderate] [heading-3] ### life_stage
    [trust-moderate] [heading-3] ### trimester
    [trust-moderate] [heading-3] ### bmi
    [trust-moderate] [heading-3] ### bmi_category
    [trust-moderate] [heading-3] ### bmr_kcal
    [trust-moderate] [heading-3] ### tdee_kcal
    [trust-moderate] [heading-3] ### total_energy_kcal

structure from js/app.js:
    [file-summary] NutriMom - Nutrition Calculator for Everyone Main application controller
    const STORAGE_KEYS  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function switchView(target)  «docstring: none»
    function sanitizeString(str, maxLen = 500)  «Sanitize string for safe storage/display»
    function sanitizeNumber(value, min = 0, max = 100000)  «Sanitize number input»
    function exportUserData()  «Export all user data to JSON file»
    function importUserData(file)  «Import user data from JSON file»
    function clearAllData()  «Clear all user data»
    function loadSavedProfile()  «docstring: none»
    function updatePregnancySectionVisibility()  «docstring: none»
    function calculateAndDisplay()  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function displayProfileCard(plan, profile)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function displayEnergy(energy, isPregnant)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function displayWeightGain(profile)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function displayNutrientGrid(targets, category)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function displayComparison(comparison)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function displayCriticalNutrients(targets, profile)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function buildCriticalReasonHtml(name, fullText)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function openCriticalReasonModal(title, text)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function getCriticalNutrientGuidance(code, nutrient, profile)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function getNutrientFoodExamples(code, stage)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function extractTargetValue(data)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function normalizeSentence(str)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function escapeHtml(str)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function formatAgeBand(code)  «docstring: none»
    function formatActivity(level)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function formatNum(val)  «NutriMom - Nutrition Calculator for Everyone Main application controller»
    function truncate(str, max)  «NutriMom - Nutrition Calculator for Everyone Main application controller»

structure from js/nutrition-engine.js:
    [file-summary] NutriMom Nutrition Engine Static JavaScript engine for calculating personalized nutrition needs Supports all ages (1+), both sexes, pregnancy, and lactation
    class NutritionEngine  «NutriMom Nutrition Engine Static JavaScript engine for calculating personalized nutrition needs Supports all ages (1+), »:
        constructor()  «docstring: none»
        async loadData(basePath = './data')  «Load all JSON data files»
        setData(data)  «Set data directly (for testing or pre-loaded data)»
        getAgeBand(age)  «Determine age band from age in years»
        isReproductiveAge(age)  «Check if age is within reproductive range for pregnancy/lactation»
        getLifeStage(profile)  «Determine life stage from user profile»
        getTrimester(week)  «Get trimester from pregnancy week»
        calculateBMR({ sex, weightKg, heightCm, ageYears })  «Calculate Basal Metabolic Rate Uses Schofield/WHO equations for children (< 19), Mifflin-St Jeor for adults (19+)»
        _calculateChildBMR(sex, weightKg, ageYears)  «Calculate BMR for children/adolescents using Schofield equations»
        calculateTDEE(bmr, activityLevel)  «Calculate Total Daily Energy Expenditure»
        getPregnancyEnergyIncrement(lifeStage)  «Get pregnancy energy increment based on trimester»
        calculateEnergyNeeds(profile)  «Calculate total daily energy needs»
        getNutrientTargets(lifeStage, ageBand)  «Get all nutrient targets for a specific life stage and age band»
        getNutritionPlan(profile)  «Get personalized nutrition plan for a user»
        getLifeStageLabel(code)  «Get human-readable label for life stage»
        compareLifeStages(ageBand, baseLifeStage, compareLifeStage)  «Compare nutrient targets between two life stages»
        getPregnancyComparison(ageYears, pregnancyWeek)  «Get pregnancy vs non-pregnancy comparison»
        calculateBMI(weightKg, heightCm)  «Calculate BMI»
        getBMICategory(bmi)  «Get BMI category»
        getPregnancyWeightGainRecommendation(prePregnancyBMI, isMultiples = false)  «Get recommended pregnancy weight gain based on pre-pregnancy BMI»
        calculateRemaining(targets, consumed)  «Calculate remaining nutrients needed for the day»
        analyzeIntake(extraction, targets)  «Analyze food intake from LLM extraction results»
        calculateOverallScore(analysis)  «Calculate overall nutrition score»
        getNutrientsByCategory()  «Get all nutrients organized by category»
        getWeekInfo(week)  «Get pregnancy week information»
        getCriticalPregnancyNutrients()  «Get nutrients with specific importance for pregnancy»


structure from plugins/food-tracker/README.md:
    [file-summary] Food Tracker Plugin
    [trust-moderate] [heading-1] # Food Tracker Plugin
    [trust-moderate] [heading-2] ## Features
    [trust-moderate] [heading-2] ## Quick Start
    [trust-moderate] [heading-3] ### 1. Include the plugin files
    [trust-moderate] [heading-3] ### 2. Add a container element
    [trust-moderate] [heading-3] ### 3. Initialize the plugin
    [trust-moderate] [heading-2] ## Configuration Options
    [trust-moderate] [heading-2] ## API Reference
    [trust-moderate] [heading-3] ### FoodTrackerPlugin
    [trust-moderate] [heading-3] ### LLM Response Schema
    [trust-moderate] [heading-2] ## File Structure
    [trust-moderate] [heading-2] ## Mock Responses
    [trust-moderate] [heading-2] ## Integration with NutriMom
    [trust-moderate] [heading-2] ## Browser Support
    [trust-moderate] [heading-2] ## License

structure from plugins/food-tracker/croqueta-casera-de-bacalao-bardetodos-unidad.webp:  (no extractable definitions)

structure from plugins/food-tracker/demo.html:
    [file-summary] NutriMom - Food Tracker
    [title] <title>NutriMom - Food Tracker</title>
    [heading-1] <h1>NutriMom</h1>
    [heading-3] <h3>🧪 Demo Mode</h3>
    [heading-3] <h3>📸 Sample Image Test</h3>
    [heading-3] <h3>🔬 Quick Tests (Mock Data)</h3>

structure from plugins/food-tracker/food-log-dashboard.css:
    [file-summary] * * Food Log Dashboard Styles * * @author Nicolas Ivan Larenas Bustamante * @license CC BY NC SA 4.0
    [note] [warning] Tree-sitter CSS backend is unavailable; CSS extraction is running in regex fallback mode.
    [selector] .log-dashboard
    [selector] .log-header
    [selector] .log-header h2
    [selector] .log-subtitle
    [selector] .log-section
    [selector] .log-section h3
    [selector] .section-note
    [selector] .log-empty-state
    [selector] .log-empty-state .empty-icon
    [selector] .log-empty-state h3
    [selector] .log-empty-state p
    [selector] .log-summary-cards
    [selector] .log-card
    [selector] .log-card:hover
    [selector] .log-card-icon
    [selector] .log-card-value
    [selector] .log-card-label
    [selector] .log-card.accent-folate
    [selector] .log-card.accent-iron
    [selector] .log-charts-row
    [selector] .log-chart-container
    [selector] .log-chart-container h4
    [selector] .chart-wrapper
    [selector] .chart-bars
    [selector] .chart-bar-group
    [selector] .chart-bar-value
    [selector] .chart-bar-track
    [selector] .chart-bar-fill
    [selector] .chart-bar-fill.protein
    [selector] .chart-bar-fill.on-track
    [selector] .chart-bar-fill.below
    [selector] .chart-bar-label
    [selector] .chart-target-line
    [selector] .chart-target-line span
    [selector] .micro-bars-container
    [selector] .micro-bar-item
    [selector] .micro-bar-label
    [selector] .micro-name
    [selector] .micro-values
    [selector] .micro-bar-track
    [selector] .micro-bar-fill
    [selector] .micro-pct
    [selector] .micro-met
    [selector] .micro-close
    [selector] .micro-low
    [selector] .micro-deficient
    [selector] .log-insights-list
    [selector] .log-insight
    [selector] .log-insight p
    [selector] .insight-icon
    [selector] .log-insight-success
    [selector] .log-insight-info
    [selector] .log-insight-warning
    [selector] .log-insight-critical
    [selector] .log-table-wrapper
    [selector] .log-table
    [selector] .log-table thead th
    [selector] .log-table tbody td
    [selector] .log-table-row:hover
    [selector] .log-table-row.row-today
    [selector] .col-status
    [selector] .col-date
    [selector] .day-name
    [selector] .date-str
    [selector] .col-meals
    [selector] .meals-count
    [selector] .col-cal
    [selector] .col-protein, .col-carbs, .col-fat
    [selector] .col-iron
    [selector] .col-folate
    [selector] .col-calcium

structure from plugins/food-tracker/food-log-dashboard.js:
    [file-summary] Food Log Dashboard Component
    class FoodLogDashboard  «Food Log Dashboard Component»:
        constructor(options = {})  «docstring: none»
        init()  «Initialize the dashboard (call after DOM is ready)»
        setUserTargets(targets)  «Set user targets for comparison»
        setUserProfile(profile)  «Set user profile for context-aware insights»
        render()  «Re-render the entire dashboard»
        _renderEmptyState()  «docstring: none»
        _renderSummaryCards(meta, weeklyAvg)  «docstring: none»
        _renderWeeklyChart(weeklyAvg)  «docstring: none»
        _renderMicronutrientChart(weeklyAvg)  «docstring: none»
        _renderInsights(weeklyAvg, allDays)  «docstring: none»
        _renderDayTable(allDays)  «docstring: none»
        _extractTarget(targetData)  «docstring: none»
        _shortDayName(dateStr)  «docstring: none»
        _mealEmoji(type)  «docstring: none»


structure from plugins/food-tracker/food-tracker-engine.js:
    [file-summary] Food Tracker Engine
    class FoodTrackerEngine  «Food Tracker Engine»:
        constructor(options = {})  «docstring: none»
        _markRecovery(storageKey, error)  «docstring: none»
        getRecoveryState()  «docstring: none»
        _loadFrequentMeals()  «Load frequent meals from localStorage»
        _saveFrequentMeals()  «Persist frequent meals to localStorage»
        getFrequentMeals()  «Return all frequent meals sorted by usage and recency»
        addFrequentMeal(analysis, title)  «Save a meal analysis as reusable frequent meal template»
        buildAnalysisFromFrequentMeal(frequentMealId)  «Build a reusable analysis object from a frequent meal template»
        removeFrequentMeal(frequentMealId)  «Delete frequent meal from memory»
        _ensureMeta()  «Ensure _meta key exists in foodLog»
        _updateMeta()  «Update metadata after any foodLog mutation»
        _checkDayTransition()  «Check if a new day has started since the last entry. Marks previous days as completed.»
        getAllDates()  «Get all logged dates (sorted ascending), excluding _meta»
        getDayCount()  «Get number of days with logged data»
        getAllDaysSummary()  «Get all days summary for table/list display»
        getWeeklyAverages(endDate = null, days = 7)  «Get weekly averages for a period ending on the given date»
        getMeta()  «Get metadata»
        importFoodLog(importedLog)  «Import food log data (for restore/sync) Merges imported data with existing, preferring newer entries»
        getExportPayload()  «Get export payload for server sync»
        async analyzeImage(image, mealType = null)  «Analyze a food image using LLM vision API»
        async _fileToBase64(file)  «Convert file to base64»
        async _callLLMApi(imageBase64, mealType)  «Call LLM API for image analysis»
        _validateResponse(response)  «Validate LLM response against schema»
        addToLog(analysis, imageDataUrl = null)  «Add analyzed meal to daily log»
        removeFromLog(date, mealId)  «Remove a meal from the log»
        getDailyLog(date = null)  «Get food log for a specific date»
        getLogRange(startDate, endDate)  «Get food log for date range»
        clearAll()  «Clear all food log data»
        _getDateKey()  «Get current date key»
        _formatDate(date)  «Format date as YYYY-MM-DD (Local Time)»
        _emptyTotals()  «Create empty totals object covering all tracked nutrients»
        _recalculateDailyTotals(date)  «Recalculate daily totals from meals Re-aggregates strictly from food items to ensure consistency (ignoring LLM-provided »
        _loadFromStorage()  «Load food log from localStorage»
        _saveToStorage()  «Save food log to localStorage»
        _extractTargetValue(targetData)  «Extract target value from nutrient data (handles RDA, AI, MIN, AMDR)»
        compareToTargets(targets, date = null)  «Compare daily intake against nutrient targets»
        _checkDayCompletion(comparison)  «Check if all required targets for the day are met»
        _generateNutrientInsights(comparison, criticalStatus)  «Generate actionable insights based on nutrient comparison»
        _formatNutrientName(code)  «Format nutrient code to human-readable name»
        _getNutrientStatus(intake, rdi, ul)  «Get nutrient status based on intake vs targets»
        generateDailySummary(targets, date = null)  «Generate daily summary report»
        _generateRecommendations(comparison, targets)  «Generate nutritional recommendations based on comparison»
        _getFoodSuggestion(nutrient)  «Get food suggestions for deficient nutrients»


structure from plugins/food-tracker/food-tracker-ui.js:
    [file-summary] Food Tracker UI Component
    class FoodTrackerUI  «Food Tracker UI Component»:
        constructor(options = {})  «docstring: none»
        _sanitizeString(str, maxLen = this.VALIDATION_LIMITS.maxStringLength)  «Sanitize string input to prevent XSS and injection»
        _sanitizeNumber(value, min = this.VALIDATION_LIMITS.minNumericValue, max = this.VALIDATION_LIMITS.maxNumericValue)  «Validate and sanitize numeric input»
        _validateEnum(value, allowedValues, defaultValue)  «Validate input against allowed values»
        _checkProfileComplete()  «Check if user profile is complete enough for food tracking»
        _validateProfileBeforeStore()  «Show profile warning if needed before storing data»
        _init()  «docstring: none»
        _render()  «docstring: none»
        _bindEvents()  «docstring: none»
        _handleFile(file)  «docstring: none»
        _showPreview(dataUrl)  «docstring: none»
        _clearPreview()  «docstring: none»
        async _analyzeFood()  «docstring: none»
        _showAnalysisError(title, message)  «Show analysis error message»
        _showLoading(show)  «docstring: none»
        _showResults(analysis)  «docstring: none»
        _addToLog()  «docstring: none»
        _discardAnalysis()  «docstring: none»
        _saveCurrentAsFrequentMeal()  «docstring: none»
        _useFrequentMeal(frequentMealId)  «docstring: none»
        _deleteFrequentMeal(frequentMealId)  «docstring: none»
        _renderFrequentMeals()  «docstring: none»
        _updateDailyView()  «docstring: none»
        _updateNutrientComparison()  «docstring: none»
        _checkForCelebration()  «Check if celebration should be shown»
        _showCelebration()  «Show celebration modal with fireworks»
        _getMealTypeEmoji(type)  «docstring: none»
        _formatTime(isoString)  «docstring: none»
        _formatNutrientName(key)  «docstring: none»
        _nutrientCategoryMap()  «docstring: none»
        _groupNutrients(nutrientsObj)  «docstring: none»
        _getManualPrompt()  «Generate the prompt for manual use with AI models»
        _getPromptNutrientKeys()  «docstring: none»
        _buildNutrientRequirementsText(macroKeys, micronutrientKeys)  «docstring: none»
        _buildNutrientFieldsJson(keys, spaces = 6)  «docstring: none»
        _updatePrompt()  «Update the prompt display»
        async _copyPromptToClipboard()  «Copy prompt to clipboard»
        _parseLLMResponse()  «Parse and validate LLM response with strict schema validation»
        _validateNutritionSchema(data)  «Validate nutrition data against strict schema»
        _validateNutrientObject(obj, context, errors)  «Validate nutrient values in an object»
        _buildSanitizedAnalysis(parsed)  «Build sanitized analysis object from parsed data»
        _showParseError(message)  «Show parse error message»
        setUserTargets(targets)  «Set user targets for nutrient comparison»
        setUserContext(context)  «Set user profile context for better AI analysis»
        refresh()  «Refresh the daily view»


structure from plugins/food-tracker/food-tracker.css:
    [file-summary] * * Food Tracker Plugin Styles * * @author Nicolas Ivan Larenas Bustamante * @license CC BY NC SA 4.0
    [note] [warning] Tree-sitter CSS backend is unavailable; CSS extraction is running in regex fallback mode.
    [section] /* API Status Banner */
    [selector] .api-status-banner
    [selector] .api-status-banner.api-not-connected
    [selector] .api-status-banner.api-connected
    [selector] .api-status-icon
    [selector] .api-status-content
    [selector] .api-status-content strong
    [selector] .api-status-content p
    [selector] .api-status-content ol
    [section] /* Workflow Dropdowns */
    [selector] .tracker-workflow-dropdown
    [selector] .tracker-workflow-dropdown[open]
    [selector] .workflow-summary
    [section] /* Hide default arrow in some browsers */
    [selector] .workflow-summary::-webkit-details-marker
    [section] /* Hide default arrow in WebKit */
    [selector] .workflow-summary:hover
    [selector] .summary-title
    [selector] .summary-icon
    [selector] .summary-badge
    [selector] .badge-recommended
    [selector] .badge-optional
    [selector] .badge-connected
    [selector] .badge-unavailable
    [selector] .workflow-content
    [section] /* API Warning for Automated Analysis */
    [selector] .api-warning-info
    [selector] .api-warning-info .warning-icon
    [selector] .api-warning-info p
    [selector] .automated-analysis-form
    [selector] .upload-section
    [selector] .diy-instructions-highlight
    [selector] .diy-pro-tip
    [selector] .api-status-content ol li
    [section] /* Analysis Error */
    [selector] .analysis-error
    [section] /* Micronutrient grouping UI */
    [selector] .micros-dropdown
    [selector] .micros-dropdown summary
    [selector] .micros-dropdown .micros-content
    [selector] .nutrient-category summary
    [selector] .nutrient-category .category-items
    [selector] .micro-item
    [selector] .nutrient-bar-item.small
    [selector] .category-summary
    [selector] .analysis-error .error-icon
    [selector] .analysis-error h4
    [selector] .analysis-error p
    [selector] .food-tracker
    [selector] .tracker-header
    [selector] .safe-mode-banner
    [selector] .safe-mode-icon
    [selector] .safe-mode-content strong
    [selector] .safe-mode-content p
    [selector] .tracker-header h2
    [selector] .tracker-subtitle
    [selector] .upload-area
    [selector] .upload-area.dragover
    [selector] .upload-icon
    [selector] .upload-area p
    [selector] .upload-hint
    [selector] .upload-actions
    [selector] .btn
    [selector] .btn:disabled
    [selector] .btn-primary
    [selector] .btn-primary:hover:not(:disabled)
    [selector] .btn-secondary
    [selector] .btn-secondary:hover:not(:disabled)
    [selector] .btn-analyze
    [selector] .btn-analyze:hover:not(:disabled)
    [selector] .btn-small
    [selector] .image-preview
    [selector] .image-preview img
    [selector] .preview-overlay
    [selector] .tracker-global-settings
    [selector] .meal-type-selector
    [selector] .meal-type-selector label
    [selector] .meal-options
    [selector] .meal-option
    [selector] .meal-option:hover
    [selector] .meal-option.active
    [selector] .loading-state
    [selector] .spinner
    [selector] .analysis-results
    [selector] .analysis-results h3
    [selector] .analysis-confidence
    [selector] .food-items-list
    [selector] .food-item-card
    [selector] .food-item-header
    [selector] .food-name
    [selector] .food-quantity
    [selector] .food-item-nutrients
    [selector] .food-item-nutrients .nutrient
    [section] /* Meal Totals */
    [selector] .meal-totals
    [selector] .meal-totals h4
    [selector] .totals-grid
    [selector] .total-item
    [selector] .total-value
    [selector] .total-label
    [section] /* Pregnancy Notes */
    [selector] .pregnancy-notes
    [selector] .pregnancy-notes h4
    [selector] .pregnancy-notes ul
    [selector] .pregnancy-notes li
    [section] /* Warnings */
    [selector] .analysis-warnings
    [selector] .analysis-warnings h4
    [selector] .analysis-warnings ul
    [selector] .analysis-warnings li
    [section] /* Results Actions */
    [selector] .results-actions
    [selector] .daily-summary
    [selector] .daily-summary h3
    [selector] .empty-state
    [selector] .daily-totals-grid
    [selector] .daily-total
    [selector] .daily-total .value
    [selector] .daily-total .label
    [selector] .left-to-eat
    [selector] .left-val
    [selector] .left-to-eat.pending .left-val
    [selector] .left-to-eat.met .left-val
    [selector] .left-label
    [selector] .meals-log
    [selector] .meals-log h3
    [selector] .meals-list
    [selector] .meal-card
    [selector] .meal-card:hover
    [selector] .meal-header
    [selector] .meal-thumb
    [selector] .meal-info
    [selector] .meal-type
    [selector] .meal-time
    [selector] .remove-meal
    [selector] .remove-meal:hover
    [selector] .meal-foods
    [selector] .meal-quick-stats
    [selector] .nutrient-comparison
    [selector] .nutrient-comparison h3
    [selector] .nutrient-comparison-header
    [selector] .nutrient-bars
    [selector] .nutrient-bar-item
    [selector] .nutrient-bar-label
    [selector] .nutrient-bar-label strong
    [selector] .nutrient-bar-label .nutrient-bar-values
    [selector] .nutrient-bar-track-container
    [selector] .nutrient-bar-track
    [selector] .nutrient-remaining-column
    [selector] .remaining-value
    [selector] .nutrient-remaining-column.met .remaining-value
    [selector] .nutrient-remaining-column.pending .remaining-value
    [selector] .remaining-unit
    [selector] .nutrient-bar-fill
    [selector] .nutrient-bar-fill.deficient
    [selector] .nutrient-bar-fill.low
    [selector] .nutrient-bar-fill.adequate
    [selector] .nutrient-bar-fill.optimal
    [selector] .nutrient-bar-fill.exceeded
    [selector] .nutrient-bar-target
    [selector] .nutrient-bar-percent
    [section] /* Comparison Alerts */
    [selector] .comparison-alert
    [selector] .comparison-alert.deficit
    [selector] .comparison-alert.exceeded
    [selector] .photo-title-section
    [selector] .photo-title-section label
    [selector] .text-input
    [selector] .text-input:focus
    [selector] .text-input::placeholder
    [selector] .input-hint
    [selector] .manual-llm-section
    [selector] .manual-llm-section h3
    [selector] .section-description
    [section] /* Prompt Generator */
    [selector] .prompt-generator
    [selector] .prompt-generator label
    [selector] .prompt-textarea
    [selector] .prompt-textarea:focus
    [selector] .copy-feedback
    [selector] .copy-feedback.show
    [section] /* Response Parser */
    [selector] .response-parser
    [selector] .frequent-meals-module
    [selector] .frequent-meals-header-row
    [selector] .frequent-meals-header-row h4
    [selector] .frequent-meals-help
    [selector] .frequent-meals-list
    [selector] .frequent-empty-state
    [selector] .frequent-meal-item
    [selector] .frequent-meal-main
    [selector] .frequent-meal-meta
    [selector] .frequent-meal-actions
    [selector] .response-parser label
    [selector] .response-textarea
    [selector] .response-textarea:focus
    [selector] .response-textarea::placeholder
    [selector] .parse-error
    [selector] .nutrient-insights
    [selector] .insight-item
    [selector] .insight-item p
    [selector] .insight-item small
    [selector] .insight-critical
    [selector] .insight-warning
    [selector] .insight-success
    [selector] .insight-caution
    [section] /* Success state for comparison alerts */
    [selector] .comparison-alert.success
    [section] /* Status colors for percentage labels */
    [selector] .nutrient-bar-percent.optimal
    [selector] .nutrient-bar-percent.adequate
    [selector] .nutrient-bar-percent.low
    [selector] .nutrient-bar-percent.deficient
    [selector] .nutrient-bar-percent.exceeded
    [section] /* Enhanced bar fill colors */
    [section] /* Nutrient bar values styling */
    [selector] .nutrient-bar-values
    [section] /* Celebration Modal */
    [selector] .ft-celebration-modal
    [selector] .ft-celebration-modal.visible
    [selector] .ft-celebration-content
    [selector] .ft-celebration-modal.visible .ft-celebration-content
    [selector] .ft-celebration-icon
    [selector] .ft-celebration-title
    [selector] .ft-celebration-text
    [selector] .ft-close-celebration
    [selector] .ft-close-celebration:hover
    [section] /* Fireworks Animation */
    [selector] .pyro > .before, .pyro > .after
    [selector] .pyro > .after

structure from plugins/food-tracker/index.js:
    [file-summary] Food Tracker Plugin - Main Entry Point
    class FoodTrackerPlugin  «Food Tracker Plugin - Main Entry Point»:
        constructor(options = {})  «docstring: none»
        init()  «Initialize the plugin Call this after DOM is ready»
        setUserTargets(targets)  «Update user's nutrient targets Call this when user profile changes in main calculator»
        setUserProfile(profile)  «Set user profile for context-aware features»
        async analyzeImage(image, mealType = 'snack')  «Programmatically analyze an image»
        addToLog(analysis, imageDataUrl = null)  «Add analyzed food to the log»
        getDailyLog()  «Get today's food log»
        compareToTargets(targets = null)  «Compare intake against targets»
        getDailySummary(targets = null)  «Generate daily summary report»
        clearAll()  «Clear all food log data»
        getEngine()  «Get the underlying engine for advanced usage»
        getUI()  «Get the underlying UI component for advanced usage»
        getDashboard()  «Get the log dashboard component»


structure from plugins/food-tracker/llm-config.js:
    [file-summary] LLM Vision Food Analysis - Configuration & Prompts
    const LLMFoodConfig  «LLM Vision Food Analysis - Configuration & Prompts»

structure from plugins/food-tracker/mock-responses.js:
    [file-summary] Mock Food Analysis Responses
    const MockFoodResponses  «Mock Food Analysis Responses»

structure from reference/sql-prototype/README.md:
    [file-summary] SQLite nutrition DB
    [trust-moderate] [heading-1] # SQLite nutrition DB

structure from reference/sql-prototype/example-queries.sql:
    [file-summary] Example queries for selecting normal vs pregnancy targets.

structure from reference/sql-prototype/schema.sql:
    [file-summary] SQLite schema for nutrition planning + pregnancy week mapping. Designed for: normal vs pregnancy targets by age band; week-of-pregnancy selects trimester targets.
    [table] CREATE TABLE IF NOT EXISTS nutrient  «---------- Core reference tables ----------»
    [table] CREATE TABLE IF NOT EXISTS life_stage  «docstring: none»
    [table] CREATE TABLE IF NOT EXISTS age_band  «docstring: none»
    [table] CREATE TABLE IF NOT EXISTS nutrient_target  «Nutrient targets (RDA/AI/UL/MIN/MAX/AMDR) per life stage + age band.»
    [table] CREATE TABLE IF NOT EXISTS pregnancy_week  «---------- Pregnancy week mapping ----------»
    [table] CREATE TABLE IF NOT EXISTS user_profile  «---------- Optional: user + logging (for later LLM/image integration) ----------»
    [table] CREATE TABLE IF NOT EXISTS pregnancy_profile  «docstring: none»
    [table] CREATE TABLE IF NOT EXISTS intake_log  «docstring: none»
    [view] CREATE VIEW IF  «Get trimester for any week.»
    [view] CREATE VIEW IF  «Get targets (tall) for a life stage + age band.»
    [view] CREATE VIEW IF  «Return targets as a JSON object (nutrient_code -> {type,value,unit,basis}) for easy app consumption. Note: If multiple t»

structure from reference/sql-prototype/seed.sql:
    [file-summary] Seed data: nutrients, life stages, age bands, week mapping, and baseline targets. Notes: - Targets are intended as starting defaults (not medical advice). - Many micronutrient recommendations do not c

structure from schemas/llm_food_extraction.schema.json:
    [file-summary] LLM Food Extraction
    [json-key] $schema: "https://json-schema.org/draft/2020-12/schema"
    [json-key] $id: "https://web-maternity.local/schemas/llm_food_extraction.sche..."
    [json-key] title: "LLM Food Extraction"
    [json-key] type: "object"
    [json-key] additionalProperties: false
    [json-key] required: [3 items]
    [json-key] properties: {extraction_confidence, items, totals_nutrients, assumptions, warnings}

structure from tests/nutrimom-basic.spec.js:
    [file-summary] No top-level file docstring detected
    const BASE_URL  «docstring: none»
    [describe] NutriMom Basic Tests  «docstring: none»
    [test] should load the application successfully
    [test] should have both Calculator and Food Tracker tabs
    [test] should switch to Food Tracker and show UI components
    [test] should show profile warning when not configured
    [test] should display meal type selector
    [test] should display manual LLM section

structure from tests/nutrimom.spec.js:
    [file-summary] NutriMom - Pregnancy Nutrition Calculator End-to-End Tests with Playwright
    const BASE_URL  «docstring: none»
    async function fillPregnantProfile(page, week = '24')  «docstring: none»
    [describe] NutriMom Application  «docstring: none»
    [describe] Page Load  «docstring: none»
    [test] should display the NutriMom header
    [test] should display the tagline
    [test] should display all form fields
    [test] should hide results section initially
    [test] should log successful data load in console
    [describe] Form Interactions  «docstring: none»
    [test] should show pregnancy section when female is selected
    [test] should hide pregnancy section when male is selected
    [test] should show pregnancy fields when pregnant status is selected
    [test] should show lactation fields when breastfeeding status is selected
    [test] should display trimester when pregnancy week is entered
    [test] should show trimester 1 for weeks 1-13
    [test] should show trimester 3 for weeks 28+
    [describe] Calculations - Non-Pregnant Female  «docstring: none»
    [test] should calculate and display results for non-pregnant female
    [test] should display correct BMI for 65kg, 165cm
    [test] should display energy calculations
    [test] should not show pregnancy increment for non-pregnant
    [describe] Calculations - Pregnant Female  «docstring: none»
    [test] should calculate and display results for pregnant female T2
    [test] should show pregnancy energy increment for T2
    [test] should show pregnancy energy increment for T3
    [test] should show pregnancy comparison section
    [test] should show critical nutrients section for pregnant
    [test] should display weight gain card when pre-pregnancy weight is provided
    [describe] Nutrient Tabs  «docstring: none»
    [test] should display macros tab by default
    [test] should switch to vitamins tab when clicked
    [test] should switch to minerals tab when clicked
    [test] should switch to fatty acids tab when clicked
    [test] should update nutrient grid when tab is switched
    [describe] Age Bands  «docstring: none»
    [test] should classify 16-year-old as 14-18 age band
    [test] should classify 25-year-old as 19-30 age band
    [test] should classify 40-year-old as 31-50 age band
    [describe] Activity Levels  «docstring: none»
    [test] should show higher TDEE for more active users
    [describe] Error Handling  «docstring: none»
    [test] should not crash with empty form submission
    [test] should handle extreme age values gracefully
    [describe] Responsive Design  «docstring: none»
    [test] should be usable on mobile viewport
    [test] should be usable on tablet viewport
    [describe] Food Tracker Navigation  «docstring: none»
    [test] should have Calculator tab active by default
    [test] should switch to Food Tracker tab when clicked
    [test] should switch back to Calculator from Food Tracker
    [test] should show profile warning banner in tracker without profile
    [test] should hide profile warning banner when profile exists
    [describe] Food Tracker UI Components  «docstring: none»
    [test] should render Food Tracker header
    [test] should render upload section with all elements
    [test] should render photo title input section
    [test] should render meal type selector
    [test] should render manual LLM section
    [test] should render daily summary and meals log sections
    [test] should populate AI prompt textarea
    [test] should update prompt when photo title changes
    [describe] Food Tracker Functionality  «docstring: none»
    [test] should allow meal type selection
    [test] should copy prompt to clipboard
    [test] should validate and parse JSON response
    [test] should show error for invalid JSON response
    [test] should show error for incomplete JSON schema
    [test] should allow adding parsed meal to log
    [describe] Food Tracker Integration  «docstring: none»
    [test] should receive user profile context from calculator
    [test] should use user nutrient targets for comparison when profile exists
    [test] should show Go to Food Tracker CTA from calculator results
    [describe] Food Tracker Data Persistence  «docstring: none»
    [test] should persist food log in localStorage
    [test] should load persisted food log on page refresh
    [describe] Food Tracker Error Scenarios  «docstring: none»
    [test] should handle plugin initialization failure gracefully
    [test] should show empty state when no meals are logged
    [test] should handle malformed localStorage data

structure from tests/calculator/calculations.spec.js:
    [file-summary] Calculator - Nutrition Calculations Tests Tests BMR, TDEE, energy display, pregnancy-specific results, age bands, activity levels
    [describe] Nutrition Calculations  «docstring: none»
    [describe] Non-Pregnant Female  «docstring: none»
    [test] should calculate and display results
    [test] should display correct BMI for 65kg, 165cm
    [test] should display energy calculations
    [test] should not show pregnancy increment for non-pregnant
    [describe] Pregnant Female  «docstring: none»
    [test] should show second trimester label for T2
    [test] should show +340 kcal increment for T2
    [test] should show +452 kcal increment for T3
    [test] should show pregnancy comparison section
    [test] should show critical nutrients (Folate, Iron)
    [test] should display weight gain card when pre-pregnancy weight is provided
    [describe] Age Bands  «docstring: none»
    [test] should classify 16-year-old as 14-18 age band
    [test] should classify 25-year-old as 19-30 age band
    [test] should classify 40-year-old as 31-50 age band
    [describe] Activity Levels  «docstring: none»
    [test] should show higher TDEE for more active users

structure from tests/calculator/nutrient-tabs.spec.js:
    [file-summary] Calculator - Nutrient Tabs Tests Tests nutrient category tab switching and grid content
    [describe] Nutrient Tabs  «docstring: none»
    [test] should display macros tab by default
    [test] should switch to vitamins tab
    [test] should switch to minerals tab
    [test] should switch to fatty acids tab
    [test] should update nutrient grid content when switching tabs

structure from tests/calculator/profile-form.spec.js:
    [file-summary] Calculator - Profile Form Tests Tests form interactions, pregnancy/lactation fields, validation
    [describe] Profile Form  «docstring: none»
    [test] should display all form fields
    [test] should hide results section initially
    [test] should hide pregnancy section by default (no age entered)
    [test] should show pregnancy section for female age 14-50
    [test] should hide pregnancy section for male
    [test] should show pregnancy fields when pregnant status is selected
    [test] should show lactation fields when breastfeeding is selected
    [test] should show trimester 1 for weeks 1-13
    [test] should show trimester 2 for weeks 14-27
    [test] should show trimester 3 for weeks 28+
    [test] should not crash with empty form submission

structure from tests/food-tracker/advanced-nutrients.spec.js:
    [file-summary] No top-level file docstring detected
    [describe] Advanced Nutrient Tracking  «docstring: none»
    [test] should correctly track advanced vitamins and minerals from nested micronutrients
    [test] should not double count micronutrients if present in both totals and items

structure from tests/food-tracker/api-status.spec.js:
    [file-summary] Food Tracker - API Status Tests Tests the no-API warning banner, API status detection, and error handling
    [describe] Food Tracker API Status  «docstring: none»
    [test] should show no-API banner when no API is configured
    [test] should display manual workflow guidance in no-API banner
    [test] should display step-by-step instructions in no-API banner
    [test] should NOT show connected banner when no API is configured
    [test] should still show all Food Tracker components despite no API
    [test] should not have any console errors on initialization
    [test] should log successful initialization

structure from tests/food-tracker/log-import.spec.js:
    [file-summary] No top-level file docstring detected
    const SAMPLE_LOG_PATH  «Food Log Import & Dashboard E2E Tests»
    [describe] Food Log Import & Dashboard  «docstring: none»
    [test] Log tab exists in navigation
    [test] Log view shows empty state initially
    [test] Can navigate between Calculator, Tracker, and Log
    [test] Import sample week log via file input
    [test] Engine loads 7 days of data after import
    [test] Engine has correct metadata after import
    [test] Each day has correct meal count
    [test] Daily totals include macros and micronutrients
    [test] Meals have correct timestamps with datetime
    [test] Completed days are marked as completed
    [test] Log dashboard renders with imported data
    [test] Summary cards show correct values
    [test] Weekly chart renders bar groups
    [test] Micronutrient chart renders bars
    [test] Day table shows all 7 days
    [test] Day table shows today row with different styling
    [test] Insights section renders
    [test] Meal food items have full nutrient data
    [test] Each meal has meal_type and timestamp
    [test] Profile data is correctly loaded from import
    [test] Full import-to-dashboard flow works end-to-end

structure from tests/food-tracker/manual-parse.spec.js:
    [file-summary] No top-level file docstring detected
    const FoodTrackerEngine  «docstring: none»
    [describe] Manual JSON parsing & aggregation  «docstring: none»
    [test] Aggregates micronutrients from parsed food_items correctly

structure from tests/food-tracker/manual-workflow.spec.js:
    [file-summary] Food Tracker - Manual Workflow Tests Tests copy prompt, parse JSON response, meal type selection, and error handling
    [describe] Food Tracker Manual Workflow  «docstring: none»
    [test] should allow meal type selection
    [test] should copy prompt to clipboard
    [test] should validate and parse valid JSON response
    [test] should show error for invalid JSON
    [test] should show error for empty response
    [test] should show error for incomplete schema
    [test] should include user context in prompt after profile is set
    [test] should discard analysis results

structure from tests/food-tracker/meal-log.spec.js:
    [file-summary] Food Tracker - Meal Log & Data Persistence Tests Tests adding/removing meals, daily summary, localStorage persistence
    [describe] Food Tracker Meal Log  «docstring: none»
    [test] should add parsed meal to daily log
    [test] should add multiple meals and update totals
    [test] should remove a meal from the log
    [test] should persist food log in localStorage
    [test] should load persisted food log on page refresh
    [test] should show empty state with no meals logged
    [test] should handle malformed localStorage data gracefully
    [test] should show nutrient comparison when profile targets exist

structure from tests/food-tracker/nutrient-data-validation.spec.js:
    [file-summary] No top-level file docstring detected
    const ENGINE_TRACKED_NUTRIENTS  «docstring: none»
    const SALMON_BOWL_MEAL  «docstring: none»
    const EXPECTED_TOTALS  «docstring: none»
    const PREGNANT_31_50_DRI  «docstring: none»
    const FoodTrackerEngine  «docstring: none»
    [describe] Nutrient Database Validation  «docstring: none»
    [test] nutrient-targets.json has entries for ALL engine-tracked nutrients (pregnant_t2 31_50)
    [test] nutrient-targets.json DRI values match IOM research for pregnant_t2 31_50
    [test] nutrients.json has entries for ALL engine-tracked nutrient codes
    [test] epa_mg targets exist for pregnancy and lactation stages
    [describe] Engine Aggregation - All 37 Nutrients  «docstring: none»
    [test] aggregates all 37 tracked nutrients from a realistic salmon bowl meal
    [test] compareToTargets includes EPA in comparison output
    [test] compareToTargets correctly flags nutrients below target
    [describe] Prompt & UI Nutrient Key Alignment  «docstring: none»
    [test] manual prompt contains all required nutrient keys
    [test] logged meal is captured by engine and totals are correct
    [describe] DRI Cross-Validation Against Research  «docstring: none»
    [test] lactation targets match research-validated values
    [test] adult male 19-30 targets match research-validated values
    [test] child 1-3 targets match research-validated values
    [test] adult female non-pregnant 19-30 targets match research
    [test] all life stages in nutrient-targets.json have epa_mg

structure from tests/food-tracker/ui-components.spec.js:
    [file-summary] Food Tracker - UI Components Tests Tests that the Food Tracker always renders all UI components regardless of API status
    [describe] Food Tracker UI Components  «docstring: none»
    [test] should render Food Tracker header
    [test] should render upload area with instructions
    [test] should render camera and browse buttons
    [test] should render photo title input
    [test] should render meal type selector with all options
    [test] should render manual LLM section with prompt and response areas
    [test] should render daily summary section
    [test] should render meals log section
    [test] should populate AI prompt textarea with analysis template
    [test] should update prompt when photo title changes

structure from tests/helpers/test-data.js:
    [file-summary] Shared test data and utility functions for NutriMom Playwright tests
    const NAV  «Shared test data and utility functions for NutriMom Playwright tests»
    const VALID_MEAL_CHICKEN  «docstring: none»
    const VALID_MEAL_PASTA  «docstring: none»
    const VALID_MEAL_AVOCADO  «docstring: none»
    async function waitForAppLoad(page)  «Wait for the app to fully load and initialize»
    async function navigateToTracker(page)  «Navigate to the Food Tracker view and wait for it to be ready»
    async function fillProfile(page, opts = {})  «Fill a standard profile»
    async function fillPregnantProfile(page, week = '24')  «Fill a pregnant female profile and submit»
    async function submitProfile(page)  «Submit the profile form and wait for results»
    async function addMealViaManualWorkflow(page, mealData)  «Add a meal via manual workflow (paste JSON and parse)»

structure from tests/navigation/view-switching.spec.js:
    [file-summary] Navigation & View Switching Tests Tests tab navigation, view visibility, and profile warning banner
    [describe] Navigation & View Switching  «docstring: none»
    [test] should load the application with correct title
    [test] should display Calculator and Food Tracker tabs
    [test] should have Calculator tab active by default
    [test] should switch to Food Tracker view when tab is clicked
    [test] should switch back to Calculator from Food Tracker
    [test] should navigate to Calculator when logo is clicked
    [test] should show profile warning banner in tracker without profile
    [test] should hide profile warning banner when profile exists
    [test] should navigate to tracker via CTA button in results
    [test] should navigate to calculator via warning banner button

structure from tools/nutrient-fetcher/README.md:
    [file-summary] Nutrient Fetcher
    [trust-moderate] [heading-1] # Nutrient Fetcher
    [trust-moderate] [heading-2] ## Purpose
    [trust-moderate] [heading-2] ## Quick Start
    [trust-moderate] [heading-1] # Fetch all automated sources
    [trust-moderate] [heading-1] # Check status
    [trust-moderate] [heading-1] # Compare against project data
    [trust-moderate] [heading-1] # Run tests
    [trust-moderate] [heading-2] ## Commands
    [trust-moderate] [heading-3] ### Flags
    [trust-moderate] [heading-2] ## Architecture
    [trust-moderate] [heading-2] ## Snapshot Storage
    [trust-moderate] [heading-2] ## Registered Sources
    [trust-moderate] [heading-3] ### Adding a New Source
    [trust-moderate] [heading-2] ## USDA FDC Setup
    [trust-moderate] [heading-2] ## Testing
    [trust-moderate] [heading-2] ## Dependencies

structure from tools/nutrient-fetcher/package.json:
    [file-summary] nutrient-fetcher - Fetch, parse, and compare nutrient reference data from authoritative sources (NIH ODS, USDA FDC, etc.)
    [json-key] name: "nutrient-fetcher"
    [json-key] version: "1.0.0"
    [json-key] description: "Fetch, parse, and compare nutrient reference data from autho..."
    [json-key] main: "src/cli.js"
    [json-key] scripts: {fetch, fetch:all, fetch:ncbi, fetch:ncbi:ul, fetch:nih, +8 more}
    [json-key] dependencies: {cheerio}
    [json-key] engines: {node}
    [json-key] author: "Nicolas Ivan Larenas Bustamante"
    [json-key] license: "CC-BY-NC-SA-4.0"
    [json-key] private: true

structure from tools/nutrient-fetcher/src/cli.js:
    [file-summary] No top-level file docstring detected
    function parseArgs(argv)  «docstring: none»
    async function cmdFetch(flags)  «docstring: none»
    async function cmdCompare(flags)  «docstring: none»
    function cmdList()  «docstring: none»
    function cmdStatus()  «docstring: none»
    function resolveSourceIds(flags)  «docstring: none»
    function showHelp()  «docstring: none»
    async function main()  «docstring: none»

structure from tools/nutrient-fetcher/src/comparator.js:
    [file-summary] Nutrient Fetcher — Snapshot Comparator
    function compare(previous, current, opts = {})  «Compare two snapshots of the same source.»
    function compareAgainstProject(snapshot, projectData, opts = {})  «Compare a fetched snapshot against project nutrient-targets.json data.»
    function flattenNutrients(obj, prefix = '')  «Flatten nested nutrients object to dot-path â†’ value pairs. e.g. { pregnant_14_18: { calcium_mg: { RDA: 1300 } } } â†’ »
    function findProjectStage(projectData, ageBandKey)  «Find the matching pregnancy stage data in project nutrient-targets.json. The project uses life stages like "pregnant_t1"»
    function findProjectNutrient(stageData, code)  «Find a nutrient in project stage data by its code. Project data might have nutrients as an array or as an object.»
    function formatReport(diff)  «Format a diff report as human-readable text.»

structure from tools/nutrient-fetcher/src/config.js:
    [file-summary] Nutrient Fetcher — Source Configuration
    const PROJECT_ROOT  «docstring: none»
    const DATA_DIR  «docstring: none»
    const REFERENCE_DIR  «docstring: none»
    const SNAPSHOTS_DIR  «docstring: none»
    const PROJECT_TARGETS_FILE  «docstring: none»
    const SOURCES  «docstring: none»
    const NIH_NUTRIENT_MAP  «docstring: none»
    const USDA_NUTRIENT_MAP  «docstring: none»
    const NCBI_TABLE_COLUMNS  «docstring: none»
    const NCBI_LIFE_STAGE_MAP  «docstring: none»
    const NCBI_AGE_BAND_MAP  «docstring: none»
    const NCBI_AGE_COLLAPSE  «docstring: none»

structure from tools/nutrient-fetcher/src/cross-check-all.js:
    [file-summary] No top-level file docstring detected
    const FLAG_FIX  «docstring: none»
    const FLAG_REPORT  «docstring: none»
    const RDA_SOURCES  «docstring: none»
    const UL_SOURCES  «docstring: none»
    const ALL_SOURCES  «docstring: none»
    function sleep(ms)  «docstring: none»
    function mergeFlat(flatResults)  «Merge multiple flattened NCBI results (from flattenForProject) into one. Later entries overwrite earlier ones for the sa»
    function loadProjectTargets()  «Load project targets and flatten to the same key structure: "lifeStage.ageBand" â†’ { nutrientCode: { value, type } }»
    async function main()  «docstring: none»

structure from tools/nutrient-fetcher/src/fetcher.js:
    [file-summary] Nutrient Fetcher — HTTP fetch with retry, timeout, and rate-limiting.
    const DEFAULT_OPTS  «docstring: none»
    let _lastRequestTime  «docstring: none»
    async function fetchUrl(url, opts = {})  «Fetch a URL with retry, timeout, and simple rate-limiting.»
    async function fetchJson(url, opts = {})  «Fetch JSON from a URL (convenience wrapper).»
    function sleep(ms)  «docstring: none»
    function resetRateLimit()  «Reset rate-limit timer (useful in tests).»

structure from tools/nutrient-fetcher/src/parser-ncbi-dri.js:
    [file-summary] NCBI DRI Table Parser
    const GROUP_HEADERS  «docstring: none»
    function parseCellValue(raw)  «Parse a single cell value from a NCBI DRI table.»
    function normaliseAgeBand(raw)  «Normalise an age-band label to our project code using NCBI_AGE_BAND_MAP. Handles en-dashes (â€“), hyphens (-), minus sig»
    function detectGroupHeader(tr, $)  «Determine if a table row is a life-stage group header.»
    function parse(html, sourceConfig)  «Parse a NCBI DRI HTML table page.»
    function flattenForProject(parsed)  «Convert parsed NCBI data into a flat structure keyed by `${projectLifeStage}.${ageBand}.${nutrientCode}` for easy compar»

structure from tools/nutrient-fetcher/src/parser-nih-ods.js:
    [file-summary] Nutrient Fetcher — NIH ODS Pregnancy Page Parser
    function parse(html)  «Parse the NIH ODS pregnancy page HTML and return structured nutrient data.»
    function findNutrientTables($, tables)  «Locate the two nutrient data tables (RDA/AI first, UL second). We look for tables whose first-column cells contain known»
    function orderByType($, tables)  «Order tables so RDA/AI is index 0 and UL is index 1.»
    function parseNutrientTable($, table, tableType)  «Parse a single nutrient table into { nutrientCode: { ageBand: { type, value } } }»
    function detectAgeBandColumns($, headerCells)  «Detect which columns correspond to pregnancy age bands. Returns array of { colIndex, ageBand }.»
    function parseNutrientName(raw)  «Map a raw nutrient name (e.g. "Calcium (mg)") to a project code.»
    function parseValue(text)  «Parse a cell value like "1,300", "30*", "ND", "N/A".»
    function mergeData(rda, ul)  «Merge RDA/AI data with UL data into a single object.»
    function extractLastUpdated($)  «Try to extract the page's "last updated" date from footer or meta.»
    function sortObjectKeys(obj)  «Recursively sort object keys alphabetically.»

structure from tools/nutrient-fetcher/src/parser-usda-fdc.js:
    [file-summary] Nutrient Fetcher — USDA FoodData Central API Parser
    const BASE_URL  «docstring: none»
    async function fetchFood(fdcId, apiKey)  «Fetch detailed nutrient data for a specific food by FDC ID.»
    async function searchFoods(query, opts = {})  «Search for foods by query string.»
    async function fetchMultiple(foods, apiKey)  «Fetch nutrient data for multiple foods (from config defaults or custom list).»
    function normalizeFood(raw)  «Normalize a raw USDA FDC API food response into our format.»
    function sortObjectKeys(obj)  «docstring: none»

structure from tools/nutrient-fetcher/src/storage.js:
    [file-summary] Nutrient Fetcher — Storage Manager
    function saveSnapshot(sourceId, data)  «Save a snapshot as the "latest" for a given source, backing up any existing latest first.»
    function loadLatest(sourceId)  «Load the latest snapshot for a source, or null if none exists.»
    function listBackups(sourceId)  «List all backups for a source, sorted newest-first.»
    function getStatus(sources)  «Return status for all sources: latest fetch date, backup count, etc.»
    function backupLatest(sourceId, latestPath)  «Backup the current latest.json to a timestamped file.»
    function snapshotDir(sourceId)  «docstring: none»
    function ensureDir(sourceId)  «docstring: none»

structure from tools/nutrient-fetcher/src/update-db-2026-02.js:
    [file-summary] No top-level file docstring detected
    const TARGET_FILE  «docstring: none»
    const CHOLINE_UL  «docstring: none»

structure from tools/nutrient-fetcher/tests/comparator.test.js:
    [file-summary] Tests for comparator.js — Snapshot comparison engine
    function makeSnapshot(nutrients, fetchedAt = '2026-02-11T00:00:00Z')  «docstring: none»
    [describe] comparator: flattenNutrients()  «docstring: none»
    [test] flattens nested object to dot paths
    [test] handles empty object
    [test] handles single-level object
    [describe] comparator: compare()  «docstring: none»
    [test] detects no changes when snapshots are identical
    [test] detects a changed value
    [test] detects an added nutrient
    [test] detects a removed nutrient
    [test] handles multiple changes at once
    [test] includes unchanged when option set
    [describe] comparator: formatReport()  «docstring: none»
    [test] renders no-change report
    [test] renders change report with symbols

structure from tools/nutrient-fetcher/tests/fetcher.test.js:
    [file-summary] Tests for fetcher.js — HTTP fetch with retry/timeout
    [describe] fetcher: fetchUrl()  «docstring: none»
    [test] returns body and status on success
    [test] retries on failure and eventually succeeds
    [test] throws after exhausting retries
    [describe] fetcher: fetchJson()  «docstring: none»
    [test] parses JSON response
    [test] throws on non-ok HTTP response
    [test] throws on invalid JSON

structure from tools/nutrient-fetcher/tests/parser-ncbi-dri.test.js:
    [file-summary] Tests for NCBI DRI Table Parser
    const VITAMINS_HTML  «docstring: none»
    const VITAMINS_SOURCE  «docstring: none»
    const ELEMENTS_HTML  «docstring: none»
    const ELEMENTS_SOURCE  «docstring: none»
    const UL_VITAMINS_HTML  «docstring: none»
    const UL_VIT_SOURCE  «docstring: none»
    [describe] parseCellValue  «docstring: none»
    [test] parses a plain integer
    [test] parses a number with comma separator
    [test] parses an AI value (trailing asterisk)
    [test] parses an AI value with comma
    [test] parses a decimal
    [test] parses a decimal AI
    [test] returns ND for "ND"
    [test] returns ND for "NDf"
    [test] returns ND for "NDh"
    [test] returns ND for "ND c"
    [test] returns ND for empty string
    [test] returns ND for null/undefined
    [test] strips footnote letter suffix from number
    [test] strips footnote letter and asterisk
    [test] handles numbers with footnote h (e.g. B12 for >50)
    [test] handles value "400i" (folate with footnote)
    [describe] normaliseAgeBand  «docstring: none»
    [test] maps "0â€“6 mo" (en-dash)
    [test] maps "0-6 mo" (hyphen)
    [test] maps "14â€“18 y"
    [test] maps "14-18 y" (hyphen)
    [test] maps "> 70 y"
    [test] maps "31â€“50 y"
    [test] maps "51â€“70 y"
    [test] maps "7â€“12 mo"
    [test] handles "14â€“18" without y suffix (macros lactation quirk)
    [test] handles "31âˆ’50 y" with minus sign
    [test] returns null for unrecognised
    [test] returns null for empty/null
    [describe] parse (vitamins fixture)  «docstring: none»
    [test] returns 4 groups
    [test] parses Infants 0_6 vitamin_a as AI 400
    [test] parses Children 1_3 vitamin_a as RDA 300
    [test] parses Children 1_3 vitamin_k as AI 30
    [test] parses Pregnancy 14_18 folate as 600 (with footnote j)
    [test] parses Pregnancy 19_30 vitamin_d as 15
    [test] parses Lactation 14_18 vitamin_a as 1200
    [test] parses Lactation 14_18 choline as AI 550
    [test] meta has correct source info
    [describe] parse (elements fixture)  «docstring: none»
    [test] parses Children 1_3 calcium as RDA 700
    [test] parses Children 1_3 chromium as AI 11
    [test] converts chloride from g to mg (1.5 g â†’ 1500 mg)
    [test] parses Pregnancy 19_30 iron as RDA 27
    [test] parses Pregnancy 19_30 potassium as AI 2900
    [test] converts Pregnancy chloride (2.3 g â†’ 2300 mg)
    [describe] parse (UL vitamins fixture)  «docstring: none»
    [test] parses Pregnancy 19_30 vitamin_a UL as 3000
    [test] parses Pregnancy 19_30 vitamin_d UL as 100
    [test] converts choline UL from g to mg (3.5 â†’ 3500)
    [test] niacin UL is 35
    [describe] flattenForProject  «docstring: none»
    [test] fans Pregnancy out to pregnant_t1, t2, t3
    [test] pregnancy fan-out values are identical
    [test] fans Lactation out to lactating_0_6 and lactating_7_12
    [test] maps Children to child
    [test] maps Infants to infant

structure from tools/nutrient-fetcher/tests/parser-nih-ods.test.js:
    [file-summary] Tests for parser-nih-ods.js — NIH ODS Pregnancy page HTML parser
    const FIXTURE_PATH  «docstring: none»
    [describe] parser-nih-ods: parse()  «docstring: none»
    [test] returns _meta with correct source_id
    [test] extracts page_last_updated date
    [test] includes both pregnancy age bands
    [test] parses RDA values correctly (calcium)
    [test] parses AI values correctly (biotin â€” asterisk marker)
    [test] parses UL values correctly (calcium)
    [test] skips ND values in UL table
    [test] handles comma-separated numbers (potassium 2,600)
    [test] parses iron correctly (RDA + UL)
    [test] parses zinc correctly
    [test] parses vitamin A correctly (different by age band)
    [test] outputs nutrient keys in sorted order
    [test] parses folate RDA and UL
    [test] parses omega-3 ALA as AI
    [test] extracts at least 25 nutrients per age band
    [describe] parser-nih-ods: parseNutrientName()  «docstring: none»
    [test] maps "Calcium (mg)" to calcium_mg
    [test] maps "Folate (mcg DFE)" to folate_dfe_ug
    [test] maps "Vitamin B12 (mcg)" to vitamin_b12_ug
    [test] returns null for unrecognized names
    [test] maps "Omega-3 Fatty Acids (ALA) (g)" correctly
    [describe] parser-nih-ods: parseValue()  «docstring: none»
    [test] parses plain number
    [test] parses number with comma
    [test] detects AI asterisk
    [test] returns null for ND
    [test] returns null for empty string
    [test] parses decimal values
    [describe] parser-nih-ods: sortObjectKeys()  «docstring: none»
    [test] sorts top-level keys
    [test] sorts nested keys recursively

structure from tools/nutrient-fetcher/tests/storage.test.js:
    [file-summary] Tests for storage.js — Snapshot save/load/backup
    function cleanUp()  «docstring: none»
    [describe] storage: saveSnapshot()  «docstring: none»
    [test] creates latest.json for a new source
    [test] backs up existing latest before overwriting
    [describe] storage: loadLatest()  «docstring: none»
    [test] returns null when no snapshot exists
    [test] returns the saved data
    [describe] storage: listBackups()  «docstring: none»
    [test] returns empty array when no backups
    [test] lists backups sorted newest-first
    [describe] storage: getStatus()  «docstring: none»
    [test] reports status for configured sources

structure from tools/nutrient-fetcher/tests/fixtures/nih-ods-sample.html:
    [file-summary] Pregnancy — Health Professional Fact Sheet (Fixture)
    [title] <title>Pregnancy — Health Professional Fact Sheet (Fixture)</title>
    [heading-1] <h1>Pregnancy — Health Professional Fact Sheet</h1>
    [heading-2] <h2>Recommended Intakes</h2>
    [heading-2] <h2>Upper Limits</h2>

structure from tools/scripts/audit-missing-targets.js:  (no extractable definitions)

---

## Parser trust

per parser:
    [trust-high] parsers/css_parser.py - Tree-sitter-first CSS parser with regex fallback for SCSS/SASS-specific constructs. Mode: tree-sitter+regex; capability fallback; confidence 0.90 (benchmark-blend).
    [trust-moderate] parsers/csv_parser.py - CSV/TSV parser that uses delimiter sniffing and header extraction for tabular files. Mode: dialect-sniff; capability primary; confidence 0.84 (static).
    [trust-high] parsers/html_parser.py - Structured HTML parser built on Python's standard html.parser streaming API. Mode: html.parser; capability primary; confidence 0.90 (static).
    [trust-high] parsers/ipynb_parser.py - Jupyter notebook parser that indexes cells, metadata, markdown headings, and Python symbols discovered inside code cells. Mode: json+ast; capability primary; confidence 0.89 (static).
    [trust-moderate] parsers/java_parser.py - Java parser that extracts package declarations, types, methods, and constants using resilient source-pattern scanning. Mode: regex; capability primary; confidence 0.80 (static).
    [trust-high] parsers/js_parser.py - AST-backed JS/TS parser powered by Babel syntax analysis with support for modern class fields, optional chaining, and nested destructuring. Mode: babel-ast; capability primary; confidence 0.88 (static).
    [trust-high] parsers/json_parser.py - JSON decoder-backed parser with stable top-level key and array extraction. Mode: decoder; capability primary; confidence 0.92 (static).
    [trust-moderate] parsers/kotlin_parser.py - Kotlin parser that extracts packages, classes, functions, and constants with lightweight KDoc summary recovery. Mode: regex; capability primary; confidence 0.79 (static).
    [trust-moderate] parsers/md_parser.py - Heading and front-matter parser for Markdown with predictable structural extraction. Mode: regex; capability primary; confidence 0.80 (static).
    [trust-high] parsers/php_parser.py - Tree-sitter-first PHP parser with regex fallback for broad compatibility. Mode: tree-sitter+regex; capability fallback; confidence 0.91 (benchmark-blend).
    [trust-high] parsers/python_parser.py - AST-backed parser with full signature, constant, and docstring extraction. Mode: ast; capability primary; confidence 0.88 (benchmark-blend+floor).
    [trust-high] parsers/sql_parser.py - Statement-pattern parser for SQL DDL with reliable named object capture on conventional syntax. Mode: regex; capability primary; confidence 0.86 (benchmark-blend).
    [trust-high] parsers/yaml_parser.py - Structured YAML parser when PyYAML is installed, with regex fallback kept for portability. Mode: pyyaml; capability primary; confidence 0.88 (static).

project-wide parser coverage:

| parser | mode | trust | avg confidence | files |
| --- | --- | --- | ---: | ---: |
| css_parser | tree-sitter+regex | high | 0.90 | 3 |
| html_parser | html.parser | high | 0.90 | 3 |
| js_parser | babel-ast | high | 0.88 | 40 |
| json_parser | decoder | high | 0.92 | 26 |
| md_parser | regex | moderate | 0.80 | 13 |
| sql_parser | regex | high | 0.86 | 3 |
| yaml_parser | pyyaml | high | 0.88 | 2 |

current posture:
    [diagnostics] 0 parser errors and 3 parser warnings were surfaced explicitly in this scan.
    [capability] 3 warnings were triggered by runtime parser fallback capabilities.
    [completeness] 0 files are currently marked partial by JSON, YAML, or template completeness gates.
    [unsupported] 3 files used unsupported extensions and were excluded from parser coverage metrics.
    [unsupported-detail] extension breakdown:
      - (no-extension): 2 files
      - .webp: 1 files
    [unsupported-samples] representative unsupported paths:
      - .gitignore
      - LICENSE
      - plugins/food-tracker/croqueta-casera-de-bacalao-bardetodos-unidad.webp

market-facing gaps:
    [gap] PHP, SQL, and CSS extraction still depend on heuristic parsers, so low-confidence outputs remain concentrated outside the JS/TS path.
    [gap] The benchmark corpus scaffolding is now present, but published external accuracy results still depend on running and curating those repo baselines.
    [gap] The project now ships HTML and public API surfaces, but adoption still depends on clearer release packaging beyond direct repository use.

roadmap:
    [next] Raise trust on PHP, SQL, and CSS by replacing heuristic scanners with stronger parse backends or narrower confidence policies.
    [next] Run and publish the benchmark corpus across fixed-SHA repositories so precision and recall claims are externally reviewable.
    [next] Add packaging metadata and release automation for the public Python API and plugin examples.
    [next] Expand the HTML viewer from static navigation into richer filtering and graph exploration.

overall assessment:
    [score] 8.0/10 - a stronger analysis platform now that parser trust, confidence-aware behavior, public API, plugin registration, and HTML output are shipped, though several parser families remain heuristic-heavy.

---

## Relations structure

relations from index.html:
    [asset] data:image/svg+xml,<svg xmlns=
    [asset] css/styles.css
    [asset] js/nutrition-engine.js
    [asset] plugins/food-tracker/food-tracker.css
    [asset] plugins/food-tracker/food-log-dashboard.css
    [asset] plugins/food-tracker/llm-config.js
    [asset] plugins/food-tracker/food-tracker-engine.js
    [asset] plugins/food-tracker/food-tracker-ui.js
    [asset] plugins/food-tracker/food-log-dashboard.js
    [asset] plugins/food-tracker/index.js
    [asset] js/app.js

relations from playwright.config.js:
    [require] @playwright/test

relations from plugins/food-tracker/demo.html:
    [asset] food-tracker.css
    [asset] croqueta-casera-de-bacalao-bardetodos-unidad.webp
    [asset] llm-config.js
    [asset] mock-responses.js
    [asset] food-tracker-engine.js
    [asset] food-tracker-ui.js
    [asset] index.js

relations from tests/nutrimom-basic.spec.js:
    [require] @playwright/test

relations from tests/nutrimom.spec.js:
    [require] @playwright/test

relations from tests/calculator/calculations.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data

relations from tests/calculator/nutrient-tabs.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data

relations from tests/calculator/profile-form.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data

relations from tests/food-tracker/advanced-nutrients.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data

relations from tests/food-tracker/api-status.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data

relations from tests/food-tracker/log-import.spec.js:
    [require] @playwright/test
    [require] path

relations from tests/food-tracker/manual-parse.spec.js:
    [require] @playwright/test
    [require] ../../plugins/food-tracker/food-tracker-engine.js

relations from tests/food-tracker/manual-workflow.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data

relations from tests/food-tracker/meal-log.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data

relations from tests/food-tracker/nutrient-data-validation.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data
    [require] fs
    [require] path
    [require] ../../plugins/food-tracker/food-tracker-engine.js

relations from tests/food-tracker/ui-components.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data

relations from tests/navigation/view-switching.spec.js:
    [require] @playwright/test
    [require] ../helpers/test-data

relations from tools/nutrient-fetcher/src/cli.js:
    [require] node:fs
    [require] node:path
    [require] ./config
    [require] ./fetcher
    [require] ./parser-nih-ods
    [require] ./parser-ncbi-dri
    [require] ./parser-usda-fdc
    [require] ./comparator
    [require] ./storage

relations from tools/nutrient-fetcher/src/config.js:
    [require] node:path

relations from tools/nutrient-fetcher/src/cross-check-all.js:
    [require] node:fs
    [require] node:path
    [require] ./config
    [require] ./fetcher
    [require] ./parser-ncbi-dri
    [require] ./storage

relations from tools/nutrient-fetcher/src/parser-ncbi-dri.js:
    [require] cheerio
    [require] ./config

relations from tools/nutrient-fetcher/src/parser-nih-ods.js:
    [require] ./config
    [require] cheerio

relations from tools/nutrient-fetcher/src/parser-usda-fdc.js:
    [require] ./fetcher
    [require] ./config

relations from tools/nutrient-fetcher/src/storage.js:
    [require] node:fs
    [require] node:path
    [require] ./config

relations from tools/nutrient-fetcher/src/update-db-2026-02.js:
    [require] node:fs
    [require] node:path

relations from tools/nutrient-fetcher/tests/comparator.test.js:
    [require] node:test
    [require] node:assert/strict
    [require] ../src/comparator

relations from tools/nutrient-fetcher/tests/fetcher.test.js:
    [require] node:test
    [require] node:assert/strict
    [require] ../src/fetcher

relations from tools/nutrient-fetcher/tests/parser-ncbi-dri.test.js:
    [require] node:test
    [require] node:assert/strict
    [require] ../src/parser-ncbi-dri

relations from tools/nutrient-fetcher/tests/parser-nih-ods.test.js:
    [require] node:test
    [require] node:assert/strict
    [require] node:fs
    [require] node:path
    [require] ../src/parser-nih-ods

relations from tools/nutrient-fetcher/tests/storage.test.js:
    [require] node:test
    [require] node:assert/strict
    [require] node:fs
    [require] node:path
    [require] node:os
    [require] ../src/config
    [require] ../src/storage

relations from tools/scripts/audit-missing-targets.js:
    [require] fs
    [require] path

---

## Flow structure

flow from js/app.js:
    input -> transform -> state -> output
    [input] loadSavedProfile, openCriticalReasonModal
    [transform] buildCriticalReasonHtml, extractTargetValue, normalizeSentence, formatAgeBand
    [state] loadSavedProfile, updatePregnancySectionVisibility
    [output] exportUserData, calculateAndDisplay, displayProfileCard, displayEnergy

flow from js/nutrition-engine.js:
    input -> state
    [input] loadData
    [state] setData

flow from plugins/food-tracker/food-log-dashboard.js:
    transform -> state -> output
    [transform] _renderSummaryCards, _extractTarget
    [state] setUserTargets, setUserProfile
    [output] render, _renderEmptyState, _renderSummaryCards, _renderWeeklyChart

flow from plugins/food-tracker/food-tracker-engine.js:
    input -> transform -> state -> output
    [input] _loadFrequentMeals, getExportPayload, _loadFromStorage
    [transform] buildAnalysisFromFrequentMeal, getAllDaysSummary, _validateResponse, _formatDate
    [state] _saveFrequentMeals, _updateMeta, _saveToStorage
    [output] getExportPayload

flow from plugins/food-tracker/food-tracker-ui.js:
    input -> transform -> state -> output
    [input] _showLoading
    [transform] _validateEnum, _validateProfileBeforeStore, _formatTime, _formatNutrientName
    [state] _validateProfileBeforeStore, _saveCurrentAsFrequentMeal, _updateDailyView, _updateNutrientComparison
    [output] _render, _renderFrequentMeals

flow from plugins/food-tracker/index.js:
    transform -> state
    [transform] getDailySummary
    [state] setUserTargets, setUserProfile

flow from tests/helpers/test-data.js:
    input
    [input] waitForAppLoad

flow from tools/nutrient-fetcher/src/cli.js:
    input -> transform
    [input] cmdFetch
    [transform] parseArgs

flow from tools/nutrient-fetcher/src/comparator.js:
    transform
    [transform] formatReport

flow from tools/nutrient-fetcher/src/cross-check-all.js:
    input
    [input] loadProjectTargets

flow from tools/nutrient-fetcher/src/fetcher.js:
    input -> state
    [input] fetchUrl, fetchJson
    [state] resetRateLimit

flow from tools/nutrient-fetcher/src/parser-ncbi-dri.js:
    transform
    [transform] parseCellValue, parse

flow from tools/nutrient-fetcher/src/parser-nih-ods.js:
    transform -> state
    [transform] parse, parseNutrientTable, parseNutrientName, parseValue
    [state] extractLastUpdated

flow from tools/nutrient-fetcher/src/parser-usda-fdc.js:
    input -> transform
    [input] fetchFood, fetchMultiple
    [transform] normalizeFood

flow from tools/nutrient-fetcher/src/storage.js:
    input -> state
    [input] loadLatest
    [state] saveSnapshot

---

## API endpoints

cli entry points:
    [cli] tools/nutrient-fetcher/src/cli.js — process.argv CLI
    [cli] tools/nutrient-fetcher/src/cross-check-all.js — process.argv CLI

api surface:
    [no-http-routes] no HTTP route handlers detected
    [no-mcp-tools] no MCP tool definitions detected

core surface candidates for API/MCP exposure:
    [candidate] plugins/food-tracker/food-tracker-engine.js: FoodTrackerEngine, constructor, getRecoveryState, getFrequentMeals, addFrequentMeal (+3 more)
    [candidate] js/app.js: switchView, sanitizeString, sanitizeNumber, exportUserData, importUserData (+3 more)
    [candidate] plugins/food-tracker/food-tracker-ui.js: FoodTrackerUI, constructor, setUserTargets, setUserContext, refresh (+3 more)
    [candidate] plugins/food-tracker/food-log-dashboard.js: FoodLogDashboard, constructor, init, setUserTargets, setUserProfile (+3 more)
    [candidate] tools/nutrient-fetcher/src/parser-nih-ods.js: parse, findNutrientTables, orderByType, parseNutrientTable, detectAgeBandColumns (+3 more)
    [candidate] js/nutrition-engine.js: NutritionEngine, constructor, loadData, setData, getAgeBand (+3 more)

automation suggestions:
    [suggest-mcp] wrap core functions with MCP SDK tool decorators for agent integration
    [suggest-http] expose core functions via HTTP server; start with plugins/food-tracker/food-tracker-engine.js
    [suggest-contract] add an OpenAPI/JSON schema to document the API surface

---
*93 files indexed · generated by extract_project_spec.py*