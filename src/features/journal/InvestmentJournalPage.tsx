import { useEffect, useState } from 'react';
import { createJournalEntry, getJournalEntries, type JournalEntry, type JournalEntryInput } from './api';

type InvestmentJournalPageProps = { onBack: () => void };

const initialForm: JournalEntryInput = { symbol: '', decision: 'BUY', reason: '', emotion: '', memo: '' };

export function InvestmentJournalPage({ onBack }: InvestmentJournalPageProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [form, setForm] = useState<JournalEntryInput>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJournalEntries()
      .then((loaded) => { if (active) setEntries(loaded); })
      .catch(() => { if (active) setError('투자 일지를 불러오지 못했습니다.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!form.memo.trim()) {
      setError('메모를 입력하세요.');
      return;
    }
    setIsSaving(true);
    try {
      const created = await createJournalEntry({ ...form, symbol: form.symbol.trim().toUpperCase() });
      setEntries((current) => [created, ...current]);
      setForm(initialForm);
      setMessage('투자 일지를 저장했습니다.');
    } catch {
      setError('투자 일지를 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="journal-shell">
      <section className="journal-content" aria-labelledby="journal-title">
        <header className="journal-header">
          <div>
            <p className="eyebrow">INVESTMENT JOURNAL</p>
            <h1 id="journal-title">투자 일지</h1>
            <p className="dashboard-subtitle">매매 결과보다 판단의 과정을 기록해두면, 다음 결정을 더 선명하게 돌아볼 수 있습니다.</p>
          </div>
          <button className="back-button" type="button" onClick={onBack}>대시보드로 돌아가기</button>
        </header>

        <section className="journal-layout">
          <section className="journal-card panel" aria-labelledby="journal-form-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">NEW ENTRY</p>
                <h2 id="journal-form-title">판단 기록하기</h2>
              </div>
            </div>
            <form className="journal-form" onSubmit={handleSubmit}>
              <label>종목 코드<input aria-label="종목 코드" value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value })} placeholder="선택 입력" /></label>
              <label>판단<select aria-label="판단" value={form.decision} onChange={(event) => setForm({ ...form, decision: event.target.value })}>
                <option value="BUY">매수</option><option value="HOLD">보유</option><option value="SELL">매도</option><option value="REVIEW">검토</option>
              </select></label>
              <label>판단 이유<input aria-label="판단 이유" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="왜 이 판단을 했나요?" /></label>
              <label>감정 상태<input aria-label="감정 상태" value={form.emotion} onChange={(event) => setForm({ ...form, emotion: event.target.value })} placeholder="예: 차분함" /></label>
              <label className="journal-memo-field">메모<textarea aria-label="메모" value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} placeholder="시장 상황과 나의 생각을 적어보세요." /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              {message && <p className="form-success" role="status">{message}</p>}
              <button type="submit" disabled={isSaving}>{isSaving ? '저장 중…' : '일지 저장'}</button>
            </form>
          </section>

          <section className="journal-card panel" aria-labelledby="recent-journal-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">RECENT NOTES</p>
                <h2 id="recent-journal-title">최근 기록</h2>
              </div>
              <span className="panel-note">{entries.length}개</span>
            </div>
            {isLoading ? <p className="empty-copy">기록을 불러오는 중입니다…</p> : entries.length === 0 ? <p className="empty-copy">아직 기록된 투자 일지가 없습니다.</p> : (
              <ul className="journal-list">{entries.map((entry) => <JournalListItem entry={entry} key={entry.id} />)}</ul>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}

function JournalListItem({ entry }: { entry: JournalEntry }) {
  return <li className="journal-list-item">
    <div className="journal-list-meta"><strong>{entry.symbol ? `${entry.symbol} · ${entry.decision}` : entry.decision}</strong><span>{formatDate(entry.writtenAt)}</span></div>
    <p>{entry.memo}</p>
    {(entry.reason || entry.emotion) && <small>{[entry.reason, entry.emotion].filter(Boolean).join(' · ')}</small>}
  </li>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(date);
}
