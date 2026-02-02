import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Menu, Activity, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CompactHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const CompactHeader = ({ onMenuToggle, isSidebarOpen }: CompactHeaderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  return (
    <header className="compact-header flex items-center justify-between px-4">
      {/* Left Section - Logo & Menu */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="h-9 w-9 hover:bg-primary/10"
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
        
        <div className="flex items-center gap-2">
          {/* QANWP Logo */}
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold leading-tight">QANWP</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">
              نظام التنبؤ الجوي الكمومي
            </p>
          </div>
        </div>
      </div>

      {/* Center Section - Status */}
      <div className="hidden md:flex items-center gap-3">
        <Badge 
          variant="outline" 
          className={cn(
            "gap-1.5 h-7 px-3 text-xs font-medium",
            "bg-accent/10 text-accent border-accent/20"
          )}
        >
          <Activity size={12} className="animate-pulse" />
          <span>نظام حي</span>
        </Badge>
        
        <Badge 
          variant="outline" 
          className="gap-1.5 h-7 px-3 text-xs font-medium"
        >
          <span>آخر تحديث:</span>
          <span className="font-mono">
            {new Date().toLocaleTimeString('ar-PS', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </Badge>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 relative"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="h-9 w-9 hover:bg-primary/10"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10"
        >
          <Settings size={18} />
        </Button>
      </div>
    </header>
  );
};

export default CompactHeader;