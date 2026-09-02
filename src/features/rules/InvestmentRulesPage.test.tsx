import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvestmentRulesPage } from './InvestmentRulesPage';

vi.mock('./api', () => ({
  getInvestmentRules: vi.fn(),
  updateInvestmentRules: vi.fn(),
}));

import { getInvestmentRules, updateInvestmentRules } from './api';

const savedRules = {
  minCashRatio: '0.20', maxSingleAssetRatio: '0.20', maxLeverageAssetRatio: '0.10',
  stopLossRatio: '0.15', additionalBuyRatio: '0.07', updatedAt: '2026-09-02T10:00:00Z',
};

describe('InvestmentRulesPage', () => {
  it('loads saved ratios as percentage inputs', async () => {
    vi.mocked(getInvestmentRules).mockResolvedValueOnce(savedRules);

    render(<InvestmentRulesPage onBack={vi.fn()} />);

    expect(await screen.findByLabelText('현금 최소 비중')).toHaveValue(20);
    expect(screen.getByLabelText('레버리지 ETF 최대 비중')).toHaveValue(10);
    expect(screen.getByText(/자동매매는 실행하지 않고, 매수 전 판단 기준으로만 사용합니다/)).toBeInTheDocument();
  });

  it('converts percentage inputs to ratios before saving', async () => {
    const user = userEvent.setup();
    vi.mocked(getInvestmentRules).mockResolvedValueOnce(savedRules);
    vi.mocked(updateInvestmentRules).mockResolvedValueOnce({ ...savedRules, minCashRatio: '0.25' });

    render(<InvestmentRulesPage onBack={vi.fn()} />);
    await screen.findByLabelText('현금 최소 비중');
    await user.clear(screen.getByLabelText('현금 최소 비중'));
    await user.type(screen.getByLabelText('현금 최소 비중'), '25');
    await user.click(screen.getByRole('button', { name: '규칙 저장' }));

    expect(updateInvestmentRules).toHaveBeenCalledWith({
      minCashRatio: '0.25', maxSingleAssetRatio: '0.20', maxLeverageAssetRatio: '0.10',
      stopLossRatio: '0.15', additionalBuyRatio: '0.07',
    });
    expect(await screen.findByText('투자 규칙을 저장했습니다.')).toBeInTheDocument();
  });

  it('shows a load error and lets the user return', async () => {
    const onBack = vi.fn();
    vi.mocked(getInvestmentRules).mockRejectedValueOnce(new Error('offline'));

    render(<InvestmentRulesPage onBack={onBack} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('투자 규칙을 불러오지 못했습니다.');
    await userEvent.click(screen.getByRole('button', { name: '대시보드로 돌아가기' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
