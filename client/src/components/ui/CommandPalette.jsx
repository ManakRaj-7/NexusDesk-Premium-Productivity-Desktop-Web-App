import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, CheckSquare, Clock, Plus, Settings as SettingsIcon } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <Command.Input
          autoFocus
          placeholder="Type a command or search..."
          className="w-full px-4 py-4 bg-transparent text-slate-100 outline-none border-b border-dark-border placeholder:text-slate-500"
        />
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="p-4 text-sm text-slate-400 text-center">No results found.</Command.Empty>

          <Command.Group heading="Navigation" className="text-xs font-medium text-slate-500 p-2">
            <Command.Item
              onSelect={() => { navigate('/dashboard'); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 rounded-md cursor-pointer aria-selected:bg-primary-500 aria-selected:text-white"
            >
              <Clock size={16} /> Dashboard
            </Command.Item>
            <Command.Item
              onSelect={() => { navigate('/tasks'); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 rounded-md cursor-pointer aria-selected:bg-primary-500 aria-selected:text-white"
            >
              <CheckSquare size={16} /> Tasks
            </Command.Item>
            <Command.Item
              onSelect={() => { navigate('/notes'); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 rounded-md cursor-pointer aria-selected:bg-primary-500 aria-selected:text-white"
            >
              <FileText size={16} /> Notes
            </Command.Item>
            <Command.Item
              onSelect={() => { navigate('/focus'); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 rounded-md cursor-pointer aria-selected:bg-primary-500 aria-selected:text-white"
            >
              <Clock size={16} /> Focus Mode
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Actions" className="text-xs font-medium text-slate-500 p-2">
            <Command.Item
              onSelect={() => { navigate('/tasks'); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 rounded-md cursor-pointer aria-selected:bg-primary-500 aria-selected:text-white"
            >
              <Plus size={16} /> Create Task
            </Command.Item>
            <Command.Item
              onSelect={() => { navigate('/notes'); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 rounded-md cursor-pointer aria-selected:bg-primary-500 aria-selected:text-white"
            >
              <Plus size={16} /> Create Note
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Settings" className="text-xs font-medium text-slate-500 p-2">
            <Command.Item
              onSelect={() => { navigate('/settings'); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 rounded-md cursor-pointer aria-selected:bg-primary-500 aria-selected:text-white"
            >
              <SettingsIcon size={16} /> Settings
            </Command.Item>
            <Command.Item
              onSelect={() => { dispatch(logout()); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 rounded-md cursor-pointer aria-selected:bg-red-500 aria-selected:text-white"
            >
              Log Out
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
