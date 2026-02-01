import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { CloudRain, Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';

interface RainfallRadarLayerProps {
  width?: number;
  height?: number;
}

interface RainfallCell {
  x: number;
  y: number;
  intensity: number;
  radius: number;
}

const PRECIPITATION_COLORS = [
  { threshold: 0, color: 'rgba(0, 0, 0, 0)' },
  { threshold: 0.1, color: 'rgba(173, 216, 230, 0.4)' },    // أزرق فاتح
  { threshold: 1, color: 'rgba(65, 105, 225, 0.5)' },       // أزرق ملكي
  { threshold: 5, color: 'rgba(0, 0, 139, 0.6)' },          // أزرق داكن
  { threshold: 10, color: 'rgba(75, 0, 130, 0.65)' },       // نيلي
  { threshold: 20, color: 'rgba(128, 0, 128, 0.7)' },       // بنفسجي
  { threshold: 40, color: 'rgba(255, 0, 0, 0.75)' },        // أحمر
];

const getColorForIntensity = (intensity: number): string => {
  for (let i = PRECIPITATION_COLORS.length - 1; i >= 0; i--) {
    if (intensity >= PRECIPITATION_COLORS[i].threshold) {
      return PRECIPITATION_COLORS[i].color;
    }
  }
  return 'rgba(0, 0, 0, 0)';
};

const RainfallRadarLayer = ({ width = 800, height = 500 }: RainfallRadarLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [timeOffset, setTimeOffset] = useState([0]); // Hours from now (-6 to +6)
  const [rainfallData, setRainfallData] = useState<RainfallCell[][]>([]);
  const [stats, setStats] = useState({ total: 0, max: 0, coverage: 0 });

  const totalFrames = 24; // 24 frames for animation

  // Generate simulated rainfall data
  const generateRainfallData = useCallback(() => {
    const frames: RainfallCell[][] = [];
    
    // Create moving weather systems
    const systems = [
      { startX: -100, startY: 100, speedX: 15, speedY: 2, intensity: 25, size: 120 },
      { startX: 200, startY: -50, speedX: 8, speedY: 10, intensity: 15, size: 80 },
      { startX: width + 50, startY: 200, speedX: -12, speedY: 3, intensity: 35, size: 100 },
    ];
    
    for (let frame = 0; frame < totalFrames; frame++) {
      const cells: RainfallCell[] = [];
      
      systems.forEach(system => {
        const currentX = system.startX + system.speedX * frame;
        const currentY = system.startY + system.speedY * frame;
        
        // Create rainfall cells around the system center
        const numCells = Math.floor(system.size / 10);
        for (let i = 0; i < numCells; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * system.size;
          const x = currentX + Math.cos(angle) * distance;
          const y = currentY + Math.sin(angle) * distance;
          
          // Intensity decreases with distance from center
          const distanceFactor = 1 - (distance / system.size);
          const intensity = system.intensity * distanceFactor * (0.5 + Math.random() * 0.5);
          
          if (x >= -50 && x <= width + 50 && y >= -50 && y <= height + 50) {
            cells.push({
              x,
              y,
              intensity,
              radius: 15 + Math.random() * 25,
            });
          }
        }
      });
      
      frames.push(cells);
    }
    
    return frames;
  }, [width, height]);

  // Initialize rainfall data
  useEffect(() => {
    const data = generateRainfallData();
    setRainfallData(data);
  }, [generateRainfallData]);

  // Calculate stats for current frame
  useEffect(() => {
    if (rainfallData.length === 0) return;
    
    const currentCells = rainfallData[currentFrame] || [];
    const intensities = currentCells.map(c => c.intensity);
    
    const total = intensities.reduce((a, b) => a + b, 0) / 100;
    const max = Math.max(...intensities, 0);
    const coverage = (currentCells.filter(c => c.intensity > 0.5).length / 50) * 100;
    
    setStats({
      total: parseFloat(total.toFixed(1)),
      max: parseFloat(max.toFixed(1)),
      coverage: Math.min(100, parseFloat(coverage.toFixed(0))),
    });
  }, [currentFrame, rainfallData]);

  // Draw frame
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || rainfallData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = 'rgb(15, 23, 42)';
    ctx.fillRect(0, 0, width, height);

    // Draw Palestine outline (simplified)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.4, height * 0.1);
    ctx.lineTo(width * 0.55, height * 0.15);
    ctx.lineTo(width * 0.6, height * 0.3);
    ctx.lineTo(width * 0.65, height * 0.5);
    ctx.lineTo(width * 0.5, height * 0.9);
    ctx.lineTo(width * 0.35, height * 0.7);
    ctx.lineTo(width * 0.3, height * 0.4);
    ctx.closePath();
    ctx.stroke();

    // Draw rainfall cells
    const cells = rainfallData[frameIndex] || [];
    
    cells.forEach(cell => {
      const gradient = ctx.createRadialGradient(
        cell.x, cell.y, 0,
        cell.x, cell.y, cell.radius
      );
      
      const color = getColorForIntensity(cell.intensity);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.7, color.replace(/[\d.]+\)$/, '0.3)'));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw timestamp
    const hours = Math.floor(timeOffset[0] + (frameIndex - 12) * 0.5);
    const timeStr = hours >= 0 ? `+${hours}س` : `${hours}س`;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Cairo';
    ctx.fillText(`الوقت: ${timeStr}`, 20, 30);
  }, [rainfallData, width, height, timeOffset]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % totalFrames);
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Draw current frame
  useEffect(() => {
    drawFrame(currentFrame);
  }, [currentFrame, drawFrame]);

  const handleSkipBack = () => {
    setCurrentFrame(prev => (prev - 1 + totalFrames) % totalFrames);
  };

  const handleSkipForward = () => {
    setCurrentFrame(prev => (prev + 1) % totalFrames);
  };

  const getTimeLabel = () => {
    const hours = Math.floor(timeOffset[0] + (currentFrame - 12) * 0.5);
    if (hours === 0) return 'الآن';
    return hours > 0 ? `بعد ${hours} ساعات` : `قبل ${Math.abs(hours)} ساعات`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-primary/10">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-blue-500" />
            <span>رادار الأمطار التفاعلي</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {getTimeLabel()}
            </Badge>
            <Badge variant="secondary">{stats.coverage}% تغطية</Badge>
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
            className="w-full h-auto"
            style={{ maxHeight: '500px' }}
          />
          
          {/* Stats Overlay */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">إجمالي الهطول:</span>
              <span className="font-bold">{stats.total} مم</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">أقصى شدة:</span>
              <span className="font-bold text-blue-500">{stats.max} مم/س</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">نسبة التغطية:</span>
              <span className="font-bold">{stats.coverage}%</span>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg p-3 text-xs">
            <div className="font-semibold mb-2">شدة الهطول (مم/س)</div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-3 rounded" style={{ background: 'rgba(173, 216, 230, 0.6)' }}></div>
              <div className="w-6 h-3 rounded" style={{ background: 'rgba(65, 105, 225, 0.7)' }}></div>
              <div className="w-6 h-3 rounded" style={{ background: 'rgba(0, 0, 139, 0.8)' }}></div>
              <div className="w-6 h-3 rounded" style={{ background: 'rgba(75, 0, 130, 0.8)' }}></div>
              <div className="w-6 h-3 rounded" style={{ background: 'rgba(128, 0, 128, 0.9)' }}></div>
              <div className="w-6 h-3 rounded" style={{ background: 'rgba(255, 0, 0, 0.9)' }}></div>
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span>0.1</span>
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>20</span>
              <span>40+</span>
            </div>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="space-y-4">
          {/* Timeline Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>-6 ساعات</span>
              <span className="font-semibold text-foreground">{getTimeLabel()}</span>
              <span>+6 ساعات</span>
            </div>
            <Slider
              value={[currentFrame]}
              onValueChange={(v) => setCurrentFrame(v[0])}
              min={0}
              max={totalFrames - 1}
              step={1}
              className="cursor-pointer"
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={handleSkipBack}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="gap-2 px-6"
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
            <Button variant="outline" size="icon" onClick={handleSkipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RainfallRadarLayer;
