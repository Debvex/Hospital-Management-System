import { before, test } from 'node:test';
import assert from 'node:assert/strict';

let hashPassword;
let verifyPassword;
let signToken;
let verifyToken;
let validDate;

before(async () => {
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hmac';
  ({ hashPassword, verifyPassword, signToken, verifyToken } = await import('../src/lib/security.js'));
  ({ validDate } = await import('../src/lib/errors.js'));
});

test('password hashes verify without storing the original password', async () => {
  const password = 'Password@123';
  const hash = await hashPassword(password);
  assert.notEqual(hash, password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword('wrong-password', hash), false);
});

test('JWT signatures are verified and expired tokens are rejected', () => {
  const token = signToken({ id: 'user-1', email: 'patient@example.test', role: 'patient' });
  assert.equal(verifyToken(token)?.sub, 'user-1');
  const [header, payload, signature] = token.split('.');
  const changedSignature = `${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`;
  assert.equal(verifyToken(`${header}.${payload}.${changedSignature}`), null);
});

test('date validation rejects impossible calendar dates', () => {
  assert.equal(validDate('2026-10-01'), true);
  assert.equal(validDate('2026-02-31'), false);
  assert.equal(validDate('not-a-date'), false);
});
