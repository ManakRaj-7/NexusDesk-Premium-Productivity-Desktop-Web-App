import { useEffect, useState } from 'react';
import { useAuth } from './hooks';
import { AppRoutes } from './routes';
import { initKeyboardShortcuts } from './utils/keyboard';

export default function App() {
  const { isAuthenticated, getProfile } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

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
        // Command palette will be implemented
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

  return <AppRoutes />;
}
