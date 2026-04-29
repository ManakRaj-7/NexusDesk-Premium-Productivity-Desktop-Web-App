import { MainLayout } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Moon, Sun, Bell, LogOut } from 'lucide-react';
import { useUI, useAuth } from '../../hooks';

export default function SettingsPage() {
  const { theme, toggleTheme } = useUI();
  const { logout } = useAuth();

  return (
    <MainLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">Settings</h1>

        {/* Theme */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              <div>
                <p className="font-medium text-slate-100">Dark Mode</p>
                <p className="text-sm text-slate-400">Currently {theme}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>
              Toggle
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} />
              <div>
                <p className="font-medium text-slate-100">Desktop Notifications</p>
                <p className="text-sm text-slate-400">Enable notifications for reminders</p>
              </div>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Default Focus Duration
              </label>
              <Input type="number" defaultValue="25" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Break Duration
              </label>
              <Input type="number" defaultValue="5" className="w-full" />
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 bg-red-500/10 border-red-500/30">
          <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
          <Button variant="danger" onClick={logout}>
            <LogOut size={16} />
            Logout
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
}
