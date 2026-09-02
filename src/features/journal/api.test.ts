import { createJournalEntry, getJournalEntries } from './api';

describe('investment journal api', () => {
  it('loads recent journal entries', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [{ id: 'journal-1', decision: 'BUY', memo: '분할 매수' }] }), { status: 200 }),
    );

    const entries = await getJournalEntries();

    expect(entries[0].decision).toBe('BUY');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/v1/investment-journals', { credentials: 'include' });
    fetchMock.mockRestore();
  });

  it('gets csrf before creating a journal entry', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { token: 'csrf-token' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { id: 'journal-1', decision: 'BUY', memo: '분할 매수' } }), { status: 200 }));
    const input = { symbol: 'AAPL', decision: 'BUY', reason: '장기 보유', emotion: '차분함', memo: '분할 매수' };

    await createJournalEntry(input);

    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/v1/investment-journals', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': 'csrf-token' },
      body: JSON.stringify(input),
    });
    fetchMock.mockRestore();
  });
});
