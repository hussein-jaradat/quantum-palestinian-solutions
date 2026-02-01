import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Leaf, Droplets, Thermometer, Calendar, AlertTriangle, 
  Sun, CloudRain, Wind, Bug 
} from 'lucide-react';
import { WeatherData, DailyForecast } from '@/types/weather';

interface AgriculturalForecastProps {
  weather: WeatherData | null;
  dailyData: DailyForecast[];
  governorateName: string;
}

const AgriculturalForecast = ({ weather, dailyData, governorateName }: AgriculturalForecastProps) => {
  // Calculate agricultural metrics
  const avgTemp = weather ? (weather.temperatureMax + weather.temperatureMin) / 2 : 15;
  const frostRisk = weather && weather.temperatureMin < 5 ? 'high' : weather && weather.temperatureMin < 10 ? 'medium' : 'low';
  const soilMoisture = weather ? Math.min(100, weather.humidity + (weather.precipitation * 2)) : 50;
  
  // Irrigation recommendation based on conditions
  const getIrrigationAdvice = () => {
    if (weather?.precipitation && weather.precipitation > 10) {
      return { text: 'لا تحتاج للري اليوم', type: 'success' as const };
    }
    if (weather?.humidity && weather.humidity > 70) {
      return { text: 'ري خفيف مساءً', type: 'warning' as const };
    }
    return { text: 'ري معتدل صباحاً ومساءً', type: 'info' as const };
  };

  // Seasonal planting recommendations (based on current month)
  const getSeasonalCrops = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) { // Spring
      return ['الطماطم', 'الخيار', 'الفلفل', 'الباذنجان', 'الكوسا'];
    } else if (month >= 5 && month <= 7) { // Summer
      return ['الذرة', 'البطيخ', 'الشمام', 'الفاصوليا'];
    } else if (month >= 8 && month <= 10) { // Fall
      return ['البصل', 'الثوم', 'الملفوف', 'القرنبيط', 'الزيتون'];
    } else { // Winter
      return ['السبانخ', 'الخس', 'البقدونس', 'الفجل', 'الجرجير'];
    }
  };

  const irrigationAdvice = getIrrigationAdvice();
  const seasonalCrops = getSeasonalCrops();
  const rainyDays = dailyData.filter((d) => d.precipitation > 30).length;

  // Pest warnings based on humidity and temperature
  const getPestWarnings = () => {
    const warnings: string[] = [];
    if (weather?.humidity && weather.humidity > 70) {
      warnings.push('خطر الفطريات - استخدم مبيد فطري وقائي');
    }
    if (avgTemp > 25 && avgTemp < 35) {
      warnings.push('نشاط متوقع للحشرات - راقب المحاصيل يومياً');
    }
    if (weather?.humidity && weather.humidity < 30) {
      warnings.push('خطر العنكبوت الأحمر بسبب الجفاف');
    }
    return warnings;
  };

  const pestWarnings = getPestWarnings();

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-alert-safe/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="text-primary" />
            <span>التوقعات الزراعية - {governorateName}</span>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            للمزارعين
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary/30 rounded-xl text-center">
            <Droplets className="h-6 w-6 mx-auto mb-2 text-weather-rainy" />
            <div className="text-2xl font-bold">{soilMoisture}%</div>
            <div className="text-xs text-muted-foreground">رطوبة التربة المقدرة</div>
          </div>
          <div className={`p-4 rounded-xl text-center ${
            frostRisk === 'high' ? 'bg-alert-danger/20' : 
            frostRisk === 'medium' ? 'bg-alert-warning/20' : 'bg-alert-safe/20'
          }`}>
            <Thermometer className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {frostRisk === 'high' ? 'عالي' : frostRisk === 'medium' ? 'متوسط' : 'منخفض'}
            </div>
            <div className="text-xs text-muted-foreground">خطر الصقيع</div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-xl text-center">
            <CloudRain className="h-6 w-6 mx-auto mb-2 text-weather-rainy" />
            <div className="text-2xl font-bold">{rainyDays}</div>
            <div className="text-xs text-muted-foreground">أيام ماطرة (7 أيام)</div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-xl text-center">
            <Wind className="h-6 w-6 mx-auto mb-2 text-weather-cloudy" />
            <div className="text-2xl font-bold">{weather?.windSpeed || '--'}</div>
            <div className="text-xs text-muted-foreground">سرعة الرياح كم/س</div>
          </div>
        </div>

        {/* Irrigation Advice */}
        <Alert className={`
          ${irrigationAdvice.type === 'success' ? 'border-alert-safe bg-alert-safe/10' : 
            irrigationAdvice.type === 'warning' ? 'border-alert-warning bg-alert-warning/10' : 
            'border-primary bg-primary/10'}
        `}>
          <Droplets className="h-4 w-4" />
          <AlertTitle>توصية الري لليوم</AlertTitle>
          <AlertDescription>{irrigationAdvice.text}</AlertDescription>
        </Alert>

        {/* Frost Warning */}
        {frostRisk !== 'low' && (
          <Alert className="border-alert-danger bg-alert-danger/10">
            <AlertTriangle className="h-4 w-4 text-alert-danger" />
            <AlertTitle className="text-alert-danger">تحذير من الصقيع</AlertTitle>
            <AlertDescription>
              درجات الحرارة المتوقعة منخفضة ({weather?.temperatureMin}°). 
              يُنصح بتغطية المحاصيل الحساسة ليلاً.
            </AlertDescription>
          </Alert>
        )}

        {/* Seasonal Crops */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            محاصيل الموسم المناسبة للزراعة
          </h4>
          <div className="flex flex-wrap gap-2">
            {seasonalCrops.map((crop, i) => (
              <Badge key={i} variant="outline" className="bg-primary/10 border-primary/30">
                🌱 {crop}
              </Badge>
            ))}
          </div>
        </div>

        {/* Pest Warnings */}
        {pestWarnings.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Bug className="h-5 w-5 text-accent" />
              تحذيرات الآفات
            </h4>
            <div className="space-y-2">
              {pestWarnings.map((warning, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <AlertTriangle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7-Day Agricultural Outlook */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-weather-sunny" />
            النظرة الأسبوعية للمزارعين
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {dailyData.slice(0, 7).map((day, i) => {
              const isGoodForPlanting = day.temperatureMax < 30 && day.temperatureMin > 5 && day.precipitation < 50;
              return (
                <div 
                  key={i}
                  className={`p-2 rounded-lg text-center text-xs ${
                    isGoodForPlanting ? 'bg-alert-safe/20 border border-alert-safe/30' : 'bg-secondary/30'
                  }`}
                >
                  <div className="font-medium mb-1">
                    {new Date(day.date).toLocaleDateString('ar-PS', { weekday: 'short' })}
                  </div>
                  <div className="text-lg">{day.precipitation > 30 ? '🌧️' : day.temperatureMax > 30 ? '🔥' : '✅'}</div>
                  <div className="text-muted-foreground mt-1">{day.temperatureMax}°</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            ✅ = مناسب للزراعة | 🌧️ = أمطار متوقعة | 🔥 = حرارة عالية
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgriculturalForecast;
