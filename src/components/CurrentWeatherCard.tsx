import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Droplets, Wind, Eye, Sunrise, Sunset } from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { getWeatherIcon, getConditionNameAr } from '@/data/weatherData';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  cityName: string;
}

const CurrentWeatherCard = ({ weather, cityName }: CurrentWeatherCardProps) => {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-card to-accent/5 border-primary/20 shadow-weather">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Main Weather Info */}
          <div className="text-center md:text-right flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Badge variant="outline" className="bg-primary/10 border-primary/30">
                الآن
              </Badge>
              <span className="text-sm text-muted-foreground">
                آخر تحديث: {new Date(weather.updatedAt).toLocaleTimeString('ar-PS')}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-1">{cityName}</h2>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              <span className="text-7xl animate-weather-bounce">{getWeatherIcon(weather.condition)}</span>
              <div>
                <div className="text-6xl font-bold text-foreground">
                  {weather.temperature}°
                </div>
                <div className="text-lg text-muted-foreground">
                  {getConditionNameAr(weather.condition)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-muted-foreground">
              <span>العظمى: {weather.temperatureMax}°</span>
              <span>•</span>
              <span>الصغرى: {weather.temperatureMin}°</span>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
            <WeatherStat
              icon={<Droplets className="text-weather-rainy" />}
              label="الرطوبة"
              value={`${weather.humidity}%`}
            />
            <WeatherStat
              icon={<Wind className="text-weather-cloudy" />}
              label="الرياح"
              value={`${weather.windSpeed} كم/س`}
              subValue={weather.windDirection}
            />
            <WeatherStat
              icon={<Eye className="text-muted-foreground" />}
              label="جودة الهواء"
              value={weather.airQuality > 50 ? 'متوسط' : 'جيد'}
              status={weather.airQuality > 50 ? 'warning' : 'safe'}
            />
            <WeatherStat
              icon={<Thermometer className="text-accent" />}
              label="الأمطار"
              value={`${weather.precipitation} مم`}
            />
            <WeatherStat
              icon={<Sunrise className="text-weather-sunny" />}
              label="الشروق"
              value={weather.sunrise}
            />
            <WeatherStat
              icon={<Sunset className="text-accent" />}
              label="الغروب"
              value={weather.sunset}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface WeatherStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  status?: 'safe' | 'warning' | 'danger';
}

const WeatherStat = ({ icon, label, value, subValue, status }: WeatherStatProps) => {
  const statusColors = {
    safe: 'bg-alert-safe/10 border-alert-safe/30',
    warning: 'bg-alert-warning/10 border-alert-warning/30',
    danger: 'bg-alert-danger/10 border-alert-danger/30',
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${status ? statusColors[status] : 'bg-secondary/50 border-border'}`}>
      <div className="p-2 rounded-lg bg-background/50">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold text-foreground">{value}</div>
        {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
      </div>
    </div>
  );
};

export default CurrentWeatherCard;
