import { getInvestmentRules, updateInvestmentRules } from './api';

describe('investment rules api', () => {
  it('loads the saved investment rules', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: {
        minCashRatio: '0.20', maxSingleAssetRatio: '0.20', maxLeverageAssetRatio: '0.10',
        stopLossRatio: '0.15', additionalBuyRatio: '0.07', updatedAt: '2026-09-02T10:00:00Z',
      } }), { status: 200 }),
    );

    const rules = await getInvestmentRules();

    expect(rules.minCashRatio).toBe('0.20');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/investment-rules', { credentials: 'include' },
    );
    fetchMock.mockRestore();
  });

  it('gets csrf before saving updated rules', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { token: 'csrf-token' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: {
        minCashRatio: '0.25', maxSingleAssetRatio: '0.18', maxLeverageAssetRatio: '0.08',
        stopLossRatio: '0.12', additionalBuyRatio: '0.06', updatedAt: '2026-09-02T10:00:00Z',
      } }), { status: 200 }));

    await updateInvestmentRules({
      minCashRatio: '0.25', maxSingleAssetRatio: '0.18', maxLeverageAssetRatio: '0.08',
      stopLossRatio: '0.12', additionalBuyRatio: '0.06',
    });

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8080/api/v1/auth/csrf', { credentials: 'include' });
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/v1/investment-rules', {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': 'csrf-token' },
      body: JSON.stringify({
        minCashRatio: '0.25', maxSingleAssetRatio: '0.18', maxLeverageAssetRatio: '0.08',
        stopLossRatio: '0.12', additionalBuyRatio: '0.06',
      }),
    });
    fetchMock.mockRestore();
  });
});
