import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyForecast, HourlyForecast } from '@/types/weather';
import { getWeatherIcon } from '@/data/weatherData';

interface ForecastSectionProps {
  hourlyData: HourlyForecast[];
  dailyData: DailyForecast[];
}

const ForecastSection = ({ hourlyData, dailyData }: ForecastSectionProps) => {
  const formatHour = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ar-PS', { hour: 'numeric', hour12: true });
  };

  const formatDay = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'غداً';
    }
    return date.toLocaleDateString('ar-PS', { weekday: 'long' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📅</span>
          <span>التنبؤات</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="hourly">كل ساعة</TabsTrigger>
            <TabsTrigger value="daily">أسبوعي</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hourly" className="mt-0">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
              {hourlyData.slice(0, 12).map((hour, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 flex flex-col items-center p-3 rounded-xl bg-secondary/50 border border-border min-w-[80px]"
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {index === 0 ? 'الآن' : formatHour(hour.time)}
                  </span>
                  <span className="text-2xl my-2">{getWeatherIcon(hour.condition)}</span>
                  <span className="font-bold text-lg">{hour.temperature}°</span>
                  {hour.precipitation > 0 && (
                    <span className="text-xs text-weather-rainy mt-1">
                      💧 {hour.precipitation}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="daily" className="mt-0">
            <div className="space-y-3">
              {dailyData.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{getWeatherIcon(day.condition)}</span>
                    <div>
                      <div className="font-semibold">{formatDay(day.date)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('ar-PS', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {day.precipitation > 0 && (
                      <div className="text-sm text-weather-rainy flex items-center gap-1">
                        <span>💧</span>
                        <span>{day.precipitation}%</span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      رطوبة {day.humidity}%
                    </div>
                    <div className="flex items-center gap-2 min-w-[100px] justify-end">
                      <span className="font-bold text-lg">{day.temperatureMax}°</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{day.temperatureMin}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ForecastSection;
