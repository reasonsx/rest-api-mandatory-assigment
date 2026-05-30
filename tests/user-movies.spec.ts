import { test, expect } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';
import path from 'path';
import { BASE_URL, loginUser, registerUser } from './helpers/auth';

dotenvFlow.config({ path: path.resolve(__dirname, '../backend') });

test('guest cannot access user movies', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/users/123/movies`);

  expect([401, 403]).toContain(res.status());
});

test('user cannot access another user movies', async ({ request }) => {
  const owner = await registerUser(request, 'movie-owner');
  const otherUser = await registerUser(request, 'movie-other');
  await loginUser(request, otherUser);

  const res = await request.get(`${BASE_URL}/users/${owner.id}/movies`);

  expect(res.status()).toBe(403);
});
