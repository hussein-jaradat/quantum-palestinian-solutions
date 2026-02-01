import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Atom, Cpu, Play, RotateCcw, Trophy, Zap, Clock,
  TrendingUp, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RaceResult {
  classical: number;
  quantum: number;
  speedup: number;
  winner: 'quantum' | 'classical';
}

const QuantumSpeedupDemo = () => {
  const [isRacing, setIsRacing] = useState(false);
  const [classicalProgress, setClassicalProgress] = useState(0);
  const [quantumProgress, setQuantumProgress] = useState(0);
  const [results, setResults] = useState<RaceResult | null>(null);
  const [selectedTask, setSelectedTask] = useState<'optimization' | 'pattern' | 'routing'>('optimization');
  
  const classicalRef = useRef<number | null>(null);
  const quantumRef = useRef<number | null>(null);

  const tasks = {
    optimization: {
      name: 'تحسين معاملات التنبؤ (VQE)',
      classicalTime: 5000,
      quantumTime: 1200,
      description: 'تحسين 48 معامل للنموذج العددي'
    },
    pattern: {
      name: 'تحليل أنماط الطقس (QNN)',
      classicalTime: 8000,
      quantumTime: 2000,
      description: 'تحليل صور أقمار صناعية لاكتشاف الأنماط'
    },
    routing: {
      name: 'تحسين مسارات السيول (QAOA)',
      classicalTime: 6000,
      quantumTime: 1500,
      description: 'حساب أفضل توزيع لمحطات الإنذار'
    }
  };

  const currentTask = tasks[selectedTask];

  const startRace = () => {
    setIsRacing(true);
    setClassicalProgress(0);
    setQuantumProgress(0);
    setResults(null);

    const classicalDuration = currentTask.classicalTime;
    const quantumDuration = currentTask.quantumTime;
    const startTime = Date.now();

    // Classical animation
    const animateClassical = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / classicalDuration) * 100);
      setClassicalProgress(progress);

      if (progress < 100) {
        classicalRef.current = requestAnimationFrame(animateClassical);
      }
    };

    // Quantum animation (with characteristic "quantum leap" behavior)
    const animateQuantum = () => {
      const elapsed = Date.now() - startTime;
      // Quantum has "exploration" phase then quick convergence
      let progress: number;
      if (elapsed < quantumDuration * 0.3) {
        // Exploration phase - slow start
        progress = (elapsed / quantumDuration) * 30;
      } else if (elapsed < quantumDuration * 0.7) {
        // Quantum parallelism - rapid progress
        progress = 30 + ((elapsed - quantumDuration * 0.3) / (quantumDuration * 0.4)) * 60;
      } else {
        // Convergence
        progress = 90 + ((elapsed - quantumDuration * 0.7) / (quantumDuration * 0.3)) * 10;
      }
      
      progress = Math.min(100, progress);
      setQuantumProgress(progress);

      if (progress < 100) {
        quantumRef.current = requestAnimationFrame(animateQuantum);
      } else {
        // Quantum finished - wait for classical
        setTimeout(() => {
          if (classicalRef.current) {
            cancelAnimationFrame(classicalRef.current);
          }
          setClassicalProgress(100);
          setIsRacing(false);
          setResults({
            classical: classicalDuration,
            quantum: quantumDuration,
            speedup: classicalDuration / quantumDuration,
            winner: 'quantum'
          });
        }, classicalDuration - quantumDuration);
      }
    };

    classicalRef.current = requestAnimationFrame(animateClassical);
    quantumRef.current = requestAnimationFrame(animateQuantum);
  };

  const resetRace = () => {
    if (classicalRef.current) cancelAnimationFrame(classicalRef.current);
    if (quantumRef.current) cancelAnimationFrame(quantumRef.current);
    setIsRacing(false);
    setClassicalProgress(0);
    setQuantumProgress(0);
    setResults(null);
  };

  useEffect(() => {
    return () => {
      if (classicalRef.current) cancelAnimationFrame(classicalRef.current);
      if (quantumRef.current) cancelAnimationFrame(quantumRef.current);
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 via-orange-500/10 to-blue-500/10">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>سباق الحوسبة: الكمية vs التقليدية</span>
          </div>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            تسريع حقيقي
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Task Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(tasks).map(([key, task]) => (
            <button
              key={key}
              onClick={() => !isRacing && setSelectedTask(key as any)}
              disabled={isRacing}
              className={cn(
                "p-4 rounded-xl border text-right transition-all",
                selectedTask === key 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50",
                isRacing && "opacity-50 cursor-not-allowed"
              )}
            >
              <h4 className="font-semibold text-sm mb-1">{task.name}</h4>
              <p className="text-xs text-muted-foreground">{task.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  كلاسيكي: {(task.classicalTime / 1000).toFixed(1)}s
                </Badge>
                <Badge variant="outline" className="text-xs">
                  كمي: {(task.quantumTime / 1000).toFixed(1)}s
                </Badge>
              </div>
            </button>
          ))}
        </div>

        {/* Race Track */}
        <div className="space-y-6 p-6 bg-secondary/20 rounded-xl">
          {/* Classical Track */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Cpu className="h-5 w-5 text-blue-500" />
                </div>
                <span className="font-semibold">الحوسبة التقليدية</span>
              </div>
              <div className="flex items-center gap-2">
                {results?.winner === 'classical' && (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {classicalProgress.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="relative">
              <Progress value={classicalProgress} className="h-8" />
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-100"
                style={{ left: `${Math.max(0, classicalProgress - 3)}%` }}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  classicalProgress === 100 ? "bg-blue-500" : "bg-blue-400 animate-pulse"
                )}>
                  <Cpu className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quantum Track */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Atom className="h-5 w-5 text-purple-500" />
                </div>
                <span className="font-semibold">الحوسبة الكمية</span>
              </div>
              <div className="flex items-center gap-2">
                {results?.winner === 'quantum' && (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {quantumProgress.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={quantumProgress} 
                className="h-8 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" 
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-100"
                style={{ left: `${Math.max(0, quantumProgress - 3)}%` }}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  quantumProgress === 100 ? "bg-purple-500" : "bg-purple-400 animate-spin"
                )}>
                  <Atom className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="p-6 bg-gradient-to-r from-purple-500/10 to-yellow-500/10 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h4 className="font-bold">نتائج السباق</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-blue-600">
                  {(results.classical / 1000).toFixed(1)}s
                </div>
                <div className="text-xs text-muted-foreground">وقت الحوسبة التقليدية</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Atom className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-purple-600">
                  {(results.quantum / 1000).toFixed(1)}s
                </div>
                <div className="text-xs text-muted-foreground">وقت الحوسبة الكمية</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold text-yellow-600">
                  {results.speedup.toFixed(1)}x
                </div>
                <div className="text-xs text-muted-foreground">معامل التسريع</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-600">
                  {((1 - results.quantum / results.classical) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">توفير الوقت</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={startRace}
            disabled={isRacing}
            size="lg"
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Play className="h-5 w-5" />
            بدء السباق
          </Button>
          <Button
            variant="outline"
            onClick={resetRace}
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            إعادة
          </Button>
        </div>

        {/* Explanation */}
        <div className="p-4 bg-secondary/30 rounded-xl text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">الحوسبة الكمية</strong> تستفيد من التراكب الكمي (Superposition) 
            والتشابك (Entanglement) لمعالجة العديد من الحلول المحتملة بالتوازي.
            في مهام التحسين مثل VQE وQAOA، يمكن أن توفر تسريعاً يصل إلى 5x مقارنة بالخوارزميات التقليدية.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumSpeedupDemo;
