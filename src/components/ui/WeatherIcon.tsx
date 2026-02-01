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
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
        animated && 'animate-weather-bounce',
        className
      )}
      role="img"
      aria-label={condition}
    >
      {emoji}
    </span>
  );
};

// SVG-based weather icons for better control
const SunIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={cn("w-full h-full", className)}
    fill="none"
  >
    <circle cx="32" cy="32" r="12" fill="hsl(var(--weather-sunny))" />
    <g stroke="hsl(var(--weather-sunny))" strokeWidth="3" strokeLinecap="round">
      <line x1="32" y1="4" x2="32" y2="14" />
      <line x1="32" y1="50" x2="32" y2="60" />
      <line x1="4" y1="32" x2="14" y2="32" />
      <line x1="50" y1="32" x2="60" y2="32" />
      <line x1="12" y1="12" x2="19" y2="19" />
      <line x1="45" y1="45" x2="52" y2="52" />
      <line x1="52" y1="12" x2="45" y2="19" />
      <line x1="19" y1="45" x2="12" y2="52" />
    </g>
  </svg>
);

const CloudIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={cn("w-full h-full", className)}
    fill="hsl(var(--weather-cloudy))"
  >
    <path d="M48 36a8 8 0 100 16H16a10 10 0 110-20 10 10 0 0118-6 12 12 0 0114 10z" />
  </svg>
);

const RainIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={cn("w-full h-full", className)}
    fill="none"
  >
    <path 
      d="M48 28a8 8 0 100 16H16a10 10 0 110-20 10 10 0 0118-6 12 12 0 0114 10z" 
      fill="hsl(var(--weather-cloudy))"
    />
    <g stroke="hsl(var(--weather-rainy))" strokeWidth="2" strokeLinecap="round">
      <line x1="20" y1="48" x2="18" y2="56" />
      <line x1="32" y1="48" x2="30" y2="56" />
      <line x1="44" y1="48" x2="42" y2="56" />
    </g>
  </svg>
);

export { WeatherIcon, SunIcon, CloudIcon, RainIcon };
export type { WeatherCondition };
