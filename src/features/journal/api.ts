const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export type JournalEntry = {
  id: string;
  writtenAt: string;
  symbol: string | null;
  decision: string;
  reason: string | null;
  emotion: string | null;
  memo: string;
};

export type JournalEntryInput = {
  symbol: string;
  decision: string;
  reason: string;
  emotion: string;
  memo: string;
};

export async function getJournalEntries(): Promise<JournalEntry[]> {
  return request<JournalEntry[]>('/api/v1/investment-journals', { credentials: 'include' });
}

export async function createJournalEntry(input: JournalEntryInput): Promise<JournalEntry> {
  const csrfResponse = await fetch(`${API_BASE_URL}/api/v1/auth/csrf`, { credentials: 'include' });
  if (!csrfResponse.ok) throw new Error(`CSRF_FAILED_${csrfResponse.status}`);
  const csrfBody = await csrfResponse.json() as { data: { token: string } };

  return request<JournalEntry>('/api/v1/investment-journals', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': csrfBody.data.token },
    body: JSON.stringify(input),
  });
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) throw new Error(`JOURNAL_REQUEST_FAILED_${response.status}`);
  const body = await response.json() as { data: T };
  return body.data;
}
