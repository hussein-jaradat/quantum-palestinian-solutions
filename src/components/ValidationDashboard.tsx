import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, TrendingUp, TrendingDown, BarChart3,
  Target, Award, AlertTriangle, RefreshCw, Database,
  Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Bar, BarChart, Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface ValidationMetric {
  date: string;
  predicted: number;
  actual: number;
  error: number;
  mae: number;
  rmse: number;
}

interface ModelScore {
  model: string;
  mae: number;
  rmse: number;
  bias: number;
  skillScore: number;
  sampleCount: number;
}

const ValidationDashboard = () => {
  const [validationData, setValidationData] = useState<ValidationMetric[]>([]);
  const [modelScores, setModelScores] = useState<ModelScore[]>([]);
  const [overallMAE, setOverallMAE] = useState(0);
  const [overallRMSE, setOverallRMSE] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'real' | 'empty'>('empty');
  const [totalValidations, setTotalValidations] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const fetchRealValidationData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch recent validations with their predictions
      const { data: validations, error: valError } = await supabase
        .from('prediction_validations')
        .select(`
          *,
          prediction:weather_predictions(
            target_date,
            model_name,
            governorate_id,
            temp_avg,
            precipitation
          )
        `)
        .order('validated_at', { ascending: false })
        .limit(100);

      if (valError) {
        console.error('Error fetching validations:', valError);
        setDataSource('empty');
        return;
      }

      if (!validations || validations.length === 0) {
        setDataSource('empty');
        setValidationData([]);
        setModelScores([]);
        return;
      }

      setTotalValidations(validations.length);
      setDataSource('real');
      setLastSyncTime(validations[0]?.validated_at || null);

      // Process validation data for charts
      const dailyData: Record<string, { errors: number[]; predicted: number[]; actual: number[] }> = {};
      
      for (const val of validations) {
        if (!val.prediction || val.error_temp_avg === null) continue;
        
        const date = new Date(val.validated_at).toLocaleDateString('ar-PS', {
          day: 'numeric',
          month: 'numeric',
        });
        
        if (!dailyData[date]) {
          dailyData[date] = { errors: [], predicted: [], actual: [] };
        }
        
        dailyData[date].errors.push(val.error_temp_avg);
        if (val.prediction.temp_avg) dailyData[date].predicted.push(val.prediction.temp_avg);
        if (val.actual_temp_avg) dailyData[date].actual.push(val.actual_temp_avg);
      }

      // Calculate metrics for chart
      const chartData: ValidationMetric[] = [];
      let cumulativeAbsError = 0;
      let cumulativeSquaredError = 0;
      let count = 0;

      Object.entries(dailyData).slice(0, 30).reverse().forEach(([date, data]) => {
        const avgError = data.errors.reduce((a, b) => a + b, 0) / data.errors.length;
        const avgPredicted = data.predicted.length > 0 
          ? data.predicted.reduce((a, b) => a + b, 0) / data.predicted.length 
          : 0;
        const avgActual = data.actual.length > 0 
          ? data.actual.reduce((a, b) => a + b, 0) / data.actual.length 
          : 0;

        cumulativeAbsError += Math.abs(avgError);
        cumulativeSquaredError += avgError * avgError;
        count++;

        chartData.push({
          date,
          predicted: Math.round(avgPredicted * 10) / 10,
          actual: Math.round(avgActual * 10) / 10,
          error: Math.round(avgError * 100) / 100,
          mae: Math.round((cumulativeAbsError / count) * 100) / 100,
          rmse: Math.round(Math.sqrt(cumulativeSquaredError / count) * 100) / 100,
        });
      });

      setValidationData(chartData);
      
      if (chartData.length > 0) {
        setOverallMAE(chartData[chartData.length - 1].mae);
        setOverallRMSE(chartData[chartData.length - 1].rmse);
      }

      // Fetch model performance data
      const { data: performance, error: perfError } = await supabase
        .from('model_performance')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!perfError && performance && performance.length > 0) {
        const scores: ModelScore[] = performance.map((p) => ({
          model: getModelDisplayName(p.model_name),
          mae: p.mae_temp || 0,
          rmse: p.rmse_temp || 0,
          bias: p.bias || 0,
          skillScore: p.skill_score || 0,
          sampleCount: p.sample_count || 0,
        }));

        scores.sort((a, b) => a.mae - b.mae);
        setModelScores(scores);
      }

    } catch (error) {
      console.error('Error fetching validation data:', error);
      setDataSource('empty');
    } finally {
      setIsLoading(false);
    }
  };

  const getModelDisplayName = (modelName: string): string => {
    const names: Record<string, string> = {
      'ensemble': 'QANWP Ensemble',
      'open-meteo': 'Open-Meteo IFS',
      'gfs': 'NOAA GFS',
      'icon': 'DWD ICON',
    };
    return names[modelName] || modelName;
  };

  useEffect(() => {
    fetchRealValidationData();
  }, []);

  const getMAEStatus = (mae: number) => {
    if (mae === 0) return { label: 'لا توجد بيانات', color: 'bg-muted', icon: <Database className="h-4 w-4" /> };
    if (mae <= 1.5) return { label: 'ممتاز', color: 'bg-accent', icon: <CheckCircle2 className="h-4 w-4" /> };
    if (mae <= 2.5) return { label: 'جيد', color: 'bg-alert-warning', icon: <TrendingUp className="h-4 w-4" /> };
    return { label: 'يحتاج تحسين', color: 'bg-destructive', icon: <AlertTriangle className="h-4 w-4" /> };
  };

  const maeStatus = getMAEStatus(overallMAE);

  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-primary/5 border-b">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <span className="font-bold">نظام التحقق من الدقة</span>
              {dataSource === 'real' && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="data-badge-success text-[10px]">
                    <Activity className="h-3 w-3 ml-1" />
                    بيانات حقيقية
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {totalValidations} سجل
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`gap-1 ${maeStatus.color} text-white`}>
              {maeStatus.icon}
              {maeStatus.label}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRealValidationData}
              disabled={isLoading}
              className="gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {dataSource === 'empty' && !isLoading && (
          <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">لا توجد بيانات تحقق بعد</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              سيتم جمع بيانات التحقق تلقائياً عند تشغيل نظام المزامنة اليومي.
              يقارن النظام التنبؤات السابقة بالطقس الفعلي لحساب الدقة.
            </p>
          </div>
        )}

        {(dataSource === 'real' || validationData.length > 0) && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card text-center">
                <div className="text-xs text-muted-foreground mb-2">MAE</div>
                <div className="text-3xl font-bold text-primary">{overallMAE || '--'}°</div>
                <div className="text-[10px] text-muted-foreground">متوسط الخطأ المطلق</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-xs text-muted-foreground mb-2">RMSE</div>
                <div className="text-3xl font-bold text-purple-500">{overallRMSE || '--'}°</div>
                <div className="text-[10px] text-muted-foreground">جذر متوسط مربع الخطأ</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-xs text-muted-foreground mb-2">سجلات التحقق</div>
                <div className="text-3xl font-bold text-accent">{totalValidations}</div>
                <div className="text-[10px] text-muted-foreground">من قاعدة البيانات</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-xs text-muted-foreground mb-2">مصدر البيانات</div>
                <div className="text-lg font-bold text-amber-500">
                  {dataSource === 'real' ? 'حقيقي 100%' : 'في انتظار البيانات'}
                </div>
                <div className="text-[10px] text-muted-foreground">لا أرقام عشوائية</div>
              </div>
            </div>

            <Tabs defaultValue="comparison" dir="rtl">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison" className="gap-1 text-xs">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">مقارنة</span> التنبؤ vs الفعلي
                </TabsTrigger>
                <TabsTrigger value="error" className="gap-1 text-xs">
                  <TrendingDown className="h-4 w-4" />
                  تتبع الخطأ
                </TabsTrigger>
                <TabsTrigger value="models" className="gap-1 text-xs">
                  <Award className="h-4 w-4" />
                  مقارنة النماذج
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="mt-4">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={validationData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          direction: 'rtl'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                        name="المُتوقَّع"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        dot={false}
                        name="الفعلي"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="error" className="mt-4 space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={validationData.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[-3, 3]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value}°C`, 'الخطأ']}
                      />
                      <Bar dataKey="error" name="الخطأ">
                        {validationData.slice(-14).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.error > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={validationData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="mae" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                        name="MAE التراكمي"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rmse" 
                        stroke="hsl(270, 50%, 50%)" 
                        strokeWidth={2}
                        dot={false}
                        name="RMSE التراكمي"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="models" className="mt-4 space-y-4">
                {modelScores.length === 0 ? (
                  <div className="p-8 text-center bg-secondary/20 rounded-xl">
                    <p className="text-muted-foreground">
                      لا توجد بيانات أداء للنماذج بعد. سيتم حسابها تلقائياً بعد تجميع بيانات التحقق.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modelScores.map((model, idx) => (
                      <div 
                        key={model.model}
                        className={`p-4 rounded-xl border transition-all ${
                          idx === 0 
                            ? 'bg-accent/5 border-accent/20' 
                            : 'bg-card hover:bg-secondary/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {idx === 0 && <Award className="h-5 w-5 text-accent" />}
                            <span className="font-semibold">{model.model}</span>
                            <Badge variant="outline" className="text-xs">
                              {model.sampleCount} عينة
                            </Badge>
                          </div>
                          <Badge variant={idx === 0 ? "default" : "outline"}>
                            #{idx + 1}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs">MAE</div>
                            <div className="font-bold">{model.mae.toFixed(2)}°</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">RMSE</div>
                            <div className="font-bold">{model.rmse.toFixed(2)}°</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">الانحياز</div>
                            <div className={`font-bold ${model.bias > 0 ? 'text-destructive' : 'text-accent'}`}>
                              {model.bias > 0 ? '+' : ''}{model.bias.toFixed(2)}°
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Skill Score</div>
                            <div className="font-bold">{(model.skillScore * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationDashboard;