/**
 * Tests for parser-nih-ods.js — NIH ODS Pregnancy page HTML parser
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs   = require('node:fs');
const path = require('node:path');

const parser = require('../src/parser-nih-ods');

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'nih-ods-sample.html');
const html = fs.readFileSync(FIXTURE_PATH, 'utf8');

// ── Full parse ───────────────────────────────────────────────────────────────

describe('parser-nih-ods: parse()', () => {
  const result = parser.parse(html);

  it('returns _meta with correct source_id', () => {
    assert.equal(result._meta.source_id, 'nih-ods-pregnancy');
  });

  it('extracts page_last_updated date', () => {
    assert.equal(result._meta.page_last_updated, 'April 3, 2025');
  });

  it('includes both pregnancy age bands', () => {
    assert.ok(result.nutrients.pregnant_14_18, 'should have pregnant_14_18');
    assert.ok(result.nutrients.pregnant_19_50, 'should have pregnant_19_50');
  });

  it('parses RDA values correctly (calcium)', () => {
    const ca14 = result.nutrients.pregnant_14_18.calcium_mg;
    const ca19 = result.nutrients.pregnant_19_50.calcium_mg;

    assert.equal(ca14.RDA, 1300);
    assert.equal(ca19.RDA, 1000);
  });

  it('parses AI values correctly (biotin — asterisk marker)', () => {
    const biotin14 = result.nutrients.pregnant_14_18.biotin_ug;
    const biotin19 = result.nutrients.pregnant_19_50.biotin_ug;

    assert.equal(biotin14.AI, 30);
    assert.equal(biotin19.AI, 30);
    // Should NOT have RDA key for AI nutrients
    assert.equal(biotin14.RDA, undefined);
  });

  it('parses UL values correctly (calcium)', () => {
    assert.equal(result.nutrients.pregnant_14_18.calcium_mg.UL, 3000);
    assert.equal(result.nutrients.pregnant_19_50.calcium_mg.UL, 2500);
  });

  it('skips ND values in UL table', () => {
    const chromium = result.nutrients.pregnant_14_18.chromium_ug;
    assert.equal(chromium.UL, undefined, 'chromium UL should be undefined (ND)');
  });

  it('handles comma-separated numbers (potassium 2,600)', () => {
    assert.equal(result.nutrients.pregnant_14_18.potassium_mg.AI, 2600);
    assert.equal(result.nutrients.pregnant_19_50.potassium_mg.AI, 2900);
  });

  it('parses iron correctly (RDA + UL)', () => {
    assert.equal(result.nutrients.pregnant_19_50.iron_mg.RDA, 27);
    assert.equal(result.nutrients.pregnant_19_50.iron_mg.UL, 45);
  });

  it('parses zinc correctly', () => {
    assert.equal(result.nutrients.pregnant_14_18.zinc_mg.RDA, 12);
    assert.equal(result.nutrients.pregnant_19_50.zinc_mg.RDA, 11);
    assert.equal(result.nutrients.pregnant_14_18.zinc_mg.UL, 34);
    assert.equal(result.nutrients.pregnant_19_50.zinc_mg.UL, 40);
  });

  it('parses vitamin A correctly (different by age band)', () => {
    assert.equal(result.nutrients.pregnant_14_18.vitamin_a_rae_ug.RDA, 750);
    assert.equal(result.nutrients.pregnant_19_50.vitamin_a_rae_ug.RDA, 770);
  });

  it('outputs nutrient keys in sorted order', () => {
    const keys14 = Object.keys(result.nutrients.pregnant_14_18);
    const sorted = [...keys14].sort();
    assert.deepEqual(keys14, sorted);
  });

  it('parses folate RDA and UL', () => {
    assert.equal(result.nutrients.pregnant_19_50.folate_dfe_ug.RDA, 600);
    assert.equal(result.nutrients.pregnant_19_50.folate_dfe_ug.UL, 1000);
  });

  it('parses omega-3 ALA as AI', () => {
    assert.equal(result.nutrients.pregnant_19_50.ala_omega3_g.AI, 1.4);
  });

  it('extracts at least 25 nutrients per age band', () => {
    const count14 = Object.keys(result.nutrients.pregnant_14_18).length;
    const count19 = Object.keys(result.nutrients.pregnant_19_50).length;
    assert.ok(count14 >= 25, `expected >=25 nutrients for 14-18, got ${count14}`);
    assert.ok(count19 >= 25, `expected >=25 nutrients for 19-50, got ${count19}`);
  });
});

// ── Unit: parseNutrientName ──────────────────────────────────────────────────

describe('parser-nih-ods: parseNutrientName()', () => {
  it('maps "Calcium (mg)" to calcium_mg', () => {
    const r = parser.parseNutrientName('Calcium (mg)');
    assert.equal(r.code, 'calcium_mg');
  });

  it('maps "Folate (mcg DFE)" to folate_dfe_ug', () => {
    const r = parser.parseNutrientName('Folate (mcg DFE)');
    assert.equal(r.code, 'folate_dfe_ug');
  });

  it('maps "Vitamin B12 (mcg)" to vitamin_b12_ug', () => {
    const r = parser.parseNutrientName('Vitamin B12 (mcg)');
    assert.equal(r.code, 'vitamin_b12_ug');
  });

  it('returns null for unrecognized names', () => {
    assert.equal(parser.parseNutrientName('Unknown Substance'), null);
  });

  it('maps "Omega-3 Fatty Acids (ALA) (g)" correctly', () => {
    const r = parser.parseNutrientName('Omega-3 Fatty Acids (ALA) (g)');
    assert.equal(r.code, 'ala_omega3_g');
  });
});

// ── Unit: parseValue ─────────────────────────────────────────────────────────

describe('parser-nih-ods: parseValue()', () => {
  it('parses plain number', () => {
    assert.deepEqual(parser.parseValue('27'), { value: 27, isAI: false });
  });

  it('parses number with comma', () => {
    assert.deepEqual(parser.parseValue('1,300'), { value: 1300, isAI: false });
  });

  it('detects AI asterisk', () => {
    assert.deepEqual(parser.parseValue('30*'), { value: 30, isAI: true });
  });

  it('returns null for ND', () => {
    assert.deepEqual(parser.parseValue('ND'), { value: null, isAI: false });
  });

  it('returns null for empty string', () => {
    assert.deepEqual(parser.parseValue(''), { value: null, isAI: false });
  });

  it('parses decimal values', () => {
    assert.deepEqual(parser.parseValue('1.4*'), { value: 1.4, isAI: true });
  });
});

// ── Unit: sortObjectKeys ─────────────────────────────────────────────────────

describe('parser-nih-ods: sortObjectKeys()', () => {
  it('sorts top-level keys', () => {
    const obj = { z: 1, a: 2, m: 3 };
    assert.deepEqual(Object.keys(parser.sortObjectKeys(obj)), ['a', 'm', 'z']);
  });

  it('sorts nested keys recursively', () => {
    const obj = { b: { d: 1, c: 2 }, a: 3 };
    const sorted = parser.sortObjectKeys(obj);
    assert.deepEqual(Object.keys(sorted), ['a', 'b']);
    assert.deepEqual(Object.keys(sorted.b), ['c', 'd']);
  });
});
