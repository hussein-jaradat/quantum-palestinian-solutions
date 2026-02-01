import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Wind, Play, Pause, RotateCcw, Gauge } from 'lucide-react';

interface WindData {
  lat: number;
  lng: number;
  speed: number;
  direction: number;
}

interface WindFlowLayerProps {
  windData?: WindData[];
  width?: number;
  height?: number;
  governorateId?: string;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  speed: number;
  direction: number;
}

const PALESTINE_BOUNDS = {
  north: 33.3,
  south: 29.5,
  east: 35.9,
  west: 34.2,
};

const getWindColor = (speed: number): string => {
  if (speed >= 50) return '#ef4444'; // أحمر - عاصفة
  if (speed >= 40) return '#f97316'; // برتقالي
  if (speed >= 30) return '#eab308'; // أصفر
  if (speed >= 20) return '#22c55e'; // أخضر
  if (speed >= 10) return '#06b6d4'; // سماوي
  return '#3b82f6'; // أزرق
};

const WindFlowLayer = ({ 
  windData,
  width = 800, 
  height = 600,
  governorateId 
}: WindFlowLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [particleCount, setParticleCount] = useState([2000]);
  const [speed, setSpeed] = useState([1]);
  const [stats, setStats] = useState({ avgSpeed: 0, maxSpeed: 0, direction: '' });

  // Generate simulated wind data for Palestine
  const generateWindData = useCallback((): WindData[] => {
    const data: WindData[] = [];
    const gridSize = 20;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat = PALESTINE_BOUNDS.south + (PALESTINE_BOUNDS.north - PALESTINE_BOUNDS.south) * (i / gridSize);
        const lng = PALESTINE_BOUNDS.west + (PALESTINE_BOUNDS.east - PALESTINE_BOUNDS.west) * (j / gridSize);
        
        // Create realistic wind patterns - stronger in valleys, turbulent in mountains
        const baseSpeed = 15 + Math.sin(Date.now() / 5000 + i * 0.5) * 10;
        const terrainFactor = Math.sin(lat * 2) * 5;
        const speed = Math.max(5, baseSpeed + terrainFactor + Math.random() * 8);
        
        // Wind direction with seasonal variation (Mediterranean climate)
        const baseDirection = 270 + Math.sin(Date.now() / 10000) * 45; // West to Northwest
        const localVariation = Math.sin(lng * 3) * 20;
        const direction = (baseDirection + localVariation + Math.random() * 15) % 360;
        
        data.push({ lat, lng, speed, direction });
      }
    }
    return data;
  }, []);

  const activeWindData = windData || generateWindData();

  // Calculate stats
  useEffect(() => {
    if (activeWindData.length > 0) {
      const speeds = activeWindData.map(w => w.speed);
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const maxSpeed = Math.max(...speeds);
      const avgDir = activeWindData.reduce((a, b) => a + b.direction, 0) / activeWindData.length;
      
      const getDirectionName = (deg: number) => {
        const dirs = ['شمالية', 'شمالية شرقية', 'شرقية', 'جنوبية شرقية', 'جنوبية', 'جنوبية غربية', 'غربية', 'شمالية غربية'];
        return dirs[Math.round(deg / 45) % 8];
      };
      
      setStats({
        avgSpeed: Math.round(avgSpeed),
        maxSpeed: Math.round(maxSpeed),
        direction: getDirectionName(avgDir)
      });
    }
  }, [activeWindData]);

  // Initialize particles
  const initParticles = useCallback(() => {
    const particles: Particle[] = [];
    const count = particleCount[0];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        age: Math.random() * 100,
        maxAge: 80 + Math.random() * 40,
        speed: 0.5 + Math.random() * 2,
        direction: Math.random() * 360,
      });
    }
    
    particlesRef.current = particles;
  }, [width, height, particleCount]);

  // Get wind at position
  const getWindAtPosition = useCallback((x: number, y: number): { speed: number; direction: number } => {
    const lat = PALESTINE_BOUNDS.north - (y / height) * (PALESTINE_BOUNDS.north - PALESTINE_BOUNDS.south);
    const lng = PALESTINE_BOUNDS.west + (x / width) * (PALESTINE_BOUNDS.east - PALESTINE_BOUNDS.west);
    
    // Find nearest wind data point
    let nearestDist = Infinity;
    let nearestWind = { speed: 15, direction: 270 };
    
    for (const w of activeWindData) {
      const dist = Math.sqrt((w.lat - lat) ** 2 + (w.lng - lng) ** 2);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestWind = { speed: w.speed, direction: w.direction };
      }
    }
    
    return nearestWind;
  }, [activeWindData, width, height]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with trail effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.fillRect(0, 0, width, height);

    const speedMultiplier = speed[0];

    particlesRef.current.forEach((particle, index) => {
      // Get wind at current position
      const wind = getWindAtPosition(particle.x, particle.y);
      
      // Update particle
      const radians = (wind.direction * Math.PI) / 180;
      const velocity = (wind.speed / 10) * speedMultiplier;
      
      particle.x += Math.cos(radians) * velocity;
      particle.y -= Math.sin(radians) * velocity; // Negative because canvas Y is inverted
      particle.age++;
      
      // Reset particle if it goes out of bounds or is too old
      if (particle.x < 0 || particle.x > width || 
          particle.y < 0 || particle.y > height || 
          particle.age > particle.maxAge) {
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
        particle.age = 0;
        particle.maxAge = 80 + Math.random() * 40;
      }
      
      // Draw particle
      const alpha = Math.min(1, (1 - particle.age / particle.maxAge) * 0.8);
      const color = getWindColor(wind.speed);
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.5;
      
      // Draw line in direction of wind
      const lineLength = velocity * 3;
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(
        particle.x - Math.cos(radians) * lineLength,
        particle.y + Math.sin(radians) * lineLength
      );
      ctx.stroke();
      
      // Draw head
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [width, height, isPlaying, speed, getWindAtPosition]);

  // Start/stop animation
  useEffect(() => {
    initParticles();
    
    if (isPlaying) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate, initParticles]);

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgb(15, 23, 42)';
        ctx.fillRect(0, 0, width, height);
      }
    }
    initParticles();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-primary/10">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-cyan-500" />
            <span>خريطة تدفق الرياح المتحركة</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Gauge className="h-3 w-3" />
              {stats.avgSpeed} كم/س
            </Badge>
            <Badge variant="secondary">{stats.direction}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Canvas */}
        <div className="relative rounded-xl overflow-hidden border border-border">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-auto bg-slate-900"
            style={{ maxHeight: '500px' }}
          />
          
          {/* Overlay Stats */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">متوسط السرعة:</span>
              <span className="font-bold">{stats.avgSpeed} كم/س</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">أقصى سرعة:</span>
              <span className="font-bold text-orange-500">{stats.maxSpeed} كم/س</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">الاتجاه:</span>
              <span className="font-bold">{stats.direction}</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg p-3 text-xs">
            <div className="font-semibold mb-2">مقياس سرعة الرياح</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-blue-500 rounded"></div>
                <span>{"<"}10 كم/س</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-cyan-500 rounded"></div>
                <span>10-20 كم/س</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-green-500 rounded"></div>
                <span>20-30 كم/س</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-yellow-500 rounded"></div>
                <span>30-40 كم/س</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-orange-500 rounded"></div>
                <span>40-50 كم/س</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-red-500 rounded"></div>
                <span>{">"}50 كم/س</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Play/Pause */}
          <div className="flex items-center gap-2">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  إيقاف
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  تشغيل
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Particle Count */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              عدد الجسيمات: {particleCount[0]}
            </label>
            <Slider
              value={particleCount}
              onValueChange={setParticleCount}
              min={500}
              max={5000}
              step={500}
            />
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              سرعة التحريك: {speed[0]}x
            </label>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              min={0.5}
              max={3}
              step={0.5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WindFlowLayer;
