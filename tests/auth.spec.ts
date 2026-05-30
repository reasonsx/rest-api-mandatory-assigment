import { test, expect } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';
import path from 'path';
import { BASE_URL, loginUser, registerUser, TEST_PASSWORD } from './helpers/auth';

dotenvFlow.config({ path: path.resolve(__dirname, '../backend') });

test('registers a user and rejects duplicate emails', async ({ request }) => {
  const user = await registerUser(request, 'duplicate-check');

  const duplicate = await request.post(`${BASE_URL}/auth/register`, {
    data: {
      email: user.email,
      password: TEST_PASSWORD,
      username: 'duplicate',
    },
  });

  expect(duplicate.status()).toBe(409);
});

test('rejects passwords longer than bcrypt can safely hash', async ({ request }) => {
  const res = await request.post(`${BASE_URL}/auth/register`, {
    data: {
      email: `bcrypt-limit-${Date.now()}@example.com`,
      password: 'a'.repeat(73),
      username: 'bcrypt-limit',
    },
  });

  expect(res.status()).toBe(400);

  const body = await res.json();
  expect(body.message).toBe('Please check the highlighted fields.');
  expect(body.errors).toContainEqual(
    expect.objectContaining({
      field: 'password',
      message: expect.stringContaining('72 bytes'),
    })
  );
});

test('logs in with an HTTP-only 2 hour auth cookie', async ({ request }) => {
  const user = await registerUser(request, 'cookie-login');
  const res = await loginUser(request, user);

  const body = await res.json();
  expect(body.token).toBeUndefined();
  expect(body.user.id).toBe(user.id);
  expect(body.user.email).toBe(user.email);
  expect(body.expiresAt).toBeDefined();
  expect(body.expiresInSeconds).toBeGreaterThan(7100);
  expect(body.expiresInSeconds).toBeLessThanOrEqual(7200);

  const setCookie = res.headers()['set-cookie'] ?? '';
  expect(setCookie).toContain('watch_tracker_jwt=');
  expect(setCookie).toContain('HttpOnly');
  expect(setCookie).toContain('Max-Age=7200');

  const meRes = await request.get(`${BASE_URL}/auth/me`);
  expect(meRes.status()).toBe(200);

  const meBody = await meRes.json();
  expect(meBody.user.id).toBe(user.id);
  expect(meBody.user.email).toBe(user.email);
});

test('should fail login with wrong password', async ({ request }) => {
  const user = await registerUser(request, 'wrong-password');

  const res = await request.post(`${BASE_URL}/auth/login`, {
    data: {
      email: user.email,
      password: 'wrongpassword',
    },
  });

  expect(res.status()).toBe(401);
});

test('should clear the auth cookie on logout', async ({ request }) => {
  const user = await registerUser(request, 'logout');
  await loginUser(request, user);

  const logoutRes = await request.post(`${BASE_URL}/auth/logout`);
  expect(logoutRes.status()).toBe(204);

  const meRes = await request.get(`${BASE_URL}/auth/me`);
  expect(meRes.status()).toBe(401);
});
