import { useUI } from '../../hooks';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Grid3x3' },
  { id: 'notes', label: 'Notes', path: '/notes', icon: 'FileText' },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: 'CheckSquare2' },
  { id: 'focus', label: 'Focus Mode', path: '/focus', icon: 'Zap' },
  { id: 'assistant', label: 'AI Assistant', path: '/assistant', icon: 'Sparkles' },
  { id: 'jobs', label: 'Jobs & Links', path: '/jobs', icon: 'Link2' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: 'Settings' },
];

export const Sidebar = () => {
  const { sidebarOpen } = useUI();
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: sidebarOpen ? 0 : -250 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-64 h-screen bg-dark-card border-r border-dark-border fixed left-0 top-16 z-20 overflow-y-auto"
    >
      <nav className="p-6 space-y-2">
        {MENU_ITEMS.map((item) => {
          const IconComponent = Icons[item.icon];
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
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
    </motion.aside>
  );
};
