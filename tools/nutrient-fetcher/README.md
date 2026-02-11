# Nutrient Fetcher

Modular CLI tool for fetching, parsing, and comparing nutrient reference data from authoritative sources.

## Purpose

- **Fetch** nutrient data from registered sources (NIH ODS, USDA FDC)
- **Parse** HTML tables and API responses into normalized, sorted JSON snapshots
- **Compare** snapshots against previous fetches or the project's `nutrient-targets.json`
- **Backup** previous data automatically before writing new snapshots

## Quick Start

```bash
cd tools/nutrient-fetcher
npm install

# Fetch all automated sources
node src/cli.js fetch --all

# Check status
node src/cli.js status

# Compare against project data
node src/cli.js compare --source=nih-ods-pregnancy --against-project

# Run tests
npm test
```

## Commands

| Command   | Description |
|-----------|-------------|
| `fetch`   | Fetch nutrient data from sources and save as snapshots |
| `compare` | Compare latest snapshot against fresh fetch or project data |
| `list`    | Show all registered sources |
| `status`  | Display snapshot status (dates, backup count) |

### Flags

| Flag                | Description |
|---------------------|-------------|
| `--source=ID`       | Target a specific source |
| `--all`             | Process all sources (including manual) |
| `--against-project` | Compare snapshot against `nutrient-targets.json` |

## Architecture

```
tools/nutrient-fetcher/
├── package.json
├── README.md
├── src/
│   ├── cli.js              ← CLI entry + command routing
│   ├── config.js           ← Source URLs, nutrient maps, paths
│   ├── fetcher.js          ← HTTP fetch with retry/timeout/rate-limit
│   ├── parser-nih-ods.js   ← NIH ODS HTML table parser (cheerio)
│   ├── parser-usda-fdc.js  ← USDA FDC REST API client
│   ├── comparator.js       ← Deep diff engine for snapshots
│   └── storage.js          ← Save/load/backup snapshot files
└── tests/
    ├── comparator.test.js
    ├── fetcher.test.js
    ├── parser-nih-ods.test.js
    ├── storage.test.js
    └── fixtures/
        └── nih-ods-sample.html
```

## Snapshot Storage

Snapshots are saved under `data/reference/snapshots/{source-id}/`:

```
data/reference/snapshots/
  nih-ods-pregnancy/
    latest.json                  ← most recent fetch
    2026-02-11T12-00-00Z.json   ← timestamped backup
    2026-01-15T08-30-00Z.json   ← older backup
```

Each snapshot includes a `_meta` block with `source_id`, `fetched_at`, and `page_last_updated`.

## Registered Sources

| Source | Parser | Type | Schedule |
|--------|--------|------|----------|
| NIH ODS – Pregnancy | `nih-ods` (HTML/cheerio) | nutrient-targets | monthly |
| USDA FoodData Central | `usda-fdc` (REST API) | food-composition | quarterly |
| EFSA DRV Summary | *(manual – PDF)* | nutrient-targets | yearly |
| CIQUAL / Zenodo | *(manual – XLS download)* | food-composition | yearly |

### Adding a New Source

1. Add source definition in `src/config.js` → `SOURCES`
2. Create a parser in `src/parser-{name}.js` exporting a `parse(html)` or async function
3. Wire it into `src/cli.js` fetch/compare commands
4. Add nutrient-name mapping in `config.js` if needed
5. Write tests using an HTML/JSON fixture

## USDA FDC Setup

The USDA FDC parser requires a free API key:

1. Register at https://fdc.nal.usda.gov/api-guide
2. Set the environment variable: `set USDA_FDC_API_KEY=your_key_here`

## Testing

Tests use Node.js built-in test runner (`node:test` + `node:assert`):

```bash
npm test                   # run all tests
npm run test:verbose       # spec-style output
node --test tests/parser-nih-ods.test.js   # single file
```

## Dependencies

- **cheerio** `^1.0.0` — HTML parsing for NIH ODS tables
- **Node.js** `>=18.0.0` — for native `fetch` and `node:test`
