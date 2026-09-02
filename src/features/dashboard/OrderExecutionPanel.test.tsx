import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderExecutionPanel } from './OrderExecutionPanel';

vi.mock('./api', () => ({
  executeOrder: vi.fn(),
}));

import { executeOrder } from './api';

describe('OrderExecutionPanel', () => {
  it('requires an explicit confirmation before sending an order request', async () => {
    const user = userEvent.setup();
    render(<OrderExecutionPanel />);

    await user.type(screen.getByLabelText('주문 종목 코드'), 'AAPL');
    await user.type(screen.getByLabelText('주문 수량'), '1');
    await user.click(screen.getByRole('button', { name: '주문 실행' }));

    expect(screen.getByRole('alert')).toHaveTextContent('실제 주문임을 확인해야 합니다.');
    expect(executeOrder).not.toHaveBeenCalled();
  });

  it('sends a confirmed order and shows the returned order id', async () => {
    const user = userEvent.setup();
    vi.mocked(executeOrder).mockResolvedValueOnce({ orderId: 'order-1', clientOrderId: 'client-1' });
    render(<OrderExecutionPanel />);

    await user.type(screen.getByLabelText('주문 종목 코드'), 'AAPL');
    await user.type(screen.getByLabelText('주문 수량'), '1');
    await user.click(screen.getByLabelText('실제 주문 확인'));
    await user.click(screen.getByRole('button', { name: '주문 실행' }));

    expect(executeOrder).toHaveBeenCalledWith({
      symbol: 'AAPL', currency: 'KRW', orderType: 'MARKET', price: '', quantity: '1', confirmed: true,
    });
    expect(await screen.findByText('주문 요청을 전송했습니다. 주문번호: order-1')).toBeInTheDocument();
  });
});
