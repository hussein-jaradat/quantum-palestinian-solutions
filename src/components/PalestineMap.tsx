import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GOVERNORATES, generateMockWeatherData, getWeatherIcon } from '@/data/weatherData';
import { Governorate, WeatherData } from '@/types/weather';

interface PalestineMapProps {
  onGovernorateSelect: (governorate: Governorate, weather: WeatherData) => void;
  selectedGovernorateId?: string;
}

const PalestineMap = ({ onGovernorateSelect, selectedGovernorateId }: PalestineMapProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const weatherByGovernorate = useMemo(() => {
    const data: Record<string, WeatherData> = {};
    GOVERNORATES.forEach((gov) => {
      data[gov.id] = generateMockWeatherData(gov.id);
    });
    return data;
  }, []);

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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center justify-between">
          <span>🗺️ خريطة فلسطين</span>
          <Badge variant="outline" className="font-normal">
            {GOVERNORATES.length} محافظة
          </Badge>
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
                  {regions[region].map((gov) => {
                    const weather = weatherByGovernorate[gov.id];
                    const isSelected = selectedGovernorateId === gov.id;
                    const isHovered = hoveredId === gov.id;

                    return (
                      <button
                        key={gov.id}
                        onClick={() => onGovernorateSelect(gov, weather)}
                        onMouseEnter={() => setHoveredId(gov.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`
                          p-3 rounded-xl border transition-all duration-200 text-right
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground border-primary shadow-weather scale-105' 
                            : isHovered 
                              ? 'bg-secondary border-primary/50 scale-102'
                              : 'bg-card border-border hover:border-primary/30'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
                          <div className="text-right">
                            <div className="font-semibold text-sm">{gov.nameAr}</div>
                            <div className={`text-lg font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                              {weather.temperature}°
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
                  const weather = weatherByGovernorate[gov.id];
                  const isSelected = selectedGovernorateId === gov.id;
                  const isHovered = hoveredId === gov.id;

                  return (
                    <button
                      key={gov.id}
                      onClick={() => onGovernorateSelect(gov, weather)}
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
                        <span className="text-3xl">{getWeatherIcon(weather.condition)}</span>
                        <div className="text-right">
                          <div className="font-semibold">{gov.nameAr}</div>
                          <div className={`text-2xl font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {weather.temperature}°
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            رطوبة: {weather.humidity}%
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Legend */}
            <div className="mt-6 p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-semibold mb-3 text-sm">مفتاح الألوان</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
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
