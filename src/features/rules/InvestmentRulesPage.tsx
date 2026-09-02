import { useEffect, useState } from 'react';
import { getInvestmentRules, updateInvestmentRules, type InvestmentRules } from './api';

type InvestmentRulesPageProps = { onBack: () => void };
type RuleForm = Omit<InvestmentRules, 'updatedAt'>;

const fields: Array<{ key: keyof RuleForm; label: string; description: string }> = [
  { key: 'minCashRatio', label: '현금 최소 비중', description: '예상치 못한 하락에 대비해 남겨둘 현금 기준' },
  { key: 'maxSingleAssetRatio', label: '개별 종목 최대 비중', description: '한 종목에 집중되지 않도록 하는 상한' },
  { key: 'maxLeverageAssetRatio', label: '레버리지 ETF 최대 비중', description: '변동성이 큰 레버리지 상품의 상한' },
  { key: 'stopLossRatio', label: '손절 검토 기준', description: '손실이 이 수준에 도달하면 재검토' },
  { key: 'additionalBuyRatio', label: '추가매수 검토 기준', description: '하락 시 추가매수를 검토할 기준' },
];

export function InvestmentRulesPage({ onBack }: InvestmentRulesPageProps) {
  const [form, setForm] = useState<RuleForm>({
    minCashRatio: '', maxSingleAssetRatio: '', maxLeverageAssetRatio: '',
    stopLossRatio: '', additionalBuyRatio: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getInvestmentRules()
      .then((rules) => {
        if (active) setForm(toPercentForm(rules));
      })
      .catch(() => {
        if (active) setError('투자 규칙을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (Object.values(form).some((value) => !isPercentage(value))) {
      setError('각 항목을 0에서 100 사이의 숫자로 입력하세요.');
      return;
    }
    setIsSaving(true);
    try {
      const saved = await updateInvestmentRules(toRatioForm(form));
      setForm(toPercentForm(saved));
      setMessage('투자 규칙을 저장했습니다.');
    } catch {
      setError('투자 규칙을 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="rules-shell">
      <section className="rules-content" aria-labelledby="rules-title">
        <header className="rules-header">
          <div>
            <p className="eyebrow">PERSONAL INVESTMENT RULES</p>
            <h1 id="rules-title">나의 투자 규칙</h1>
            <p className="dashboard-subtitle">매수 전 판단을 돕는 기준을 정하고, 포트폴리오를 같은 기준으로 바라봅니다.</p>
          </div>
          <button className="back-button" type="button" onClick={onBack}>대시보드로 돌아가기</button>
        </header>

        <section className="rules-card panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">RISK GUARDRAILS</p>
              <h2>비중과 검토 기준</h2>
            </div>
            <span className="panel-note">모든 값은 % 기준</span>
          </div>
          <p className="rules-help">이 기준은 경고와 매수 시뮬레이션에 사용됩니다. 자동매매는 실행하지 않고, 매수 전 판단 기준으로만 사용합니다.</p>

          {isLoading ? <p className="empty-copy">저장된 규칙을 불러오는 중입니다…</p> : (
            <form onSubmit={handleSubmit}>
              <div className="rules-form-grid">
                {fields.map((field) => (
                  <label className="rule-field" key={field.key}>
                    <span>{field.label}</span>
                    <small>{field.description}</small>
                    <div className="percentage-input">
                      <input
                        aria-label={field.label}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={form[field.key]}
                        onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                      />
                      <b>%</b>
                    </div>
                  </label>
                ))}
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              {message && <p className="form-success" role="status">{message}</p>}
              <button type="submit" disabled={isSaving}>{isSaving ? '저장 중…' : '규칙 저장'}</button>
            </form>
          )}
          {!isLoading && error && !form.minCashRatio && <p className="rules-retry">화면을 새로고침해 다시 시도해주세요.</p>}
        </section>
      </section>
    </main>
  );
}

function toPercentForm(rules: InvestmentRules): RuleForm {
  return {
    minCashRatio: toPercent(rules.minCashRatio),
    maxSingleAssetRatio: toPercent(rules.maxSingleAssetRatio),
    maxLeverageAssetRatio: toPercent(rules.maxLeverageAssetRatio),
    stopLossRatio: toPercent(rules.stopLossRatio),
    additionalBuyRatio: toPercent(rules.additionalBuyRatio),
  };
}

function toRatioForm(form: RuleForm): RuleForm {
  return Object.fromEntries(Object.entries(form).map(([key, value]) => [key, toRatio(value)])) as RuleForm;
}

function toPercent(value: string) {
  return String(Number((Number(value) * 100).toFixed(4)));
}

function toRatio(value: string) {
  const fixed = (Number(value) / 100).toFixed(5).replace(/0+$/, '').replace(/\.$/, '');
  return fixed.includes('.') && fixed.split('.')[1].length === 1 ? `${fixed}0` : fixed;
}

function isPercentage(value: string) {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) && number >= 0 && number <= 100;
}
