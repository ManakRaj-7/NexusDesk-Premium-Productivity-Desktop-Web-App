import { useUI } from '../../hooks';
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { id: 'notes', label: 'Notes', path: '/notes', icon: 'FileText' },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
  { id: 'focus', label: 'Focus Mode', path: '/focus', icon: 'Zap' },
  { id: 'assistant', label: 'AI Assistant', path: '/assistant', icon: 'Sparkles' },
  { id: 'jobs', label: 'Jobs & Links', path: '/jobs', icon: 'Link2' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: 'Settings' },
];

export const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useUI();
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Auto-close sidebar on any route change (handles back-button, command palette, etc.)
  useEffect(() => {
    if (sidebarOpen) toggleSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: sidebarOpen ? 0 : -250 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-64 h-[calc(100vh-64px)] bg-dark-card border-r border-dark-border fixed left-0 top-16 z-20 overflow-y-auto flex flex-col"
    >
      <nav className="p-6 space-y-2 flex-1">
        {MENU_ITEMS.map((item) => {
          const IconComponent = Icons[item.icon];
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => { if (sidebarOpen) toggleSidebar(); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-dark-hover'
              }`}
            >
              <IconComponent size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {deferredPrompt && (
        <div className="p-6 mt-auto">
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-soft"
          >
            <Icons.Download size={18} />
            Install App
          </button>
        </div>
      )}
    </motion.aside>
  );
};
