import { test, expect } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

const BASE_URL = 'http://localhost:4000/api';

async function login(request: any) {
  const res = await request.post(`${BASE_URL}/auth/login`, {
    data: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
  });

  const { token } = await res.json();
  return token;
}

test('GET /movies should return array', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/movies`);

  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(Array.isArray(body)).toBeTruthy();
});

test('admin can create and delete movie', async ({ request }) => {
  const token = await login(request);

  const createRes = await request.post(`${BASE_URL}/movies`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'Playwright Movie' },
  });

  expect(createRes.status()).toBe(201);

  const movie = await createRes.json();

  const deleteRes = await request.delete(`${BASE_URL}/movies/${movie._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  expect(deleteRes.status()).toBe(204);
});

test('should fail creating movie without auth', async ({ request }) => {
  const res = await request.post(`${BASE_URL}/movies`, {
    data: { title: 'No Auth Movie' },
  });

  expect(res.status()).toBe(401);
});

