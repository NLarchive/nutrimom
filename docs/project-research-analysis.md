# NutriMom - Project Research & Business Analysis

**Author:** Nicolas Ivan Larenas Bustamante  
**Date:** February 2026  
**Version:** 1.0  
**License:** CC-BY-NC-SA-4.0

---

## Executive Summary

NutriMom is a client-side web application that provides personalized daily nutrition recommendations for pregnant and lactating women based on the Institute of Medicine (IOM) Dietary Reference Intakes (DRI). The application calculates energy needs using the Mifflin-St Jeor equation and provides comprehensive nutrient targets across all life stages of pregnancy.

---

## 1. Problem Statement

### 1.1 The Global Challenge

Maternal nutrition is a critical determinant of pregnancy outcomes. According to WHO data:

- **Maternal mortality:** 287,000 deaths globally per year, many related to nutrition-preventable conditions
- **Preterm births:** 15 million babies born preterm annually; nutrition is a modifiable risk factor
- **Neural tube defects:** 300,000+ cases/year; 70% preventable with adequate folate intake
- **Iron deficiency anemia:** Affects 40% of pregnant women globally
- **Gestational diabetes:** Affects 14% of pregnancies worldwide

### 1.2 The Information Gap

Despite the wealth of nutritional research, pregnant women face challenges:

1. **Fragmented information** scattered across multiple sources
2. **Generic recommendations** not personalized to age, weight, or trimester
3. **Confusing units** (μg vs mg, IU vs μg, DFE vs folic acid)
4. **Lack of comparison** to pre-pregnancy needs
5. **No clear prioritization** of which nutrients matter most

### 1.3 Target Users

| User Segment | Needs |
|--------------|-------|
| Pregnant women | Personalized nutrition targets by trimester |
| Lactating mothers | Adjusted energy and nutrient needs |
| Healthcare providers | Evidence-based reference tool |
| Nutritionists/Dietitians | Client consultation aid |
| Health educators | Teaching resource |

---

## 2. Solution Overview

### 2.1 Core Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **BMR/TDEE Calculator** | Mifflin-St Jeor equation with activity factors | Accurate energy baseline |
| **Pregnancy Increments** | 0/340/452 kcal by trimester (IOM) | Trimester-specific guidance |
| **Nutrient Targets** | 35+ nutrients with RDA/AI/UL values | Comprehensive coverage |
| **Life Stage Comparison** | Shows % increase vs non-pregnant | Highlights what changes |
| **Critical Nutrients** | Prioritized list with importance | Focuses attention |
| **Weight Gain Recommendations** | IOM guidelines by pre-pregnancy BMI | Healthy weight trajectory |

### 2.2 Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT-SIDE APP                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   index.html │  │  styles.css  │  │   app.js     │          │
│  │   (UI Layer) │  │ (Styling)    │  │ (Controller) │          │
│  └──────────────┘  └──────────────┘  └──────┬───────┘          │
│                                              │                  │
│                                    ┌─────────▼─────────┐        │
│                                    │ nutrition-engine  │        │
│                                    │     .js           │        │
│                                    │ (Calculation Core)│        │
│                                    └─────────┬─────────┘        │
│                                              │                  │
│  ┌───────────────────────────────────────────▼───────────────┐  │
│  │                    JSON DATA FILES                        │  │
│  ├───────────────┬───────────────┬───────────────────────────┤  │
│  │ nutrients.json│ targets.json  │ formulas.json             │  │
│  │ age-bands.json│ life-stages   │ pregnancy_weeks.json      │  │
│  └───────────────┴───────────────┴───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Data Sources

| Source | Data Used | Authority |
|--------|-----------|-----------|
| IOM Dietary Reference Intakes | RDA, AI, UL, AMDR values | Gold standard (USA/Canada) |
| IOM Weight Gain Guidelines (2009) | Pregnancy weight gain by BMI | Evidence-based guidelines |
| Mifflin-St Jeor (1990) | BMR equation | Most accurate for modern populations |
| IOM Pregnancy Energy Increments | 0/340/452 kcal by trimester | Based on energy deposition studies |

---

## 3. SWOT Analysis

### 3.1 Strengths

| Strength | Impact |
|----------|--------|
| **100% Client-Side** | No server costs, instant calculations, works offline |
| **Evidence-Based** | IOM DRI are the gold standard for nutrition recommendations |
| **Personalized** | Adjusts for age, weight, height, activity, trimester |
| **Comprehensive** | 35+ nutrients across macros, vitamins, minerals, fatty acids |
| **Transparent** | Open-source data files, calculations viewable |
| **Privacy-First** | No data sent to servers, all local |
| **Accessible** | Works on any device with a browser |
| **Free** | No subscription or payment required |
| **Fast** | Instant calculations, no network latency |
| **Educational** | Shows why nutrients matter for pregnancy |

### 3.2 Weaknesses

| Weakness | Mitigation Strategy |
|----------|---------------------|
| **No food tracking** | Future: Add food image analysis with LLM |
| **No meal planning** | Future: Partner with meal planning services |
| **English only** | Future: i18n support for Spanish, Portuguese, etc. |
| **US/Canada DRI only** | Future: Add WHO, EU, regional guidelines |
| **No medical conditions** | Disclaimer: Consult healthcare provider |
| **Static recommendations** | Future: Dynamic adjustment based on progress |
| **No persistent storage** | Future: LocalStorage for session persistence |
| **Limited validation** | Manual review by healthcare professionals needed |

### 3.3 Opportunities

| Opportunity | Potential Value |
|-------------|-----------------|
| **Healthcare partnerships** | Clinics could embed/white-label |
| **Prenatal vitamin brands** | Sponsorship/affiliate opportunities |
| **Insurance wellness programs** | B2B licensing |
| **AI food analysis** | Patent potential, competitive advantage |
| **Regional expansion** | Localized DRI for Europe, Asia, LATAM |
| **Mobile app** | PWA or native app for app stores |
| **Integration APIs** | Connect with fitness/health trackers |
| **Telehealth integration** | Embed in virtual prenatal visits |

### 3.4 Threats

| Threat | Risk Level | Mitigation |
|--------|------------|------------|
| **Medical liability** | High | Strong disclaimers, no diagnosis claims |
| **Competitor apps** | Medium | Focus on transparency and evidence basis |
| **DRI updates** | Low | Modular data files, easy to update |
| **Browser compatibility** | Low | Modern ES6, tested on major browsers |
| **Misinformation concerns** | Medium | Cite sources, peer review |

---

## 4. Competitive Analysis

### 4.1 Market Landscape

| Competitor | Type | Strengths | Weaknesses vs NutriMom |
|------------|------|-----------|------------------------|
| **BabyCenter** | Content site | Brand recognition, community | Generic advice, not personalized |
| **Ovia Pregnancy** | Mobile app | Food logging, reminders | Freemium model, data collection |
| **MyFitnessPal** | General nutrition | Large food database | Not pregnancy-specific |
| **Pregnancy+** | Mobile app | 3D visualizations | Subscription required |
| **Nutrition calculators** | Web tools | Simple to use | Often not pregnancy-specific |

### 4.2 Differentiation

NutriMom differentiates by:

1. **Transparency:** Open-source calculations and data
2. **Privacy:** No account required, no data collection
3. **Authority:** Direct IOM DRI implementation
4. **Comprehensiveness:** 35+ nutrients vs typical 10-15
5. **Comparison feature:** Shows % change vs baseline
6. **Free forever:** No freemium upsell

---

## 5. Technical Specifications

### 5.1 Calculation Methods

#### BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation

```
Female: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age_years) - 161
Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age_years) + 5
```

#### TDEE (Total Daily Energy Expenditure)

```
TDEE = BMR × Activity Factor

Activity Factors:
- Sedentary:        1.2
- Lightly Active:   1.375
- Moderately Active: 1.55
- Very Active:      1.725
- Extra Active:     1.9
```

#### Pregnancy Energy Increments (IOM)

| Trimester | Weeks | Increment |
|-----------|-------|-----------|
| First     | 1-13  | 0 kcal/day |
| Second    | 14-27 | +340 kcal/day |
| Third     | 28-42 | +452 kcal/day |

#### BMI Categories

| Category | BMI Range |
|----------|-----------|
| Underweight | < 18.5 |
| Normal | 18.5 - 24.9 |
| Overweight | 25.0 - 29.9 |
| Obese | ≥ 30.0 |

### 5.2 Data Schema

#### Nutrient Target Structure

```json
{
  "life_stage": {
    "age_band": {
      "nutrient_code": {
        "RDA": number,      // Recommended Dietary Allowance
        "AI": number,       // Adequate Intake (when RDA unavailable)
        "UL": number,       // Tolerable Upper Intake Level
        "unit": "string"
      }
    }
  }
}
```

#### Life Stages Supported

- `female_nonpregnant`
- `pregnant_t1` (First trimester)
- `pregnant_t2` (Second trimester)
- `pregnant_t3` (Third trimester)
- `lactating_0_6` (0-6 months postpartum)
- `lactating_7_12` (7-12 months postpartum)
- `male_adult` (reference only)

### 5.3 Browser Compatibility

| Browser | Minimum Version | Status |
|---------|-----------------|--------|
| Chrome | 80+ | ✅ Tested |
| Firefox | 75+ | ✅ Tested |
| Safari | 13+ | ✅ Tested |
| Edge | 80+ | ✅ Tested |
| Mobile Chrome | 80+ | ✅ Tested |
| Mobile Safari | 13+ | ✅ Tested |

---

## 6. Business Model Options

### 6.1 Non-Commercial (Current)

- **Model:** Free, open-source under CC-BY-NC-SA-4.0
- **Revenue:** None
- **Sustainability:** Donation/grant-based
- **Pros:** Maximum accessibility, community trust
- **Cons:** No funding for maintenance/development

### 6.2 Freemium (Potential)

- **Free tier:** Basic calculations (current features)
- **Premium tier:** Meal plans, food tracking, progress charts
- **Revenue:** $4.99/month or $39.99/year
- **Sustainability:** Self-funding
- **Risk:** May reduce accessibility

### 6.3 B2B Licensing (Potential)

- **Target:** Healthcare providers, prenatal clinics, insurance companies
- **Model:** White-label licensing, API access
- **Pricing:** $500-5000/month based on usage
- **Pros:** Sustainable revenue, professional validation
- **Cons:** Requires compliance/certification work

### 6.4 Sponsorship (Potential)

- **Target:** Prenatal vitamin brands, organic food companies
- **Model:** Sponsored content, affiliate links
- **Risk:** Perceived bias, must disclose clearly
- **Mitigation:** Strict editorial independence policy

---

## 7. Future Roadmap

### Phase 1: Foundation (Complete) ✅

- [x] Core calculation engine
- [x] JSON data files with IOM DRI
- [x] Responsive web UI
- [x] BMR/TDEE/pregnancy increment calculations
- [x] Nutrient targets by life stage
- [x] Weight gain recommendations
- [x] Pregnancy comparison feature

### Phase 2: Quality Assurance (In Progress) 🔄

- [x] Playwright E2E tests
- [ ] Unit tests for calculation engine
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Medical/nutrition expert review

### Phase 3: Enhancement (Planned) 📋

- [ ] LocalStorage for session persistence
- [ ] PDF export of nutrition plan
- [ ] Print-friendly version
- [ ] Dark mode
- [ ] Language localization (Spanish, Portuguese)
- [ ] PWA with offline support

### Phase 4: AI Integration (Future) 🔮

- [ ] Food image analysis with LLM
- [ ] Meal suggestions based on nutrient gaps
- [ ] Chatbot for nutrition questions
- [ ] Integration with food databases (USDA, etc.)

### Phase 5: Platform Expansion (Future) 🚀

- [ ] Mobile app (iOS/Android)
- [ ] Healthcare provider dashboard
- [ ] API for third-party integration
- [ ] Multi-region DRI support (WHO, EU)

---

## 8. Key Metrics & Success Criteria

### 8.1 Technical Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | > 90 | TBD |
| Lighthouse Accessibility | > 90 | TBD |
| First Contentful Paint | < 1.5s | TBD |
| Time to Interactive | < 3s | TBD |
| Test Coverage | > 80% | In Progress |
| Bug Rate | < 1/week | Stable |

### 8.2 User Metrics (Future)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly Active Users | 10,000 | Analytics |
| Session Duration | > 3 min | Analytics |
| Calculation Completions | > 70% | Event tracking |
| Return Visitors | > 30% | Analytics |
| User Satisfaction | > 4.0/5.0 | Survey |

### 8.3 Health Impact Metrics (Long-term)

| Metric | Goal | Method |
|--------|------|--------|
| User awareness of key nutrients | Improved | Pre/post survey |
| Folate supplementation rates | Increased | Partner clinic data |
| Appropriate weight gain | Improved | Longitudinal study |

---

## 9. Risk Assessment

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Browser incompatibility | Low | Medium | Polyfills, testing |
| Data accuracy errors | Low | High | Expert review, unit tests |
| Performance issues | Low | Low | Lazy loading, optimization |

### 9.2 Legal/Compliance Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Medical advice liability | Medium | High | Strong disclaimers |
| Data privacy concerns | Low | Medium | No data collection |
| Copyright issues | Low | Low | Use public domain data |

### 9.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Competitor entry | Medium | Medium | Focus on differentiation |
| Funding sustainability | Medium | High | Explore B2B model |
| DRI guideline changes | Low | Medium | Modular data architecture |

---

## 10. Conclusions

### 10.1 Project Viability

NutriMom addresses a real and significant need in maternal healthcare. The combination of:

1. **Evidence-based data** (IOM DRI)
2. **Personalized calculations** (BMR/TDEE/trimester)
3. **Privacy-first architecture** (client-side only)
4. **Comprehensive coverage** (35+ nutrients)
5. **Educational approach** (comparisons, explanations)

...creates a unique value proposition in the maternal nutrition space.

### 10.2 Key Success Factors

1. **Accuracy:** Must be medically sound and verified
2. **Usability:** Must be simple enough for non-technical users
3. **Trust:** Must be transparent about sources and limitations
4. **Accessibility:** Must work on all devices, all backgrounds
5. **Sustainability:** Must have a path to long-term maintenance

### 10.3 Recommendations

1. **Short-term:** Complete testing suite, deploy to production, gather user feedback
2. **Medium-term:** Seek medical professional review, explore B2B partnerships
3. **Long-term:** Consider AI integration for food tracking, expand to other regions

### 10.4 Final Assessment

NutriMom has strong potential as a free, evidence-based tool for maternal nutrition guidance. The client-side architecture ensures privacy and accessibility, while the comprehensive IOM DRI implementation provides scientific credibility. With proper expert validation and continued development, this project can meaningfully improve maternal nutrition awareness and outcomes.

---

## References

1. Institute of Medicine. Dietary Reference Intakes: The Essential Guide to Nutrient Requirements. National Academies Press, 2006.
2. Institute of Medicine. Weight Gain During Pregnancy: Reexamining the Guidelines. National Academies Press, 2009.
3. Mifflin MD, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247.
4. World Health Organization. Guideline: Daily iron and folic acid supplementation in pregnant women. WHO, 2012.
5. Centers for Disease Control and Prevention. Folic Acid Recommendations. CDC, 2021.

---

*Document prepared by Nicolas Ivan Larenas Bustamante*  
*Last updated: February 3, 2026*
