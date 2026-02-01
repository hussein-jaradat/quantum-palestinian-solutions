import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Atom, Sparkles, Zap } from 'lucide-react';

const QuantumBadge = () => {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-purple-500/10 via-card to-blue-500/10 border-purple-500/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-lg animate-pulse" />
              <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-full">
                <Atom className="text-white" size={24} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">IBM Qiskit</h3>
                <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30">
                  Quantum
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                تنبؤات محسّنة بالحوسبة الكمية
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <Sparkles className="text-weather-sunny" size={16} />
              <span className="text-sm font-medium">AI مدمج</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-alert-safe/10 rounded-lg">
              <Zap className="text-alert-safe" size={16} />
              <span className="text-sm font-medium">دقة عالية</span>
            </div>
          </div>
        </div>

        {/* Quantum Circuit Visualization (Simplified) */}
        <div className="mt-4 p-3 bg-foreground/5 rounded-lg overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="text-purple-500">q[0]:</span>
            <span className="text-purple-400">──H──</span>
            <span className="border border-purple-500 px-1 rounded">X</span>
            <span className="text-purple-400">──●──</span>
            <span className="text-purple-400">──M──</span>
            <span className="text-muted-foreground ml-2">← VQE Optimization</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-1">
            <span className="text-blue-500">q[1]:</span>
            <span className="text-blue-400">──H──</span>
            <span className="text-blue-400">─────</span>
            <span className="text-blue-400">──⊕──</span>
            <span className="text-blue-400">──M──</span>
            <span className="text-muted-foreground ml-2">← Weather Patterns</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumBadge;
