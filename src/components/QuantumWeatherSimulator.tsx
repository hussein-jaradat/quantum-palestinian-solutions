import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Atom, Zap, TrendingUp, BarChart3, Play, RefreshCw,
  CircleDot, ArrowRight, Activity, Cpu, Network, ExternalLink,
  AlertCircle, CheckCircle2, Clock, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import QuantumBlochSphere from './QuantumBlochSphere';
import QuantumSpeedupDemo from './QuantumSpeedupDemo';

interface QuantumResult {
  iteration: number;
  accuracy: number;
}

interface QuantumJob {
  id: string;
  ibmJobId: string | null;
  status: string;
  algorithm: string;
  circuit?: string;
  result?: any;
}

interface QuantumWeatherSimulatorProps {
  governorateId?: string;
  currentWeather?: {
    temperature: number;
    humidity: number;
    pressure?: number;
  };
}

const QuantumWeatherSimulator = ({ 
  governorateId = 'ramallah',
  currentWeather = { temperature: 22, humidity: 65, pressure: 1013 }
}: QuantumWeatherSimulatorProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<'vqe' | 'qaoa' | 'qml'>('vqe');
  const [quantumJob, setQuantumJob] = useState<QuantumJob | null>(null);
  const [hasIBMToken, setHasIBMToken] = useState<boolean | null>(null);
  const [circuitQASM, setCircuitQASM] = useState<string>('');
  const [measurementResults, setMeasurementResults] = useState<any>(null);

  // Check if IBM Quantum is configured
  const checkQuantumConfig = async () => {
    try {
      // We'll check by trying to run a job - if credentials missing, API will tell us
      setHasIBMToken(null); // Unknown until we try
    } catch (error) {
      console.error('Error checking quantum config:', error);
    }
  };

  useEffect(() => {
    checkQuantumConfig();
  }, []);

  const runQuantumSimulation = async () => {
    setIsRunning(true);
    setQuantumJob(null);
    setMeasurementResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('quantum-processor', {
        body: {
          algorithm: currentAlgorithm,
          weatherParams: {
            temperature: currentWeather.temperature,
            humidity: currentWeather.humidity,
            pressure: currentWeather.pressure || 1013,
          },
          governorateId,
          shots: 1024,
        },
      });

      if (error) throw error;

      // Check response status
      if (data.status === 'credentials_missing') {
        setHasIBMToken(false);
        setCircuitQASM(data.circuit || '');
      } else if (data.status === 'queued' || data.status === 'running') {
        setHasIBMToken(true);
        setQuantumJob({
          id: data.jobId,
          ibmJobId: data.ibmJobId,
          status: data.status,
          algorithm: currentAlgorithm,
          circuit: data.circuit,
        });
        setCircuitQASM(data.circuit || '');
        
        // Start polling for results
        pollJobStatus(data.jobId);
      }
    } catch (error) {
      console.error('Error running quantum simulation:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setQuantumJob(prev => prev ? { ...prev, status: 'timeout' } : null);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('quantum-job-status', {
          body: {},
          headers: {},
        });

        // Use query params approach
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quantum-job-status?jobId=${jobId}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch job status');

        const statusData = await response.json();

        setQuantumJob({
          id: jobId,
          ibmJobId: statusData.ibmJobId,
          status: statusData.status,
          algorithm: currentAlgorithm,
          circuit: statusData.circuit,
          result: statusData.result,
        });

        if (statusData.status === 'completed') {
          setMeasurementResults(statusData.result);
          return;
        } else if (statusData.status === 'failed') {
          return;
        }

        // Continue polling
        attempts++;
        setTimeout(poll, 5000);
      } catch (error) {
        console.error('Error polling job status:', error);
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'queued':
        return <Badge className="bg-yellow-500/20 text-yellow-700"><Clock className="h-3 w-3 mr-1" />في الانتظار</Badge>;
      case 'running':
        return <Badge className="bg-blue-500/20 text-blue-700"><Loader2 className="h-3 w-3 mr-1 animate-spin" />قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />اكتمل</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />فشل</Badge>;
      case 'credentials_missing':
        return <Badge className="bg-orange-500/20 text-orange-700"><AlertCircle className="h-3 w-3 mr-1" />يحتاج إعداد</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-primary/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Atom className="text-purple-500 animate-pulse" />
            <span>IBM Quantum للطقس</span>
          </div>
          <div className="flex items-center gap-2">
            {hasIBMToken === true && (
              <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                IBM Quantum متصل
              </Badge>
            )}
            {hasIBMToken === false && (
              <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">
                <AlertCircle className="h-3 w-3 mr-1" />
                يحتاج إعداد
              </Badge>
            )}
            <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30">
              Quantum Computing
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* IBM Quantum Setup Notice */}
        {hasIBMToken === false && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <h4 className="font-semibold flex items-center gap-2 text-orange-700 mb-2">
              <AlertCircle className="h-5 w-5" />
              إعداد IBM Quantum Cloud
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              لتشغيل الدوائر الكمية على أجهزة IBM الحقيقية، يرجى إضافة مفاتيح IBM Quantum:
            </p>
            <ol className="text-sm space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="bg-orange-500/20 text-orange-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                <span>أنشئ حساباً مجانياً على <a href="https://quantum.ibm.com" target="_blank" rel="noopener" className="text-blue-500 underline">quantum.ibm.com</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-orange-500/20 text-orange-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                <span>انسخ API Token من Settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-orange-500/20 text-orange-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                <span>انسخ Service CRN من Instances</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-orange-500/20 text-orange-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                <span>أضف IBM_QUANTUM_TOKEN و IBM_SERVICE_CRN كـ secrets</span>
              </li>
            </ol>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => window.open('https://quantum.ibm.com', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              فتح IBM Quantum
            </Button>
          </div>
        )}

        {/* Quantum Circuit Visualization */}
        <div className="p-4 bg-foreground/5 rounded-xl overflow-x-auto">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
            <CircleDot className="h-4 w-4 text-purple-500" />
            الدائرة الكمية (QASM 3.0)
          </h4>
          {circuitQASM ? (
            <pre className="font-mono text-xs bg-black/5 dark:bg-white/5 p-3 rounded-lg overflow-x-auto max-h-48">
              {circuitQASM}
            </pre>
          ) : (
            <div className="font-mono text-xs space-y-1 min-w-[400px]">
              <div className="flex items-center gap-2">
                <span className="text-purple-500 w-12">q[0]:</span>
                <span className="text-muted-foreground">──</span>
                <span className="border border-purple-500 px-2 py-0.5 rounded text-purple-500">H</span>
                <span className="text-muted-foreground">──</span>
                <span className="border border-blue-500 px-2 py-0.5 rounded text-blue-500">Ry(θ₁)</span>
                <span className="text-muted-foreground">──●──</span>
                <span className="border border-green-500 px-2 py-0.5 rounded text-green-500">M</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500 w-12">q[1]:</span>
                <span className="text-muted-foreground">──</span>
                <span className="border border-purple-500 px-2 py-0.5 rounded text-purple-500">H</span>
                <span className="text-muted-foreground">──</span>
                <span className="border border-blue-500 px-2 py-0.5 rounded text-blue-500">Rz(θ₂)</span>
                <span className="text-muted-foreground">──⊕──</span>
                <span className="border border-green-500 px-2 py-0.5 rounded text-green-500">M</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500 w-12">q[2]:</span>
                <span className="text-muted-foreground">──</span>
                <span className="border border-purple-500 px-2 py-0.5 rounded text-purple-500">H</span>
                <span className="text-muted-foreground">──</span>
                <span className="border border-blue-500 px-2 py-0.5 rounded text-blue-500">Rx(θ₃)</span>
                <span className="text-muted-foreground">─────</span>
                <span className="border border-green-500 px-2 py-0.5 rounded text-green-500">M</span>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            θ₁ = {((currentWeather.temperature + 20) / 60 * Math.PI).toFixed(4)} (حرارة)، 
            θ₂ = {(currentWeather.humidity / 100 * Math.PI).toFixed(4)} (رطوبة)
          </p>
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
            <TabsTrigger value="qml" className="gap-1">
              <Activity className="h-4 w-4" />
              QNN
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vqe" className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-semibold mb-2">Variational Quantum Eigensolver (VQE)</h4>
              <p className="text-sm text-muted-foreground">
                يُستخدم لتحسين معاملات نماذج التنبؤ الجوي وإيجاد أدنى طاقة للنظام (أفضل الحلول).
                يتم إرسال الدائرة لمعالج IBM Quantum الحقيقي.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="qaoa" className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-semibold mb-2">Quantum Approximate Optimization Algorithm (QAOA)</h4>
              <p className="text-sm text-muted-foreground">
                يُستخدم لتحسين توزيع محطات الرصد وحساب أفضل مسارات السيول المحتملة.
                يستخدم طبقات ZZ interactions لترميز الارتباطات الجوية.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="qml" className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Network className="h-5 w-5 text-green-500" />
                Quantum Neural Networks (QNN)
              </h4>
              <p className="text-sm text-muted-foreground">
                شبكات عصبية كمية للتعرف على أنماط الطقس من البيانات التاريخية.
                تستخدم amplitude encoding وطبقات variational.
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
                <div className="text-3xl font-bold text-blue-500">3</div>
                <div className="text-xs text-muted-foreground">Layers</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-xl text-center border border-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-500">1024</div>
                <div className="text-xs text-muted-foreground">Shots</div>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-xl text-center border border-amber-500/20">
                <Zap className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-amber-500">
                  {measurementResults?.weatherPrediction?.confidence || '--'}%
                </div>
                <div className="text-xs text-muted-foreground">ثقة</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Job Status */}
        {quantumJob && (
          <div className="p-4 bg-secondary/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">حالة المهمة الكمية</h4>
              {getStatusBadge(quantumJob.status)}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">معرف المهمة: </span>
                <code className="text-xs">{quantumJob.id.slice(0, 8)}...</code>
              </div>
              <div>
                <span className="text-muted-foreground">الخوارزمية: </span>
                <span className="font-medium">{quantumJob.algorithm.toUpperCase()}</span>
              </div>
              {quantumJob.ibmJobId && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">IBM Job ID: </span>
                  <code className="text-xs">{quantumJob.ibmJobId}</code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Measurement Results */}
        {measurementResults && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl space-y-4">
            <h4 className="font-semibold flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              نتائج القياس الكمي (حقيقية من IBM)
            </h4>
            
            {measurementResults.measurements && (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={measurementResults.measurements.probabilities}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="state" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar 
                      dataKey="probability" 
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      name="الاحتمالية %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {measurementResults.weatherPrediction && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-background rounded-lg text-center">
                  <div className="text-muted-foreground">تصحيح الحرارة</div>
                  <div className="text-xl font-bold">
                    {measurementResults.weatherPrediction.temperatureCorrection > 0 ? '+' : ''}
                    {measurementResults.weatherPrediction.temperatureCorrection}°C
                  </div>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <div className="text-muted-foreground">احتمالية الهطول</div>
                  <div className="text-xl font-bold">
                    {measurementResults.weatherPrediction.precipitationProbability}%
                  </div>
                </div>
                <div className="p-3 bg-background rounded-lg text-center">
                  <div className="text-muted-foreground">الميزة الكمية</div>
                  <div className="text-xl font-bold capitalize">
                    {measurementResults.weatherPrediction.quantumAdvantage}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Run Button */}
        <div className="flex gap-4">
          <Button 
            onClick={runQuantumSimulation}
            disabled={isRunning}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                جاري الإرسال لـ IBM Quantum...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 ml-2" />
                تشغيل على IBM Quantum
              </>
            )}
          </Button>
        </div>

        {/* Comparison Stats */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            مقارنة: الكوانتوم الحقيقي vs المحاكاة
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {measurementResults?.weatherPrediction?.confidence || '--'}%
              </div>
              <div className="text-sm text-muted-foreground">IBM Quantum (حقيقي)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">
                ~85%
              </div>
              <div className="text-sm text-muted-foreground">محاكاة كلاسيكية</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumWeatherSimulator;
