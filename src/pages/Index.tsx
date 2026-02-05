import { useState } from 'react';
import { GOVERNORATES } from '@/data/weatherData';
import { Governorate } from '@/types/weather';
import { useGovernorateWeather } from '@/hooks/useWeather';
import { MapPin, Wind, CloudRain, Droplets, ThermometerSun } from 'lucide-react';
import { cn } from '@/lib/utils';
import FullscreenMap from '@/components/map/FullscreenMap';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const defaultGovernorate = GOVERNORATES.find((g) => g.id === 'ramallah')!;
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate>(defaultGovernorate);

  const { data, isLoading } = useGovernorateWeather(selectedGovernorate.id);
  const weather = data?.weather;

  const handleGovernorateChange = (value: string) => {
    const gov = GOVERNORATES.find(g => g.id === value);
    if (gov) setSelectedGovernorate(gov);
  };

  return (
    <div className="h-screen w-screen relative" dir="rtl">
      {/* خريطة ملء الشاشة */}
      <FullscreenMap
        onGovernorateSelect={setSelectedGovernorate}
        selectedGovernorateId={selectedGovernorate.id}
      />

      {/* بطاقة الطقس العائمة */}
      <div className="absolute top-4 right-4 z-[1000] w-80">
        <div className="glass-card-elevated p-4 space-y-4">
          {/* اختيار المحافظة */}
          <Select value={selectedGovernorate.id} onValueChange={handleGovernorateChange}>
            <SelectTrigger className="w-full bg-background/80">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {GOVERNORATES.map(gov => (
                <SelectItem key={gov.id} value={gov.id}>{gov.nameAr}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* بيانات الطقس */}
          {isLoading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="animate-pulse-soft text-muted-foreground">جاري التحميل...</div>
            </div>
          ) : weather ? (
            <div className="space-y-4">
              {/* درجة الحرارة الرئيسية */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-bold text-primary">
                    {weather.temperature}°
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {weather.temperatureMax}° / {weather.temperatureMin}°
                  </div>
                </div>
                <ThermometerSun className="h-12 w-12 text-weather-sunny" />
              </div>

              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <Droplets size={16} className="mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">رطوبة</div>
                  <div className="font-semibold">{weather.humidity}%</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <Wind size={16} className="mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">رياح</div>
                  <div className="font-semibold">{weather.windSpeed}</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <CloudRain size={16} className="mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">أمطار</div>
                  <div className="font-semibold">{weather.precipitation}mm</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* توقعات الأيام القادمة */}
      {data?.daily && data.daily.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="glass-card-elevated p-3">
            <div className="flex gap-3 overflow-x-auto hide-scrollbar">
              {data.daily.slice(0, 7).map((day, idx) => (
                <div key={idx} className="flex-shrink-0 text-center p-2 min-w-[70px] rounded-lg bg-secondary/30">
                  <div className="text-xs text-muted-foreground mb-1">
                    {new Date(day.date).toLocaleDateString('ar', { weekday: 'short' })}
                  </div>
                  <div className="font-bold text-primary">{day.temperatureMax}°</div>
                  <div className="text-xs text-muted-foreground">{day.temperatureMin}°</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
