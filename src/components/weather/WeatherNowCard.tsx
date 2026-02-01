import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { WeatherIcon } from '@/components/ui/WeatherIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { Droplets, Wind, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { getConditionNameAr } from '@/data/weatherData';

interface WeatherNowCardProps {
  weather: WeatherData | null;
  cityName: string;
  isLoading?: boolean;
  compact?: boolean;
}

const WeatherNowCard = ({ weather, cityName, isLoading, compact = false }: WeatherNowCardProps) => {
  if (isLoading || !weather) {
    return (
      <GlassCard variant="elevated" className="animate-pulse-soft">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-12 w-20 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (compact) {
    return (
      <GlassCard variant="elevated" padding="sm" className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeatherIcon condition={weather.condition} size="lg" animated />
            <div>
              <div className="text-2xl font-bold">{weather.temperature}°</div>
              <div className="text-xs text-muted-foreground">{cityName}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ArrowUp size={12} className="text-temp-warm" />
              {weather.temperatureMax}°
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown size={12} className="text-temp-cold" />
              {weather.temperatureMin}°
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated" className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{cityName}</h2>
          <Badge variant="outline" className="bg-alert-safe/10 text-alert-safe border-alert-safe/30 text-xs">
            بيانات حية
          </Badge>
        </div>
        <Badge variant="secondary" className="text-xs">
          الآن
        </Badge>
      </div>

      {/* Main Temperature */}
      <div className="flex items-center gap-6 mb-6">
        <WeatherIcon condition={weather.condition} size="2xl" animated />
        <div>
          <div className="text-6xl font-bold tracking-tight">{weather.temperature}°</div>
          <div className="text-lg text-muted-foreground">{getConditionNameAr(weather.condition)}</div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <ArrowUp size={14} className="text-temp-warm" />
              {weather.temperatureMax}°
            </span>
            <span className="flex items-center gap-1">
              <ArrowDown size={14} className="text-temp-cold" />
              {weather.temperatureMin}°
            </span>
          </div>
        </div>
      </div>

      {/* Weather Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatItem 
          icon={<Droplets size={18} className="text-weather-rainy" />}
          label="الرطوبة"
          value={`${weather.humidity}%`}
        />
        <StatItem 
          icon={<Wind size={18} className="text-weather-cloudy" />}
          label="الرياح"
          value={`${weather.windSpeed} كم/س`}
          subValue={weather.windDirection}
        />
        <StatItem 
          icon={<Eye size={18} className="text-muted-foreground" />}
          label="جودة الهواء"
          value={weather.airQuality > 50 ? 'متوسط' : 'جيد'}
          status={weather.airQuality > 50 ? 'warning' : 'safe'}
        />
      </div>

      {/* Sunrise/Sunset */}
      <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>🌅</span>
          <span>الشروق: {weather.sunrise}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🌇</span>
          <span>الغروب: {weather.sunset}</span>
        </div>
      </div>
    </GlassCard>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  status?: 'safe' | 'warning' | 'danger';
}

const StatItem = ({ icon, label, value, subValue, status }: StatItemProps) => {
  const statusColors = {
    safe: 'bg-alert-safe/10 border-alert-safe/20',
    warning: 'bg-alert-warning/10 border-alert-warning/20',
    danger: 'bg-alert-danger/10 border-alert-danger/20',
  };

  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border ${status ? statusColors[status] : 'bg-secondary/50 border-border/50'}`}>
      <div className="p-2 rounded-lg bg-background/50">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold">{value}</div>
        {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
      </div>
    </div>
  );
};

export default WeatherNowCard;
