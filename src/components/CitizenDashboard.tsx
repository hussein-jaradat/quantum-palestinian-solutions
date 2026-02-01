import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Umbrella, Shirt, AlertTriangle, Clock, 
  Sun, Moon, Thermometer, Wind, Droplets 
} from 'lucide-react';
import { WeatherData, HourlyForecast, DailyForecast } from '@/types/weather';
import { getWeatherIcon, getConditionNameAr } from '@/data/weatherData';

interface CitizenDashboardProps {
  weather: WeatherData | null;
  hourlyData: HourlyForecast[];
  dailyData: DailyForecast[];
  governorateName: string;
}

const CitizenDashboard = ({ weather, hourlyData, dailyData, governorateName }: CitizenDashboardProps) => {
  const getClothingAdvice = () => {
    if (!weather) return [];
    const temp = weather.temperature;
    const condition = weather.condition;
    
    const advice: string[] = [];
    
    if (temp < 10) {
      advice.push('🧥 معطف ثقيل');
      advice.push('🧣 وشاح وقفازات');
    } else if (temp < 18) {
      advice.push('🧥 جاكيت خفيف');
      advice.push('👕 طبقات متعددة');
    } else if (temp < 25) {
      advice.push('👕 ملابس خفيفة');
      advice.push('👟 حذاء مريح');
    } else {
      advice.push('👕 ملابس قطنية');
      advice.push('🧢 قبعة للشمس');
      advice.push('🕶️ نظارة شمسية');
    }
    
    if (condition === 'rainy' || condition === 'heavy_rain') {
      advice.push('☔ مظلة');
      advice.push('👢 حذاء مقاوم للماء');
    }
    
    return advice;
  };

  const needsUmbrella = weather?.condition === 'rainy' || 
                        weather?.condition === 'heavy_rain' || 
                        weather?.precipitation > 20;

  const getSafetyAlerts = () => {
    const alerts: { icon: React.ReactNode; text: string; severity: 'low' | 'medium' | 'high' }[] = [];
    
    if (!weather) return alerts;
    
    if (weather.temperature > 35) {
      alerts.push({ icon: <Thermometer className="h-4 w-4" />, text: 'موجة حر - اشرب الماء بكثرة', severity: 'high' });
    }
    if (weather.temperature < 5) {
      alerts.push({ icon: <Thermometer className="h-4 w-4" />, text: 'برد شديد - ابق دافئاً', severity: 'medium' });
    }
    if (weather.windSpeed > 40) {
      alerts.push({ icon: <Wind className="h-4 w-4" />, text: 'رياح قوية - تجنب القيادة', severity: 'high' });
    }
    if (weather.precipitation > 30) {
      alerts.push({ icon: <Droplets className="h-4 w-4" />, text: 'أمطار غزيرة - احذر السيول', severity: 'high' });
    }
    if (weather.airQuality > 150) {
      alerts.push({ icon: <AlertTriangle className="h-4 w-4" />, text: 'جودة هواء سيئة - قلل النشاط الخارجي', severity: 'medium' });
    }
    
    return alerts;
  };

  // Prayer times (approximate)
  const prayerTimes = [
    { name: 'الفجر', time: '05:15', icon: '🌙' },
    { name: 'الشروق', time: weather?.sunrise || '06:30', icon: '🌅' },
    { name: 'الظهر', time: '12:25', icon: '☀️' },
    { name: 'العصر', time: '15:30', icon: '🌤️' },
    { name: 'المغرب', time: weather?.sunset || '17:45', icon: '🌇' },
    { name: 'العشاء', time: '19:00', icon: '🌙' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`glass-effect ${needsUmbrella ? 'ring-2 ring-blue-500' : ''}`}>
          <CardContent className="p-4 text-center">
            <Umbrella className={`h-10 w-10 mx-auto mb-2 ${needsUmbrella ? 'text-blue-500' : 'text-muted-foreground'}`} />
            <p className="font-bold text-lg">{needsUmbrella ? 'نعم' : 'لا'}</p>
            <p className="text-xs text-muted-foreground">هل أحتاج مظلة؟</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Shirt className="h-10 w-10 mx-auto mb-2 text-primary" />
            <p className="font-bold text-lg">
              {weather && weather.temperature < 15 ? 'دافئة' : weather && weather.temperature > 28 ? 'خفيفة' : 'معتدلة'}
            </p>
            <p className="text-xs text-muted-foreground">نوع الملابس</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Sun className="h-10 w-10 mx-auto mb-2 text-yellow-500" />
            <p className="font-bold text-lg">{weather?.sunrise || '--:--'}</p>
            <p className="text-xs text-muted-foreground">الشروق</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Moon className="h-10 w-10 mx-auto mb-2 text-indigo-500" />
            <p className="font-bold text-lg">{weather?.sunset || '--:--'}</p>
            <p className="text-xs text-muted-foreground">الغروب</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clothing Advice */}
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shirt className="h-4 w-4 text-primary" />
              ماذا أرتدي اليوم؟
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getClothingAdvice().map((item, i) => (
                <Badge key={i} variant="secondary" className="text-sm py-1.5 px-3">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Alerts */}
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-accent" />
              تنبيهات السلامة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getSafetyAlerts().length > 0 ? (
              <div className="space-y-2">
                {getSafetyAlerts().map((alert, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      alert.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                      alert.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-700' :
                      'bg-primary/10 text-primary'
                    }`}
                  >
                    {alert.icon}
                    <span className="text-sm">{alert.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                ✅ لا توجد تنبيهات - يوم آمن!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prayer Times */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            مواقيت الصلاة في {governorateName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {prayerTimes.map((prayer, i) => (
              <div key={i} className="text-center p-2 rounded-lg bg-secondary/50">
                <span className="text-xl mb-1 block">{prayer.icon}</span>
                <p className="text-xs text-muted-foreground">{prayer.name}</p>
                <p className="font-bold text-sm">{prayer.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Hourly Forecast */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">تنبؤات اليوم بالساعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {hourlyData.slice(0, 12).map((hour, i) => (
              <div key={i} className="flex-shrink-0 text-center p-3 rounded-xl bg-secondary/50 min-w-[70px]">
                <p className="text-xs text-muted-foreground">
                  {new Date(hour.time).getHours()}:00
                </p>
                <span className="text-2xl my-1 block">{getWeatherIcon(hour.condition)}</span>
                <p className="font-bold text-sm">{hour.temperature}°</p>
                {hour.precipitation > 0 && (
                  <p className="text-xs text-blue-500">{hour.precipitation}%</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenDashboard;
