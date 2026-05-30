import { expect, type APIRequestContext } from '@playwright/test';

export const BASE_URL = 'http://localhost:4000/api';
export const TEST_PASSWORD = 'TestPassword123!';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  username: string;
}

export function uniqueEmail(prefix: string): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}@example.com`;
}

export async function registerUser(
  request: APIRequestContext,
  prefix = 'test-user'
): Promise<TestUser> {
  const email = uniqueEmail(prefix);
  const username = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

  const res = await request.post(`${BASE_URL}/auth/register`, {
    data: {
      email,
      password: TEST_PASSWORD,
      username,
    },
  });

  expect(res.status()).toBe(201);

  const body = await res.json();
  expect(body.id).toBeDefined();
  expect(body.email).toBe(email);

  return {
    id: body.id,
    email,
    password: TEST_PASSWORD,
    username,
  };
}

export async function loginUser(request: APIRequestContext, user: TestUser) {
  const res = await request.post(`${BASE_URL}/auth/login`, {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  expect(res.status()).toBe(200);

  return res;
}
