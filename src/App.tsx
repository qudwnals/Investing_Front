import { useState } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { login } from './features/auth/api';
import { DashboardPage } from './features/dashboard/DashboardPage';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return <DashboardPage />;
}
