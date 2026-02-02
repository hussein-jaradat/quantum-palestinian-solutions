import { cn } from "@/lib/utils";

type WeatherCondition = 
  | 'sunny' 
  | 'partly_cloudy' 
  | 'cloudy' 
  | 'rainy' 
  | 'heavy_rain' 
  | 'stormy' 
  | 'snowy' 
  | 'foggy' 
  | 'windy';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  className?: string;
}

const weatherEmojis: Record<WeatherCondition, string> = {
  sunny: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  heavy_rain: '⛈️',
  stormy: '🌩️',
  snowy: '❄️',
  foggy: '🌫️',
  windy: '💨',
};

const sizeClasses = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
  '2xl': 'text-6xl',
};

const WeatherIcon = ({ 
  condition, 
  size = 'md', 
  animated = false, 
  className 
}: WeatherIconProps) => {
  const emoji = weatherEmojis[condition] || '🌤️';
  
  return (
    <span 
      className={cn(
        sizeClasses[size],
        animated && 'animate-float',
        className
      )}
      role="img"
      aria-label={condition}
    >
      {emoji}
    </span>
  );
};

export { WeatherIcon };
export type { WeatherCondition };