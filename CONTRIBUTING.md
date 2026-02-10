# Contributing to NutriMom

Thank you for your interest in contributing to NutriMom! This document provides guidelines and instructions for contributing to the project.

---

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and constructive in all interactions
- Welcome diverse perspectives and backgrounds
- Focus on the code, not the person
- Report harassment or inappropriate behavior to the maintainers

---

## 🎯 Ways to Contribute

### 1. **Report Bugs**
- Check [existing issues](https://github.com/nicolaslarenas/nutrimom/issues) first
- Provide a clear, descriptive title
- Include steps to reproduce the issue
- Specify your environment (OS, browser, Node version)
- Include screenshots or error logs if applicable

**Bug Report Template:**
```markdown
## Description
[Brief description of the bug]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [...]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., Windows 11, macOS 13]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node: [e.g., 18.16.0]
```

### 2. **Suggest Enhancements**
- Use the **"Feature Request"** issue template
- Explain the use case and expected benefit
- Provide examples or mockups if relevant
- Consider the scope and feasibility

**Feature Request Template:**
```markdown
## Description
[Clear description of the feature]

## Motivation
[Why is this useful? Who benefits?]

## Proposed Solution
[How should it work?]

## Alternatives Considered
[Other approaches you've thought about]

## Examples
[Real-world examples or mockups]
```

### 3. **Improve Documentation**
- Fix typos or unclear explanations
- Add examples or clarifications
- Update outdated information
- Improve code comments

### 4. **Code Contributions**
- New features
- Bug fixes
- Performance improvements
- Test coverage expansion
- Refactoring for clarity

---

## 💻 Development Setup

### Prerequisites
- Node.js 16+ (18+ recommended)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Initial Setup

```bash
# 1. Fork the repository on GitHub
# Visit https://github.com/nicolaslarenas/nutrimom and click "Fork"

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/nutrimom.git
cd nutrimom

# 3. Add upstream remote (for syncing)
git remote add upstream https://github.com/nicolaslarenas/nutrimom.git

# 4. Install dependencies
npm install

# 5. Verify setup
npm test
```

### Running the Application

```bash
# Start development server
npm start

# Server runs at http://localhost:8080
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test tests/calculator
npm test tests/food-tracker

# Run in UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug
```

---

## 📋 Coding Standards

### Style Guide

We follow these standards:

1. **JavaScript/ES6+**
   - Use modern ES6+ syntax
   - Prefer `const` over `let` over `var`
   - Use arrow functions for callbacks
   - Meaningful variable names (not single letters except in loops)
   - Max line length: 100 characters (aim for clarity)

2. **Comments & Documentation**
   - Comment complex logic, not obvious code
   - Use JSDoc for functions:
   ```javascript
   /**
    * Calculates BMR using Mifflin-St Jeor equation
    * @param {number} weightKg - Body weight in kilograms
    * @param {number} heightCm - Height in centimeters
    * @param {number} ageYears - Age in years
    * @param {string} sex - 'male' or 'female'
    * @returns {number} BMR in kcal
    */
   function calculateBMR(weightKg, heightCm, ageYears, sex) {
   ```

3. **HTML/CSS**
   - Use semantic HTML5
   - Follow BEM naming for CSS classes: `.block__element--modifier`
   - Keep stylesheets modular and organized
   - Use CSS variables for theming

4. **JSON Data Files**
   - Use proper indentation (2 spaces)
   - Validate with `npm run validate:data` (if available)
   - Document structure with comments
   - Cite data sources in file headers

### File Organization

```
- New features go in logical folders
- Keep related files together
- Use clear, descriptive names
- Follow existing directory structure
- Test files live alongside source files
```

---

## ✅ Testing Requirements

**All contributions must include tests.**

### Test Coverage Goals
- New features: minimum 80% coverage
- Bug fixes: add regression tests
- Each test should be independent and repeatable

### Writing Tests

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.click('#button');
    
    // Act
    const result = await page.locator('#result').textContent();
    
    // Assert
    expect(result).toBe('expected value');
  });

  test('should handle edge case', async ({ page }) => {
    // Test the edge case
  });
});
```

### Running Tests Before PR

```bash
# Run all tests (must pass)
npm test

# Optional: check coverage
npm run test:coverage
```

---

## 📝 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without behavior change
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `chore`: Build, dependencies, tooling
- `ci`: CI/CD configuration changes

### Scope (optional)
- calculator
- food-tracker
- ui
- data
- tests
- docs

### Examples

```bash
git commit -m "feat(food-tracker): add day completion celebration modal"
git commit -m "fix(calculator): correct BMR calculation for edge cases"
git commit -m "docs(readme): update testing instructions"
git commit -m "test(food-tracker): add aggregation tests for 37 nutrients"
```

---

## 🔄 Pull Request Process

### Before Starting
1. Check [existing pull requests](https://github.com/nicolaslarenas/nutrimom/pulls) - avoid duplicates
2. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Development Workflow

```bash
# 1. Make your changes
# 2. Test thoroughly
npm test

# 3. Commit with conventional messages
git commit -m "feat(scope): description"

# 4. Keep branch updated with upstream
git fetch upstream
git rebase upstream/main

# 5. Push to your fork
git push origin feature/your-feature-name
```

### Submitting PRs

1. **Create PR on GitHub** with:
   - Clear, descriptive title
   - Reference related issues: `Closes #123`
   - Description of changes (what & why)
   - Screenshots/demos if UI changes
   - Checklist of completed items

**PR Template:**
```markdown
## Description
[Brief description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #[issue number]

## Changes Made
- [Change 1]
- [Change 2]
- [Change 3]

## Testing
- [ ] All tests pass (`npm test`)
- [ ] New tests added
- [ ] Manually tested on [browser/device]

## Checklist
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Responsive design verified (if UI change)
```

### Review Process

- Maintainers will review within 5-7 days
- Feedback will be constructive and respectful
- Make requested changes in new commits (don't force-push)
- Re-request review after updates
- Squash commits before merge (optional, maintainer does this)

### Merging

Once approved:
- Maintainer will merge to `main`
- Your feature branch will be deleted
- You'll be credited in release notes

---

## 🔍 Code Review Checklist

When reviewing code, check for:

- [ ] Code follows style guide
- [ ] Tests pass and cover new functionality
- [ ] Documentation is updated
- [ ] No console errors/warnings
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Performance impact considered
- [ ] Security vulnerabilities addressed
- [ ] Breaking changes documented

---

## 📚 Project Structure Quick Reference

```
nutrimom/
├── js/                          # Core application logic
│   ├── nutrition-engine.js      # Calculation engine
│   └── app.js                   # UI controller
├── plugins/food-tracker/        # Food tracker plugin
├── data/                        # JSON data files (nutrient targets, etc.)
├── tests/                       # Playwright tests
│   ├── calculator/
│   ├── food-tracker/
│   ├── navigation/
│   └── helpers/test-data.js
├── docs/                        # Documentation
├── CONTRIBUTING.md              # This file
├── LICENSE                      # CC BY-NC-SA 4.0
└── project-state.json           # Task tracking
```

---

## 🚀 Getting Help

- **General Questions**: Open a [Discussion](https://github.com/nicolaslarenas/nutrimom/discussions)
- **Bug Reports**: Create an [Issue](https://github.com/nicolaslarenas/nutrimom/issues) with the bug template
- **Feature Ideas**: Create an [Issue](https://github.com/nicolaslarenas/nutrimom/issues) with the feature template
- **Security Issues**: Email the maintainer (do NOT create public issue)

---

## 📄 Licensing

By contributing to NutriMom, you agree that your contributions will be licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** license.

This means:
- ✅ Free to use and modify for non-commercial purposes
- ✅ Must give appropriate credit
- ✅ Must share adaptations under the same license
- ❌ Commercial use requires separate license

See [LICENSE](./LICENSE) for full terms.

---

## 🎓 Learning Resources

### Pregnancy Nutrition
- [IOM Dietary Reference Intakes](https://www.nap.edu/catalog/11537)
- [NIH Office of Dietary Supplements](https://ods.od.nih.gov/)
- [DGA 2025-2030](https://www.dietaryguidelines.gov/)

### Development
- [Playwright Documentation](https://playwright.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🙏 Attribution

We recognize and appreciate all contributions! Contributors will be credited in:
- Release notes
- Project README
- GitHub contributors page

---

## ❓ FAQ

**Q: Do I need to sign a CLA?**
A: No, but your contribution must be compatible with CC BY-NC-SA 4.0.

**Q: Can I work on multiple features at once?**
A: Create separate branches for each feature. Submit PRs separately.

**Q: What if my PR gets rejected?**
A: Feedback will be constructive. Feel free to discuss, make changes, or explore alternative approaches.

**Q: How long do reviews take?**
A: Usually 5-7 days. Complex changes may take longer.

**Q: Can I work on features marked "In Progress"?**
A: Check the issue first - it might already be assigned. Comment to express interest.

---

## 📊 Contribution Statistics

Current project metrics:
- **247 tests** - All passing
- **37+ nutrients** tracked
- **40+ completed tasks**
- **6+ life stages** supported

---

---

**Thank you for contributing to NutriMom! Together, we're improving nutrition education during pregnancy.** 🤰💚

---

Last updated: February 10, 2026  
Author: Nicolas Ivan Larenas Bustamante
