/**
 * Nutrient Fetcher — NIH ODS Pregnancy Page Parser
 *
 * Parses the "Pregnancy — Health Professional Fact Sheet" from the NIH
 * Office of Dietary Supplements (ODS) to extract RDA / AI tables and
 * Upper Limit (UL) tables for pregnancy age-bands 14-18 and 19-50.
 *
 * Requires: cheerio
 */

'use strict';

const { NIH_NUTRIENT_MAP } = require('./config');

/**
 * Parse the NIH ODS pregnancy page HTML and return structured nutrient data.
 *
 * @param {string} html  Raw HTML of the NIH ODS pregnancy page
 * @returns {{ _meta: object, nutrients: object }}
 */
function parse(html) {
  // Load cheerio dynamically so unit tests can mock it if needed
  let cheerio;
  try {
    cheerio = require('cheerio');
  } catch {
    throw new Error('cheerio is required for NIH ODS HTML parsing — run npm install');
  }

  const $ = cheerio.load(html);
  const tables = $('table');

  if (tables.length === 0) {
    throw new Error('No <table> elements found in the HTML — page structure may have changed');
  }

  // Strategy: Find tables by scanning for known nutrient keywords.
  // Table 1 (RDA/AI) and Table 2 (UL) both contain nutrient names.
  // Distinguish by section header or by presence of "Upper Limit" keywords.
  const nutrientTables = findNutrientTables($, tables);

  if (nutrientTables.length === 0) {
    throw new Error('Could not identify nutrient data tables — page structure may have changed');
  }

  // Parse Recommended Intakes (RDA/AI) table
  const rda = nutrientTables[0]
    ? parseNutrientTable($, nutrientTables[0], 'rda')
    : {};

  // Parse Upper Limits (UL) table
  const ul = nutrientTables[1]
    ? parseNutrientTable($, nutrientTables[1], 'ul')
    : {};

  // Merge RDA/AI + UL into age-band objects
  const merged = mergeData(rda, ul);

  // Extract source "last updated" date if available
  const lastUpdated = extractLastUpdated($);

  return {
    _meta: {
      source_id:   'nih-ods-pregnancy',
      source_url:  'https://ods.od.nih.gov/factsheets/Pregnancy-HealthProfessional/',
      fetched_at:  new Date().toISOString(),
      page_last_updated: lastUpdated || null,
      parser_version: '1.0.0',
    },
    nutrients: sortObjectKeys(merged),
  };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Locate the two nutrient data tables (RDA/AI first, UL second).
 * We look for tables whose first-column cells contain known nutrient names.
 * Then we try to distinguish RDA vs UL based on surrounding headings.
 */
function findNutrientTables($, tables) {
  const nutrientNames = ['calcium', 'iron', 'folate', 'zinc', 'iodine'];
  const candidates = [];

  tables.each((_i, table) => {
    const firstColText = $(table)
      .find('tr td:first-child, tr th:first-child')
      .map((_j, el) => $(el).text().toLowerCase())
      .get();

    const matchCount = nutrientNames.filter(n =>
      firstColText.some(t => t.includes(n))
    ).length;

    if (matchCount >= 3) {
      candidates.push(table);
    }
  });

  if (candidates.length >= 2) {
    // Try to order: RDA/AI first, UL second
    // UL table often has "ND" or "Upper" in surrounding heading
    return orderByType($, candidates);
  }

  return candidates;
}

/**
 * Order tables so RDA/AI is index 0 and UL is index 1.
 */
function orderByType($, tables) {
  const scored = tables.map(table => {
    // Look at preceding heading or table content for "upper" keyword
    const prev = $(table).prevAll('h2, h3, h4, p').first().text().toLowerCase();
    const allText = $(table).text().toLowerCase();
    const isUL = prev.includes('upper') || prev.includes('tolerable') ||
                 allText.includes('upper limit') || allText.includes(' nd');
    return { table, isUL };
  });

  const rdaTables = scored.filter(s => !s.isUL).map(s => s.table);
  const ulTables  = scored.filter(s => s.isUL).map(s => s.table);

  return [rdaTables[0] || tables[0], ulTables[0] || tables[1]];
}

/**
 * Parse a single nutrient table into { nutrientCode: { ageBand: { type, value } } }
 *
 * The real NIH ODS page uses two table layouts:
 *   • RDA/AI table: multi-row header (Row 0 = "Nutrient | Age", Row 1 = "14–18 y | 19–50 y")
 *   • UL table:     single-row header ("Nutrient | Age 14–18 y | Age 19–50 y")
 *
 * @param {cheerio.Root} $
 * @param {cheerio.Element} table
 * @param {'rda'|'ul'} tableType
 */
function parseNutrientTable($, table, tableType) {
  const rows = $(table).find('tr');
  if (rows.length < 2) return {};

  // Detect header columns — check Row 0 first, then Row 1 for multi-row headers
  let ageBandCols = [];
  let dataStartRow = 1;

  // Try Row 0 header
  const headerCells0 = $(rows[0]).find('th, td');
  ageBandCols = detectAgeBandColumns($, headerCells0);

  // If Row 0 didn't yield two age bands, check Row 1 for sub-headers
  if (ageBandCols.length < 2 && rows.length > 2) {
    const row1Cells = $(rows[1]).find('td, th');
    const row1Cols = detectAgeBandColumns($, row1Cells);

    if (row1Cols.length >= 2) {
      // Sub-header row may have fewer cells than data rows (e.g. 2 cells
      // for age bands while data rows have 3: nutrient + 2 values).
      // If sub-header has fewer cells than data rows, offset indices by
      // the difference (typically +1 for the nutrient-name column).
      const sampleDataRow = rows.length > 2 ? $(rows[2]).find('td, th').length : 0;
      const offset = sampleDataRow > row1Cells.length
        ? sampleDataRow - row1Cells.length
        : 0;
      ageBandCols = row1Cols.map(c => ({
        colIndex: c.colIndex + offset,
        ageBand:  c.ageBand,
      }));
      dataStartRow = 2;
    } else if (row1Cols.length > ageBandCols.length) {
      ageBandCols = row1Cols;
      dataStartRow = 2;
    }
  }

  // If we still don't have age-band columns, attempt to infer from data rows
  // For tables with 3+ cells per data row but no matching headers, use col 1 & 2
  if (ageBandCols.length < 2) {
    const sampleRow = rows.length > dataStartRow ? $(rows[dataStartRow]).find('td, th') : null;
    if (sampleRow && sampleRow.length >= 3) {
      ageBandCols = [
        { colIndex: 1, ageBand: 'pregnant_14_18' },
        { colIndex: 2, ageBand: 'pregnant_19_50' },
      ];
    }
  }

  const result = {};

  rows.each((i, row) => {
    if (i < dataStartRow) return; // skip header row(s)

    const cells = $(row).find('td, th');
    if (cells.length < 2) return;

    const rawName = $(cells[0]).text().trim();
    const parsed  = parseNutrientName(rawName);
    if (!parsed) return;

    const { code } = parsed;
    if (!code) return;

    for (const ab of ageBandCols) {
      if (ab.colIndex >= cells.length) continue;
      const cellText = $(cells[ab.colIndex]).text().trim();
      const valueInfo = parseValue(cellText);

      if (valueInfo.value === null) continue;

      if (!result[code]) result[code] = {};
      if (!result[code][ab.ageBand]) result[code][ab.ageBand] = {};

      if (tableType === 'ul') {
        result[code][ab.ageBand].UL = valueInfo.value;
      } else {
        // RDA unless asterisk (AI)
        const type = valueInfo.isAI ? 'AI' : 'RDA';
        result[code][ab.ageBand][type] = valueInfo.value;
      }
    }
  });

  return result;
}

/**
 * Detect which columns correspond to pregnancy age bands.
 * Returns array of { colIndex, ageBand }.
 */
function detectAgeBandColumns($, headerCells) {
  const cols = [];

  headerCells.each((i, cell) => {
    // Normalize dashes (en-dash, em-dash → hyphen) and whitespace
    const text = $(cell).text().toLowerCase()
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\s+/g, ' ');

    if (text.includes('14') && text.includes('18')) {
      cols.push({ colIndex: i, ageBand: 'pregnant_14_18' });
    } else if (text.includes('19') && (text.includes('50') || text.includes('51'))) {
      cols.push({ colIndex: i, ageBand: 'pregnant_19_50' });
    }
  });

  // Fallback: if page only has one data column (unlikely), assume 19-50
  if (cols.length === 0 && headerCells.length >= 2) {
    cols.push({ colIndex: 1, ageBand: 'pregnant_19_50' });
  }

  return cols;
}

/**
 * Map a raw nutrient name (e.g. "Calcium (mg)") to a project code.
 */
function parseNutrientName(raw) {
  // Strip unit portion in parentheses and clean up
  let name = raw
    .replace(/\(.*?\)/g, '')   // remove parenthesized units
    .replace(/[\u2013\u2014]/g, '-')  // normalize dashes
    .replace(/\*/g, '')
    .trim()
    .toLowerCase();

  // Direct lookup
  if (NIH_NUTRIENT_MAP[name]) {
    return { code: NIH_NUTRIENT_MAP[name], raw };
  }

  // Partial match (e.g. "vitamin a" matches "vitamin a (mcg rae)")
  for (const [key, code] of Object.entries(NIH_NUTRIENT_MAP)) {
    if (name.startsWith(key) || key.startsWith(name)) {
      return { code, raw };
    }
  }

  return null;
}

/**
 * Parse a cell value like "1,300", "30*", "ND", "N/A".
 */
function parseValue(text) {
  const cleaned = text.trim();

  if (!cleaned || cleaned === 'ND' || cleaned === 'N/A' || cleaned === '—' || cleaned === '-') {
    return { value: null, isAI: false };
  }

  const isAI = cleaned.includes('*');
  const numStr = cleaned.replace(/[*,\s]/g, '');
  const value = parseFloat(numStr);

  if (Number.isNaN(value)) {
    return { value: null, isAI: false };
  }

  return { value, isAI };
}

/**
 * Merge RDA/AI data with UL data into a single object.
 */
function mergeData(rda, ul) {
  const allCodes = new Set([...Object.keys(rda), ...Object.keys(ul)]);
  const ageBands = ['pregnant_14_18', 'pregnant_19_50'];
  const merged = {};

  for (const ab of ageBands) {
    merged[ab] = {};

    for (const code of [...allCodes].sort()) {
      const entry = {};
      const rdaEntry = rda[code]?.[ab];
      const ulEntry  = ul[code]?.[ab];

      if (rdaEntry) Object.assign(entry, rdaEntry);
      if (ulEntry)  Object.assign(entry, ulEntry);

      if (Object.keys(entry).length > 0) {
        merged[ab][code] = entry;
      }
    }
  }

  return merged;
}

/**
 * Try to extract the page's "last updated" date from footer or meta.
 */
function extractLastUpdated($) {
  // NIH ODS pages often have "Updated: April 3, 2025" in the page
  const bodyText = $('body').text();
  const match = bodyText.match(/Updated:\s*([A-Za-z]+ \d{1,2},?\s*\d{4})/i);
  return match ? match[1].trim() : null;
}

/**
 * Recursively sort object keys alphabetically.
 */
function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  return sorted;
}

module.exports = {
  parse,
  // Exported for testing
  parseNutrientName,
  parseValue,
  mergeData,
  sortObjectKeys,
};
