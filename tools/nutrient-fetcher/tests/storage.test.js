/**
 * Tests for storage.js — Snapshot save/load/backup
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs   = require('node:fs');
const path = require('node:path');
const os   = require('node:os');

// We need to override SNAPSHOTS_DIR before requiring storage.
// Use a temp directory to avoid polluting real data.
const tmpDir = path.join(os.tmpdir(), `nutrient-fetcher-test-${Date.now()}`);

// Patch config before loading storage
const config = require('../src/config');
const originalSnapshotsDir = config.SNAPSHOTS_DIR;
config.SNAPSHOTS_DIR = tmpDir;

const storage = require('../src/storage');

// ── Setup / Teardown ─────────────────────────────────────────────────────────

function cleanUp() {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

beforeEach(() => {
  cleanUp();
  fs.mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  cleanUp();
  // Restore original
  config.SNAPSHOTS_DIR = originalSnapshotsDir;
});

// Re-set for every test (afterEach restores, but beforeEach re-patches)
beforeEach(() => {
  config.SNAPSHOTS_DIR = tmpDir;
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('storage: saveSnapshot()', () => {
  it('creates latest.json for a new source', () => {
    const data = { _meta: { fetched_at: '2026-02-11T12:00:00Z' }, nutrients: {} };
    const result = storage.saveSnapshot('test-source', data);

    assert.ok(fs.existsSync(result.latestPath));
    assert.equal(result.backupPath, null, 'no backup on first save');

    const saved = JSON.parse(fs.readFileSync(result.latestPath, 'utf8'));
    assert.equal(saved._meta.fetched_at, '2026-02-11T12:00:00Z');
  });

  it('backs up existing latest before overwriting', () => {
    const data1 = { _meta: { fetched_at: '2026-02-10T12:00:00Z' }, nutrients: { a: 1 } };
    const data2 = { _meta: { fetched_at: '2026-02-11T12:00:00Z' }, nutrients: { a: 2 } };

    storage.saveSnapshot('test-source', data1);
    const result = storage.saveSnapshot('test-source', data2);

    assert.ok(result.backupPath, 'should have a backup path');
    assert.ok(fs.existsSync(result.backupPath), 'backup file should exist');

    // Latest should be data2
    const latest = JSON.parse(fs.readFileSync(result.latestPath, 'utf8'));
    assert.equal(latest.nutrients.a, 2);

    // Backup should be data1
    const backup = JSON.parse(fs.readFileSync(result.backupPath, 'utf8'));
    assert.equal(backup.nutrients.a, 1);
  });
});

describe('storage: loadLatest()', () => {
  it('returns null when no snapshot exists', () => {
    assert.equal(storage.loadLatest('nonexistent'), null);
  });

  it('returns the saved data', () => {
    const data = { _meta: { fetched_at: '2026-02-11T12:00:00Z' }, nutrients: { x: 42 } };
    storage.saveSnapshot('test-source', data);

    const loaded = storage.loadLatest('test-source');
    assert.equal(loaded.nutrients.x, 42);
  });
});

describe('storage: listBackups()', () => {
  it('returns empty array when no backups', () => {
    const backups = storage.listBackups('test-source');
    assert.deepEqual(backups, []);
  });

  it('lists backups sorted newest-first', () => {
    const data1 = { _meta: { fetched_at: '2026-02-09T12:00:00Z' }, nutrients: {} };
    const data2 = { _meta: { fetched_at: '2026-02-10T12:00:00Z' }, nutrients: {} };
    const data3 = { _meta: { fetched_at: '2026-02-11T12:00:00Z' }, nutrients: {} };

    storage.saveSnapshot('test-source', data1);
    storage.saveSnapshot('test-source', data2);
    storage.saveSnapshot('test-source', data3);

    const backups = storage.listBackups('test-source');
    assert.equal(backups.length, 2, 'should have 2 backups');
    // Newest first
    assert.ok(backups[0].file > backups[1].file);
  });
});

describe('storage: getStatus()', () => {
  it('reports status for configured sources', () => {
    const sources = {
      'test-a': { id: 'test-a', name: 'Test A', automated: true },
      'test-b': { id: 'test-b', name: 'Test B', automated: false },
    };

    const statuses = storage.getStatus(sources);
    assert.equal(statuses.length, 2);
    assert.equal(statuses[0].id, 'test-a');
    assert.equal(statuses[0].latestExists, false);
    assert.equal(statuses[1].automated, false);
  });
});
