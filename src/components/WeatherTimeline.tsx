import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Clock, Play, Pause, SkipBack, SkipForward, 
  FastForward, Rewind, Calendar, Sun, Cloud, CloudRain
} from 'lucide-react';

interface TimelineData {
  timestamp: Date;
  hour: number;
  temperature: number;
  condition: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

interface WeatherTimelineProps {
  onTimeChange?: (timestamp: Date) => void;
  hoursRange?: number; // ±hours from now
}

const getConditionIcon = (condition: string) => {
  if (condition.includes('rain')) return <CloudRain className="h-4 w-4 text-blue-500" />;
  if (condition.includes('cloud')) return <Cloud className="h-4 w-4 text-gray-500" />;
  return <Sun className="h-4 w-4 text-yellow-500" />;
};

const WeatherTimeline = ({ onTimeChange, hoursRange = 24 }: WeatherTimelineProps) => {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(hoursRange); // Start at "now"
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 1x, 2x, 4x

  // Generate timeline data
  useEffect(() => {
    const now = new Date();
    const data: TimelineData[] = [];
    
    for (let i = -hoursRange; i <= hoursRange; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hourOfDay = timestamp.getHours();
      
      // Simulate weather data
      const baseTemp = 20 + Math.sin((hourOfDay / 24) * Math.PI * 2 - Math.PI / 2) * 8;
      const temperature = Math.round((baseTemp + (Math.random() - 0.5) * 4) * 10) / 10;
      
      const precipitationChance = Math.random();
      let condition = 'clear';
      let precipitation = 0;
      
      if (precipitationChance > 0.8) {
        condition = 'rain';
        precipitation = Math.random() * 5;
      } else if (precipitationChance > 0.6) {
        condition = 'cloudy';
      } else if (precipitationChance > 0.4) {
        condition = 'partly_cloudy';
      }
      
      data.push({
        timestamp,
        hour: i,
        temperature,
        condition,
        precipitation: Math.round(precipitation * 10) / 10,
        humidity: Math.round(50 + Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 20),
      });
    }
    
    setTimelineData(data);
  }, [hoursRange]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= timelineData.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playSpeed);
    
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, timelineData.length]);

  // Notify parent of time change
  useEffect(() => {
    if (timelineData[currentIndex] && onTimeChange) {
      onTimeChange(timelineData[currentIndex].timestamp);
    }
  }, [currentIndex, timelineData, onTimeChange]);

  const handleSliderChange = useCallback((value: number[]) => {
    setCurrentIndex(value[0]);
  }, []);

  const currentData = timelineData[currentIndex];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-PS', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-PS', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTimeLabel = (hour: number) => {
    if (hour === 0) return 'الآن';
    if (hour > 0) return `+${hour}س`;
    return `${hour}س`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-primary/10 pb-3">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            <span>المحور الزمني للطقس</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              ±{hoursRange} ساعة
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Current Time Display */}
        {currentData && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">الوقت</div>
                <div className="text-2xl font-bold">{formatTime(currentData.timestamp)}</div>
                <div className="text-xs text-muted-foreground">{formatDate(currentData.timestamp)}</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="flex items-center gap-2">
                {getConditionIcon(currentData.condition)}
                <span className="text-3xl font-bold">{currentData.temperature}°</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-muted-foreground">الرطوبة</div>
                <div className="font-semibold">{currentData.humidity}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">الرياح</div>
                <div className="font-semibold">{currentData.windSpeed} كم/س</div>
              </div>
              <div>
                <div className="text-muted-foreground">الهطول</div>
                <div className="font-semibold">{currentData.precipitation} مم</div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>-{hoursRange}س</span>
            <Badge variant={currentIndex === hoursRange ? "default" : "secondary"}>
              {currentData ? getTimeLabel(currentData.hour) : '--'}
            </Badge>
            <span>+{hoursRange}س</span>
          </div>
          <Slider
            value={[currentIndex]}
            onValueChange={handleSliderChange}
            min={0}
            max={timelineData.length - 1}
            step={1}
            className="cursor-pointer"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex(0)}
            disabled={currentIndex === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <Rewind className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isPlaying ? "destructive" : "default"}
            size="lg"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-24 gap-2"
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
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex(prev => Math.min(timelineData.length - 1, prev + 1))}
            disabled={currentIndex === timelineData.length - 1}
          >
            <FastForward className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex(timelineData.length - 1)}
            disabled={currentIndex === timelineData.length - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 mr-4">
            {[1, 2, 4].map(speed => (
              <Button
                key={speed}
                variant={playSpeed === speed ? "default" : "ghost"}
                size="sm"
                onClick={() => setPlaySpeed(speed)}
                className="w-10"
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        {/* Mini Timeline Preview */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {timelineData.filter((_, idx) => idx % 4 === 0).map((data, idx) => {
            const actualIdx = idx * 4;
            const isActive = Math.abs(actualIdx - currentIndex) < 2;
            const isNow = data.hour === 0;
            
            return (
              <button
                key={actualIdx}
                onClick={() => setCurrentIndex(actualIdx)}
                className={`
                  flex-shrink-0 p-2 rounded-lg text-center min-w-[50px] transition-all
                  ${isActive ? 'bg-primary text-primary-foreground scale-105' : 'bg-secondary/50 hover:bg-secondary'}
                  ${isNow ? 'ring-2 ring-primary ring-offset-1' : ''}
                `}
              >
                <div className="text-xs">
                  {getTimeLabel(data.hour)}
                </div>
                <div className="my-1">
                  {getConditionIcon(data.condition)}
                </div>
                <div className="text-xs font-bold">{Math.round(data.temperature)}°</div>
              </button>
            );
          })}
        </div>

        {/* Quick Jump Buttons */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(0)}
          >
            -{hoursRange}س
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.floor(hoursRange / 2))}
          >
            -{hoursRange / 2}س
          </Button>
          <Button
            variant={currentIndex === hoursRange ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentIndex(hoursRange)}
          >
            الآن
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(hoursRange + Math.floor(hoursRange / 2))}
          >
            +{hoursRange / 2}س
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(timelineData.length - 1)}
          >
            +{hoursRange}س
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherTimeline;
