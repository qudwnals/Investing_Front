import { useState } from 'react';
import { executeOrder, type OrderExecutionRequest, type OrderExecutionResponse } from './api';

const initialForm: OrderExecutionRequest = {
  symbol: '', currency: 'KRW', orderType: 'MARKET', price: '', quantity: '', confirmed: false,
};

export function OrderExecutionPanel() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<OrderExecutionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError(null);
    if (!form.symbol.trim() || !form.quantity || Number(form.quantity) <= 0) {
      setError('주문 종목 코드와 0보다 큰 수량을 입력하세요.');
      return;
    }
    if (!form.confirmed) {
      setError('실제 주문임을 확인해야 합니다.');
      return;
    }
    if (form.orderType === 'LIMIT' && (!form.price || Number(form.price) <= 0)) {
      setError('지정가 주문에는 0보다 큰 가격이 필요합니다.');
      return;
    }
    setIsLoading(true);
    try {
      setResult(await executeOrder({ ...form, symbol: form.symbol.trim().toUpperCase() }));
    } catch {
      setError('주문을 전송하지 못했습니다. 현재 실제 주문 기능이 잠겨 있을 수 있습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="order-panel panel" aria-labelledby="order-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">MANUAL ORDER</p>
          <h2 id="order-title">사용자 승인 주문</h2>
        </div>
        <span className="panel-note">기본 잠금</span>
      </div>
      <p className="order-warning">실제 거래 기능입니다. 현재는 서버 설정상 잠겨 있으며, 자동매매·조건주문은 지원하지 않습니다.</p>
      <form className="order-form" onSubmit={handleSubmit}>
        <label>종목 코드<input aria-label="주문 종목 코드" value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value })} placeholder="예: AAPL" /></label>
        <label>통화<select aria-label="주문 통화" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value as 'KRW' | 'USD' })}><option value="KRW">KRW 원화</option><option value="USD">USD 달러</option></select></label>
        <label>주문 유형<select aria-label="주문 유형" value={form.orderType} onChange={(event) => setForm({ ...form, orderType: event.target.value as 'LIMIT' | 'MARKET' })}><option value="MARKET">시장가</option><option value="LIMIT">지정가</option></select></label>
        <label>수량<input aria-label="주문 수량" type="number" min="0" step="any" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label>
        {form.orderType === 'LIMIT' && <label>가격<input aria-label="주문 가격" type="number" min="0" step="any" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>}
        <label className="order-confirm"><input aria-label="실제 주문 확인" type="checkbox" checked={form.confirmed} onChange={(event) => setForm({ ...form, confirmed: event.target.checked })} /> 실제 주문임을 확인합니다.</label>
        <button type="submit" disabled={isLoading}>{isLoading ? '전송 중…' : '주문 실행'}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {result && <p className="form-success" role="status">주문 요청을 전송했습니다. 주문번호: {result.orderId}</p>}
    </section>
  );
}
