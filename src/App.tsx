import { useState } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { login } from './features/auth/api';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { InvestmentRulesPage } from './features/rules/InvestmentRulesPage';
import { InvestmentJournalPage } from './features/journal/InvestmentJournalPage';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'dashboard' | 'rules' | 'journal'>('dashboard');

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

  if (view === 'rules') return <InvestmentRulesPage onBack={() => setView('dashboard')} />;
  if (view === 'journal') return <InvestmentJournalPage onBack={() => setView('dashboard')} />;
  return <DashboardPage onOpenRules={() => setView('rules')} onOpenJournal={() => setView('journal')} />;
}
