import { useState } from 'react';
import { GOVERNORATES, getWeatherIcon, getConditionNameAr, MOCK_ALERTS } from '@/data/weatherData';
import { Governorate } from '@/types/weather';
import { useGovernorateWeather } from '@/hooks/useWeather';
import { 
  MapPin, Wind, Droplets, ThermometerSun, Eye, Gauge, 
  Sunrise, Sunset, CloudRain, Calendar, AlertTriangle,
  TrendingUp, Navigation, Clock
} from 'lucide-react';
import FullscreenMap from '@/components/map/FullscreenMap';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const defaultGovernorate = GOVERNORATES.find((g) => g.id === 'ramallah')!;
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate>(defaultGovernorate);

  const { data, isLoading } = useGovernorateWeather(selectedGovernorate.id);
  const weather = data?.weather;
  const hourly = data?.hourly || [];
  const daily = data?.daily || [];

  const handleGovernorateChange = (value: string) => {
    const gov = GOVERNORATES.find(g => g.id === value);
    if (gov) setSelectedGovernorate(gov);
  };

  const formatHour = (isoString: string) => {
    const date = new Date(isoString);
    const hour = date.getHours();
    if (hour === 0) return '12 ص';
    if (hour === 12) return '12 م';
    if (hour < 12) return `${hour} ص`;
    return `${hour - 12} م`;
  };

  const formatDay = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'اليوم';
    if (date.toDateString() === tomorrow.toDateString()) return 'غداً';
    return date.toLocaleDateString('ar-PS', { weekday: 'short' });
  };

  const activeAlerts = MOCK_ALERTS.filter(a => 
    a.governorateIds.includes(selectedGovernorate.id)
  );

  return (
    <div className="h-screen w-screen relative overflow-hidden" dir="rtl">
      {/* الخريطة */}
      <FullscreenMap
        onGovernorateSelect={setSelectedGovernorate}
        selectedGovernorateId={selectedGovernorate.id}
      />

      {/* الشريط العلوي - شفاف */}
      <div className="absolute top-0 left-0 right-0 z-[1000] glass-card-elevated border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">ق</span>
            </div>
            <span className="font-bold text-lg hidden sm:block">QANWP</span>
          </div>
          
          <Select value={selectedGovernorate.id} onValueChange={handleGovernorateChange}>
            <SelectTrigger className="w-48 bg-background/60 border-border/50">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {GOVERNORATES.map(gov => (
                <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={14} />
            <span>{new Date().toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* اللوحة الجانبية اليمنى - المعلومات الرئيسية */}
      <div className="absolute top-16 right-4 z-[1000] w-80 max-h-[calc(100vh-100px)] overflow-y-auto hide-scrollbar space-y-3">
        
        {/* بطاقة الطقس الحالي */}
        <div className="glass-card-elevated p-4 animate-slide-up">
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="animate-pulse-soft text-muted-foreground">جاري التحميل...</div>
            </div>
          ) : weather ? (
            <>
              {/* العنوان والحالة */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-lg">{selectedGovernorate.nameAr}</h2>
                  <p className="text-sm text-muted-foreground">{getConditionNameAr(weather.condition)}</p>
                </div>
                <span className="text-5xl">{getWeatherIcon(weather.condition)}</span>
              </div>

              {/* درجة الحرارة الرئيسية */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-bold">{weather.temperature}°</span>
                <div className="text-sm text-muted-foreground">
                  <span className="text-temp-hot">{weather.temperatureMax}°</span>
                  <span className="mx-1">/</span>
                  <span className="text-temp-cold">{weather.temperatureMin}°</span>
                </div>
              </div>

              {/* الإحصائيات السريعة */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <Droplets size={16} className="text-weather-rainy" />
                  <div>
                    <div className="text-xs text-muted-foreground">الرطوبة</div>
                    <div className="font-semibold">{weather.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <Wind size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">الرياح</div>
                    <div className="font-semibold">{weather.windSpeed} كم/س</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <CloudRain size={16} className="text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">هطول</div>
                    <div className="font-semibold">{weather.precipitation} مم</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <Eye size={16} className="text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">جودة الهواء</div>
                    <div className="font-semibold">{weather.airQuality < 50 ? 'جيد' : 'متوسط'}</div>
                  </div>
                </div>
              </div>

              {/* الشروق والغروب */}
              <div className="flex items-center justify-around mt-3 pt-3 border-t border-border/50 text-xs">
                <div className="flex items-center gap-1">
                  <Sunrise size={14} className="text-weather-sunny" />
                  <span>{weather.sunrise}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sunset size={14} className="text-weather-sunny" />
                  <span>{weather.sunset}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Navigation size={14} />
                  <span>{weather.windDirection}</span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* التحذيرات إن وجدت */}
        {activeAlerts.length > 0 && (
          <div className="glass-card-elevated p-3 border-alert-warning/50 animate-slide-up">
            <div className="flex items-center gap-2 text-alert-warning mb-2">
              <AlertTriangle size={18} />
              <span className="font-bold text-sm">تحذيرات نشطة</span>
            </div>
            {activeAlerts.map(alert => (
              <div key={alert.id} className="text-xs bg-alert-warning/10 rounded-lg p-2 mb-1 last:mb-0">
                <span className="font-medium">{alert.titleAr}</span>
              </div>
            ))}
          </div>
        )}

        {/* احتمالية الأمطار - الساعات القادمة */}
        <div className="glass-card-elevated p-3 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <CloudRain size={16} className="text-weather-rainy" />
            <span className="font-bold text-sm">احتمالية الأمطار</span>
          </div>
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            {hourly.slice(0, 8).map((h, i) => (
              <div key={i} className="flex-shrink-0 text-center w-12">
                <div className="text-xs text-muted-foreground">{i === 0 ? 'الآن' : formatHour(h.time)}</div>
                <div className="text-lg font-bold my-1">{getWeatherIcon(h.condition)}</div>
                <div className={`text-xs font-medium ${h.precipitation > 30 ? 'text-weather-rainy' : 'text-muted-foreground'}`}>
                  {h.precipitation}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* اللوحة السفلية - التوقعات */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000]">
        <div className="glass-card-elevated mx-4 mb-4 p-3 animate-slide-up">
          <Tabs defaultValue="hourly" className="w-full">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="h-8">
                <TabsTrigger value="hourly" className="text-xs px-3 h-7">كل ساعة</TabsTrigger>
                <TabsTrigger value="daily" className="text-xs px-3 h-7">7 أيام</TabsTrigger>
              </TabsList>
              <Badge variant="outline" className="text-xs">
                <TrendingUp size={12} className="mr-1" />
                دقة 94%
              </Badge>
            </div>

            <TabsContent value="hourly" className="mt-0">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {hourly.slice(0, 12).map((h, i) => (
                  <div 
                    key={i} 
                    className={`flex-shrink-0 text-center p-2 rounded-lg min-w-[60px] transition-all
                      ${i === 0 ? 'bg-primary/20 border border-primary/30' : 'bg-secondary/40 hover:bg-secondary/60'}`}
                  >
                    <div className="text-xs text-muted-foreground">{i === 0 ? 'الآن' : formatHour(h.time)}</div>
                    <div className="text-xl my-1">{getWeatherIcon(h.condition)}</div>
                    <div className="font-bold">{h.temperature}°</div>
                    {h.precipitation > 0 && (
                      <div className="text-xs text-weather-rainy">💧{h.precipitation}%</div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="daily" className="mt-0">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {daily.map((d, i) => (
                  <div 
                    key={i} 
                    className={`flex-shrink-0 text-center p-2 rounded-lg min-w-[70px] transition-all
                      ${i === 0 ? 'bg-primary/20 border border-primary/30' : 'bg-secondary/40 hover:bg-secondary/60'}`}
                  >
                    <div className="text-xs font-medium">{formatDay(d.date)}</div>
                    <div className="text-2xl my-1">{getWeatherIcon(d.condition)}</div>
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <span className="font-bold">{d.temperatureMax}°</span>
                      <span className="text-muted-foreground text-xs">{d.temperatureMin}°</span>
                    </div>
                    {d.precipitation > 0 && (
                      <div className="text-xs text-weather-rainy mt-1">💧{d.precipitation}%</div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* معلومات إضافية - الزاوية السفلى اليمنى */}
      <div className="absolute bottom-24 right-4 z-[1000]">
        <div className="glass-card-elevated p-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-alert-safe animate-pulse"></div>
            <span>بيانات حية</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
