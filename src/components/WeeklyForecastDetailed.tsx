import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DailyForecast } from '@/types/weather';
import { getWeatherIcon, getConditionNameAr } from '@/data/weatherData';
import { Thermometer, Droplets, Wind, Sun, Moon, TrendingUp, TrendingDown } from 'lucide-react';

interface WeeklyForecastDetailedProps {
  dailyData: DailyForecast[];
  governorateName: string;
}

const WeeklyForecastDetailed = ({ dailyData, governorateName }: WeeklyForecastDetailedProps) => {
  const formatDay = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return { day: 'اليوم', full: date.toLocaleDateString('ar-PS', { weekday: 'long', month: 'long', day: 'numeric' }) };
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return { day: 'غداً', full: date.toLocaleDateString('ar-PS', { weekday: 'long', month: 'long', day: 'numeric' }) };
    }
    return { 
      day: date.toLocaleDateString('ar-PS', { weekday: 'long' }),
      full: date.toLocaleDateString('ar-PS', { weekday: 'long', month: 'long', day: 'numeric' })
    };
  };

  // Calculate weekly statistics
  const avgMax = Math.round(dailyData.reduce((a, b) => a + b.temperatureMax, 0) / dailyData.length);
  const avgMin = Math.round(dailyData.reduce((a, b) => a + b.temperatureMin, 0) / dailyData.length);
  const totalRainyDays = dailyData.filter(d => d.precipitation > 30).length;
  const avgHumidity = Math.round(dailyData.reduce((a, b) => a + b.humidity, 0) / dailyData.length);

  return (
    <div className="space-y-6">
      {/* Weekly Summary Header */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                📅 التنبؤ الأسبوعي المفصل
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{governorateName} - الأيام السبعة القادمة</p>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {dailyData.length} أيام
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card/60 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp size={16} className="text-accent" />
                <span>متوسط العظمى</span>
              </div>
              <span className="text-2xl font-bold">{avgMax}°</span>
            </div>
            <div className="bg-card/60 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingDown size={16} className="text-primary" />
                <span>متوسط الصغرى</span>
              </div>
              <span className="text-2xl font-bold">{avgMin}°</span>
            </div>
            <div className="bg-card/60 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Droplets size={16} className="text-weather-rainy" />
                <span>أيام ماطرة</span>
              </div>
              <span className="text-2xl font-bold">{totalRainyDays}</span>
            </div>
            <div className="bg-card/60 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Wind size={16} />
                <span>متوسط الرطوبة</span>
              </div>
              <span className="text-2xl font-bold">{avgHumidity}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Daily Cards */}
      <div className="grid gap-4">
        {dailyData.map((day, index) => {
          const { day: dayName, full: fullDate } = formatDay(day.date);
          const isToday = dayName === 'اليوم';
          const tempRange = day.temperatureMax - day.temperatureMin;
          
          return (
            <Card 
              key={index} 
              className={`transition-all duration-300 hover:shadow-lg ${
                isToday ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Day Info */}
                  <div className="flex items-center gap-4 md:min-w-[200px]">
                    <div className="text-5xl">{getWeatherIcon(day.condition)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{dayName}</span>
                        {isToday && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            الآن
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{fullDate}</p>
                      <p className="text-sm font-medium text-primary mt-1">{getConditionNameAr(day.condition)}</p>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Sun size={16} className="text-weather-sunny" />
                          <span className="font-bold text-xl">{day.temperatureMax}°</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Moon size={16} className="text-muted-foreground" />
                          <span className="text-muted-foreground text-lg">{day.temperatureMin}°</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        فرق {tempRange}°
                      </span>
                    </div>
                    
                    {/* Temperature bar */}
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                        style={{ 
                          left: `${(day.temperatureMin / 40) * 100}%`,
                          width: `${(tempRange / 40) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 md:min-w-[200px]">
                    <div className="bg-secondary/50 rounded-lg p-2 text-center">
                      <Droplets size={16} className="mx-auto mb-1 text-weather-rainy" />
                      <span className="text-sm font-medium">{day.precipitation}%</span>
                      <p className="text-[10px] text-muted-foreground">أمطار</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2 text-center">
                      <Wind size={16} className="mx-auto mb-1" />
                      <span className="text-sm font-medium">{day.humidity}%</span>
                      <p className="text-[10px] text-muted-foreground">رطوبة</p>
                    </div>
                  </div>
                </div>

                {/* Precipitation indicator */}
                {day.precipitation > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">احتمالية الأمطار</span>
                      <span className="font-medium">{day.precipitation}%</span>
                    </div>
                    <Progress value={day.precipitation} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyForecastDetailed;
