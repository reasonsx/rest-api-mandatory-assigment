import { test, expect } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';
import path from 'path';

dotenvFlow.config({ path: path.resolve(__dirname, '../backend') });

const BASE_URL = 'http://localhost:4000/api';

test('should login with valid credentials', async ({ request }) => {
  const res = await request.post(`${BASE_URL}/auth/login`, {
    data: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
  });

  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body.token).toBeUndefined();
  expect(body.user.email).toBe(process.env.ADMIN_EMAIL);
  expect(body.expiresAt).toBeDefined();

  const setCookie = res.headers()['set-cookie'] ?? '';
  expect(setCookie).toContain('watch_tracker_jwt=');
  expect(setCookie).toContain('HttpOnly');
  expect(setCookie).toContain('Max-Age=7200');

  const meRes = await request.get(`${BASE_URL}/auth/me`);
  expect(meRes.status()).toBe(200);
});

test('should fail login with wrong password', async ({ request }) => {
  const res = await request.post(`${BASE_URL}/auth/login`, {
    data: {
      email: process.env.ADMIN_EMAIL,
      password: 'wrongpassword',
    },
  });

  expect(res.status()).toBe(401);
});

test('should clear the auth cookie on logout', async ({ request }) => {
  const loginRes = await request.post(`${BASE_URL}/auth/login`, {
    data: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
  });

  expect(loginRes.status()).toBe(200);

  const logoutRes = await request.post(`${BASE_URL}/auth/logout`);
  expect(logoutRes.status()).toBe(204);

  const meRes = await request.get(`${BASE_URL}/auth/me`);
  expect(meRes.status()).toBe(401);
});
