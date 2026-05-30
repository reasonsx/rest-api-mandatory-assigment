import { test, expect } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';
import path from 'path';
import { BASE_URL, loginUser, registerUser } from './helpers/auth';

dotenvFlow.config({ path: path.resolve(__dirname, '../backend') });

async function loginAdmin(request: any) {
  const res = await request.post(`${BASE_URL}/auth/login`, {
    data: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
  });

  return res;
}

test('GET /movies should return array', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/movies`);

  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(Array.isArray(body)).toBeTruthy();
});

test('admin can create and delete movie', async ({ request }) => {
  const loginRes = await loginAdmin(request);
  test.skip(
    loginRes.status() !== 200,
    'ADMIN_EMAIL/ADMIN_PASSWORD did not authenticate against the configured database.'
  );

  const createRes = await request.post(`${BASE_URL}/movies`, {
    data: { title: 'Playwright Movie' },
  });

  expect(createRes.status()).toBe(201);

  const movie = await createRes.json();

  const deleteRes = await request.delete(`${BASE_URL}/movies/${movie._id}`);

  expect(deleteRes.status()).toBe(204);
});

test('authenticated non-admin cannot create a movie', async ({ request }) => {
  const user = await registerUser(request, 'movie-user');
  await loginUser(request, user);

  const res = await request.post(`${BASE_URL}/movies`, {
    data: { title: 'User Created Movie' },
  });

  expect(res.status()).toBe(403);
});

test('should fail creating movie without auth', async ({ request }) => {
  const res = await request.post(`${BASE_URL}/movies`, {
    data: { title: 'No Auth Movie' },
  });

  expect(res.status()).toBe(401);
});

