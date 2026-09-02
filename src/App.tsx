import { useState } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { login } from './features/auth/api';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { InvestmentRulesPage } from './features/rules/InvestmentRulesPage';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'dashboard' | 'rules'>('dashboard');

  if (!isAuthenticated) {
    return (
      <LoginPage
        onSubmit={async (credentials) => {
          await login(credentials);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return view === 'rules'
    ? <InvestmentRulesPage onBack={() => setView('dashboard')} />
    : <DashboardPage onOpenRules={() => setView('rules')} />;
}
