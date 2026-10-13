import React, { useState, useEffect } from 'react';
import { apiClient } from './services/api';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { AppShell } from './components/AppShell';

export function App() {
  const [user, setUser] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'auth' | 'app'>('landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    const token = apiClient.getToken();
    if (token) {
      const cachedUser = apiClient.getUser();
      if (cachedUser) {
        setUser(cachedUser);
        setCurrentScreen('app');
      }

      const res = await apiClient.get('/api/auth/me');
      if (res.ok && res.data && res.data.user) {
        setUser(res.data.user);
        apiClient.setUser(res.data.user);
        setCurrentScreen('app');
      } else {
        apiClient.setToken('');
        apiClient.setUser(null);
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    apiClient.setToken('');
    apiClient.setUser(null);
    setUser(null);
    setCurrentScreen('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentScreen === 'landing') {
    return (
      <LandingView
        onGetStarted={() => setCurrentScreen('auth')}
        onSignIn={() => setCurrentScreen('auth')}
      />
    );
  }

  if (currentScreen === 'auth') {
    return (
      <AuthView
        onSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setCurrentScreen('app');
        }}
        onSwitchToLanding={() => setCurrentScreen('landing')}
      />
    );
  }

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;
