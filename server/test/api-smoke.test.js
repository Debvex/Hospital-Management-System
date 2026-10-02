import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';

let server;
let baseUrl;

before(async () => {
  process.env.DATABASE_URL = 'postgresql://hms_test:test@127.0.0.1:1/hms_test';
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hmac';
  const { app } = await import('../src/app.js');
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('protected API endpoints reject missing bearer tokens', async () => {
  const response = await fetch(`${baseUrl}/api/v1/doctors`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, 'UNAUTHENTICATED');
});

test('unknown API routes return the structured not-found response', async () => {
  const response = await fetch(`${baseUrl}/api/v1/no-such-route`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, 'NOT_FOUND');
});

test('unauthenticated demo role switching is not available', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'administrator' }),
  });
  assert.equal(response.status, 404);
});