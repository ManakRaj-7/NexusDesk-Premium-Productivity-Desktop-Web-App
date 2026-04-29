import { useState, useRef, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { Moon, Sun, Bell, LogOut, Upload, User as UserIcon } from 'lucide-react';
import { useUI, useAuth } from '../../hooks';
import { authService } from '../../services';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Liliana',
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useUI();
  const { user, logout, getProfile } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.fullName || '');
      setBio(user.profile.bio || '');
      setAvatar(user.profile.avatar || '');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await authService.updateProfile({ fullName, bio, avatar });
      await getProfile(); // Refresh redux state
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">Settings</h1>

        {/* Profile Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Profile</h2>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-hover flex items-center justify-center border-2 border-primary-500/30">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} className="text-slate-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} className="mr-2" /> Upload
              </Button>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Preset Avatars</label>
                <div className="flex gap-2">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAvatar(preset)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${avatar === preset ? 'border-primary-500 scale-110' : 'border-transparent hover:border-slate-500'}`}
                    >
                      <img src={preset} alt={`Preset ${idx}`} className="w-full h-full bg-slate-200" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <Input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe" 
                  className="w-full" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..." 
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-primary-500 transition-colors resize-none h-24" 
                />
              </div>
              
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </Card>

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
