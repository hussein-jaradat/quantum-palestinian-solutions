import { Cloud, Sun, CloudRain, MapPin, Wind, Droplets } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 36, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' },
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Palestinian flag inspired design */}
        <div className="absolute inset-0 bg-gradient-to-br from-palestine-green via-palestine-red to-palestine-black rounded-xl opacity-20 blur-lg" />
        <div className="relative bg-gradient-to-br from-palestine-green to-primary rounded-xl p-2 shadow-weather">
          <div className="relative">
            <Sun 
              size={sizes[size].icon} 
              className="text-weather-sunny absolute -top-1 -right-1 animate-pulse-glow"
              strokeWidth={2.5}
            />
            <Cloud 
              size={sizes[size].icon} 
              className="text-primary-foreground"
              strokeWidth={2}
            />
            <MapPin 
              size={sizes[size].icon * 0.4} 
              className="text-palestine-red absolute -bottom-1 -left-1"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-bold text-gradient-palestine`}>
            PalWeather
          </span>
          <span className="text-xs text-muted-foreground">
            الأرصاد الجوية الفلسطينية
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
