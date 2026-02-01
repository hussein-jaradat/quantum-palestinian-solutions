import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CompactHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const CompactHeader = ({ onMenuToggle, isSidebarOpen }: CompactHeaderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    <header className="compact-header flex items-center justify-between px-4 border-b border-border/50">
      {/* Left Section - Logo & Menu */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="h-8 w-8 rounded-lg"
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-palestine flex items-center justify-center">
            <span className="text-white text-xs font-bold">Q</span>
          </div>
          <span className="font-bold text-sm hidden sm:block">QANWP</span>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        {isSearchOpen ? (
          <div className="relative animate-fade-in">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن موقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pr-9 pl-8 text-sm bg-secondary/50 border-transparent focus:border-primary/30"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
            >
              <X size={14} />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full h-8 justify-start gap-2 text-muted-foreground hover:text-foreground bg-secondary/30 hover:bg-secondary/50"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={14} />
            <span className="text-sm hidden sm:inline">ابحث عن موقع...</span>
          </Button>
        )}
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="h-8 w-8 rounded-lg"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-lg relative"
        >
          <Bell size={16} />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            2
          </Badge>
        </Button>
      </div>
    </header>
  );
};

export default CompactHeader;
