import { test, expect } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

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
  expect(body.token).toBeDefined();
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