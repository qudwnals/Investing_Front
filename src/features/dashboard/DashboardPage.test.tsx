import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  it('shows a calm portfolio overview and a connection state without fake numbers', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: '오늘의 투자 현황' })).toBeInTheDocument();
    expect(screen.getByText('토스증권 계좌를 연결하면 자산 요약이 표시됩니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '계좌 동기화' })).toBeInTheDocument();
    expect(screen.queryByText(/₩|\$/)).not.toBeInTheDocument();
  });

  it('shows a sync error without inventing portfolio values', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    render(<DashboardPage />);

    await userEvent.click(screen.getByRole('button', { name: '계좌 동기화' }));

    expect(await screen.findByText('계좌 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    vi.restoreAllMocks();
  });

  it('switches between light and dark themes and remembers the choice', async () => {
    localStorage.clear();
    render(<DashboardPage />);

    await userEvent.click(screen.getByRole('button', { name: '다크 모드로 전환' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('investment-manager-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: '라이트 모드로 전환' })).toBeInTheDocument();
  });

  it('opens the investment rules view from the sidebar', async () => {
    const onOpenRules = vi.fn();
    render(<DashboardPage onOpenRules={onOpenRules} />);

    await userEvent.click(screen.getByRole('button', { name: '투자 규칙' }));

    expect(onOpenRules).toHaveBeenCalledOnce();
  });
});
