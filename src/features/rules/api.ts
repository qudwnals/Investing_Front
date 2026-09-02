const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export type InvestmentRules = {
  minCashRatio: string;
  maxSingleAssetRatio: string;
  maxLeverageAssetRatio: string;
  stopLossRatio: string;
  additionalBuyRatio: string;
  updatedAt: string;
};

type ApiEnvelope<T> = { data: T };

export async function getInvestmentRules(): Promise<InvestmentRules> {
  return request<InvestmentRules>('/api/v1/investment-rules', { credentials: 'include' });
}

export async function updateInvestmentRules(
  rules: Omit<InvestmentRules, 'updatedAt'>,
): Promise<InvestmentRules> {
  const csrfResponse = await fetch(`${API_BASE_URL}/api/v1/auth/csrf`, { credentials: 'include' });
  if (!csrfResponse.ok) throw new Error(`CSRF_FAILED_${csrfResponse.status}`);
  const csrfBody = await csrfResponse.json() as { data: { token: string } };

  return request<InvestmentRules>('/api/v1/investment-rules', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': csrfBody.data.token },
    body: JSON.stringify(rules),
  });
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) throw new Error(`INVESTMENT_RULES_REQUEST_FAILED_${response.status}`);
  const body = await response.json() as ApiEnvelope<T>;
  return body.data;
}
