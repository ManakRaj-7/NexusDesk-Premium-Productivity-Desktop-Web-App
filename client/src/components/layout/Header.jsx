import { useAuth, useUI } from '../../hooks';
import { Button } from '../ui';
import { Menu, LogOut, Settings, Moon, Sun } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, theme, toggleTheme } = useUI();

  return (
    <header className="h-16 bg-dark-card border-b border-dark-border fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          NexusDesk
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-hover">
          {user?.profile?.avatar ? (
            <img src={user.profile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
          )}
          <span className="text-sm font-medium">{user?.username || 'User'}</span>
        </div>

        <button
          onClick={logout}
          className="p-2 hover:bg-dark-hover rounded-lg transition-colors text-slate-400 hover:text-slate-100"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
