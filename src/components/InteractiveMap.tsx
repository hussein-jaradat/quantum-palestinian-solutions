import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GOVERNORATES, getWeatherIcon, getConditionNameAr } from '@/data/weatherData';
import { Governorate, WeatherData } from '@/types/weather';
import { useAllGovernoratesWeather } from '@/hooks/useWeather';
import { RefreshCw, Thermometer, Droplets, Wind, MapPin, Layers } from 'lucide-react';

interface InteractiveMapProps {
  onGovernorateSelect: (governorate: Governorate) => void;
  selectedGovernorateId?: string;
}

// Custom marker icon creator based on temperature
const createTemperatureIcon = (temp: number, condition: string, isSelected: boolean) => {
  const getColor = (t: number) => {
    if (t >= 35) return '#ef4444'; // red
    if (t >= 30) return '#f97316'; // orange
    if (t >= 25) return '#eab308'; // yellow
    if (t >= 20) return '#22c55e'; // green
    if (t >= 15) return '#06b6d4'; // cyan
    return '#3b82f6'; // blue
  };

  const color = getColor(temp);
  const icon = getWeatherIcon(condition as any);
  const size = isSelected ? 60 : 48;
  const fontSize = isSelected ? '14px' : '12px';

  return L.divIcon({
    className: 'custom-temp-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
        cursor: pointer;
        transition: all 0.3s ease;
      ">
        <div style="
          background: linear-gradient(135deg, ${color}, ${color}dd);
          color: white;
          padding: 6px 10px;
          border-radius: 12px;
          font-weight: bold;
          font-size: ${fontSize};
          font-family: 'Cairo', sans-serif;
          box-shadow: 0 4px 12px ${color}66;
          border: 2px solid white;
          display: flex;
          align-items: center;
          gap: 4px;
          ${isSelected ? 'transform: scale(1.15); box-shadow: 0 6px 20px ' + color + '88;' : ''}
        ">
          <span style="font-size: 16px;">${icon}</span>
          <span>${temp}°</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid ${color};
          margin-top: -2px;
        "></div>
      </div>
    `,
    iconSize: [size, size + 20],
    iconAnchor: [size / 2, size + 20],
    popupAnchor: [0, -size - 10],
  });
};

// Map bounds for Palestine
const PALESTINE_BOUNDS: L.LatLngBoundsExpression = [
  [31.2, 34.2], // Southwest
  [32.6, 35.6], // Northeast
];

const PALESTINE_CENTER: L.LatLngExpression = [31.9, 35.0];

// Component to handle map events
const MapController = ({ selectedGovernorateId }: { selectedGovernorateId?: string }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedGovernorateId) {
      const gov = GOVERNORATES.find(g => g.id === selectedGovernorateId);
      if (gov) {
        map.flyTo([gov.coordinates.lat, gov.coordinates.lng], 10, {
          duration: 1,
        });
      }
    }
  }, [selectedGovernorateId, map]);
  
  return null;
};

const InteractiveMap = ({ onGovernorateSelect, selectedGovernorateId }: InteractiveMapProps) => {
  const { data: weatherData, isLoading, isError, refetch, isFetching } = useAllGovernoratesWeather();
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'terrain'>('standard');

  const tileLayers = {
    standard: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap',
    },
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            خريطة فلسطين التفاعلية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">خريطة فلسطين التفاعلية</h3>
              <p className="text-xs text-muted-foreground">اضغط على أي محافظة لعرض التفاصيل</p>
            </div>
            {isError && (
              <Badge variant="destructive" className="text-xs">
                خطأ في التحميل
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Map Style Selector */}
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <Button
                variant={mapStyle === 'standard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMapStyle('standard')}
                className="h-7 text-xs"
              >
                عادي
              </Button>
              <Button
                variant={mapStyle === 'satellite' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMapStyle('satellite')}
                className="h-7 text-xs"
              >
                قمر صناعي
              </Button>
              <Button
                variant={mapStyle === 'terrain' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMapStyle('terrain')}
                className="h-7 text-xs"
              >
                تضاريس
              </Button>
            </div>
            
            <Button
              variant="outline"
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
      
      <CardContent className="p-0 relative">
        <div className="h-[500px] md:h-[600px] w-full">
          <MapContainer
            center={PALESTINE_CENTER}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            maxBounds={PALESTINE_BOUNDS}
            minZoom={7}
            maxZoom={12}
            className="z-0"
          >
            <TileLayer
              url={tileLayers[mapStyle].url}
              attribution={tileLayers[mapStyle].attribution}
            />
            
            <MapController selectedGovernorateId={selectedGovernorateId} />
            
            {GOVERNORATES.map((gov) => {
              const weather = weatherData?.[gov.id];
              const isSelected = selectedGovernorateId === gov.id;
              
              return (
                <Marker
                  key={gov.id}
                  position={[gov.coordinates.lat, gov.coordinates.lng]}
                  icon={createTemperatureIcon(
                    weather?.temperature || 20,
                    weather?.condition || 'sunny',
                    isSelected
                  )}
                  eventHandlers={{
                    click: () => onGovernorateSelect(gov),
                  }}
                >
                  <Popup className="custom-popup" closeButton={false}>
                    <div className="p-3 min-w-[200px] font-cairo" dir="rtl">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">{gov.nameAr}</h3>
                        <span className="text-3xl">{weather ? getWeatherIcon(weather.condition) : '🌤️'}</span>
                      </div>
                      
                      {weather ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-red-500" />
                              <span className="text-sm">درجة الحرارة</span>
                            </div>
                            <span className="font-bold text-lg">{weather.temperature}°C</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">الرطوبة</span>
                            </div>
                            <span className="font-bold">{weather.humidity}%</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Wind className="h-4 w-4 text-green-500" />
                              <span className="text-sm">الرياح</span>
                            </div>
                            <span className="font-bold">{weather.windSpeed} كم/س</span>
                          </div>
                          
                          <div className="text-center pt-2 border-t">
                            <Badge variant="secondary">
                              {getConditionNameAr(weather.condition)}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">جاري التحميل...</p>
                      )}
                      
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => onGovernorateSelect(gov)}
                      >
                        عرض التفاصيل الكاملة
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border">
          <h4 className="text-xs font-bold mb-2 text-center">مؤشر الحرارة</h4>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
              <span>35°+ ساخن جداً</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f97316]"></div>
              <span>30-35° ساخن</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#eab308]"></div>
              <span>25-30° دافئ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#22c55e]"></div>
              <span>20-25° معتدل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#06b6d4]"></div>
              <span>15-20° بارد</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
              <span>&lt;15° بارد جداً</span>
            </div>
          </div>
        </div>
        
        {/* Region Stats */}
        <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border max-w-[200px]">
          <h4 className="text-xs font-bold mb-2">إحصائيات سريعة</h4>
          {weatherData && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>أعلى حرارة:</span>
                <span className="font-bold text-red-500">
                  {Math.max(...Object.values(weatherData).map(w => w.temperature))}°
                </span>
              </div>
              <div className="flex justify-between">
                <span>أدنى حرارة:</span>
                <span className="font-bold text-blue-500">
                  {Math.min(...Object.values(weatherData).map(w => w.temperature))}°
                </span>
              </div>
              <div className="flex justify-between">
                <span>متوسط الحرارة:</span>
                <span className="font-bold">
                  {Math.round(Object.values(weatherData).reduce((a, b) => a + b.temperature, 0) / Object.values(weatherData).length)}°
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
