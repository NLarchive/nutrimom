/**
 * Nutrient Fetcher — HTTP fetch with retry, timeout, and rate-limiting.
 */

'use strict';

const DEFAULT_OPTS = {
  retries:      3,
  retryDelay:   1500,      // ms between retries
  timeout:      30_000,    // 30 s
  rateLimitMs:  1000,      // min ms between requests
  userAgent:    'NutriMom-Fetcher/1.0 (nutrient-reference-tool)',
};

let _lastRequestTime = 0;

/**
 * Fetch a URL with retry, timeout, and simple rate-limiting.
 *
 * @param {string} url
 * @param {object} [opts]  Override any key of DEFAULT_OPTS
 * @returns {Promise<{ ok: boolean, status: number, body: string, headers: object }>}
 */
async function fetchUrl(url, opts = {}) {
  const cfg = { ...DEFAULT_OPTS, ...opts };

  let lastError;
  for (let attempt = 1; attempt <= cfg.retries; attempt++) {
    try {
      // Simple rate-limiting
      const now = Date.now();
      const wait = cfg.rateLimitMs - (now - _lastRequestTime);
      if (wait > 0) await sleep(wait);
      _lastRequestTime = Date.now();

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), cfg.timeout);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': cfg.userAgent },
      });
      clearTimeout(timer);

      const body = await res.text();

      return {
        ok:      res.ok,
        status:  res.status,
        body,
        headers: Object.fromEntries(res.headers.entries()),
      };
    } catch (err) {
      lastError = err;
      if (attempt < cfg.retries) {
        const delay = cfg.retryDelay * attempt;  // linear back-off
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `Failed to fetch ${url} after ${cfg.retries} attempts: ${lastError?.message}`
  );
}

/**
 * Fetch JSON from a URL (convenience wrapper).
 *
 * @param {string} url
 * @param {object} [opts]
 * @returns {Promise<object>}
 */
async function fetchJson(url, opts = {}) {
  const result = await fetchUrl(url, opts);
  if (!result.ok) {
    throw new Error(`HTTP ${result.status} for ${url}`);
  }
  try {
    return JSON.parse(result.body);
  } catch {
    throw new Error(`Invalid JSON from ${url}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Reset rate-limit timer (useful in tests). */
function resetRateLimit() {
  _lastRequestTime = 0;
}

module.exports = { fetchUrl, fetchJson, resetRateLimit, DEFAULT_OPTS };
