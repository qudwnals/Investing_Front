import { useState } from 'react';
import { simulateInvestment, type InvestmentSimulationResponse } from './api';

export function InvestmentSimulationPanel() {
  const [symbol, setSymbol] = useState('');
  const [currency, setCurrency] = useState<'KRW' | 'USD'>('KRW');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<InvestmentSimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!symbol.trim() || !amount || Number(amount) <= 0) {
      setError('종목 코드와 0보다 큰 매수 금액을 입력하세요.');
      return;
    }
    setIsLoading(true);
    try {
      setResult(await simulateInvestment({ symbol: symbol.trim().toUpperCase(), currency, amount }));
    } catch {
      setError('매수 시뮬레이션을 계산하지 못했습니다. 계좌를 먼저 동기화해주세요.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="simulation-panel panel" aria-labelledby="simulation-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">BUYING CHECK</p>
          <h2 id="simulation-title">매수 전 시뮬레이션</h2>
        </div>
        <span className="panel-note">주문 없이 미리 계산</span>
      </div>
      <p className="simulation-help">현재가 기준 예상 수량과 매수 후 현금·비중을 확인합니다. 실제 주문은 이 화면에서 실행하지 않습니다.</p>
      <form className="simulation-form" onSubmit={handleSubmit}>
        <label>
          종목 코드
          <input aria-label="종목 코드" value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="예: AAPL" />
        </label>
        <label>
          통화
          <select aria-label="통화" value={currency} onChange={(event) => setCurrency(event.target.value as 'KRW' | 'USD')}>
            <option value="KRW">KRW 원화</option>
            <option value="USD">USD 달러</option>
          </select>
        </label>
        <label>
          매수 금액
          <input aria-label="매수 금액" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" />
        </label>
        <button type="submit" disabled={isLoading}>{isLoading ? '계산 중…' : '매수 시뮬레이션'}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {result && <SimulationResult result={result} />}
    </section>
  );
}

function SimulationResult({ result }: { result: InvestmentSimulationResponse }) {
  return (
    <div className={result.withinRules ? 'simulation-result safe' : 'simulation-result warning'}>
      <div className="simulation-result-heading">
        <strong>{result.withinRules ? '규칙 기준에 맞습니다.' : '규칙 확인이 필요합니다.'}</strong>
        <span>{result.symbol} · {result.currency}</span>
      </div>
      <div className="simulation-metrics">
        <span>현재가 <b>{result.currentPrice}</b></span>
        <span>예상 수량 <b>{result.estimatedQuantity}</b></span>
        <span>매수 후 현금 <b>{result.afterCash}</b></span>
        <span>매수 후 비중 <b>{formatRatio(result.afterAssetRatio)}</b></span>
      </div>
      {!result.withinRules && <ul className="violation-list">{result.violations.map((violation) => <li key={violation}>{violation}</li>)}</ul>}
    </div>
  );
}

function formatRatio(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? `${(number * 100).toFixed(1)}%` : '—';
}
