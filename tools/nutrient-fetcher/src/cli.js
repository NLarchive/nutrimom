#!/usr/bin/env node
/**
 * Nutrient Fetcher — CLI
 *
 * Usage:
 *   node src/cli.js fetch   [--source=ID] [--all]
 *   node src/cli.js compare [--source=ID] [--all] [--against-project]
 *   node src/cli.js list
 *   node src/cli.js status
 *
 * Examples:
 *   node src/cli.js fetch --source=nih-ods-pregnancy
 *   node src/cli.js fetch --all
 *   node src/cli.js compare --source=nih-ods-pregnancy --against-project
 *   node src/cli.js status
 */

'use strict';

const fs   = require('node:fs');
const path = require('node:path');

const { SOURCES, PROJECT_TARGETS_FILE } = require('./config');
const { fetchUrl }                       = require('./fetcher');
const nihOdsParser                       = require('./parser-nih-ods');
const ncbiDriParser                      = require('./parser-ncbi-dri');
const usdaFdcParser                      = require('./parser-usda-fdc');
const { compare, compareAgainstProject, formatReport } = require('./comparator');
const { saveSnapshot, loadLatest, getStatus }          = require('./storage');

// ── Argument parsing ─────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];
  const flags = {};

  for (const arg of args.slice(1)) {
    if (arg.startsWith('--')) {
      const [key, val] = arg.slice(2).split('=');
      flags[key] = val ?? true;
    }
  }

  return { command, flags };
}

// ── Commands ─────────────────────────────────────────────────────────────────

async function cmdFetch(flags) {
  const sourceIds = resolveSourceIds(flags);

  for (const id of sourceIds) {
    const src = SOURCES[id];
    if (!src) {
      console.error(`Unknown source: ${id}`);
      continue;
    }
    if (src.automated === false) {
      console.log(`⊘ ${src.name} — manual source, skipping`);
      continue;
    }

    console.log(`→ Fetching ${src.name} ...`);

    try {
      let snapshot;

      if (src.parser === 'nih-ods') {
        const { body } = await fetchUrl(src.url);
        snapshot = nihOdsParser.parse(body);
      } else if (src.parser === 'ncbi-dri') {
        const { body } = await fetchUrl(src.url);
        snapshot = ncbiDriParser.parse(body, src);
      } else if (src.parser === 'usda-fdc') {
        snapshot = await usdaFdcParser.fetchMultiple(src.defaultFoods);
      } else {
        console.log(`  No automated parser for ${id}`);
        continue;
      }

      const { latestPath, backupPath } = saveSnapshot(id, snapshot);
      console.log(`  ✓ Saved → ${path.relative(process.cwd(), latestPath)}`);
      if (backupPath) {
        console.log(`  ↩ Backup → ${path.relative(process.cwd(), backupPath)}`);
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }
}

async function cmdCompare(flags) {
  const sourceIds = resolveSourceIds(flags);
  const againstProject = flags['against-project'];

  for (const id of sourceIds) {
    const src = SOURCES[id];
    if (!src) { console.error(`Unknown source: ${id}`); continue; }

    console.log(`→ Comparing ${src.name} ...`);

    const latest = loadLatest(id);
    if (!latest) {
      console.log(`  No existing snapshot — run "fetch" first.`);
      continue;
    }

    try {
      let diff;

      if (againstProject) {
        if (!fs.existsSync(PROJECT_TARGETS_FILE)) {
          console.error(`  Project targets file not found: ${PROJECT_TARGETS_FILE}`);
          continue;
        }
        const projectData = JSON.parse(fs.readFileSync(PROJECT_TARGETS_FILE, 'utf8'));
        diff = compareAgainstProject(latest, projectData);
      } else {
        // Compare latest against a fresh fetch
        console.log(`  Fetching fresh data for comparison...`);
        let current;
        if (src.parser === 'nih-ods') {
          const { body } = await fetchUrl(src.url);
          current = nihOdsParser.parse(body);
        } else if (src.parser === 'ncbi-dri') {
          const { body } = await fetchUrl(src.url);
          current = ncbiDriParser.parse(body, src);
        } else if (src.parser === 'usda-fdc') {
          current = await usdaFdcParser.fetchMultiple(src.defaultFoods);
        } else {
          console.log(`  No automated parser for ${id}`);
          continue;
        }

        diff = compare(latest, current);

        // If changes detected, save the new snapshot (with backup)
        if (diff.has_changes) {
          const { latestPath, backupPath } = saveSnapshot(id, current);
          console.log(`  ↻ Updated snapshot → ${path.relative(process.cwd(), latestPath)}`);
          if (backupPath) {
            console.log(`  ↩ Backup → ${path.relative(process.cwd(), backupPath)}`);
          }
        }
      }

      console.log('');
      console.log(formatReport(diff));
      console.log('');
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }
}

function cmdList() {
  console.log('\nRegistered sources:\n');
  for (const src of Object.values(SOURCES)) {
    const auto = src.automated !== false ? '✓' : '○';
    console.log(`  ${auto} ${src.id}`);
    console.log(`    ${src.name}`);
    console.log(`    ${src.url}`);
    console.log(`    Type: ${src.type} | Parser: ${src.parser || 'none'} | Schedule: ${src.schedule}`);
    console.log('');
  }
}

function cmdStatus() {
  const statuses = getStatus(SOURCES);

  console.log('\nSource status:\n');
  for (const s of statuses) {
    const icon = s.latestExists ? '●' : '○';
    console.log(`  ${icon} ${s.id}`);
    console.log(`    Name:          ${s.name}`);
    console.log(`    Automated:     ${s.automated ? 'yes' : 'no (manual)'}`);
    console.log(`    Last fetch:    ${s.lastFetch || '—'}`);
    console.log(`    Page updated:  ${s.pageLastUpdate || '—'}`);
    console.log(`    Backups:       ${s.backupCount}`);
    console.log('');
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveSourceIds(flags) {
  if (flags.all) {
    return Object.keys(SOURCES);
  }
  if (flags.source) {
    return [flags.source];
  }
  // Default to all automated sources
  return Object.values(SOURCES)
    .filter(s => s.automated !== false && s.parser)
    .map(s => s.id);
}

function showHelp() {
  console.log(`
Nutrient Fetcher — Fetch, parse, and compare nutrient reference data.

Commands:
  fetch    Fetch nutrient data from sources and save snapshots
  compare  Compare latest snapshot against a fresh fetch or project data
  list     List all registered sources
  status   Show snapshot status for all sources

Flags:
  --source=ID        Target a specific source (e.g., nih-ods-pregnancy)
  --all              Process all sources (including manual ones)
  --against-project  Compare against project's nutrient-targets.json

Examples:
  node src/cli.js fetch --source=nih-ods-pregnancy
  node src/cli.js compare --all --against-project
  node src/cli.js status
`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { command, flags } = parseArgs(process.argv);

  switch (command) {
    case 'fetch':   await cmdFetch(flags);   break;
    case 'compare': await cmdCompare(flags); break;
    case 'list':    cmdList();               break;
    case 'status':  cmdStatus();             break;
    default:        showHelp();
  }
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
