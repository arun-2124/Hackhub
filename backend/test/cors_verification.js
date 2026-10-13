/**
 * Focused CORS Verification Test for HackHub Backend API
 *
 * Verifications:
 * 1. FRONTEND_URL validation enforces valid HTTPS origins without paths or wildcards in production.
 * 2. Both approved Vercel origins function properly with credentials and OPTIONS preflights.
 * 3. Unapproved origins receive deliberate HTTP 403 without Access-Control-Allow-Origin.
 * 4. Requests without Origin header succeed for health checks and internal monitoring.
 * 5. Localhost origins are excluded from production by default.
 * 6. Wildcard origin (*) is never used in production.
 */

// Enforce production mode and a dedicated test port before loading server
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.TEST_PORT || '5055';

const { app, server, allowedOrigins, corsOptions, parseConfiguredOrigins } = require('../server');
const pool = require('../config/db');

const TEST_PORT = process.env.PORT;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
    failed++;
  }
}

async function runCorsTests() {
  console.log('\n======================================================');
  console.log('🔒 STARTING HACKHUB FOCUSED CORS VERIFICATION (PRODUCTION)');
  console.log(`Target: ${BASE_URL} | NODE_ENV: ${process.env.NODE_ENV}`);
  console.log('======================================================\n');

  try {
    // 1. FRONTEND_URL Validation in Production
    console.log('--- 1. FRONTEND_URL Production Validation ---');
    const validHttps = parseConfiguredOrigins('https://custom-valid.example.com', true);
    assert(
      validHttps.length === 1 && validHttps[0] === 'https://custom-valid.example.com',
      'Valid HTTPS origin without path is accepted'
    );

    const validHttpsWithPort = parseConfiguredOrigins('https://custom-valid.example.com:8443', true);
    assert(
      validHttpsWithPort.length === 1 && validHttpsWithPort[0] === 'https://custom-valid.example.com:8443',
      'Valid HTTPS origin with port is accepted'
    );

    const withPath = parseConfiguredOrigins('https://custom.example.com/subpath', true);
    assert(withPath.length === 0, 'Origins with paths are rejected');

    const withQuery = parseConfiguredOrigins('https://custom.example.com?query=1', true);
    assert(withQuery.length === 0, 'Origins with query strings are rejected');

    const insecureHttp = parseConfiguredOrigins('http://insecure.example.com', true);
    assert(insecureHttp.length === 0, 'HTTP (insecure) origins are rejected in production');

    const wildcardOrigin = parseConfiguredOrigins('*', true);
    assert(wildcardOrigin.length === 0, 'Wildcard "*" origin is rejected');

    const wildcardSubdomain = parseConfiguredOrigins('https://*.example.com', true);
    assert(wildcardSubdomain.length === 0, 'Wildcard subdomain "*.example.com" is rejected');

    const malformed = parseConfiguredOrigins('not-a-valid-url, javascript:alert(1)', true);
    assert(malformed.length === 0, 'Malformed URL strings are rejected');

    const mixedList = parseConfiguredOrigins(
      'https://valid1.com, http://invalid-http.com, https://valid2.com/path, https://valid3.com',
      true
    );
    assert(
      mixedList.length === 2 && mixedList[0] === 'https://valid1.com' && mixedList[1] === 'https://valid3.com',
      'Only valid HTTPS origins are extracted from comma-separated list'
    );

    // 2. Production Allowlist Inspection
    console.log('\n--- 2. Production Allowlist Structure ---');
    assert(
      allowedOrigins.includes('https://hackhub-gamma.vercel.app'),
      'Primary Vercel origin is present in production allowlist'
    );
    assert(
      allowedOrigins.includes('https://hackhub-cfggx2x6l-xibotix-pvt-ltd.vercel.app'),
      'Preview/deployment Vercel origin is present in production allowlist'
    );
    assert(
      !allowedOrigins.includes('http://localhost:5173') && !allowedOrigins.includes('http://localhost:5000'),
      'Localhost development origins are excluded from production allowlist by default'
    );

    // 3. Approved Origin 1: https://hackhub-gamma.vercel.app
    console.log('\n--- 3. Testing Approved Origin 1 (hackhub-gamma.vercel.app) ---');
    const origin1 = 'https://hackhub-gamma.vercel.app';

    // 3a. GET Request
    const res1 = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Origin': origin1 }
    });
    const allowOrigin1 = res1.headers.get('access-control-allow-origin');
    const allowCreds1 = res1.headers.get('access-control-allow-credentials');
    assert(res1.status === 200, `GET /api/health returns 200 for origin1`, `got status ${res1.status}`);
    assert(allowOrigin1 === origin1, `Access-Control-Allow-Origin matches origin1`, `got "${allowOrigin1}"`);
    assert(allowCreds1 === 'true', `Access-Control-Allow-Credentials is true for origin1`, `got "${allowCreds1}"`);

    // 3b. Preflight OPTIONS Request
    const preflight1 = await fetch(`${BASE_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin1,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    const preflightAllowOrigin1 = preflight1.headers.get('access-control-allow-origin');
    const preflightAllowCreds1 = preflight1.headers.get('access-control-allow-credentials');
    assert(
      preflight1.status === 204 || preflight1.status === 200,
      `OPTIONS preflight returns 200/204 for origin1`,
      `got status ${preflight1.status}`
    );
    assert(preflightAllowOrigin1 === origin1, `Preflight Access-Control-Allow-Origin matches origin1`);
    assert(preflightAllowCreds1 === 'true', `Preflight Access-Control-Allow-Credentials is true for origin1`);

    // 4. Approved Origin 2: https://hackhub-cfggx2x6l-xibotix-pvt-ltd.vercel.app
    console.log('\n--- 4. Testing Approved Origin 2 (hackhub-cfggx2x6l-xibotix-pvt-ltd.vercel.app) ---');
    const origin2 = 'https://hackhub-cfggx2x6l-xibotix-pvt-ltd.vercel.app';

    // 4a. GET Request
    const res2 = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Origin': origin2 }
    });
    const allowOrigin2 = res2.headers.get('access-control-allow-origin');
    const allowCreds2 = res2.headers.get('access-control-allow-credentials');
    assert(res2.status === 200, `GET /api/health returns 200 for origin2`, `got status ${res2.status}`);
    assert(allowOrigin2 === origin2, `Access-Control-Allow-Origin matches origin2`, `got "${allowOrigin2}"`);
    assert(allowCreds2 === 'true', `Access-Control-Allow-Credentials is true for origin2`, `got "${allowCreds2}"`);

    // 4b. Preflight OPTIONS Request
    const preflight2 = await fetch(`${BASE_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin2,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    const preflightAllowOrigin2 = preflight2.headers.get('access-control-allow-origin');
    const preflightAllowCreds2 = preflight2.headers.get('access-control-allow-credentials');
    assert(
      preflight2.status === 204 || preflight2.status === 200,
      `OPTIONS preflight returns 200/204 for origin2`,
      `got status ${preflight2.status}`
    );
    assert(preflightAllowOrigin2 === origin2, `Preflight Access-Control-Allow-Origin matches origin2`);
    assert(preflightAllowCreds2 === 'true', `Preflight Access-Control-Allow-Credentials is true for origin2`);

    // 5. Unapproved Origin: Deliberate and Consistent Error Response
    console.log('\n--- 5. Testing Unapproved Origin (Deliberate Consistent Error) ---');
    const unapprovedOrigin = 'https://unauthorized-evil-app.vercel.app';

    // 5a. GET Request from unapproved origin -> deliberate HTTP 403 with standard error JSON
    const unapprovedRes = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Origin': unapprovedOrigin }
    });
    const unapprovedData = await unapprovedRes.json();
    const unapprovedAllowOrigin = unapprovedRes.headers.get('access-control-allow-origin');

    assert(
      unapprovedRes.status === 403,
      `GET request from unapproved origin returns deliberate HTTP 403 Forbidden`,
      `got status ${unapprovedRes.status}`
    );
    assert(
      unapprovedData.success === false && unapprovedData.message.includes('CORS request blocked by HackHub security policy'),
      `Error payload provides consistent error structure: "${unapprovedData.message}"`
    );
    assert(
      unapprovedAllowOrigin !== unapprovedOrigin && unapprovedAllowOrigin !== '*',
      `Access-Control-Allow-Origin is NOT granted to unapproved origin (got "${unapprovedAllowOrigin}")`
    );

    // 5b. Preflight OPTIONS Request from unapproved origin -> deliberate HTTP 403
    const unapprovedPreflight = await fetch(`${BASE_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': unapprovedOrigin,
        'Access-Control-Request-Method': 'POST'
      }
    });
    const unapprovedPreflightOrigin = unapprovedPreflight.headers.get('access-control-allow-origin');
    assert(
      unapprovedPreflight.status === 403,
      `OPTIONS preflight from unapproved origin returns deliberate HTTP 403 Forbidden`,
      `got status ${unapprovedPreflight.status}`
    );
    assert(
      unapprovedPreflightOrigin !== unapprovedOrigin && unapprovedPreflightOrigin !== '*',
      `Preflight Access-Control-Allow-Origin is NOT granted to unapproved origin`
    );

    // 6. Default Localhost in Production -> strictly blocked (excluded from production by default)
    console.log('\n--- 6. Testing Localhost in Production (Default Exclusion) ---');
    const localhostRes = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Origin': 'http://localhost:5173' }
    });
    assert(
      localhostRes.status === 403,
      'GET /api/health blocks default localhost in production with HTTP 403',
      `got status ${localhostRes.status}`
    );
    assert(
      localhostRes.headers.get('access-control-allow-origin') !== 'http://localhost:5173',
      'Localhost does not receive Access-Control-Allow-Origin in production'
    );

    // 7. Direct Requests Without Origin Header (Server-to-Server, Health Monitors)
    console.log('\n--- 7. Testing Requests Without Origin Header ---');
    const directRes = await fetch(`${BASE_URL}/api/health`, { method: 'GET' });
    const directData = await directRes.json();
    assert(
      directRes.status === 200 && directData.status === 'UP',
      'Direct health check request without Origin header succeeds with status 200 and status UP'
    );

    // 8. Strict Absence of Wildcard Origin in Production
    console.log('\n--- 8. Wildcard Protection in Production ---');
    assert(
      res1.headers.get('access-control-allow-origin') !== '*',
      'Production response does not use wildcard origin (*)'
    );

  } catch (err) {
    console.error('Fatal error during CORS verification:', err);
    failed++;
  } finally {
    console.log('\n======================================================');
    console.log(`🏁 CORS TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    // Gracefully shutdown server and db pool
    if (pool && pool.end) {
      try {
        await pool.end();
      } catch (_) {}
    }
    if (server && server.close) {
      server.close(() => {
        process.exitCode = failed > 0 ? 1 : 0;
      });
    } else {
      process.exitCode = failed > 0 ? 1 : 0;
    }
  }
}

// Give server a moment to start
setTimeout(runCorsTests, 600);
