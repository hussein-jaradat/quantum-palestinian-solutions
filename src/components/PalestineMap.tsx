import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GOVERNORATES, getWeatherIcon } from '@/data/weatherData';
import { Governorate, WeatherData } from '@/types/weather';
import { useAllGovernoratesWeather } from '@/hooks/useWeather';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PalestineMapProps {
  onGovernorateSelect: (governorate: Governorate) => void;
  selectedGovernorateId?: string;
}

const PalestineMap = ({ onGovernorateSelect, selectedGovernorateId }: PalestineMapProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { data: weatherData, isLoading, isError, refetch, isFetching } = useAllGovernoratesWeather();

  const regions = {
    north: GOVERNORATES.filter((g) => g.region === 'north'),
    center: GOVERNORATES.filter((g) => g.region === 'center'),
    south: GOVERNORATES.filter((g) => g.region === 'south'),
    gaza: GOVERNORATES.filter((g) => g.region === 'gaza'),
  };

  const regionLabels = {
    north: { ar: 'شمال الضفة', color: 'bg-primary/20 border-primary' },
    center: { ar: 'وسط الضفة', color: 'bg-weather-sunny/20 border-weather-sunny' },
    south: { ar: 'جنوب الضفة', color: 'bg-accent/20 border-accent' },
    gaza: { ar: 'قطاع غزة', color: 'bg-weather-rainy/20 border-weather-rainy' },
  };

  const renderGovernorateCard = (gov: Governorate) => {
    const weather = weatherData?.[gov.id];
    const isSelected = selectedGovernorateId === gov.id;
    const isHovered = hoveredId === gov.id;

    if (isLoading) {
      return (
        <div key={gov.id} className="p-3 rounded-xl border bg-card">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-12" />
        </div>
      );
    }

    return (
      <button
        key={gov.id}
        onClick={() => onGovernorateSelect(gov)}
        onMouseEnter={() => setHoveredId(gov.id)}
        onMouseLeave={() => setHoveredId(null)}
        className={`
          p-3 rounded-xl border transition-all duration-200 text-right w-full
          ${isSelected 
            ? 'bg-primary text-primary-foreground border-primary shadow-weather scale-105' 
            : isHovered 
              ? 'bg-secondary border-primary/50 scale-102'
              : 'bg-card border-border hover:border-primary/30'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <span className="text-2xl">
            {weather ? getWeatherIcon(weather.condition) : '🌤️'}
          </span>
          <div className="text-right">
            <div className="font-semibold text-sm">{gov.nameAr}</div>
            <div className={`text-lg font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
              {weather ? `${weather.temperature}°` : '--°'}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🗺️ خريطة فلسطين</span>
            {isError && (
              <Badge variant="destructive" className="text-xs">
                خطأ في التحميل
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Badge variant="outline" className="font-normal">
              {GOVERNORATES.length} محافظة
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* West Bank */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground border-b pb-2">الضفة الغربية</h3>
            
            {(['north', 'center', 'south'] as const).map((region) => (
              <div key={region}>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 border ${regionLabels[region].color}`}>
                  {regionLabels[region].ar}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {regions[region].map(renderGovernorateCard)}
                </div>
              </div>
            ))}
          </div>

          {/* Gaza Strip */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground border-b pb-2">قطاع غزة</h3>
            
            <div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 border ${regionLabels.gaza.color}`}>
                {regionLabels.gaza.ar}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {regions.gaza.map((gov) => {
                  const weather = weatherData?.[gov.id];
                  const isSelected = selectedGovernorateId === gov.id;
                  const isHovered = hoveredId === gov.id;

                  if (isLoading) {
                    return (
                      <div key={gov.id} className="p-4 rounded-xl border bg-card">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-16" />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={gov.id}
                      onClick={() => onGovernorateSelect(gov)}
                      onMouseEnter={() => setHoveredId(gov.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`
                        p-4 rounded-xl border transition-all duration-200 text-right
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground border-primary shadow-weather scale-105' 
                          : isHovered 
                            ? 'bg-secondary border-primary/50'
                            : 'bg-card border-border hover:border-primary/30'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">
                          {weather ? getWeatherIcon(weather.condition) : '🌤️'}
                        </span>
                        <div className="text-right">
                          <div className="font-semibold">{gov.nameAr}</div>
                          <div className={`text-2xl font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {weather ? `${weather.temperature}°` : '--°'}
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            رطوبة: {weather ? `${weather.humidity}%` : '--%'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data Source Info */}
            <div className="mt-6 p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                <span>📡</span>
                مصدر البيانات
              </h4>
              <p className="text-xs text-muted-foreground">
                بيانات الطقس من Open-Meteo API محدثة كل 15 دقيقة
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">☀️</span>
                  <span>مشمس</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⛅</span>
                  <span>غائم جزئياً</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">☁️</span>
                  <span>غائم</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌧️</span>
                  <span>ماطر</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PalestineMap;
