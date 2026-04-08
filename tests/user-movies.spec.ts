import { test, expect } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';
const BASE_URL = 'http://localhost:4000/api';
dotenvFlow.config();

test('user cannot access another user movies', async ({ request }) => {
  // simulates wrong access
  const res = await request.get(`${BASE_URL}/users/123/movies`);

  expect([401, 403]).toContain(res.status());
});