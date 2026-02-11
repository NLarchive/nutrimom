#!/usr/bin/env node
/**
 * One-time update: Fix phosphorus UL for 51+ and add choline UL across all life stages.
 * Applies NCBI DRI data from February 2026 cross-check.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const TARGET_FILE = path.resolve(__dirname, '..', '..', '..', 'data', 'nutrient-targets.json');
const data = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));

let changes = 0;

// ── 1. Fix phosphorus UL for 51_plus ────────────────────────────────────────
for (const stage of ['male_nonpregnant', 'female_nonpregnant']) {
  const band = '51_plus';
  if (data[stage]?.[band]?.phosphorus_mg) {
    const old = data[stage][band].phosphorus_mg.UL;
    data[stage][band].phosphorus_mg.UL = 3000;
    console.log(`Fixed ${stage}.${band}.phosphorus_mg.UL: ${old} → 3000`);
    changes++;
  }
}

// ── 2. Add choline UL (from NCBI DRI UL Vitamins table) ────────────────────
const CHOLINE_UL = {
  'child':              { '1_3': 1000, '4_8': 1000 },
  'male_nonpregnant':   { '9_13': 2000, '14_18': 3000, '19_30': 3500, '31_50': 3500, '51_plus': 3500 },
  'female_nonpregnant': { '9_13': 2000, '14_18': 3000, '19_30': 3500, '31_50': 3500, '51_plus': 3500 },
  'pregnant_t1':        { '14_18': 3000, '19_30': 3500, '31_50': 3500 },
  'pregnant_t2':        { '14_18': 3000, '19_30': 3500, '31_50': 3500 },
  'pregnant_t3':        { '14_18': 3000, '19_30': 3500, '31_50': 3500 },
  'lactating_0_6':      { '14_18': 3000, '19_30': 3500, '31_50': 3500 },
  'lactating_7_12':     { '14_18': 3000, '19_30': 3500, '31_50': 3500 },
};

for (const [stage, bands] of Object.entries(CHOLINE_UL)) {
  for (const [band, ul] of Object.entries(bands)) {
    if (data[stage]?.[band]?.choline_mg) {
      if (!data[stage][band].choline_mg.UL) {
        data[stage][band].choline_mg.UL = ul;
        console.log(`Added ${stage}.${band}.choline_mg.UL = ${ul}`);
        changes++;
      }
    }
  }
}

// ── 3. Update metadata ──────────────────────────────────────────────────────
if (data._meta) {
  data._meta.last_updated = new Date().toISOString().slice(0, 10);
  data._meta.last_cross_check = 'NCBI DRI tables (2019/2011 editions)';
}

// ── 4. Write ─────────────────────────────────────────────────────────────────
fs.writeFileSync(TARGET_FILE, JSON.stringify(data, null, 2) + '\n');
console.log(`\n✓ Applied ${changes} changes. Updated ${path.basename(TARGET_FILE)}`);
