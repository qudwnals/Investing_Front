import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvestmentSimulationPanel } from './InvestmentSimulationPanel';

vi.mock('./api', () => ({
  simulateInvestment: vi.fn(),
}));

import { simulateInvestment } from './api';

describe('InvestmentSimulationPanel', () => {
  it('submits a native-currency amount and shows a safe preview', async () => {
    const user = userEvent.setup();
    vi.mocked(simulateInvestment).mockResolvedValueOnce({
      symbol: 'AAPL', currency: 'USD', amount: '500', currentPrice: '155',
      estimatedQuantity: '3.2258064516', beforeCash: '1000', afterCash: '500',
      beforeAssetRatio: '0.31', afterAssetRatio: '0.6183', violations: [],
      withinRules: true, simulatedAt: '2026-09-02T10:00:00Z',
    });

    render(<InvestmentSimulationPanel />);
    await user.type(screen.getByLabelText('종목 코드'), 'AAPL');
    await user.selectOptions(screen.getByLabelText('통화'), 'USD');
    await user.type(screen.getByLabelText('매수 금액'), '500');
    await user.click(screen.getByRole('button', { name: '매수 시뮬레이션' }));

    expect(simulateInvestment).toHaveBeenCalledWith({ symbol: 'AAPL', currency: 'USD', amount: '500' });
    expect(await screen.findByText('규칙 기준에 맞습니다.')).toBeInTheDocument();
    expect(screen.getAllByText(/예상 수량/).some((element) => element.textContent?.includes('3.2258064516'))).toBe(true);
  });

  it('shows rule violations returned by the backend', async () => {
    const user = userEvent.setup();
    vi.mocked(simulateInvestment).mockResolvedValueOnce({
      symbol: 'TSLL', currency: 'USD', amount: '1200', currentPrice: '20',
      estimatedQuantity: '60', beforeCash: '1000', afterCash: '-200',
      beforeAssetRatio: '0.31', afterAssetRatio: '1.15',
      violations: ['주문 가능 현금을 초과합니다.', '현금 비중이 최소 기준 미만입니다.'],
      withinRules: false, simulatedAt: '2026-09-02T10:00:00Z',
    });

    render(<InvestmentSimulationPanel />);
    await user.type(screen.getByLabelText('종목 코드'), 'TSLL');
    await user.type(screen.getByLabelText('매수 금액'), '1200');
    await user.click(screen.getByRole('button', { name: '매수 시뮬레이션' }));

    expect(await screen.findByText('규칙 확인이 필요합니다.')).toBeInTheDocument();
    expect(screen.getByText('주문 가능 현금을 초과합니다.')).toBeInTheDocument();
  });
});
