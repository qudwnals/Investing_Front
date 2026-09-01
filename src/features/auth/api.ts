import type { LoginCredentials } from './LoginPage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function login(credentials: LoginCredentials): Promise<void> {
  const csrfResponse = await fetch(`${API_BASE_URL}/api/v1/auth/csrf`, {
    credentials: 'include',
  });
  if (!csrfResponse.ok) throw new Error('CSRF_FAILED');
  const csrfBody = (await csrfResponse.json()) as { data: { token: string } };

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfBody.data.token,
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) throw new Error('LOGIN_FAILED');
}

export async function getCurrentUser(): Promise<{ userId: string; loginId: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('UNAUTHENTICATED');
  const body = (await response.json()) as { data: { userId: string; loginId: string } };
  return body.data;
}
