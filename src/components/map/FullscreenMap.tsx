import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { GOVERNORATES, getWeatherIcon, getConditionNameAr } from '@/data/weatherData';
import { Governorate, WeatherData } from '@/types/weather';
import { useAllGovernoratesWeather } from '@/hooks/useWeather';
import { RefreshCw, Maximize2, Minimize2, Layers } from 'lucide-react';
import LayerSwitcher from './LayerSwitcher';
import MapControls from './MapControls';

interface FullscreenMapProps {
  onGovernorateSelect: (governorate: Governorate) => void;
  selectedGovernorateId?: string;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

const PALESTINE_CENTER: L.LatLngExpression = [31.9, 35.0];

const getTemperatureColor = (temp: number): string => {
  if (temp >= 35) return 'hsl(0, 80%, 50%)';
  if (temp >= 30) return 'hsl(30, 90%, 50%)';
  if (temp >= 25) return 'hsl(45, 90%, 50%)';
  if (temp >= 20) return 'hsl(145, 63%, 42%)';
  if (temp >= 15) return 'hsl(180, 60%, 45%)';
  return 'hsl(210, 80%, 50%)';
};

const tileLayers = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
    label: 'عادي',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    label: 'قمر صناعي',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap',
    label: 'تضاريس',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB',
    label: 'داكن',
  },
};

const FullscreenMap = ({
  onGovernorateSelect,
  selectedGovernorateId,
  isFullscreen = false,
  onFullscreenToggle,
}: FullscreenMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const { data: weatherData, isLoading, refetch, isFetching } = useAllGovernoratesWeather();
  const [mapStyle, setMapStyle] = useState<keyof typeof tileLayers>('standard');
  const [showLayerSwitcher, setShowLayerSwitcher] = useState(false);

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
      maxZoom: 14,
      zoomControl: false,
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
        <div style="font-family: 'Cairo', sans-serif; direction: rtl; min-width: 200px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 8px;">
            <h3 style="font-weight: bold; font-size: 16px; margin: 0;">${gov.nameAr}</h3>
            <span style="font-size: 32px;">${icon}</span>
          </div>
          ${weather ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="background: hsl(var(--secondary)); padding: 8px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">${weather.temperature}°</div>
                <div style="font-size: 11px; color: hsl(var(--muted-foreground));">درجة الحرارة</div>
              </div>
              <div style="background: hsl(var(--secondary)); padding: 8px; border-radius: 8px; text-align: center;">
                <div style="font-size: 18px; font-weight: bold;">💧 ${weather.humidity}%</div>
                <div style="font-size: 11px; color: hsl(var(--muted-foreground));">الرطوبة</div>
              </div>
              <div style="background: hsl(var(--secondary)); padding: 8px; border-radius: 8px; text-align: center;">
                <div style="font-size: 18px; font-weight: bold;">💨 ${weather.windSpeed}</div>
                <div style="font-size: 11px; color: hsl(var(--muted-foreground));">كم/س</div>
              </div>
              <div style="background: hsl(var(--secondary)); padding: 8px; border-radius: 8px; text-align: center;">
                <div style="font-size: 18px; font-weight: bold;">🌧️ ${weather.precipitation}</div>
                <div style="font-size: 11px; color: hsl(var(--muted-foreground));">مم</div>
              </div>
            </div>
            <div style="text-align: center; margin-top: 12px;">
              <span style="background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); padding: 4px 12px; border-radius: 12px; font-size: 12px;">${conditionName}</span>
            </div>
          ` : '<p style="color: hsl(var(--muted-foreground)); text-align: center;">جاري التحميل...</p>'}
        </div>
      `;
    },
    [weatherData]
  );

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

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
            transition: all 0.2s ease;
            filter: ${isSelected ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))'};
          ">
            <div style="
              background: linear-gradient(135deg, ${color}, ${color}dd);
              color: white;
              padding: 8px 12px;
              border-radius: 16px;
              font-weight: bold;
              font-size: ${isSelected ? '14px' : '13px'};
              font-family: 'Cairo', sans-serif;
              border: 2px solid rgba(255,255,255,0.9);
              display: flex;
              align-items: center;
              gap: 6px;
              transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
            ">
              <span style="font-size: 18px;">${icon}</span>
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
        iconSize: [70, 90],
        iconAnchor: [35, 90],
        popupAnchor: [0, -80],
      });

      const marker = L.marker([gov.coordinates.lat, gov.coordinates.lng], {
        icon: divIcon,
      }).addTo(map);

      marker.bindPopup(createPopupContent(gov), {
        closeButton: true,
        className: 'custom-popup',
        maxWidth: 280,
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
        duration: 0.8,
      });
    }
  }, [selectedGovernorateId]);

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-48px)]">
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      />

      {/* Map Controls */}
      <MapControls
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onRefresh={() => refetch()}
        onFullscreen={onFullscreenToggle}
        isFullscreen={isFullscreen}
        isFetching={isFetching}
      />

      {/* Layer Switcher Toggle */}
      <div className="map-overlay-top-left">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLayerSwitcher(!showLayerSwitcher)}
          className="glass-card gap-2 shadow-weather"
        >
          <Layers size={16} />
          <span className="hidden sm:inline">الطبقات</span>
        </Button>

        {showLayerSwitcher && (
          <LayerSwitcher
            currentStyle={mapStyle}
            onStyleChange={setMapStyle}
            tileLayers={tileLayers}
          />
        )}
      </div>

      {/* Quick Stats */}
      {stats && (
        <GlassCard 
          variant="elevated" 
          padding="sm" 
          className="map-overlay-bottom-left max-w-[180px] animate-slide-up"
        >
          <h4 className="text-xs font-bold mb-2 text-primary">إحصائيات فلسطين</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">أعلى حرارة</span>
              <span className="font-bold text-temp-hot">{stats.max}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">أدنى حرارة</span>
              <span className="font-bold text-temp-cold">{stats.min}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">المتوسط</span>
              <span className="font-bold">{stats.avg}°</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Legend */}
      <GlassCard 
        variant="elevated" 
        padding="sm" 
        className="map-overlay-bottom-right max-w-[160px] animate-slide-up"
      >
        <h4 className="text-xs font-bold mb-2 text-center">مؤشر الحرارة</h4>
        <div className="flex flex-col gap-1 text-[10px]">
          {[
            { color: 'bg-temp-hot', label: '35°+ ساخن جداً' },
            { color: 'bg-temp-warm', label: '30-35° ساخن' },
            { color: 'bg-temp-mild', label: '20-30° معتدل' },
            { color: 'bg-temp-cool', label: '15-20° بارد' },
            { color: 'bg-temp-cold', label: '<15° بارد جداً' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default FullscreenMap;
