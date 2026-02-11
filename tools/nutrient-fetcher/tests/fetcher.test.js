/**
 * Tests for fetcher.js — HTTP fetch with retry/timeout
 *
 * NOTE: These tests mock globalThis.fetch to avoid real network calls.
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const fetcher = require('../src/fetcher');

let originalFetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  fetcher.resetRateLimit();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ── fetchUrl ─────────────────────────────────────────────────────────────────

describe('fetcher: fetchUrl()', () => {
  it('returns body and status on success', async () => {
    globalThis.fetch = async () => ({
      ok:      true,
      status:  200,
      text:    async () => '<html>OK</html>',
      headers: new Map([['content-type', 'text/html']]),
    });

    const res = await fetcher.fetchUrl('https://example.com', {
      retries: 1,
      rateLimitMs: 0,
    });

    assert.equal(res.ok, true);
    assert.equal(res.status, 200);
    assert.equal(res.body, '<html>OK</html>');
  });

  it('retries on failure and eventually succeeds', async () => {
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount++;
      if (callCount < 3) throw new Error('network error');
      return {
        ok:      true,
        status:  200,
        text:    async () => 'OK',
        headers: new Map(),
      };
    };

    const res = await fetcher.fetchUrl('https://example.com', {
      retries: 3,
      retryDelay: 10,
      rateLimitMs: 0,
    });

    assert.equal(res.ok, true);
    assert.equal(callCount, 3);
  });

  it('throws after exhausting retries', async () => {
    globalThis.fetch = async () => { throw new Error('fail'); };

    await assert.rejects(
      () => fetcher.fetchUrl('https://example.com', {
        retries: 2,
        retryDelay: 10,
        rateLimitMs: 0,
      }),
      /Failed to fetch.*after 2 attempts/
    );
  });
});

// ── fetchJson ────────────────────────────────────────────────────────────────

describe('fetcher: fetchJson()', () => {
  it('parses JSON response', async () => {
    globalThis.fetch = async () => ({
      ok:      true,
      status:  200,
      text:    async () => '{"key": "value"}',
      headers: new Map(),
    });

    const data = await fetcher.fetchJson('https://example.com/api', {
      retries: 1,
      rateLimitMs: 0,
    });

    assert.deepEqual(data, { key: 'value' });
  });

  it('throws on non-ok HTTP response', async () => {
    globalThis.fetch = async () => ({
      ok:      false,
      status:  404,
      text:    async () => 'Not Found',
      headers: new Map(),
    });

    await assert.rejects(
      () => fetcher.fetchJson('https://example.com/missing', {
        retries: 1,
        rateLimitMs: 0,
      }),
      /HTTP 404/
    );
  });

  it('throws on invalid JSON', async () => {
    globalThis.fetch = async () => ({
      ok:      true,
      status:  200,
      text:    async () => 'not json',
      headers: new Map(),
    });

    await assert.rejects(
      () => fetcher.fetchJson('https://example.com/bad', {
        retries: 1,
        rateLimitMs: 0,
      }),
      /Invalid JSON/
    );
  });
});
