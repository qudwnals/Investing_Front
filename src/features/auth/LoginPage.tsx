import { FormEvent, useState } from 'react';

export type LoginCredentials = {
  loginId: string;
  password: string;
};

type LoginPageProps = {
  onSubmit: (credentials: LoginCredentials) => Promise<void> | void;
};

export function LoginPage({ onSubmit }: LoginPageProps) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: string[] = [];

    if (!loginId.trim()) nextErrors.push('로그인 아이디를 입력하세요.');
    if (!password) nextErrors.push('비밀번호를 입력하세요.');

    if (nextErrors.length > 0) {
      setError(nextErrors.join(' '));
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ loginId: loginId.trim(), password });
    } catch {
      setError('로그인에 실패했습니다. 입력 정보를 확인하세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">PRIVATE INVESTMENT DESK</p>
        <h1 id="login-title">개인 투자 관리</h1>
        <p className="auth-description">등록된 사용자만 안전하게 접근할 수 있습니다.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-id">로그인 아이디</label>
          <input
            id="login-id"
            name="loginId"
            autoComplete="username"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
          />

          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '확인 중…' : '로그인'}
          </button>
        </form>
      </section>
    </main>
  );
}
