import { getPortfolioSnapshot } from './api';

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
