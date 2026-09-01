import { useState } from 'react';
import { getPortfolioSnapshot, type PortfolioSnapshot } from './api';

const navigation = ['대시보드', '보유 자산', '시장 보기', '투자 규칙', '투자 일지'];

export function DashboardPage() {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  async function handleSync() {
    setIsSyncing(true);
    setSyncError(false);
    try {
      setSnapshot(await getPortfolioSnapshot());
    } catch {
      setSyncError(true);
    } finally {
      setIsSyncing(false);
    }
  }

  const isConnected = snapshot !== null;
  const marketValue = snapshot?.holdings.marketValue?.amount?.krw;
  const profitLoss = snapshot?.holdings.profitLoss?.amount?.krw;
  const profitLossRate = snapshot?.holdings.profitLoss?.rate;
  const cash = snapshot?.buyingPower.cashBuyingPower;

  return (
    <main className="dashboard-shell">
      <aside className="sidebar" aria-label="주요 메뉴">
        <div className="brand-mark">PM</div>
        <div>
          <p className="eyebrow">PRIVATE INVESTMENT DESK</p>
          <p className="brand-name">투자 관리</p>
        </div>
        <nav>
          {navigation.map((item, index) => (
            <button className={index === 0 ? 'nav-item active' : 'nav-item'} key={item} type="button">
              <span className="nav-dot" aria-hidden="true" />
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <span>개인 전용 공간</span>
        </div>
      </aside>

      <section className="dashboard-content" aria-labelledby="dashboard-title">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">TUESDAY, SEPTEMBER 1</p>
            <h1 id="dashboard-title">오늘의 투자 현황</h1>
            <p className="dashboard-subtitle">필요한 정보만 조용히 모아두었습니다.</p>
          </div>
          <button className="sync-button" type="button" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? '동기화 중…' : '계좌 동기화'}
          </button>
        </header>

        <section className="connection-banner" aria-label="계좌 연결 상태">
          <div className="connection-icon" aria-hidden="true">↗</div>
          <div>
            <h2>{isConnected ? '토스증권 계좌가 연결되었습니다' : '아직 연결된 계좌가 없습니다'}</h2>
            <p>{syncError ? '계좌 정보를 불러오지 못했습니다.' : isConnected ? '가장 최근 조회 기준으로 표시합니다.' : '토스증권 계좌를 연결하면 자산 요약이 표시됩니다.'}</p>
          </div>
          <span className="connection-status">{isConnected ? '동기화 완료' : syncError ? '확인 필요' : '연결 대기'}</span>
        </section>

        <section className="metric-grid" aria-label="포트폴리오 요약">
          <MetricCard label="총 평가금액" value={formatKrw(marketValue)} note={isConnected ? '토스증권 조회 기준' : '계좌 연결 후 표시'} />
          <MetricCard label="평가손익" value={formatKrw(profitLoss)} note={profitLossRate ? `수익률 ${formatRate(profitLossRate)}` : '실시간 기준'} />
          <MetricCard label="현금 비중" value={formatCashRatio(cash, marketValue)} note="투자 규칙과 비교" />
        </section>

        <section className="lower-grid">
          <article className="panel empty-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">PORTFOLIO</p>
                <h2>보유 자산</h2>
              </div>
              <span className="panel-link">—</span>
            </div>
            {snapshot?.holdings.items?.length ? (
              <ul className="holding-list">
                {snapshot.holdings.items.slice(0, 5).map((holding) => (
                  <li key={holding.symbol}>
                    <span><strong>{holding.name}</strong><small>{holding.symbol}</small></span>
                    <span className="holding-value">{formatNumber(holding.marketValue?.amount)} {holding.currency}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="empty-copy">계좌를 연결하면 보유종목과 비중을 확인할 수 있습니다.</p>}
          </article>

          <article className="panel empty-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">JOURNAL</p>
                <h2>최근 투자 일지</h2>
              </div>
              <span className="panel-link">—</span>
            </div>
            <p className="empty-copy">첫 번째 투자 판단을 기록해보세요.</p>
          </article>
        </section>
      </section>
    </main>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  );
}

function formatKrw(value?: string) {
  if (!value) return '—';
  return `${formatNumber(value)}원`;
}

function formatNumber(value?: string) {
  if (!value) return '—';
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(number) : '—';
}

function formatRate(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? `${(number * 100).toFixed(2)}%` : '—';
}

function formatCashRatio(cash?: string, marketValue?: string) {
  if (!cash || !marketValue) return '—';
  const cashNumber = Number(cash);
  const totalNumber = cashNumber + Number(marketValue);
  return Number.isFinite(cashNumber) && totalNumber > 0 ? `${((cashNumber / totalNumber) * 100).toFixed(1)}%` : '—';
}
