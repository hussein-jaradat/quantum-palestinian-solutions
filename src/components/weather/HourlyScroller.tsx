import { useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { WeatherIcon, WeatherCondition } from '@/components/ui/WeatherIcon';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HourlyForecast } from '@/types/weather';
import { cn } from '@/lib/utils';

interface HourlyScrollerProps {
  hourlyData: HourlyForecast[];
  className?: string;
}

const HourlyScroller = ({ hourlyData, className }: HourlyScrollerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  const formatHour = (isoString: string) => {
    const date = new Date(isoString);
    const hour = date.getHours();
    if (hour === 0) return '12 ص';
    if (hour === 12) return '12 م';
    if (hour < 12) return `${hour} ص`;
    return `${hour - 12} م`;
  };

  const isCurrentHour = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    return date.getHours() === now.getHours() && date.getDate() === now.getDate();
  };

  if (!hourlyData || hourlyData.length === 0) {
    return null;
  }

  return (
    <GlassCard variant="subtle" padding="sm" className={cn("relative", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">التنبؤ الساعي</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => scroll('right')}
          >
            <ChevronRight size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={14} />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto hide-scrollbar pb-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {hourlyData.map((hour, index) => {
          const isCurrent = isCurrentHour(hour.time);
          
          return (
            <div
              key={index}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                "hover:bg-secondary/50 cursor-default",
                isCurrent && "bg-primary/10 border border-primary/20",
                "scroll-snap-align-start"
              )}
              style={{ minWidth: '60px' }}
            >
              <span className={cn(
                "text-xs",
                isCurrent ? "text-primary font-bold" : "text-muted-foreground"
              )}>
                {isCurrent ? 'الآن' : formatHour(hour.time)}
              </span>
              <WeatherIcon 
                condition={hour.condition as WeatherCondition} 
                size="md" 
              />
              <span className="text-sm font-bold">{hour.temperature}°</span>
              {hour.precipitation > 0 && (
                <span className="text-xs text-weather-rainy">
                  💧 {hour.precipitation}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export default HourlyScroller;
