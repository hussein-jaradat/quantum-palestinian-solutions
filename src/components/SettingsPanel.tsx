import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Sun, Moon, Globe, Bell, Palette, 
  Monitor, Smartphone, Check
} from 'lucide-react';

interface SettingsPanelProps {
  onClose?: () => void;
}

const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme, prefersDark);
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system', prefersDark: boolean) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark' || (newTheme === 'system' && prefersDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(newTheme, prefersDark);
  };

  const themes = [
    { id: 'light', name: 'فاتح', icon: <Sun className="h-4 w-4" /> },
    { id: 'dark', name: 'داكن', icon: <Moon className="h-4 w-4" /> },
    { id: 'system', name: 'تلقائي', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <Card className="glass-effect">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-primary" />
          الإعدادات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">المظهر</label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <Button
                key={t.id}
                variant={theme === t.id ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => handleThemeChange(t.id as 'light' | 'dark' | 'system')}
              >
                {t.icon}
                {t.name}
                {theme === t.id && <Check className="h-3 w-3" />}
              </Button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">اللغة</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={language === 'ar' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setLanguage('ar')}
            >
              <Globe className="h-4 w-4" />
              العربية
              {language === 'ar' && <Check className="h-3 w-3" />}
            </Button>
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setLanguage('en')}
              disabled
            >
              <Globe className="h-4 w-4" />
              English
              <Badge variant="secondary" className="text-[8px]">قريباً</Badge>
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">الإشعارات</span>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        {/* Device Info */}
        <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="h-4 w-4" />
            <span>معلومات الجهاز</span>
          </div>
          <p className="text-xs">
            المنطقة الزمنية: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <p className="text-xs">
            الإصدار: PalWeather v1.0.0
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
