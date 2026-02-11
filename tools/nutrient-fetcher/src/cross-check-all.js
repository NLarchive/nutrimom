#!/usr/bin/env node
/**
 * Cross-Check All Life Stages
 *
 * Fetches all 5 NCBI DRI tables (RDA/AI vitamins, elements, macros + UL vitamins, elements),
 * merges them, and compares every value against data/nutrient-targets.json.
 *
 * Usage:
 *   node src/cross-check-all.js [--fix] [--report-only]
 *
 * Outputs:
 *   - Console report of matches, mismatches, and missing
 *   - If --fix: writes updated nutrient-targets.json
 */

'use strict';

const fs   = require('node:fs');
const path = require('node:path');

const {
  SOURCES,
  PROJECT_TARGETS_FILE,
  NCBI_LIFE_STAGE_MAP,
  NCBI_AGE_COLLAPSE,
} = require('./config');
const { fetchUrl }       = require('./fetcher');
const ncbiDriParser      = require('./parser-ncbi-dri');
const { saveSnapshot }   = require('./storage');

// ── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FLAG_FIX    = args.includes('--fix');
const FLAG_REPORT = args.includes('--report-only');

// ── NCBI source IDs to fetch (ordered: RDA first, then UL) ──────────────────
const RDA_SOURCES = ['ncbi-dri-vitamins', 'ncbi-dri-elements', 'ncbi-dri-macros'];
const UL_SOURCES  = ['ncbi-dri-ul-vitamins', 'ncbi-dri-ul-elements'];
const ALL_SOURCES = [...RDA_SOURCES, ...UL_SOURCES];

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Merge multiple flattened NCBI results (from flattenForProject) into one.
 * Later entries overwrite earlier ones for the same nutrient/life-stage/age-band.
 */
function mergeFlat(flatResults) {
  const merged = {};
  for (const flat of flatResults) {
    for (const [key, nutrients] of Object.entries(flat)) {
      if (!merged[key]) merged[key] = {};
      Object.assign(merged[key], nutrients);
    }
  }
  return merged;
}

/**
 * Load project targets and flatten to the same key structure:
 *   "lifeStage.ageBand" → { nutrientCode: { value, type } }
 */
function loadProjectTargets() {
  const raw = JSON.parse(fs.readFileSync(PROJECT_TARGETS_FILE, 'utf8'));
  const flat = {};

  for (const [stage, ageBands] of Object.entries(raw)) {
    if (stage === '_meta') continue;
    for (const [band, nutrients] of Object.entries(ageBands)) {
      const key = `${stage}.${band}`;
      flat[key] = {};
      for (const [code, def] of Object.entries(nutrients)) {
        // Project format: { RDA: 700 } or { AI: 30 } or { UL: 3000 } or { RDA: 600, UL: 1000 }
        // We flatten each type separately
        for (const [type, value] of Object.entries(def)) {
          if (['RDA', 'AI', 'UL', 'MIN', 'MAX', 'REC', 'AMDR_MIN', 'AMDR_MAX'].includes(type)) {
            if (!flat[key][code]) flat[key][code] = {};
            flat[key][code][type] = value;
          }
        }
      }
    }
  }
  return flat;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  NCBI DRI Cross-Check: All Life Stages vs nutrient-targets  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // 1. Fetch all NCBI DRI tables
  const flatResults = [];
  for (const id of ALL_SOURCES) {
    const src = SOURCES[id];
    console.log(`→ Fetching ${src.name} ...`);
    try {
      const { body } = await fetchUrl(src.url);
      const parsed = ncbiDriParser.parse(body, src);
      const flat = ncbiDriParser.flattenForProject(parsed);

      // Save snapshot
      saveSnapshot(id, parsed);

      const groups = Object.keys(parsed.groups);
      const bands = Object.keys(flat);
      console.log(`  ✓ ${groups.length} groups, ${bands.length} life-stage/age-band combos`);
      flatResults.push(flat);

      await sleep(1200); // rate-limit
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  if (flatResults.length === 0) {
    console.error('\nNo data fetched. Exiting.');
    process.exit(1);
  }

  // 2. Merge all fetched data
  const ncbiData = mergeFlat(flatResults);
  console.log(`\n→ Merged NCBI data: ${Object.keys(ncbiData).length} life-stage/age-band keys\n`);

  // 3. Load project targets
  const projectData = loadProjectTargets();
  console.log(`→ Project data: ${Object.keys(projectData).length} life-stage/age-band keys\n`);

  // 4. Compare
  const report = {
    matches: [],
    mismatches: [],
    ncbiOnly: [],       // in NCBI but not in project
    projectOnly: [],    // in project but not verifiable from NCBI
    ndValues: [],       // NCBI has ND where project has a value
  };

  // For each NCBI key, compare against project (with age-band collapsing)
  for (const [ncbiKey, ncbiNutrients] of Object.entries(ncbiData)) {
    const [stage, ageBand] = ncbiKey.split('.');

    // Determine project key (may need age-band collapse)
    let projectKey = ncbiKey;
    if (!projectData[projectKey] && NCBI_AGE_COLLAPSE[ageBand]) {
      const collapsedBand = NCBI_AGE_COLLAPSE[ageBand];
      projectKey = `${stage}.${collapsedBand}`;
    }

    if (!projectData[projectKey]) {
      // This NCBI life-stage/age-band doesn't exist in our project
      report.ncbiOnly.push({
        key: ncbiKey,
        nutrientCount: Object.keys(ncbiNutrients).length,
      });
      continue;
    }

    const projectNutrients = projectData[projectKey];

    for (const [code, ncbiVal] of Object.entries(ncbiNutrients)) {
      // Skip nutrients not in our project's 37
      if (!projectNutrients[code]) {
        // e.g., linoleic_acid_g, boron_mg, nickel_mg, vanadium_mg
        continue;
      }

      if (ncbiVal.isND || ncbiVal.value === null) {
        // NCBI says ND — check if project has a value
        const projTypes = projectNutrients[code];
        if (projTypes[ncbiVal.type] && projTypes[ncbiVal.type] > 0) {
          report.ndValues.push({
            key: projectKey,
            nutrient: code,
            ncbiType: ncbiVal.type,
            projectValue: projTypes[ncbiVal.type],
          });
        }
        continue;
      }

      // Compare NCBI value against project value of same type (RDA, AI, or UL)
      const projectValue = projectNutrients[code][ncbiVal.type];

      if (projectValue === undefined || projectValue === null) {
        // Project doesn't have this specific type for this nutrient
        // e.g., NCBI has AI but project has RDA, or vice versa
        // Check if there's ANY matching type
        const anyMatch = Object.entries(projectNutrients[code]).find(
          ([, v]) => v === ncbiVal.value
        );
        if (anyMatch) {
          report.matches.push({
            key: projectKey,
            nutrient: code,
            type: `${ncbiVal.type}→${anyMatch[0]}`,
            value: ncbiVal.value,
            note: 'type differs but value matches',
          });
        } else {
          report.mismatches.push({
            key: projectKey,
            nutrient: code,
            ncbiType: ncbiVal.type,
            ncbiValue: ncbiVal.value,
            projectTypes: projectNutrients[code],
            note: 'type not found in project',
          });
        }
        continue;
      }

      // Direct value comparison
      if (Math.abs(projectValue - ncbiVal.value) < 0.01) {
        report.matches.push({
          key: projectKey,
          nutrient: code,
          type: ncbiVal.type,
          value: ncbiVal.value,
        });
      } else {
        report.mismatches.push({
          key: projectKey,
          nutrient: code,
          ncbiType: ncbiVal.type,
          ncbiValue: ncbiVal.value,
          projectValue,
          projectTypes: projectNutrients[code],
        });
      }
    }
  }

  // 5. Print report
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ✓ Matches:          ${report.matches.length}`);
  console.log(`  ✗ Mismatches:       ${report.mismatches.length}`);
  console.log(`  ○ NCBI-only keys:   ${report.ncbiOnly.length}`);
  console.log(`  ◌ ND→value cases:   ${report.ndValues.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (report.mismatches.length > 0) {
    console.log('MISMATCHES:\n');
    for (const m of report.mismatches) {
      console.log(`  ${m.key} → ${m.nutrient}`);
      console.log(`    NCBI: ${m.ncbiType} = ${m.ncbiValue}`);
      if (m.projectValue !== undefined) {
        console.log(`    Project: ${m.ncbiType} = ${m.projectValue}`);
      }
      console.log(`    Project types: ${JSON.stringify(m.projectTypes)}`);
      if (m.note) console.log(`    Note: ${m.note}`);
      console.log('');
    }
  }

  if (report.ncbiOnly.length > 0) {
    console.log('NCBI-ONLY (not in project):\n');
    for (const n of report.ncbiOnly) {
      console.log(`  ${n.key} (${n.nutrientCount} nutrients)`);
    }
    console.log('');
  }

  if (report.ndValues.length > 0 && report.ndValues.length <= 20) {
    console.log('ND→VALUE CASES (NCBI=ND but project has value):\n');
    for (const n of report.ndValues) {
      console.log(`  ${n.key} → ${n.nutrient}: NCBI=${n.ncbiType}:ND, project=${n.projectValue}`);
    }
    console.log('');
  }

  // 6. Save report to file
  const reportPath = path.join(
    path.dirname(PROJECT_TARGETS_FILE),
    'reference',
    'cross-check-all-life-stages.json'
  );
  const reportData = {
    _meta: {
      generatedAt: new Date().toISOString(),
      sourcesFetched: ALL_SOURCES,
      projectFile: PROJECT_TARGETS_FILE,
    },
    summary: {
      matches: report.matches.length,
      mismatches: report.mismatches.length,
      ncbiOnlyKeys: report.ncbiOnly.length,
      ndValueCases: report.ndValues.length,
    },
    mismatches: report.mismatches,
    ncbiOnly: report.ncbiOnly,
    ndValues: report.ndValues,
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`→ Report saved to: ${path.relative(process.cwd(), reportPath)}\n`);

  // 7. If --fix requested and there are mismatches, update the project file
  if (FLAG_FIX && report.mismatches.length > 0) {
    console.log('→ Applying fixes to nutrient-targets.json ...\n');
    const raw = JSON.parse(fs.readFileSync(PROJECT_TARGETS_FILE, 'utf8'));
    let fixCount = 0;

    for (const m of report.mismatches) {
      const [stage, band] = m.key.split('.');
      if (raw[stage] && raw[stage][band] && raw[stage][band][m.nutrient]) {
        const oldVal = raw[stage][band][m.nutrient][m.ncbiType];
        raw[stage][band][m.nutrient][m.ncbiType] = m.ncbiValue;
        console.log(`  Fixed: ${m.key}.${m.nutrient}.${m.ncbiType}: ${oldVal} → ${m.ncbiValue}`);
        fixCount++;
      }
    }

    if (fixCount > 0) {
      // Update last_updated in _meta
      if (raw._meta) raw._meta.last_updated = new Date().toISOString().slice(0, 10);
      fs.writeFileSync(PROJECT_TARGETS_FILE, JSON.stringify(raw, null, 2));
      console.log(`\n  ✓ Applied ${fixCount} fixes to nutrient-targets.json`);
    } else {
      console.log('  No fixes could be applied (life-stage/age-band keys may not match).');
    }
  }

  console.log('Done.');
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
