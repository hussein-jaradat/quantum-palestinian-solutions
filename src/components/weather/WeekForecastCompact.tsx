import { GlassCard } from '@/components/ui/GlassCard';
import { WeatherIcon, WeatherCondition } from '@/components/ui/WeatherIcon';
import { DailyForecast } from '@/types/weather';
import { cn } from '@/lib/utils';

interface WeekForecastCompactProps {
  dailyData: DailyForecast[];
  className?: string;
}

const WeekForecastCompact = ({ dailyData, className }: WeekForecastCompactProps) => {
  const formatDay = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'اليوم';
    if (date.toDateString() === tomorrow.toDateString()) return 'غداً';

    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getTemperatureBarWidth = (min: number, max: number, currentMin: number, currentMax: number) => {
    const range = max - min;
    const startPercent = ((currentMin - min) / range) * 100;
    const endPercent = ((currentMax - min) / range) * 100;
    return { start: startPercent, width: endPercent - startPercent };
  };

  if (!dailyData || dailyData.length === 0) {
    return null;
  }

  const allTemps = dailyData.flatMap(d => [d.temperatureMin, d.temperatureMax]);
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);

  return (
    <GlassCard variant="subtle" padding="sm" className={className}>
      <h3 className="text-sm font-bold mb-3">تنبؤ 7 أيام</h3>
      
      <div className="space-y-2">
        {dailyData.slice(0, 7).map((day, index) => {
          const isToday = index === 0;
          const bar = getTemperatureBarWidth(globalMin, globalMax, day.temperatureMin, day.temperatureMax);

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all",
                isToday && "bg-primary/5 border border-primary/10",
                !isToday && "hover:bg-secondary/30"
              )}
            >
              {/* Day Name */}
              <div className="w-16 flex-shrink-0">
                <div className={cn(
                  "text-sm font-medium",
                  isToday && "text-primary"
                )}>
                  {formatDay(day.date)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(day.date)}
                </div>
              </div>

              {/* Weather Icon */}
              <WeatherIcon 
                condition={day.condition as WeatherCondition} 
                size="sm" 
              />

              {/* Precipitation */}
              {day.precipitation > 0 ? (
                <span className="w-10 text-xs text-weather-rainy text-center">
                  💧{day.precipitation}%
                </span>
              ) : (
                <span className="w-10" />
              )}

              {/* Temperature Bar */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-8 text-left">
                  {day.temperatureMin}°
                </span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full relative">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-temp-cool via-temp-mild to-temp-warm"
                    style={{
                      left: `${bar.start}%`,
                      width: `${bar.width}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium w-8">
                  {day.temperatureMax}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default WeekForecastCompact;
