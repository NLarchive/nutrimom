/**
 * Nutrient Fetcher — Snapshot Comparator
 *
 * Deep-compares two nutrient snapshots and produces a structured diff report
 * that identifies added, removed, changed, and unchanged values.
 */

'use strict';

/**
 * Compare two snapshots of the same source.
 *
 * @param {object} previous  The older snapshot (e.g., last fetched)
 * @param {object} current   The newer snapshot (e.g., just fetched)
 * @param {object} [opts]
 * @param {boolean} [opts.includeUnchanged=false]  Include unchanged entries in report
 * @returns {object}  Structured diff report
 */
function compare(previous, current, opts = {}) {
  const includeUnchanged = opts.includeUnchanged || false;

  const prevData = flattenNutrients(previous.nutrients || {});
  const currData = flattenNutrients(current.nutrients || {});

  const allPaths = new Set([...Object.keys(prevData), ...Object.keys(currData)]);

  const changes = [];
  let added = 0, removed = 0, changed = 0, unchanged = 0;

  for (const path of [...allPaths].sort()) {
    const oldVal = prevData[path];
    const newVal = currData[path];

    if (oldVal === undefined && newVal !== undefined) {
      changes.push({ path, type: 'added', value: newVal });
      added++;
    } else if (oldVal !== undefined && newVal === undefined) {
      changes.push({ path, type: 'removed', value: oldVal });
      removed++;
    } else if (oldVal !== newVal) {
      changes.push({ path, type: 'changed', old: oldVal, new: newVal });
      changed++;
    } else {
      unchanged++;
      if (includeUnchanged) {
        changes.push({ path, type: 'unchanged', value: oldVal });
      }
    }
  }

  return {
    source:         current._meta?.source_id || previous._meta?.source_id || 'unknown',
    compared_at:    new Date().toISOString(),
    previous_fetch: previous._meta?.fetched_at || null,
    current_fetch:  current._meta?.fetched_at || null,
    has_changes:    added + removed + changed > 0,
    summary: { added, removed, changed, unchanged },
    changes: changes.filter(c => includeUnchanged || c.type !== 'unchanged'),
  };
}

/**
 * Compare a fetched snapshot against project nutrient-targets.json data.
 *
 * @param {object} snapshot     Fetched snapshot (e.g., from NIH ODS)
 * @param {object} projectData  Contents of nutrient-targets.json
 * @param {object} [opts]
 * @returns {object}  Structured diff report
 */
function compareAgainstProject(snapshot, projectData, opts = {}) {
  const includeUnchanged = opts.includeUnchanged || false;

  // Map snapshot age-bands to project life-stage keys
  const stageMapping = {
    'pregnant_14_18': findProjectStage(projectData, '14_18'),
    'pregnant_19_50': findProjectStage(projectData, '19_50'),
  };

  const changes = [];
  let added = 0, removed = 0, changed = 0, unchanged = 0;

  const snapshotNutrients = snapshot.nutrients || {};

  for (const [ageBand, nutrients] of Object.entries(snapshotNutrients)) {
    const projectStageData = stageMapping[ageBand];
    if (!projectStageData) {
      changes.push({
        path: ageBand,
        type: 'info',
        message: `No matching project stage found for ${ageBand}`,
      });
      continue;
    }

    for (const [code, values] of Object.entries(nutrients)) {
      const projectNutrient = findProjectNutrient(projectStageData, code);

      for (const [type, value] of Object.entries(values)) {
        const path = `${ageBand}.${code}.${type}`;
        const projectValue = projectNutrient?.[type.toLowerCase()] ??
                             projectNutrient?.[type.toUpperCase()] ??
                             projectNutrient?.[type] ?? undefined;

        if (projectValue === undefined) {
          changes.push({ path, type: 'missing_in_project', value });
          added++;
        } else if (typeof projectValue === 'number' && projectValue !== value) {
          changes.push({ path, type: 'changed', old: projectValue, new: value, note: 'project has different value' });
          changed++;
        } else {
          unchanged++;
          if (includeUnchanged) {
            changes.push({ path, type: 'unchanged', value });
          }
        }
      }
    }
  }

  return {
    source:      snapshot._meta?.source_id || 'unknown',
    compared_at: new Date().toISOString(),
    mode:        'against-project',
    has_changes: added + removed + changed > 0,
    summary:     { missing_in_project: added, different_values: changed, unchanged },
    changes:     changes.filter(c => includeUnchanged || c.type !== 'unchanged'),
  };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Flatten nested nutrients object to dot-path → value pairs.
 * e.g. { pregnant_14_18: { calcium_mg: { RDA: 1300 } } }
 *   → { "pregnant_14_18.calcium_mg.RDA": 1300 }
 */
function flattenNutrients(obj, prefix = '') {
  const result = {};

  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenNutrients(val, path));
    } else {
      result[path] = val;
    }
  }

  return result;
}

/**
 * Find the matching pregnancy stage data in project nutrient-targets.json.
 * The project uses life stages like "pregnant_t1", "pregnant_t2", "pregnant_t3"
 * with age bands like "14_18", "19_50".  For DRI comparisons, all trimesters
 * share the same DRI base, so we use the first match.
 */
function findProjectStage(projectData, ageBandKey) {
  const targets = projectData.targets || projectData;

  for (const [stageKey, stageData] of Object.entries(targets)) {
    if (!stageKey.startsWith('pregnant')) continue;

    if (stageData[ageBandKey]) {
      return stageData[ageBandKey];
    }

    // Also try nested "age_bands" structure
    if (stageData.age_bands?.[ageBandKey]) {
      return stageData.age_bands[ageBandKey];
    }
  }

  return null;
}

/**
 * Find a nutrient in project stage data by its code.
 * Project data might have nutrients as an array or as an object.
 */
function findProjectNutrient(stageData, code) {
  // If it's an object keyed by nutrient code
  if (stageData[code]) return stageData[code];

  // If nutrients are in a "nutrients" sub-object
  if (stageData.nutrients?.[code]) return stageData.nutrients[code];

  // If nutrients are an array of { id: 'calcium_mg', ... }
  if (Array.isArray(stageData.nutrients)) {
    return stageData.nutrients.find(n => n.id === code || n.code === code);
  }

  return null;
}

/**
 * Format a diff report as human-readable text.
 */
function formatReport(diff) {
  const lines = [];
  lines.push(`# Nutrient Data Comparison Report`);
  lines.push(`Source: ${diff.source}`);
  lines.push(`Compared at: ${diff.compared_at}`);
  if (diff.previous_fetch) lines.push(`Previous fetch: ${diff.previous_fetch}`);
  if (diff.current_fetch)  lines.push(`Current fetch: ${diff.current_fetch}`);
  if (diff.mode)           lines.push(`Mode: ${diff.mode}`);
  lines.push('');

  lines.push(`## Summary`);
  for (const [key, val] of Object.entries(diff.summary)) {
    lines.push(`  ${key}: ${val}`);
  }
  lines.push('');

  if (diff.has_changes) {
    lines.push(`## Changes`);
    for (const c of diff.changes) {
      switch (c.type) {
        case 'added':
        case 'missing_in_project':
          lines.push(`  + ${c.path}: ${c.value}`);
          break;
        case 'removed':
          lines.push(`  - ${c.path}: ${c.value}`);
          break;
        case 'changed':
          lines.push(`  ~ ${c.path}: ${c.old} → ${c.new}${c.note ? ` (${c.note})` : ''}`);
          break;
        case 'info':
          lines.push(`  i ${c.path}: ${c.message}`);
          break;
      }
    }
  } else {
    lines.push(`No changes detected — source data matches.`);
  }

  return lines.join('\n');
}

module.exports = {
  compare,
  compareAgainstProject,
  formatReport,
  // Exported for testing
  flattenNutrients,
  findProjectStage,
};
