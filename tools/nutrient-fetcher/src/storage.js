/**
 * Nutrient Fetcher — Storage Manager
 *
 * Handles saving / loading snapshots, managing timestamped backups,
 * and creating necessary directory structures.
 *
 * Layout:
 *   data/reference/snapshots/{source-id}/
 *     latest.json              ← current snapshot
 *     2026-02-11T12-00-00Z.json ← timestamped backup
 */

'use strict';

const fs   = require('node:fs');
const path = require('node:path');
const { SNAPSHOTS_DIR } = require('./config');

/**
 * Save a snapshot as the "latest" for a given source, backing up any
 * existing latest first.
 *
 * @param {string} sourceId  e.g. "nih-ods-pregnancy"
 * @param {object} data      The snapshot object to save
 * @returns {{ latestPath: string, backupPath: string|null }}
 */
function saveSnapshot(sourceId, data) {
  const dir = ensureDir(sourceId);
  const latestPath = path.join(dir, 'latest.json');
  let backupPath = null;

  // Backup existing latest before overwriting
  if (fs.existsSync(latestPath)) {
    backupPath = backupLatest(sourceId, latestPath);
  }

  const json = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(latestPath, json, 'utf8');

  return { latestPath, backupPath };
}

/**
 * Load the latest snapshot for a source, or null if none exists.
 *
 * @param {string} sourceId
 * @returns {object|null}
 */
function loadLatest(sourceId) {
  const latestPath = path.join(snapshotDir(sourceId), 'latest.json');
  if (!fs.existsSync(latestPath)) return null;

  const raw = fs.readFileSync(latestPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * List all backups for a source, sorted newest-first.
 *
 * @param {string} sourceId
 * @returns {Array<{ file: string, timestamp: string, sizeMB: number }>}
 */
function listBackups(sourceId) {
  const dir = snapshotDir(sourceId);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && f !== 'latest.json')
    .sort()
    .reverse()
    .map(f => {
      const fp = path.join(dir, f);
      const stat = fs.statSync(fp);
      return {
        file:      f,
        timestamp: f.replace('.json', '').replace(/-/g, (m, i) => i > 9 ? ':' : m),
        sizeMB:    +(stat.size / 1024 / 1024).toFixed(3),
      };
    });
}

/**
 * Return status for all sources: latest fetch date, backup count, etc.
 *
 * @param {object} sources  Map of sourceId → source config
 * @returns {Array<object>}
 */
function getStatus(sources) {
  return Object.values(sources).map(src => {
    const latest  = loadLatest(src.id);
    const backups = listBackups(src.id);

    return {
      id:             src.id,
      name:           src.name,
      automated:      src.automated !== false,
      lastFetch:      latest?._meta?.fetched_at || null,
      pageLastUpdate: latest?._meta?.page_last_updated || null,
      backupCount:    backups.length,
      latestExists:   !!latest,
    };
  });
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Backup the current latest.json to a timestamped file.
 */
function backupLatest(sourceId, latestPath) {
  const existing = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  const fetchedAt = existing._meta?.fetched_at || new Date().toISOString();

  // Sanitize ISO string for filename: 2026-02-11T12:00:00.000Z → 2026-02-11T12-00-00Z
  const ts = fetchedAt
    .replace(/:/g, '-')
    .replace(/\.\d{3}/, '')
    .replace('Z', 'Z');

  const backupPath = path.join(snapshotDir(sourceId), `${ts}.json`);

  // Don't overwrite an existing backup with the same timestamp
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(latestPath, backupPath);
  }

  return backupPath;
}

function snapshotDir(sourceId) {
  return path.join(SNAPSHOTS_DIR, sourceId);
}

function ensureDir(sourceId) {
  const dir = snapshotDir(sourceId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = {
  saveSnapshot,
  loadLatest,
  listBackups,
  getStatus,
  // Exported for testing
  snapshotDir,
};
