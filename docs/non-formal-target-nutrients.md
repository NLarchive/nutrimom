# Nutrients Without Formal RDA/AI Targets (or MAX-only)

NutriMom tracks several nutrients that either:

1) have **no formal DRI target** (no RDA/AI/MIN), but still have strong clinical/population guidance for “better to get some than none” in specific life stages; or
2) are primarily represented as **MAX-only** (upper limit / recommended ceiling), where *lower is often better*.

This document explains why these nutrients should not be hidden in the UI and proposes a consistent data + UI model.

## Why “target = 0” hides nutrients today

In the Food Tracker comparison, nutrients are currently evaluated using an extracted “effective target” (priority order):

- `target` → `RDA` → `AI` → `MIN` → `AMDR_MIN`

If the extracted target is `0` or missing, the nutrient is treated as “no target” and may be excluded from the comparison output. That makes the UI omit it entirely even if the user consumed meaningful amounts.

## Categories of non-standard targets

### A) MAX-only nutrients (Limit-only)

**Example: Sodium (`sodium_mg`)**

- In `data/nutrient-targets.json`, sodium is typically represented as `MAX` (a ceiling), not a minimum target.
- Hiding sodium is a UX gap: users can easily exceed sodium and benefit from seeing intake vs ceiling.

**Recommendation**
- Always display sodium as **Limit-only**.
- Render it as: `intake / max`, e.g. `1800 mg / max 2300 mg`.
- Do **not** include it in “met / total” nutrient scoring (it’s not a “meet at least X” goal).

### B) Evidence-supported but no formal DRI (Info-only)

**Examples: DHA (`dha_mg`) and EPA (`epa_mg`)**

- These are tracked nutrients in the system and are especially relevant in pregnancy.
- Many life stages in `data/nutrient-targets.json` set DHA/EPA to `AI: 0` to reflect “no formal DRI target”.
- However, our internal research summary (see `docs/nutrient-research-2026.md`) documents why DHA/EPA are still actionable and clinically meaningful, particularly in pregnancy.

**Recommendation**
- Always display DHA/EPA in the UI as **Info-only** when a formal target is not available.
- Render them as: `intake • no target` (and optionally show the guidance note from the targets file).
- Do **not** include them in “met / total” scoring when they are Info-only.

## Implementation model (Tiered)

This is a practical tier system that avoids hiding important nutrients:

- **Tier 1 (Formal targets):** RDA/AI/MIN/AMDR goals → % completion and “left to eat”
- **Tier 2 (Limit-only):** MAX-only ceilings → display as `intake / max` and warn when exceeded
- **Tier 3 (Info-only):** No formal target → display intake + guidance note; exclude from scoring

## JSON schema guidance

No schema rewrite is required. The existing target objects can encode this with:

- **Limit-only:** `{ "MAX": 2300, "unit": "mg" }`
- **Info-only:** `{ "AI": 0, "unit": "mg", "note": "No formal DRI established…" }`

The Food Tracker comparison can treat these as displayable even when they have no effective minimum target.

## UI rules

1) Do not hide nutrients solely because their “effective target” is 0/missing.
2) Exclude `isLimitOnly` and `isInfoOnly` nutrients from:
   - “X/Y met” denominator
   - average % calculations
   - deficit lists
3) Still show them in the appropriate category with an explicit label:
   - Limit-only: `max`
   - Info-only: `no target`

## Future candidates (not yet tracked)

This repository currently tracks a defined nutrient set (see `plugins/food-tracker/food-tracker-engine.js::_emptyTotals()`).

If we expand tracking in the future, the same tiering approach can accommodate additional evidence-based nutrients that are useful but not formal DRIs (e.g., specific phytonutrients). Those should be added only if we also add consistent extraction + validation + UI grouping.
