import { login } from './api';

describe('auth api', () => {
  it('gets a CSRF token before posting login credentials', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { token: 'csrf-token' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    await login({ loginId: 'owner', password: 'secret' });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8080/api/v1/auth/csrf',
      { credentials: 'include' },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8080/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf-token' }),
      }),
    );
  });
});
