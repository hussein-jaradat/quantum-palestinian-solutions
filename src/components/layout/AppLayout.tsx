import { useState, ReactNode } from 'react';
import CompactHeader from './CompactHeader';
import WeatherSidebar from './WeatherSidebar';
import { cn } from '@/lib/utils';
import { Governorate, WeatherData } from '@/types/weather';

interface AppLayoutProps {
  children: ReactNode;
  selectedGovernorate: Governorate;
  onGovernorateSelect: (governorate: Governorate) => void;
  weather: WeatherData | null;
  activeSection: string;
  onNavigate: (section: string) => void;
}

const AppLayout = ({
  children,
  selectedGovernorate,
  onGovernorateSelect,
  weather,
  activeSection,
  onNavigate,
}: AppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Compact Header */}
      <CompactHeader 
        onMenuToggle={toggleSidebar} 
        isSidebarOpen={isSidebarOpen}
      />

      {/* Sidebar */}
      <WeatherSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        selectedGovernorate={selectedGovernorate}
        onGovernorateSelect={onGovernorateSelect}
        weather={weather}
        activeSection={activeSection}
        onNavigate={onNavigate}
      />

      {/* Main Content */}
      <main
        className={cn(
          "pt-[52px] min-h-screen transition-all duration-300",
          isSidebarOpen ? "pr-[300px]" : "pr-[64px]"
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;