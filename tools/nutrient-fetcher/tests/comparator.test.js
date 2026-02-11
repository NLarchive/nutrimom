/**
 * Tests for comparator.js — Snapshot comparison engine
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  compare,
  compareAgainstProject,
  formatReport,
  flattenNutrients,
} = require('../src/comparator');

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSnapshot(nutrients, fetchedAt = '2026-02-11T00:00:00Z') {
  return {
    _meta: { source_id: 'test', fetched_at: fetchedAt },
    nutrients,
  };
}

// ── flattenNutrients ─────────────────────────────────────────────────────────

describe('comparator: flattenNutrients()', () => {
  it('flattens nested object to dot paths', () => {
    const flat = flattenNutrients({
      pregnant_14_18: { calcium_mg: { RDA: 1300, UL: 3000 } },
    });
    assert.equal(flat['pregnant_14_18.calcium_mg.RDA'], 1300);
    assert.equal(flat['pregnant_14_18.calcium_mg.UL'], 3000);
  });

  it('handles empty object', () => {
    assert.deepEqual(flattenNutrients({}), {});
  });

  it('handles single-level object', () => {
    const flat = flattenNutrients({ a: 1, b: 2 });
    assert.equal(flat.a, 1);
    assert.equal(flat.b, 2);
  });
});

// ── compare() ────────────────────────────────────────────────────────────────

describe('comparator: compare()', () => {
  it('detects no changes when snapshots are identical', () => {
    const data = { pregnant_19_50: { calcium_mg: { RDA: 1000, UL: 2500 } } };
    const diff = compare(makeSnapshot(data, '2026-01-01'), makeSnapshot(data, '2026-02-01'));

    assert.equal(diff.has_changes, false);
    assert.equal(diff.summary.unchanged, 2);
    assert.equal(diff.summary.changed, 0);
    assert.equal(diff.summary.added, 0);
    assert.equal(diff.summary.removed, 0);
  });

  it('detects a changed value', () => {
    const prev = { pregnant_19_50: { calcium_mg: { RDA: 1000 } } };
    const curr = { pregnant_19_50: { calcium_mg: { RDA: 1200 } } };
    const diff = compare(makeSnapshot(prev), makeSnapshot(curr));

    assert.equal(diff.has_changes, true);
    assert.equal(diff.summary.changed, 1);
    assert.equal(diff.changes[0].type, 'changed');
    assert.equal(diff.changes[0].old, 1000);
    assert.equal(diff.changes[0].new, 1200);
  });

  it('detects an added nutrient', () => {
    const prev = { pregnant_19_50: {} };
    const curr = { pregnant_19_50: { iron_mg: { RDA: 27 } } };
    const diff = compare(makeSnapshot(prev), makeSnapshot(curr));

    assert.equal(diff.has_changes, true);
    assert.equal(diff.summary.added, 1);
    assert.equal(diff.changes[0].type, 'added');
    assert.equal(diff.changes[0].value, 27);
  });

  it('detects a removed nutrient', () => {
    const prev = { pregnant_19_50: { iron_mg: { RDA: 27 } } };
    const curr = { pregnant_19_50: {} };
    const diff = compare(makeSnapshot(prev), makeSnapshot(curr));

    assert.equal(diff.has_changes, true);
    assert.equal(diff.summary.removed, 1);
    assert.equal(diff.changes[0].type, 'removed');
  });

  it('handles multiple changes at once', () => {
    const prev = {
      pregnant_19_50: {
        calcium_mg: { RDA: 1000 },
        iron_mg:    { RDA: 27 },
        zinc_mg:    { RDA: 11 },
      },
    };
    const curr = {
      pregnant_19_50: {
        calcium_mg: { RDA: 1200 },  // changed
        // iron_mg removed
        zinc_mg:    { RDA: 11 },    // unchanged
        folate_dfe_ug: { RDA: 600 }, // added
      },
    };
    const diff = compare(makeSnapshot(prev), makeSnapshot(curr));

    assert.equal(diff.summary.changed, 1);
    assert.equal(diff.summary.removed, 1);
    assert.equal(diff.summary.added, 1);
    assert.equal(diff.summary.unchanged, 1);
  });

  it('includes unchanged when option set', () => {
    const data = { pregnant_19_50: { calcium_mg: { RDA: 1000 } } };
    const diff = compare(
      makeSnapshot(data),
      makeSnapshot(data),
      { includeUnchanged: true }
    );
    assert.equal(diff.changes.length, 1);
    assert.equal(diff.changes[0].type, 'unchanged');
  });
});

// ── formatReport() ───────────────────────────────────────────────────────────

describe('comparator: formatReport()', () => {
  it('renders no-change report', () => {
    const diff = compare(
      makeSnapshot({ a: { b: { c: 1 } } }),
      makeSnapshot({ a: { b: { c: 1 } } })
    );
    const text = formatReport(diff);
    assert.ok(text.includes('No changes detected'));
  });

  it('renders change report with symbols', () => {
    const diff = compare(
      makeSnapshot({ a: { b: { c: 1 } } }),
      makeSnapshot({ a: { b: { c: 2 } } })
    );
    const text = formatReport(diff);
    assert.ok(text.includes('~'));  // changed marker
    assert.ok(text.includes('1'));
    assert.ok(text.includes('2'));
  });
});
