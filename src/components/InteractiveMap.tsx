import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GOVERNORATES, getWeatherIcon, getConditionNameAr } from '@/data/weatherData';
import { Governorate } from '@/types/weather';
import { useAllGovernoratesWeather } from '@/hooks/useWeather';
import { RefreshCw, MapPin } from 'lucide-react';

interface InteractiveMapProps {
  onGovernorateSelect: (governorate: Governorate) => void;
  selectedGovernorateId?: string;
}

const PALESTINE_CENTER: L.LatLngExpression = [31.9, 35.0];

const getTemperatureColor = (temp: number): string => {
  if (temp >= 35) return '#ef4444';
  if (temp >= 30) return '#f97316';
  if (temp >= 25) return '#eab308';
  if (temp >= 20) return '#22c55e';
  if (temp >= 15) return '#06b6d4';
  return '#3b82f6';
};

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

const InteractiveMap = ({
  onGovernorateSelect,
  selectedGovernorateId,
}: InteractiveMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const { data: weatherData, isLoading, isError, refetch, isFetching } =
    useAllGovernoratesWeather();
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'terrain'>('standard');

  const stats = useMemo(() => {
    if (!weatherData || Object.keys(weatherData).length === 0) return null;
    const temps = Object.values(weatherData).map((w) => w.temperature);
    return {
      max: Math.max(...temps),
      min: Math.min(...temps),
      avg: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
    };
  }, [weatherData]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: PALESTINE_CENTER,
      zoom: 8,
      minZoom: 7,
      maxZoom: 12,
      zoomControl: true,
    });

    tileLayerRef.current = L.tileLayer(tileLayers.standard.url, {
      attribution: tileLayers.standard.attribution,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle tile layer changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.setUrl(tileLayers[mapStyle].url);
  }, [mapStyle]);

  // Create popup content
  const createPopupContent = useCallback(
    (gov: Governorate) => {
      const weather = weatherData?.[gov.id];
      const icon = weather ? getWeatherIcon(weather.condition) : '🌤️';
      const conditionName = weather ? getConditionNameAr(weather.condition) : 'غير معروف';

      return `
        <div style="font-family: 'Cairo', sans-serif; direction: rtl; min-width: 180px; padding: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-weight: bold; font-size: 16px; margin: 0;">${gov.nameAr}</h3>
            <span style="font-size: 28px;">${icon}</span>
          </div>
          ${
            weather
              ? `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <span>🌡️ درجة الحرارة</span>
                <strong>${weather.temperature}°C</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <span>💧 الرطوبة</span>
                <strong>${weather.humidity}%</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <span>💨 الرياح</span>
                <strong>${weather.windSpeed} كم/س</strong>
              </div>
              <div style="text-align: center; padding-top: 8px; border-top: 1px solid #eee;">
                <span style="background: #f0f0f0; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${conditionName}</span>
              </div>
            </div>
          `
              : '<p style="color: #888;">جاري التحميل...</p>'
          }
        </div>
      `;
    },
    [weatherData]
  );

  // Update markers when weather data changes
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Create new markers
    GOVERNORATES.forEach((gov) => {
      const weather = weatherData?.[gov.id];
      const temp = weather?.temperature || 20;
      const condition = weather?.condition || 'sunny';
      const isSelected = selectedGovernorateId === gov.id;
      const color = getTemperatureColor(temp);
      const icon = getWeatherIcon(condition);

      const divIcon = L.divIcon({
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
              font-size: ${isSelected ? '14px' : '12px'};
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
        iconSize: [60, 80],
        iconAnchor: [30, 80],
        popupAnchor: [0, -70],
      });

      const marker = L.marker([gov.coordinates.lat, gov.coordinates.lng], {
        icon: divIcon,
      }).addTo(map);

      marker.bindPopup(createPopupContent(gov), {
        closeButton: true,
        className: 'custom-popup',
      });

      marker.on('click', () => {
        onGovernorateSelect(gov);
      });

      markersRef.current.set(gov.id, marker);
    });
  }, [weatherData, selectedGovernorateId, createPopupContent, onGovernorateSelect]);

  // Fly to selected governorate
  useEffect(() => {
    if (!mapRef.current || !selectedGovernorateId) return;

    const gov = GOVERNORATES.find((g) => g.id === selectedGovernorateId);
    if (gov) {
      mapRef.current.flyTo([gov.coordinates.lat, gov.coordinates.lng], 10, {
        duration: 1,
      });
    }
  }, [selectedGovernorateId]);

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
              <p className="text-xs text-muted-foreground">
                اضغط على أي محافظة لعرض التفاصيل
              </p>
            </div>
            {isError && (
              <Badge variant="destructive" className="text-xs">
                خطأ في التحميل
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
        <div
          ref={mapContainerRef}
          className="h-[500px] md:h-[600px] w-full"
          style={{ zIndex: 1 }}
        />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border">
          <h4 className="text-xs font-bold mb-2 text-center">مؤشر الحرارة</h4>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-destructive"></div>
              <span>35°+ ساخن جداً</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span>30-35° ساخن</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>25-30° دافئ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>20-25° معتدل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
              <span>15-20° بارد</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary"></div>
              <span>&lt;15° بارد جداً</span>
            </div>
          </div>
        </div>

        {/* Region Stats */}
        <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border max-w-[200px]">
          <h4 className="text-xs font-bold mb-2">إحصائيات سريعة</h4>
          {stats && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>أعلى حرارة:</span>
                <span className="font-bold text-destructive">{stats.max}°</span>
              </div>
              <div className="flex justify-between">
                <span>أدنى حرارة:</span>
                <span className="font-bold text-primary">{stats.min}°</span>
              </div>
              <div className="flex justify-between">
                <span>متوسط الحرارة:</span>
                <span className="font-bold">{stats.avg}°</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
