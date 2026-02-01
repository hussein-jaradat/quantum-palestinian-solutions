import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Satellite, 
  CloudRain, 
  Wind, 
  Brain, 
  Atom,
  BarChart3,
  Droplets,
  AlertTriangle,
  Leaf,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { WeatherIcon } from '@/components/ui/WeatherIcon';
import { cn } from '@/lib/utils';
import { Governorate, WeatherData } from '@/types/weather';
import { GOVERNORATES } from '@/data/weatherData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface WeatherSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedGovernorate: Governorate;
  onGovernorateSelect: (governorate: Governorate) => void;
  weather: WeatherData | null;
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navigationItems = [
  { id: 'overview', label: 'الخريطة', icon: MapPin },
  { id: 'wind', label: 'الرياح', icon: Wind },
  { id: 'radar', label: 'الرادار', icon: CloudRain },
  { id: 'qanwp-ai', label: 'QANWP-AI', icon: Brain, badge: 'AI' },
  { id: 'satellite', label: 'الأقمار', icon: Satellite },
  { id: 'historical', label: 'التاريخي', icon: BarChart3 },
  { id: 'forecast', label: 'التنبؤات', icon: Droplets },
  { id: 'agriculture', label: 'الزراعة', icon: Leaf },
  { id: 'floods', label: 'السيول', icon: AlertTriangle },
  { id: 'quantum', label: 'الكوانتوم', icon: Atom },
  { id: 'sdgs', label: 'SDGs', icon: Target },
];

const WeatherSidebar = ({
  isOpen,
  onToggle,
  selectedGovernorate,
  onGovernorateSelect,
  weather,
  activeSection,
  onNavigate,
}: WeatherSidebarProps) => {
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(true);
  const [isForecastExpanded, setIsForecastExpanded] = useState(false);

  const handleGovernorateChange = (value: string) => {
    const gov = GOVERNORATES.find(g => g.id === value);
    if (gov) onGovernorateSelect(gov);
  };

  return (
    <aside
      className={cn(
        "fixed top-[48px] right-0 h-[calc(100vh-48px)] z-40 transition-all duration-300 ease-out",
        "bg-sidebar border-l border-sidebar-border",
        isOpen ? "w-[320px]" : "w-[60px]"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -left-3 top-4 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border shadow-sm z-50"
      >
        {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      <ScrollArea className="h-full">
        <div className={cn("p-3 space-y-3", !isOpen && "px-2")}>
          {/* Location Selector */}
          {isOpen && (
            <div className="animate-fade-in">
              <Select value={selectedGovernorate.id} onValueChange={handleGovernorateChange}>
                <SelectTrigger className="w-full h-10 bg-sidebar-accent/50 border-sidebar-border">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    <SelectValue placeholder="اختر المحافظة" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <div className="text-xs text-muted-foreground px-2 py-1">شمال الضفة</div>
                  {GOVERNORATES.filter(g => g.region === 'north').map(gov => (
                    <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
                  ))}
                  <div className="text-xs text-muted-foreground px-2 py-1 mt-1">وسط الضفة</div>
                  {GOVERNORATES.filter(g => g.region === 'center').map(gov => (
                    <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
                  ))}
                  <div className="text-xs text-muted-foreground px-2 py-1 mt-1">جنوب الضفة</div>
                  {GOVERNORATES.filter(g => g.region === 'south').map(gov => (
                    <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
                  ))}
                  <div className="text-xs text-muted-foreground px-2 py-1 mt-1">قطاع غزة</div>
                  {GOVERNORATES.filter(g => g.region === 'gaza').map(gov => (
                    <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compact Location (Collapsed State) */}
          {!isOpen && (
            <div className="flex justify-center">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MapPin size={18} className="text-primary" />
              </Button>
            </div>
          )}

          {/* Current Weather Card */}
          <Collapsible open={isWeatherExpanded} onOpenChange={setIsWeatherExpanded}>
            <GlassCard variant="elevated" padding={isOpen ? "md" : "sm"} className="animate-slide-up">
              {isOpen ? (
                <>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-alert-safe/10 text-alert-safe border-alert-safe/30 text-xs">
                          الآن
                        </Badge>
                        <span className="text-sm font-medium">{selectedGovernorate.nameAr}</span>
                      </div>
                      {isWeatherExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    {weather ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-4xl font-bold">{weather.temperature}°</div>
                            <div className="text-sm text-muted-foreground">
                              {weather.temperatureMax}° / {weather.temperatureMin}°
                            </div>
                          </div>
                          <WeatherIcon condition={weather.condition} size="xl" animated />
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">💧 الرطوبة</div>
                            <div className="text-sm font-medium">{weather.humidity}%</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">💨 الرياح</div>
                            <div className="text-sm font-medium">{weather.windSpeed}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">🌧️ أمطار</div>
                            <div className="text-sm font-medium">{weather.precipitation}mm</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-20 flex items-center justify-center">
                        <div className="animate-pulse-soft text-muted-foreground">جاري التحميل...</div>
                      </div>
                    )}
                  </CollapsibleContent>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  {weather && (
                    <>
                      <WeatherIcon condition={weather.condition} size="lg" />
                      <div className="text-lg font-bold">{weather.temperature}°</div>
                    </>
                  )}
                </div>
              )}
            </GlassCard>
          </Collapsible>

          {/* Navigation Items */}
          <div className="space-y-1">
            {isOpen && (
              <div className="text-xs text-muted-foreground px-2 mb-2">التنقل السريع</div>
            )}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 h-9",
                    isActive && "bg-primary/10 text-primary border border-primary/20",
                    !isOpen && "justify-center px-0"
                  )}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={16} className={isActive ? "text-primary" : ""} />
                  {isOpen && (
                    <>
                      <span className="text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge variant="outline" className="mr-auto text-[10px] h-4 px-1">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Active Alerts */}
          {isOpen && (
            <GlassCard variant="subtle" padding="sm" className="animate-slide-up">
              <div className="flex items-center gap-2 text-alert-warning">
                <AlertTriangle size={14} />
                <span className="text-xs font-medium">تنبيهان نشطان</span>
              </div>
            </GlassCard>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default WeatherSidebar;
