import { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, Bell, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Logo from './Logo';
import SettingsPanel from './SettingsPanel';

interface HeaderProps {
  activeSection?: string;
  onNavigate?: (section: string) => void;
}

const Header = ({ activeSection = 'overview', onNavigate }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const navItems = [
    { id: 'overview', labelAr: 'الخريطة', labelEn: 'Map', icon: '🗺️' },
    { id: 'qanwp-ai', labelAr: 'QANWP-AI', labelEn: 'QANWP-AI', icon: '🤖' },
    { id: 'satellite', labelAr: 'الأقمار', labelEn: 'Satellite', icon: '🛰️' },
    { id: 'historical', labelAr: 'التاريخي', labelEn: 'Historical', icon: '📊' },
    { id: 'forecast', labelAr: 'التنبؤات', labelEn: 'Forecast', icon: '📅' },
    { id: 'agriculture', labelAr: 'الزراعة', labelEn: 'Agriculture', icon: '🌱' },
    { id: 'floods', labelAr: 'السيول', labelEn: 'Floods', icon: '🌊' },
    { id: 'quantum', labelAr: 'الكوانتوم', labelEn: 'Quantum', icon: '⚛️' },
  ];

  const handleNavClick = (sectionId: string) => {
    if (onNavigate) {
      onNavigate(sectionId);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-effect shadow-lg' : 'bg-background/80 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" variant="compact" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.labelAr}</span>
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full h-9 w-9"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 relative">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                2
              </span>
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hidden md:flex">
                  <Settings size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <SettingsPanel />
              </PopoverContent>
            </Popover>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full h-9 w-9"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.labelAr}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
