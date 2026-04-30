import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from './hooks';
import { AppRoutes } from './routes';
import { initKeyboardShortcuts } from './utils/keyboard';

import { CommandPalette } from './components/ui/CommandPalette';

export default function App() {
  const { isAuthenticated, getProfile } = useAuth();
  const theme = useSelector((state) => state.ui.theme);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && isAuthenticated) {
        try {
          await getProfile();
        } catch (error) {
          console.error('Failed to get profile:', error);
        }
      }
      setIsInitializing(false);
    };

    initializeApp();
  }, [isAuthenticated]);

  useEffect(() => {
    const unsubscribe = initKeyboardShortcuts({
      onCommandPalette: () => {
        // Handled directly inside CommandPalette component using custom event listener
      },
      onToggleSidebar: () => {
        // Sidebar toggle handled by Redux
      },
      onToggleTheme: () => {
        // Theme toggle handled by Redux
      },
    });

    return unsubscribe;
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="text-slate-100">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <CommandPalette />
      <AppRoutes />
    </>
  );
}
