/**
 * NCBI DRI Table Parser
 *
 * Parses the National Academies DRI summary tables hosted on NCBI Bookshelf.
 * Handles all life stages: Infants, Children, Males, Females, Pregnancy, Lactation.
 *
 * Each NCBI table URL (?report=objectonly) returns a single HTML table with:
 *   - Group header rows (e.g. "Infants", "Males") spanning all columns
 *   - Data rows: age-band label + nutrient values
 *   - Values may include: numbers, commas, asterisks (*) for AI, footnote
 *     superscripts (a–j), "ND" for not determined
 *
 * The column order is fixed per table and defined in config.NCBI_TABLE_COLUMNS.
 */

'use strict';

const cheerio = require('cheerio');
const {
  NCBI_TABLE_COLUMNS,
  NCBI_LIFE_STAGE_MAP,
  NCBI_AGE_BAND_MAP,
} = require('./config');

// Known life-stage group header texts (normalised to lowercase for matching)
const GROUP_HEADERS = new Set([
  'infants', 'children', 'males', 'females', 'pregnancy', 'lactation',
]);

// ── Value parser ─────────────────────────────────────────────────────────────

/**
 * Parse a single cell value from a NCBI DRI table.
 *
 * @param {string} raw - Raw cell text (may contain commas, *, footnote chars, ND)
 * @returns {{ value: number|null, isAI: boolean, isND: boolean }}
 */
function parseCellValue(raw) {
  if (!raw || typeof raw !== 'string') {
    return { value: null, isAI: false, isND: true };
  }

  let text = raw.trim();

  // Normalise whitespace
  text = text.replace(/\s+/g, ' ');

  // Check for ND (Not Determinable) — may have footnote suffix like "NDf", "NDh"
  if (/^ND\b/i.test(text) || text === '—' || text === '–' || text === '-') {
    return { value: null, isAI: false, isND: true };
  }

  // Detect AI indicator: trailing asterisk (possibly with footnote letters)
  const isAI = /\*/.test(text);

  // Strip footnote letters (a–z), asterisks, and sup tags residue
  text = text.replace(/[a-z*]/gi, (ch) => {
    // Keep digits and decimal points and commas; strip letters and asterisks
    return /[a-z*]/i.test(ch) ? '' : ch;
  });
  // More targeted: strip only trailing non-numeric chars after digits
  // Actually let's redo this cleanly
  text = raw.trim()
    .replace(/\*+/g, '')           // strip asterisks
    .replace(/[a-z]+$/i, '')       // strip trailing footnote letters
    .replace(/^[a-z]+/i, '')       // strip leading footnote letters (rare)
    .replace(/,/g, '')             // strip thousands separators
    .replace(/\s+/g, '')           // strip spaces
    .trim();

  // Re-check ND after cleanup
  if (/^ND$/i.test(text) || text === '' || text === '—' || text === '–') {
    return { value: null, isAI: false, isND: true };
  }

  const num = parseFloat(text);
  if (isNaN(num)) {
    return { value: null, isAI: false, isND: true };
  }

  return { value: num, isAI, isND: false };
}

// ── Age-band parser ──────────────────────────────────────────────────────────

/**
 * Normalise an age-band label to our project code using NCBI_AGE_BAND_MAP.
 * Handles en-dashes (–), hyphens (-), minus signs (−), and whitespace.
 *
 * @param {string} raw - e.g. "14–18 y", "> 70 y", "0–6 mo"
 * @returns {string|null} Project age-band code or null if unrecognised
 */
function normaliseAgeBand(raw) {
  if (!raw) return null;

  // Normalise dash variants to a regular hyphen
  let text = raw.trim()
    .replace(/[\u2013\u2014\u2212]/g, '\u2013')  // normalise to en-dash
    .replace(/\s+/g, ' ');

  // Direct lookup (try both en-dash and hyphen variants)
  if (NCBI_AGE_BAND_MAP[text]) return NCBI_AGE_BAND_MAP[text];

  // Try with regular hyphen
  const hyphenText = text.replace(/\u2013/g, '-');
  if (NCBI_AGE_BAND_MAP[hyphenText]) return NCBI_AGE_BAND_MAP[hyphenText];

  // Try with en-dash
  const enDashText = text.replace(/-/g, '\u2013');
  if (NCBI_AGE_BAND_MAP[enDashText]) return NCBI_AGE_BAND_MAP[enDashText];

  return null;
}

// ── Row classification ───────────────────────────────────────────────────────

/**
 * Determine if a table row is a life-stage group header.
 *
 * Group header rows typically have:
 * - A single cell with colspan spanning all columns, or
 * - Multiple cells but only the first has text, rest are empty/nbsp
 *
 * @param {cheerio.Element} tr - Table row element
 * @param {cheerio.CheerioAPI} $ - Cheerio instance
 * @returns {string|null} Capitalised group name or null
 */
function detectGroupHeader(tr, $) {
  const cells = $(tr).children('td, th');
  if (cells.length === 0) return null;

  // Check if first cell has colspan covering most of the row
  const firstCell = cells.first();
  const colspan = parseInt(firstCell.attr('colspan') || '1', 10);

  // Get text from first cell only
  const text = firstCell.text().trim();
  const normalised = text.toLowerCase().replace(/[^a-z]/g, '');

  if (GROUP_HEADERS.has(normalised)) {
    return text.charAt(0).toUpperCase() + normalised.slice(1);
  }

  // Also check if ALL other cells are empty (indicating a group header row)
  if (cells.length > 1) {
    let allEmpty = true;
    cells.slice(1).each((_, cell) => {
      const cellText = $(cell).text().trim().replace(/\u00a0/g, '');
      if (cellText.length > 0) allEmpty = false;
    });
    if (allEmpty && GROUP_HEADERS.has(normalised)) {
      return text.charAt(0).toUpperCase() + normalised.slice(1);
    }
  }

  return null;
}

// ── Main parser ──────────────────────────────────────────────────────────────

/**
 * Parse a NCBI DRI HTML table page.
 *
 * @param {string} html        - Raw HTML of the ?report=objectonly page
 * @param {object} sourceConfig - Source definition from config.SOURCES
 * @returns {object} Structured data:
 *   {
 *     _meta: { source, fetchedAt, tableKind },
 *     groups: {
 *       Infants:   { '0_6': { nutrientCode: { value, type } }, ... },
 *       Children:  { ... },
 *       Males:     { ... },
 *       Females:   { ... },
 *       Pregnancy: { ... },
 *       Lactation: { ... },
 *     }
 *   }
 */
function parse(html, sourceConfig) {
  const $ = cheerio.load(html);
  const sourceId = sourceConfig.id;
  const tableKind = sourceConfig.tableKind; // 'rda' or 'ul'
  const columns = NCBI_TABLE_COLUMNS[sourceId];

  if (!columns) {
    throw new Error(`No column definitions found for source "${sourceId}"`);
  }

  const result = {
    _meta: {
      source: sourceId,
      sourceName: sourceConfig.name,
      url: sourceConfig.url,
      fetchedAt: new Date().toISOString(),
      tableKind,
      nutrientCount: columns.filter(c => c.code).length,
    },
    groups: {},
  };

  // Find the main data table
  const table = $('table').first();
  if (!table.length) {
    throw new Error(`No <table> found in HTML for source "${sourceId}"`);
  }

  const rows = table.find('tr');
  let currentGroup = null;

  rows.each((_, tr) => {
    // Skip pure header rows (thead rows with column names)
    if ($(tr).closest('thead').length) return;

    // Check if this is a group header row
    const group = detectGroupHeader(tr, $);
    if (group) {
      currentGroup = group;
      if (!result.groups[currentGroup]) {
        result.groups[currentGroup] = {};
      }
      return;
    }

    // Skip rows before any group header
    if (!currentGroup) return;

    // Parse data row
    const cells = $(tr).children('td, th');
    if (cells.length < 2) return;

    // First cell is the age-band label
    const ageBandRaw = $(cells[0]).text().trim();
    const ageBand = normaliseAgeBand(ageBandRaw);

    if (!ageBand) {
      // Could be a sub-header, footnote, or unrecognised row — skip
      return;
    }

    // Parse nutrient value cells (starting from index 1)
    const nutrients = {};
    for (let i = 0; i < columns.length; i++) {
      const colDef = columns[i];
      const cellIdx = i + 1; // +1 because column 0 is the age-band label

      if (!colDef.code) continue; // skip null/untracked columns

      const cellEl = cells[cellIdx];
      if (!cellEl) continue;

      const rawText = $(cellEl).text();
      const parsed = parseCellValue(rawText);

      if (parsed.isND) {
        nutrients[colDef.code] = {
          value: null,
          type: 'ND',
          raw: rawText.trim(),
        };
        continue;
      }

      let value = parsed.value;

      // Unit conversion if needed
      if (colDef.convertToMg && value !== null) {
        value = Math.round(value * 1000);
      }

      // Determine target type based on tableKind + AI indicator
      let type;
      if (tableKind === 'ul') {
        type = 'UL';
      } else {
        // rda table: bold = RDA, asterisk = AI
        type = parsed.isAI ? 'AI' : 'RDA';
      }

      nutrients[colDef.code] = { value, type, raw: rawText.trim() };
    }

    result.groups[currentGroup][ageBand] = nutrients;
  });

  return result;
}

// ── Flatten to project-comparable structure ──────────────────────────────────

/**
 * Convert parsed NCBI data into a flat structure keyed by
 * `${projectLifeStage}.${ageBand}.${nutrientCode}` for easy comparison
 * with nutrient-targets.json.
 *
 * Handles:
 * - Fan-out of Pregnancy → pregnant_t1/t2/t3
 * - Fan-out of Lactation → lactating_0_6/7_12
 * - Age-band collapsing: 51_70 and 71_plus → 51_plus (picks appropriate value)
 *
 * @param {object} parsed - Output of parse()
 * @returns {object} Map of "lifeStage.ageBand" → { nutrientCode: { value, type } }
 */
function flattenForProject(parsed) {
  const flat = {};

  for (const [groupName, ageBands] of Object.entries(parsed.groups)) {
    const mappings = NCBI_LIFE_STAGE_MAP[groupName];
    if (!mappings) continue;

    for (const { stage } of mappings) {
      for (const [ageBand, nutrients] of Object.entries(ageBands)) {
        const key = `${stage}.${ageBand}`;
        if (!flat[key]) flat[key] = {};

        for (const [code, data] of Object.entries(nutrients)) {
          flat[key][code] = data;
        }
      }
    }
  }

  return flat;
}

module.exports = {
  parse,
  flattenForProject,
  parseCellValue,
  normaliseAgeBand,
  detectGroupHeader,
};
