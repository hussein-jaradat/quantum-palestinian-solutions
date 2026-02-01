import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useSatelliteLayers, useAvailableSatelliteDates, useSatelliteInfo } from '@/hooks/useQANWPAI';
import { Satellite, Calendar, Layers, Info, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

const PALESTINE_CENTER: L.LatLngExpression = [31.9, 35.0];

const SatelliteImageryViewer = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  
  const [selectedLayer, setSelectedLayer] = useState<string>('trueColor');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [dateIndex, setDateIndex] = useState(0);

  const { data: layers, isLoading: layersLoading } = useSatelliteLayers();
  const { data: dates, isLoading: datesLoading } = useAvailableSatelliteDates();
  const { data: info } = useSatelliteInfo();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: PALESTINE_CENTER,
      zoom: 7,
      minZoom: 5,
      maxZoom: 10,
    });

    // Base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      opacity: 0.3,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Set initial date when dates load
  useEffect(() => {
    if (dates && dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  // Update satellite layer when selection changes
  useEffect(() => {
    if (!mapRef.current || !layers || !selectedDate) return;

    const layer = layers.find(l => l.key === selectedLayer);
    if (!layer) return;

    // Remove existing satellite layer
    if (satelliteLayerRef.current) {
      mapRef.current.removeLayer(satelliteLayerRef.current);
    }

    // NASA GIBS WMTS URL
    const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${layer.id}/default/${selectedDate}/${layer.matrixSet}/{z}/{y}/{x}.${layer.format.split('/')[1]}`;

    try {
      satelliteLayerRef.current = L.tileLayer(tileUrl, {
        attribution: 'NASA GIBS',
        tileSize: 256,
        maxZoom: 10,
        opacity: 0.9,
        bounds: [[29, 33], [34, 37]], // Approximate Palestine bounds
      }).addTo(mapRef.current);
    } catch (error) {
      console.error('Failed to load satellite layer:', error);
    }
  }, [selectedLayer, selectedDate, layers]);

  // Time-lapse animation
  useEffect(() => {
    if (!isPlaying || !dates) return;

    const interval = setInterval(() => {
      setDateIndex(prev => {
        const next = (prev + 1) % dates.length;
        setSelectedDate(dates[next]);
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, dates]);

  const handlePrevDate = () => {
    if (!dates) return;
    const newIndex = (dateIndex - 1 + dates.length) % dates.length;
    setDateIndex(newIndex);
    setSelectedDate(dates[newIndex]);
  };

  const handleNextDate = () => {
    if (!dates) return;
    const newIndex = (dateIndex + 1) % dates.length;
    setDateIndex(newIndex);
    setSelectedDate(dates[newIndex]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-PS', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (layersLoading || datesLoading) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            صور الأقمار الصناعية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Satellite className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">صور الأقمار الصناعية - NASA GIBS</h3>
                <p className="text-xs text-muted-foreground">
                  صور حقيقية من نظام EOSDIS
                </p>
              </div>
            </div>
            <Badge variant="outline" className="font-normal">
              <Info className="h-3 w-3 mr-1" />
              تحديث يومي
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Layer Selection */}
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="اختر الطبقة" />
                </SelectTrigger>
                <SelectContent>
                  {layers?.map((layer) => (
                    <SelectItem key={layer.key} value={layer.key}>
                      {layer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر التاريخ" />
                </SelectTrigger>
                <SelectContent>
                  {dates?.slice(0, 14).map((date) => (
                    <SelectItem key={date} value={date}>
                      {formatDate(date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time-lapse Controls */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevDate}
                disabled={isPlaying}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant={isPlaying ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextDate}
                disabled={isPlaying}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Layer Info */}
          {layers && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                {layers.find(l => l.key === selectedLayer)?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-0 relative">
          <div
            ref={mapContainerRef}
            className="h-[500px] md:h-[600px] w-full"
            style={{ zIndex: 1 }}
          />

          {/* Date Overlay */}
          <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border">
            <p className="text-sm font-medium">{selectedDate && formatDate(selectedDate)}</p>
          </div>

          {/* Attribution */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
            NASA GIBS • EOSDIS WorldView
          </div>
        </CardContent>
      </Card>

      {/* Available Layers Grid */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">الطبقات المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {layers?.map((layer) => (
              <button
                key={layer.key}
                onClick={() => setSelectedLayer(layer.key)}
                className={`p-4 rounded-xl border text-right transition-all ${
                  selectedLayer === layer.key
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <h4 className="font-medium text-sm mb-1">{layer.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {layer.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SatelliteImageryViewer;
