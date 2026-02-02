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
  Calendar,
  AlertTriangle,
  Leaf,
  Target,
  Thermometer,
  Droplets,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Governorate, WeatherData, WeatherCondition } from '@/types/weather';
import { GOVERNORATES } from '@/data/weatherData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WeatherIcon } from '@/components/ui/WeatherIcon';

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
  { id: 'overview', label: 'الخريطة', icon: MapPin, color: 'text-primary' },
  { id: 'wind', label: 'الرياح', icon: Wind, color: 'text-sky-500' },
  { id: 'radar', label: 'الرادار', icon: CloudRain, color: 'text-blue-500' },
  { id: 'qanwp-ai', label: 'QANWP-AI', icon: Brain, color: 'text-purple-500', badge: 'AI' },
  { id: 'satellite', label: 'الأقمار', icon: Satellite, color: 'text-indigo-500' },
  { id: 'historical', label: 'التاريخي', icon: BarChart3, color: 'text-amber-500' },
  { id: 'forecast', label: 'التنبؤات', icon: Calendar, color: 'text-green-500' },
  { id: 'agriculture', label: 'الزراعة', icon: Leaf, color: 'text-emerald-500' },
  { id: 'floods', label: 'السيول', icon: AlertTriangle, color: 'text-red-500' },
  { id: 'quantum', label: 'الكوانتوم', icon: Atom, color: 'text-violet-500' },
  { id: 'sdgs', label: 'SDGs', icon: Target, color: 'text-teal-500' },
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

  const handleGovernorateChange = (value: string) => {
    const gov = GOVERNORATES.find(g => g.id === value);
    if (gov) onGovernorateSelect(gov);
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 5) return 'text-temp-freezing';
    if (temp <= 10) return 'text-temp-cold';
    if (temp <= 15) return 'text-temp-cool';
    if (temp <= 22) return 'text-temp-mild';
    if (temp <= 30) return 'text-temp-warm';
    if (temp <= 38) return 'text-temp-hot';
    return 'text-temp-extreme';
  };

  return (
    <aside
      className={cn(
        "weather-sidebar fixed top-[52px] right-0 h-[calc(100vh-52px)] z-40 transition-all duration-300 ease-out",
        isOpen ? "weather-sidebar-expanded" : "weather-sidebar-collapsed"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className="absolute -left-4 top-6 h-8 w-8 rounded-full bg-background border shadow-md z-50 hover:bg-primary hover:text-white"
      >
        {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>

      <ScrollArea className="h-full">
        <div className={cn("p-3 space-y-4", !isOpen && "px-2")}>
          {/* Location Selector */}
          {isOpen && (
            <div className="animate-fade-in">
              <Select value={selectedGovernorate.id} onValueChange={handleGovernorateChange}>
                <SelectTrigger className="w-full h-11 bg-card border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <SelectValue placeholder="اختر المحافظة" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <div className="text-xs text-muted-foreground px-2 py-1.5 font-medium">شمال الضفة</div>
                  {GOVERNORATES.filter(g => g.region === 'north').map(gov => (
                    <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
                  ))}
                  <div className="text-xs text-muted-foreground px-2 py-1.5 font-medium mt-1">وسط الضفة</div>
                  {GOVERNORATES.filter(g => g.region === 'center').map(gov => (
                    <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
                  ))}
                  <div className="text-xs text-muted-foreground px-2 py-1.5 font-medium mt-1">جنوب الضفة</div>
                  {GOVERNORATES.filter(g => g.region === 'south').map(gov => (
                    <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
                  ))}
                  <div className="text-xs text-muted-foreground px-2 py-1.5 font-medium mt-1">قطاع غزة</div>
                  {GOVERNORATES.filter(g => g.region === 'gaza').map(gov => (
                    <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Compact Location Icon (Collapsed State) */}
          {!isOpen && (
            <div className="flex justify-center py-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10">
                <MapPin size={20} className="text-primary" />
              </Button>
            </div>
          )}

          {/* Current Weather Card */}
          <div className={cn(
            "glass-card-elevated p-4 animate-slide-up",
            !isOpen && "p-2"
          )}>
            {isOpen ? (
              weather ? (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="data-badge-success text-[10px] px-1.5 py-0">
                        الآن
                      </Badge>
                      <span className="text-sm font-semibold">{selectedGovernorate.nameAr}</span>
                    </div>
                  </div>

                  {/* Main Weather Display */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={cn("text-5xl font-bold tracking-tight", getTemperatureColor(weather.temperature))}>
                        {weather.temperature}°
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="text-temp-hot">{weather.temperatureMax}°</span>
                        <span className="mx-1">/</span>
                        <span className="text-temp-cold">{weather.temperatureMin}°</span>
                      </div>
                    </div>
                    <WeatherIcon 
                      condition={weather.condition as WeatherCondition} 
                      size="xl" 
                      animated 
                    />
                  </div>

                  {/* Weather Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                      <Droplets size={14} className="mx-auto mb-1 text-blue-500" />
                      <div className="text-xs text-muted-foreground">رطوبة</div>
                      <div className="text-sm font-semibold">{weather.humidity}%</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                      <Wind size={14} className="mx-auto mb-1 text-sky-500" />
                      <div className="text-xs text-muted-foreground">رياح</div>
                      <div className="text-sm font-semibold">{weather.windSpeed}</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                      <CloudRain size={14} className="mx-auto mb-1 text-indigo-500" />
                      <div className="text-xs text-muted-foreground">أمطار</div>
                      <div className="text-sm font-semibold">{weather.precipitation}mm</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-pulse-soft text-muted-foreground text-sm">جاري التحميل...</div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-2 py-2">
                {weather && (
                  <>
                    <WeatherIcon condition={weather.condition as WeatherCondition} size="lg" />
                    <div className={cn("text-xl font-bold", getTemperatureColor(weather.temperature))}>
                      {weather.temperature}°
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {isOpen && (
              <div className="text-xs text-muted-foreground px-2 py-2 font-medium">القوائم</div>
            )}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10 transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-sm",
                    !isActive && "hover:bg-secondary",
                    !isOpen && "justify-center px-0"
                  )}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={18} className={isActive ? "" : item.color} />
                  {isOpen && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant={isActive ? "secondary" : "outline"} 
                          className="text-[10px] h-5 px-1.5"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Active Alerts */}
          {isOpen && (
            <div className="glass-card p-3 animate-slide-up border-destructive/30">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle size={16} className="animate-pulse" />
                <span className="text-sm font-medium">تنبيهان نشطان</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                اضغط للاطلاع على التفاصيل
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default WeatherSidebar;