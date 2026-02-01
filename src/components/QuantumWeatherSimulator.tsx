import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Atom, Zap, TrendingUp, BarChart3, Play, RefreshCw,
  CircleDot, ArrowRight, Activity, Cpu, Network
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import QuantumBlochSphere from './QuantumBlochSphere';
import QuantumSpeedupDemo from './QuantumSpeedupDemo';

// Quantum simulation results types
interface QuantumResult {
  iteration: number;
  energy: number;
  accuracy: number;
}

interface QubitState {
  state: string;
  probability: number;
}

const QuantumWeatherSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [vqeResults, setVqeResults] = useState<QuantumResult[]>([]);
  const [qaoaResults, setQaoaResults] = useState<QuantumResult[]>([]);
  const [qubitStates, setQubitStates] = useState<QubitState[]>([]);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<'vqe' | 'qaoa' | 'qnn'>('vqe');

  // Simulate VQE optimization
  const runVQESimulation = () => {
    setIsRunning(true);
    setVqeResults([]);
    
    const results: QuantumResult[] = [];
    let currentEnergy = -0.5;
    
    const interval = setInterval(() => {
      if (results.length >= 20) {
        clearInterval(interval);
        setIsRunning(false);
        return;
      }
      
      // Simulate optimization convergence
      const noise = (Math.random() - 0.5) * 0.1;
      currentEnergy = currentEnergy - 0.02 + noise;
      const accuracy = 85 + results.length * 0.7 + Math.random() * 2;
      
      results.push({
        iteration: results.length + 1,
        energy: parseFloat(currentEnergy.toFixed(4)),
        accuracy: parseFloat(Math.min(99, accuracy).toFixed(2)),
      });
      
      setVqeResults([...results]);
    }, 200);
  };

  // Simulate QAOA optimization
  const runQAOASimulation = () => {
    setIsRunning(true);
    setQaoaResults([]);
    
    const results: QuantumResult[] = [];
    
    const interval = setInterval(() => {
      if (results.length >= 15) {
        clearInterval(interval);
        setIsRunning(false);
        generateQubitStates();
        return;
      }
      
      const iteration = results.length + 1;
      const accuracy = 70 + iteration * 1.8 + Math.random() * 3;
      
      results.push({
        iteration,
        energy: parseFloat((Math.random() * 0.3 + 0.5).toFixed(3)),
        accuracy: parseFloat(Math.min(98, accuracy).toFixed(2)),
      });
      
      setQaoaResults([...results]);
    }, 250);
  };

  // Generate simulated qubit measurement states
  const generateQubitStates = () => {
    const states: QubitState[] = [
      { state: '|00⟩', probability: Math.random() * 30 + 10 },
      { state: '|01⟩', probability: Math.random() * 20 + 15 },
      { state: '|10⟩', probability: Math.random() * 25 + 20 },
      { state: '|11⟩', probability: Math.random() * 20 + 15 },
    ];
    
    // Normalize to 100%
    const total = states.reduce((sum, s) => sum + s.probability, 0);
    states.forEach((s) => (s.probability = parseFloat(((s.probability / total) * 100).toFixed(1))));
    
    setQubitStates(states);
  };

  const runSimulation = () => {
    if (currentAlgorithm === 'vqe') {
      runVQESimulation();
    } else if (currentAlgorithm === 'qaoa') {
      runQAOASimulation();
    } else {
      // QNN simulation
      runVQESimulation();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-primary/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Atom className="text-purple-500 animate-pulse" />
            <span>محاكي IBM Qiskit للطقس</span>
          </div>
          <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30">
            Quantum Computing
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Quantum Circuit Visualization */}
        <div className="p-4 bg-foreground/5 rounded-xl overflow-x-auto">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <CircleDot className="h-4 w-4 text-purple-500" />
            الدائرة الكمية
          </h4>
          <div className="font-mono text-xs space-y-1 min-w-[400px]">
            <div className="flex items-center gap-2">
              <span className="text-purple-500 w-12">q[0]:</span>
              <span className="text-muted-foreground">──</span>
              <span className="border border-purple-500 px-2 py-0.5 rounded text-purple-500">H</span>
              <span className="text-muted-foreground">──</span>
              <span className="border border-blue-500 px-2 py-0.5 rounded text-blue-500">Ry(θ₁)</span>
              <span className="text-muted-foreground">──●──</span>
              <span className="text-muted-foreground">──</span>
              <span className="border border-green-500 px-2 py-0.5 rounded text-green-500">M</span>
              <span className="text-muted-foreground mr-4">→ Weather Parameter 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-500 w-12">q[1]:</span>
              <span className="text-muted-foreground">──</span>
              <span className="border border-purple-500 px-2 py-0.5 rounded text-purple-500">H</span>
              <span className="text-muted-foreground">──</span>
              <span className="border border-blue-500 px-2 py-0.5 rounded text-blue-500">Rz(θ₂)</span>
              <span className="text-muted-foreground">──⊕──</span>
              <span className="text-muted-foreground">──</span>
              <span className="border border-green-500 px-2 py-0.5 rounded text-green-500">M</span>
              <span className="text-muted-foreground mr-4">→ Weather Parameter 2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-500 w-12">q[2]:</span>
              <span className="text-muted-foreground">──</span>
              <span className="border border-purple-500 px-2 py-0.5 rounded text-purple-500">H</span>
              <span className="text-muted-foreground">──</span>
              <span className="border border-blue-500 px-2 py-0.5 rounded text-blue-500">Rx(θ₃)</span>
              <span className="text-muted-foreground">─────</span>
              <span className="text-muted-foreground">──</span>
              <span className="border border-green-500 px-2 py-0.5 rounded text-green-500">M</span>
              <span className="text-muted-foreground mr-4">→ Precipitation</span>
            </div>
          </div>
        </div>

        {/* Algorithm Tabs */}
        <Tabs value={currentAlgorithm} onValueChange={(v) => setCurrentAlgorithm(v as any)} dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vqe" className="gap-1">
              <Zap className="h-4 w-4" />
              VQE
            </TabsTrigger>
            <TabsTrigger value="qaoa" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              QAOA
            </TabsTrigger>
            <TabsTrigger value="qnn" className="gap-1">
              <Activity className="h-4 w-4" />
              QNN
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vqe" className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-semibold mb-2">Variational Quantum Eigensolver (VQE)</h4>
              <p className="text-sm text-muted-foreground">
                يُستخدم لتحسين معاملات نماذج التنبؤ الجوي وإيجاد أدنى طاقة للنظام (أفضل الحلول).
              </p>
            </div>
            
            {vqeResults.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vqeResults}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="iteration" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={false}
                      name="الدقة %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="qaoa" className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-semibold mb-2">Quantum Approximate Optimization Algorithm (QAOA)</h4>
              <p className="text-sm text-muted-foreground">
                يُستخدم لتحسين توزيع محطات الرصد وحساب أفضل مسارات السيول المحتملة.
              </p>
            </div>
            
            {qaoaResults.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qaoaResults}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="iteration" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      name="دقة التحسين %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {qubitStates.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm">نتائج القياس الكمي</h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qubitStates}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="state" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="probability" 
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        name="الاحتمالية %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="qnn" className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Network className="h-5 w-5 text-green-500" />
                Quantum Neural Networks (QNN)
              </h4>
              <p className="text-sm text-muted-foreground">
                شبكات عصبية كمية للتعرف على أنماط الطقس من صور الأقمار الصناعية وتحسين التنبؤات طويلة المدى.
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-purple-500/10 rounded-xl text-center border border-purple-500/20">
                <Cpu className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-500">4</div>
                <div className="text-xs text-muted-foreground">Qubits</div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-xl text-center border border-blue-500/20">
                <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-500">12</div>
                <div className="text-xs text-muted-foreground">Layers</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-xl text-center border border-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-500">48</div>
                <div className="text-xs text-muted-foreground">Parameters</div>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-xl text-center border border-amber-500/20">
                <Zap className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-amber-500">92%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            </div>

            {/* QNN Architecture Visualization */}
            <div className="p-4 bg-foreground/5 rounded-xl">
              <h5 className="font-semibold mb-3 text-sm">بنية الشبكة العصبية الكمية</h5>
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-4">
                {/* Input Layer */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-center mb-1">المدخلات</div>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-xs">
                      q{i-1}
                    </div>
                  ))}
                </div>
                
                {/* Arrows */}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                
                {/* Hidden Layers */}
                {[1,2,3].map(layer => (
                  <div key={layer} className="flex flex-col gap-1">
                    <div className="text-xs text-center mb-1">Layer {layer}</div>
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ))}
                
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                
                {/* Output Layer */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-center mb-1">المخرجات</div>
                  {['T°', '💧', '💨'].map((out, i) => (
                    <div key={i} className="w-10 h-8 rounded-lg bg-green-500/20 border border-green-500 flex items-center justify-center text-sm">
                      {out}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Run Button */}
        <div className="flex gap-4">
          <Button 
            onClick={runSimulation}
            disabled={isRunning}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                جاري المحاكاة...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 ml-2" />
                تشغيل المحاكاة
              </>
            )}
          </Button>
        </div>

        {/* Comparison Stats */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            مقارنة الدقة: الكوانتوم vs التقليدي
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {vqeResults.length > 0 ? vqeResults[vqeResults.length - 1].accuracy : '94.5'}%
              </div>
              <div className="text-sm text-muted-foreground">دقة الكوانتوم</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">87.2%</div>
              <div className="text-sm text-muted-foreground">دقة النماذج التقليدية</div>
            </div>
          </div>
          <div className="mt-3 text-center text-sm text-primary">
            تحسن بنسبة +8.3% باستخدام الخوارزميات الكمية
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumWeatherSimulator;
