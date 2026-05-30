import { test, expect } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';
import path from 'path';
const BASE_URL = 'http://localhost:4000/api';
dotenvFlow.config({ path: path.resolve(__dirname, '../backend') });

test('user cannot access another user movies', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/users/123/movies`);

  expect([401, 403]).toContain(res.status());
});
