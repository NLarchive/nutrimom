/**
 * Tests for NCBI DRI Table Parser
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  parseCellValue,
  normaliseAgeBand,
  parse,
  flattenForProject,
} = require('../src/parser-ncbi-dri');

// ── parseCellValue ───────────────────────────────────────────────────────────

describe('parseCellValue', () => {
  it('parses a plain integer', () => {
    const r = parseCellValue('700');
    assert.equal(r.value, 700);
    assert.equal(r.isAI, false);
    assert.equal(r.isND, false);
  });

  it('parses a number with comma separator', () => {
    const r = parseCellValue('2,500');
    assert.equal(r.value, 2500);
    assert.equal(r.isND, false);
  });

  it('parses an AI value (trailing asterisk)', () => {
    const r = parseCellValue('11*');
    assert.equal(r.value, 11);
    assert.equal(r.isAI, true);
    assert.equal(r.isND, false);
  });

  it('parses an AI value with comma', () => {
    const r = parseCellValue('2,000*');
    assert.equal(r.value, 2000);
    assert.equal(r.isAI, true);
  });

  it('parses a decimal', () => {
    const r = parseCellValue('0.7');
    assert.equal(r.value, 0.7);
    assert.equal(r.isAI, false);
  });

  it('parses a decimal AI', () => {
    const r = parseCellValue('1.5*');
    assert.equal(r.value, 1.5);
    assert.equal(r.isAI, true);
  });

  it('returns ND for "ND"', () => {
    const r = parseCellValue('ND');
    assert.equal(r.value, null);
    assert.equal(r.isND, true);
  });

  it('returns ND for "NDf"', () => {
    const r = parseCellValue('NDf');
    assert.equal(r.value, null);
    assert.equal(r.isND, true);
  });

  it('returns ND for "NDh"', () => {
    const r = parseCellValue('NDh');
    assert.equal(r.value, null);
    assert.equal(r.isND, true);
  });

  it('returns ND for "ND c"', () => {
    const r = parseCellValue('ND c');
    assert.equal(r.value, null);
    assert.equal(r.isND, true);
  });

  it('returns ND for empty string', () => {
    const r = parseCellValue('');
    assert.equal(r.value, null);
    assert.equal(r.isND, true);
  });

  it('returns ND for null/undefined', () => {
    assert.equal(parseCellValue(null).isND, true);
    assert.equal(parseCellValue(undefined).isND, true);
  });

  it('strips footnote letter suffix from number', () => {
    const r = parseCellValue('600j');
    assert.equal(r.value, 600);
    assert.equal(r.isAI, false);
  });

  it('strips footnote letter and asterisk', () => {
    const r = parseCellValue('200*a');
    assert.equal(r.value, 200);
    assert.equal(r.isAI, true);
  });

  it('handles numbers with footnote h (e.g. B12 for >50)', () => {
    const r = parseCellValue('2.4h');
    assert.equal(r.value, 2.4);
    assert.equal(r.isAI, false);
  });

  it('handles value "400i" (folate with footnote)', () => {
    const r = parseCellValue('400i');
    assert.equal(r.value, 400);
    assert.equal(r.isAI, false);
  });
});

// ── normaliseAgeBand ─────────────────────────────────────────────────────────

describe('normaliseAgeBand', () => {
  it('maps "0–6 mo" (en-dash)', () => {
    assert.equal(normaliseAgeBand('0\u20136 mo'), '0_6');
  });

  it('maps "0-6 mo" (hyphen)', () => {
    assert.equal(normaliseAgeBand('0-6 mo'), '0_6');
  });

  it('maps "14–18 y"', () => {
    assert.equal(normaliseAgeBand('14\u201318 y'), '14_18');
  });

  it('maps "14-18 y" (hyphen)', () => {
    assert.equal(normaliseAgeBand('14-18 y'), '14_18');
  });

  it('maps "> 70 y"', () => {
    assert.equal(normaliseAgeBand('> 70 y'), '71_plus');
  });

  it('maps "31–50 y"', () => {
    assert.equal(normaliseAgeBand('31\u201350 y'), '31_50');
  });

  it('maps "51–70 y"', () => {
    assert.equal(normaliseAgeBand('51\u201370 y'), '51_70');
  });

  it('maps "7–12 mo"', () => {
    assert.equal(normaliseAgeBand('7\u201312 mo'), '7_12');
  });

  it('handles "14–18" without y suffix (macros lactation quirk)', () => {
    assert.equal(normaliseAgeBand('14\u201318'), '14_18');
  });

  it('handles "31−50 y" with minus sign', () => {
    assert.equal(normaliseAgeBand('31\u221250 y'), '31_50');
  });

  it('returns null for unrecognised', () => {
    assert.equal(normaliseAgeBand('some other text'), null);
  });

  it('returns null for empty/null', () => {
    assert.equal(normaliseAgeBand(''), null);
    assert.equal(normaliseAgeBand(null), null);
  });
});

// ── parse (full HTML table) ─────────────────────────────────────────────────

// Minimal fixture HTML mimicking NCBI DRI vitamins table structure
const VITAMINS_HTML = `
<html><body>
<table>
<thead>
<tr>
  <th>Life Stage Group</th>
  <th>Vit A (μg/d)</th><th>Vit C (mg/d)</th><th>Vit D (μg/d)</th>
  <th>Vit E (mg/d)</th><th>Vit K (μg/d)</th><th>Thiamin (mg/d)</th>
  <th>Riboflavin (mg/d)</th><th>Niacin (mg/d)</th><th>Vit B6 (mg/d)</th>
  <th>Folate (μg/d)</th><th>Vit B12 (μg/d)</th>
  <th>Pantothenic Acid (mg/d)</th><th>Biotin (μg/d)</th><th>Choline (mg/d)</th>
</tr>
</thead>
<tbody>
<tr><td colspan="15">Infants</td></tr>
<tr>
  <td>0\u20136 mo</td>
  <td>400*</td><td>40*</td><td>10*</td><td>4*</td><td>2.0*</td>
  <td>0.2*</td><td>0.3*</td><td>2*</td><td>0.1*</td><td>65*</td>
  <td>0.4*</td><td>1.7*</td><td>5*</td><td>125*</td>
</tr>
<tr><td colspan="15">Children</td></tr>
<tr>
  <td>1\u20133 y</td>
  <td>300</td><td>15</td><td>15</td><td>6</td><td>30*</td>
  <td>0.5</td><td>0.5</td><td>6</td><td>0.5</td><td>150</td>
  <td>0.9</td><td>2*</td><td>8*</td><td>200*</td>
</tr>
<tr><td colspan="15">Pregnancy</td></tr>
<tr>
  <td>14\u201318 y</td>
  <td>750</td><td>80</td><td>15</td><td>15</td><td>75*</td>
  <td>1.4</td><td>1.4</td><td>18</td><td>1.9</td><td>600j</td>
  <td>2.6</td><td>6*</td><td>30*</td><td>450*</td>
</tr>
<tr>
  <td>19\u201330 y</td>
  <td>770</td><td>85</td><td>15</td><td>15</td><td>90*</td>
  <td>1.4</td><td>1.4</td><td>18</td><td>1.9</td><td>600j</td>
  <td>2.6</td><td>6*</td><td>30*</td><td>450*</td>
</tr>
<tr><td colspan="15">Lactation</td></tr>
<tr>
  <td>14\u201318 y</td>
  <td>1,200</td><td>115</td><td>15</td><td>19</td><td>75*</td>
  <td>1.4</td><td>1.6</td><td>17</td><td>2.0</td><td>500</td>
  <td>2.8</td><td>7*</td><td>35*</td><td>550*</td>
</tr>
</tbody>
</table>
</body></html>
`;

const VITAMINS_SOURCE = {
  id: 'ncbi-dri-vitamins',
  name: 'Test Vitamins',
  url: 'https://example.com',
  tableKind: 'rda',
};

describe('parse (vitamins fixture)', () => {
  const result = parse(VITAMINS_HTML, VITAMINS_SOURCE);

  it('returns 4 groups', () => {
    assert.deepEqual(
      Object.keys(result.groups).sort(),
      ['Children', 'Infants', 'Lactation', 'Pregnancy']
    );
  });

  it('parses Infants 0_6 vitamin_a as AI 400', () => {
    const v = result.groups.Infants['0_6'].vitamin_a_rae_ug;
    assert.equal(v.value, 400);
    assert.equal(v.type, 'AI');
  });

  it('parses Children 1_3 vitamin_a as RDA 300', () => {
    const v = result.groups.Children['1_3'].vitamin_a_rae_ug;
    assert.equal(v.value, 300);
    assert.equal(v.type, 'RDA');
  });

  it('parses Children 1_3 vitamin_k as AI 30', () => {
    const v = result.groups.Children['1_3'].vitamin_k_ug;
    assert.equal(v.value, 30);
    assert.equal(v.type, 'AI');
  });

  it('parses Pregnancy 14_18 folate as 600 (with footnote j)', () => {
    const v = result.groups.Pregnancy['14_18'].folate_dfe_ug;
    assert.equal(v.value, 600);
    assert.equal(v.type, 'RDA');
  });

  it('parses Pregnancy 19_30 vitamin_d as 15', () => {
    const v = result.groups.Pregnancy['19_30'].vitamin_d_ug;
    assert.equal(v.value, 15);
    assert.equal(v.type, 'RDA');
  });

  it('parses Lactation 14_18 vitamin_a as 1200', () => {
    const v = result.groups.Lactation['14_18'].vitamin_a_rae_ug;
    assert.equal(v.value, 1200);
    assert.equal(v.type, 'RDA');
  });

  it('parses Lactation 14_18 choline as AI 550', () => {
    const v = result.groups.Lactation['14_18'].choline_mg;
    assert.equal(v.value, 550);
    assert.equal(v.type, 'AI');
  });

  it('meta has correct source info', () => {
    assert.equal(result._meta.source, 'ncbi-dri-vitamins');
    assert.equal(result._meta.tableKind, 'rda');
    assert.equal(result._meta.nutrientCount, 14);
  });
});

// ── Elements table fixture ──────────────────────────────────────────────────

const ELEMENTS_HTML = `
<html><body>
<table>
<thead><tr>
  <th></th><th>Ca</th><th>Cr</th><th>Cu</th><th>F</th><th>I</th>
  <th>Fe</th><th>Mg</th><th>Mn</th><th>Mo</th><th>P</th>
  <th>Se</th><th>Zn</th><th>K</th><th>Na</th><th>Cl</th>
</tr></thead>
<tbody>
<tr><th colspan="16">Children</th></tr>
<tr>
  <td>1\u20133 y</td>
  <td>700</td><td>11*</td><td>340</td><td>0.7*</td><td>90</td>
  <td>7</td><td>80</td><td>1.2*</td><td>17</td><td>460</td>
  <td>20</td><td>3</td><td>2,000*</td><td>800*</td><td>1.5*</td>
</tr>
<tr><th colspan="16">Pregnancy</th></tr>
<tr>
  <td>19\u201330 y</td>
  <td>1,000</td><td>30*</td><td>1,000</td><td>3*</td><td>220</td>
  <td>27</td><td>350</td><td>2.0*</td><td>50</td><td>700</td>
  <td>60</td><td>11</td><td>2,900*</td><td>1,500*</td><td>2.3*</td>
</tr>
</tbody></table>
</body></html>
`;

const ELEMENTS_SOURCE = {
  id: 'ncbi-dri-elements',
  name: 'Test Elements',
  url: 'https://example.com',
  tableKind: 'rda',
};

describe('parse (elements fixture)', () => {
  const result = parse(ELEMENTS_HTML, ELEMENTS_SOURCE);

  it('parses Children 1_3 calcium as RDA 700', () => {
    const v = result.groups.Children['1_3'].calcium_mg;
    assert.equal(v.value, 700);
    assert.equal(v.type, 'RDA');
  });

  it('parses Children 1_3 chromium as AI 11', () => {
    const v = result.groups.Children['1_3'].chromium_ug;
    assert.equal(v.value, 11);
    assert.equal(v.type, 'AI');
  });

  it('converts chloride from g to mg (1.5 g → 1500 mg)', () => {
    const v = result.groups.Children['1_3'].chloride_mg;
    assert.equal(v.value, 1500);
    assert.equal(v.type, 'AI');
  });

  it('parses Pregnancy 19_30 iron as RDA 27', () => {
    const v = result.groups.Pregnancy['19_30'].iron_mg;
    assert.equal(v.value, 27);
    assert.equal(v.type, 'RDA');
  });

  it('parses Pregnancy 19_30 potassium as AI 2900', () => {
    const v = result.groups.Pregnancy['19_30'].potassium_mg;
    assert.equal(v.value, 2900);
    assert.equal(v.type, 'AI');
  });

  it('converts Pregnancy chloride (2.3 g → 2300 mg)', () => {
    const v = result.groups.Pregnancy['19_30'].chloride_mg;
    assert.equal(v.value, 2300);
    assert.equal(v.type, 'AI');
  });
});

// ── UL Vitamins fixture ─────────────────────────────────────────────────────

const UL_VITAMINS_HTML = `
<html><body>
<table>
<thead><tr>
  <th></th>
  <th>Vit A</th><th>Vit C</th><th>Vit D</th><th>Vit E</th>
  <th>Vit K</th><th>Thiamin</th><th>Riboflavin</th>
  <th>Niacin</th><th>Vit B6</th><th>Folate</th>
  <th>Vit B12</th><th>Pantothenic Acid</th><th>Biotin</th>
  <th>Choline</th><th>Carotenoids</th>
</tr></thead>
<tbody>
<tr><td colspan="16">Pregnancy</td></tr>
<tr>
  <td>19\u201330 y</td>
  <td>3,000</td><td>2,000</td><td>100</td><td>1,000</td>
  <td>ND</td><td>ND</td><td>ND</td>
  <td>35</td><td>100</td><td>1,000</td>
  <td>ND</td><td>ND</td><td>ND</td>
  <td>3.5</td><td>ND</td>
</tr>
</tbody></table>
</body></html>
`;

const UL_VIT_SOURCE = {
  id: 'ncbi-dri-ul-vitamins',
  name: 'Test UL Vitamins',
  url: 'https://example.com',
  tableKind: 'ul',
};

describe('parse (UL vitamins fixture)', () => {
  const result = parse(UL_VITAMINS_HTML, UL_VIT_SOURCE);

  it('parses Pregnancy 19_30 vitamin_a UL as 3000', () => {
    const v = result.groups.Pregnancy['19_30'].vitamin_a_rae_ug;
    assert.equal(v.value, 3000);
    assert.equal(v.type, 'UL');
  });

  it('parses Pregnancy 19_30 vitamin_d UL as 100', () => {
    const v = result.groups.Pregnancy['19_30'].vitamin_d_ug;
    assert.equal(v.value, 100);
    assert.equal(v.type, 'UL');
  });

  it('converts choline UL from g to mg (3.5 → 3500)', () => {
    const v = result.groups.Pregnancy['19_30'].choline_mg;
    assert.equal(v.value, 3500);
    assert.equal(v.type, 'UL');
  });

  it('niacin UL is 35', () => {
    const v = result.groups.Pregnancy['19_30'].niacin_mg_ne;
    assert.equal(v.value, 35);
    assert.equal(v.type, 'UL');
  });
});

// ── flattenForProject ────────────────────────────────────────────────────────

describe('flattenForProject', () => {
  const parsed = parse(VITAMINS_HTML, VITAMINS_SOURCE);
  const flat = flattenForProject(parsed);

  it('fans Pregnancy out to pregnant_t1, t2, t3', () => {
    assert.ok(flat['pregnant_t1.14_18']);
    assert.ok(flat['pregnant_t2.14_18']);
    assert.ok(flat['pregnant_t3.14_18']);
  });

  it('pregnancy fan-out values are identical', () => {
    assert.deepEqual(flat['pregnant_t1.14_18'], flat['pregnant_t2.14_18']);
    assert.deepEqual(flat['pregnant_t2.14_18'], flat['pregnant_t3.14_18']);
  });

  it('fans Lactation out to lactating_0_6 and lactating_7_12', () => {
    assert.ok(flat['lactating_0_6.14_18']);
    assert.ok(flat['lactating_7_12.14_18']);
  });

  it('maps Children to child', () => {
    assert.ok(flat['child.1_3']);
    assert.equal(flat['child.1_3'].vitamin_a_rae_ug.value, 300);
  });

  it('maps Infants to infant', () => {
    assert.ok(flat['infant.0_6']);
    assert.equal(flat['infant.0_6'].vitamin_a_rae_ug.value, 400);
  });
});
