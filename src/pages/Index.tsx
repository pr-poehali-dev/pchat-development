import { useState, useEffect } from 'react';
import AuthScreen from '../components/AuthScreen';
import ChatInterface from '../components/ChatInterface';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar_url?: string;
  theme?: string;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const savedUser = localStorage.getItem('pchat_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      if (userData.theme) {
        setTheme(userData.theme);
      }
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('pchat_user', JSON.stringify(userData));
    if (userData.theme) {
      setTheme(userData.theme as 'light' | 'dark' | 'system');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pchat_user');
  };

  return (
    <div className="min-h-screen">
      {!user ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <ChatInterface 
          user={user} 
          onLogout={handleLogout}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  );
}