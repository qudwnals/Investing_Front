import { getPortfolioSnapshot, getPortfolioSummary, simulateInvestment, syncTossData } from './api';

describe('dashboard api', () => {
  it('loads account, holdings, and KRW buying power from the backend', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { result: [{ accountSeq: 7 }] } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { result: { items: [] } } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { result: { currency: 'KRW', cashBuyingPower: '5000000' } } }), { status: 200 }));

    const snapshot = await getPortfolioSnapshot();

    expect(snapshot.accounts[0].accountSeq).toBe(7);
    expect(snapshot.buyingPower.cashBuyingPower).toBe('5000000');
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8080/api/v1/toss/accounts', { credentials: 'include' });
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/v1/toss/holdings', { credentials: 'include' });
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'http://localhost:8080/api/v1/toss/buying-power?currency=KRW', { credentials: 'include' });

    fetchMock.mockRestore();
  });
});

describe('portfolio summary api', () => {
  it('syncs Toss data and reads the currency-aware portfolio summary', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { token: 'csrf-token' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { syncedAt: '2026-09-02T10:00:00Z' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: {
        krw: { currency: 'KRW', marketValue: '140000', cash: '1000000', totalValue: '1140000', profitLoss: '10000', profitLossRate: '0.0769' },
        usd: { currency: 'USD', marketValue: '1785', cash: '250.50', totalValue: '2035.50', profitLoss: '232', profitLossRate: '0.1494' },
        exchangeRate: '1380.5', totalKrw: '3950007.75', totalProfitLossKrw: '330276', asOf: '2026-09-02T10:00:00Z',
      } }), { status: 200 }));

    await syncTossData();
    const summary = await getPortfolioSummary();

    expect(summary.totalKrw).toBe('3950007.75');
    expect(summary.krw.cash).toBe('1000000');
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8080/api/v1/auth/csrf', { credentials: 'include' });
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/v1/toss/sync', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': 'csrf-token' }, body: '{}',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'http://localhost:8080/api/v1/portfolio/summary', { credentials: 'include' });

    fetchMock.mockRestore();
  });
});

describe('investment simulation api', () => {
  it('gets csrf before requesting a simulation preview', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { token: 'csrf-token' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: {
        symbol: 'AAPL', currency: 'USD', amount: '500', currentPrice: '155',
        estimatedQuantity: '3.2258064516', violations: [], withinRules: true,
      } }), { status: 200 }));

    const result = await simulateInvestment({ symbol: 'AAPL', currency: 'USD', amount: '500' });

    expect(result.estimatedQuantity).toBe('3.2258064516');
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8080/api/v1/auth/csrf', { credentials: 'include' });
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/v1/portfolio/simulations', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': 'csrf-token' },
      body: JSON.stringify({ symbol: 'AAPL', currency: 'USD', amount: '500' }),
    });
    fetchMock.mockRestore();
  });
});
