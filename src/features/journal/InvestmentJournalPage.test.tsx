import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvestmentJournalPage } from './InvestmentJournalPage';

vi.mock('./api', () => ({
  getJournalEntries: vi.fn(),
  createJournalEntry: vi.fn(),
}));

import { createJournalEntry, getJournalEntries } from './api';

const entry = {
  id: 'journal-1', writtenAt: '2026-09-02T10:00:00Z', symbol: 'AAPL', decision: 'BUY',
  reason: '장기 보유', emotion: '차분함', memo: '실적 발표 전 분할 매수',
};

describe('InvestmentJournalPage', () => {
  it('loads recent journal entries', async () => {
    vi.mocked(getJournalEntries).mockResolvedValueOnce([entry]);

    render(<InvestmentJournalPage onBack={vi.fn()} />);

    expect(await screen.findByText('실적 발표 전 분할 매수')).toBeInTheDocument();
    expect(screen.getByText('AAPL · BUY')).toBeInTheDocument();
  });

  it('creates a journal entry from the form', async () => {
    const user = userEvent.setup();
    vi.mocked(getJournalEntries).mockResolvedValueOnce([]);
    vi.mocked(createJournalEntry).mockResolvedValueOnce(entry);

    render(<InvestmentJournalPage onBack={vi.fn()} />);
    await screen.findByText('아직 기록된 투자 일지가 없습니다.');
    await user.type(screen.getByLabelText('종목 코드'), 'AAPL');
    await user.selectOptions(screen.getByLabelText('판단'), 'BUY');
    await user.type(screen.getByLabelText('판단 이유'), '장기 보유');
    await user.type(screen.getByLabelText('감정 상태'), '차분함');
    await user.type(screen.getByLabelText('메모'), '실적 발표 전 분할 매수');
    await user.click(screen.getByRole('button', { name: '일지 저장' }));

    expect(createJournalEntry).toHaveBeenCalledWith({
      symbol: 'AAPL', decision: 'BUY', reason: '장기 보유', emotion: '차분함', memo: '실적 발표 전 분할 매수',
    });
    expect(await screen.findByText('투자 일지를 저장했습니다.')).toBeInTheDocument();
  });

  it('shows a load error and supports returning to the dashboard', async () => {
    const onBack = vi.fn();
    vi.mocked(getJournalEntries).mockRejectedValueOnce(new Error('offline'));

    render(<InvestmentJournalPage onBack={onBack} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('투자 일지를 불러오지 못했습니다.');
    await userEvent.click(screen.getByRole('button', { name: '대시보드로 돌아가기' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
