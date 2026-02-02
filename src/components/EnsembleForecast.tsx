import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers, RefreshCw, TrendingUp, BarChart3, Percent,
  Thermometer, CloudRain, CheckCircle2, Database, AlertCircle,
  Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Area, ComposedChart, Bar
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { GOVERNORATES } from '@/data/weatherData';

interface ModelInfo {
  name: string;
  color: string;
  weight: number;
  source: string;
}

interface EnsembleData {
  day: string;
  date: string;
  openMeteo: number;
  gfs: number;
  icon: number;
  ensemble: number;
  ensembleMin: number;
  ensembleMax: number;
  precipOpenMeteo: number;
  precipGfs: number;
  precipIcon: number;
  precipEnsemble: number;
  confidence: number;
}

interface EnsembleForecastProps {
  governorateId?: string;
}

const EnsembleForecast = ({ governorateId = 'ramallah' }: EnsembleForecastProps) => {
  const [data, setData] = useState<EnsembleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [ensembleAccuracy, setEnsembleAccuracy] = useState(0);
  const [weightsSource, setWeightsSource] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchRealEnsembleData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const gov = GOVERNORATES.find(g => g.id === governorateId);
      if (!gov) throw new Error('المحافظة غير موجودة');

      const { data: response, error: fetchError } = await supabase.functions.invoke('ensemble-forecast', {
        body: {
          governorateId,
          lat: gov.coordinates.lat,
          lng: gov.coordinates.lng,
          days: 7,
        },
      });

      if (fetchError) throw fetchError;
      if (!response || !response.dailyForecast) throw new Error('استجابة غير صالحة');

      const ensembleData: EnsembleData[] = response.dailyForecast.map((day: any) => ({
        day: day.dayName,
        date: new Date(day.date).toLocaleDateString('ar-PS', { day: 'numeric', month: 'numeric' }),
        openMeteo: day.temperature.openMeteo,
        gfs: day.temperature.gfs,
        icon: day.temperature.icon,
        ensemble: day.temperature.ensemble,
        ensembleMin: day.temperature.min,
        ensembleMax: day.temperature.max,
        precipOpenMeteo: day.precipitation.openMeteo,
        precipGfs: day.precipitation.gfs,
        precipIcon: day.precipitation.icon,
        precipEnsemble: day.precipitation.ensemble,
        confidence: day.confidence,
      }));

      setData(ensembleData);

      const modelColors = {
        'Open-Meteo IFS': 'hsl(var(--primary))',
        'NOAA GFS': 'hsl(var(--accent))',
        'DWD ICON': 'hsl(35, 90%, 50%)',
      };

      setModels(response.models.map((m: any) => ({
        name: m.name,
        color: modelColors[m.name as keyof typeof modelColors] || 'hsl(var(--muted))',
        weight: m.weight,
        source: m.source,
      })));

      setEnsembleAccuracy(response.summary.avgConfidence);
      setWeightsSource(response.summary.weightsSource || 'ديناميكي');

    } catch (err) {
      console.error('Error fetching ensemble data:', err);
      setError(err instanceof Error ? err.message : 'فشل في جلب البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealEnsembleData();
  }, [governorateId]);

  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="bg-gradient-to-r from-accent/5 via-primary/5 to-purple-500/5 border-b">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-accent" />
            </div>
            <div>
              <span className="font-bold">التنبؤ المُجمَّع (Ensemble)</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="data-badge-success text-[10px]">
                  <Activity className="h-3 w-3 ml-1" />
                  بيانات حقيقية
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="gap-1 bg-accent/10 text-accent border-accent/20">
              <CheckCircle2 className="h-3 w-3" />
              {models.length} نماذج
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Percent className="h-3 w-3" />
              ثقة {Math.round(ensembleAccuracy)}%
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRealEnsembleData}
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
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">خطأ في جلب البيانات</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        )}

        {/* Model Weights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((model) => (
            <div 
              key={model.name}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{model.name}</span>
                <Badge variant="secondary">{model.weight}%</Badge>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>المصدر:</span>
                  <span className="font-medium truncate max-w-[140px]">{model.source}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all bg-primary"
                    style={{ width: `${model.weight}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weights Source */}
        <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-sm">
          <span className="font-medium">مصدر الأوزان: </span>
          <span className="text-muted-foreground">{weightsSource}</span>
          <span className="text-xs text-muted-foreground mr-2">
            (تتغير تلقائياً بناءً على أداء كل نموذج)
          </span>
        </div>

        <Tabs defaultValue="temperature" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="temperature" className="gap-1">
              <Thermometer className="h-4 w-4" />
              درجة الحرارة
            </TabsTrigger>
            <TabsTrigger value="precipitation" className="gap-1">
              <CloudRain className="h-4 w-4" />
              الهطول
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="space-y-4 mt-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      direction: 'rtl'
                    }}
                    formatter={(value: number, name: string) => [
                      `${value}°C`,
                      name === 'ensemble' ? 'المُجمَّع' : name
                    ]}
                  />
                  <Legend />
                  
                  <Area 
                    type="monotone" 
                    dataKey="ensembleMax" 
                    stroke="none" 
                    fill="hsl(var(--accent) / 0.1)"
                    name="الحد الأعلى"
                  />
                  
                  <Line 
                    type="monotone" 
                    dataKey="openMeteo" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Open-Meteo"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gfs" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="GFS"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="icon" 
                    stroke="hsl(35, 90%, 50%)" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="ICON"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ensemble" 
                    stroke="hsl(270, 60%, 55%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(270, 60%, 55%)', strokeWidth: 2 }}
                    name="المُجمَّع (Ensemble)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-sm">
                <span className="font-semibold">💡 الخط البنفسجي السميك</span> يمثل التنبؤ المُجمَّع 
                المحسوب من {models.length} نماذج عالمية حقيقية بأوزان ديناميكية.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="precipitation" className="space-y-4 mt-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      direction: 'rtl'
                    }}
                    formatter={(value: number) => [`${value} مم`, '']}
                  />
                  <Legend />
                  
                  <Bar 
                    dataKey="precipOpenMeteo" 
                    fill="hsl(var(--primary) / 0.6)"
                    name="Open-Meteo"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="precipGfs" 
                    fill="hsl(var(--accent) / 0.6)"
                    name="GFS"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="precipIcon" 
                    fill="hsl(35, 90%, 50%, 0.6)"
                    name="ICON"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="precipEnsemble" 
                    stroke="hsl(270, 60%, 55%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(270, 60%, 55%)', strokeWidth: 2 }}
                    name="المُجمَّع"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Ensemble Explanation */}
        <div className="p-4 bg-secondary/30 rounded-xl space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            كيف يعمل التجميع (Ensemble)؟
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-card rounded-lg border">
              <div className="font-medium mb-1">1️⃣ جمع البيانات</div>
              <p className="text-muted-foreground text-xs">
                نجمع توقعات من ECMWF IFS، NOAA GFS، و DWD ICON
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="font-medium mb-1">2️⃣ الترجيح الديناميكي</div>
              <p className="text-muted-foreground text-xs">
                الأوزان تتغير بناءً على MAE الفعلي لكل نموذج
              </p>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="font-medium mb-1">3️⃣ حساب عدم اليقين</div>
              <p className="text-muted-foreground text-xs">
                نطاق الثقة محسوب من الفرق بين توقعات النماذج
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card text-center">
            <TrendingUp className="h-6 w-6 text-accent mx-auto mb-2" />
            <div className="text-lg font-bold text-accent">
              {weightsSource.includes('Dynamic') ? 'ديناميكي' : 'ثابت'}
            </div>
            <div className="text-xs text-muted-foreground">نظام الأوزان</div>
          </div>
          <div className="stat-card text-center">
            <Layers className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold text-primary">{models.length}</div>
            <div className="text-xs text-muted-foreground">نماذج حقيقية</div>
          </div>
          <div className="stat-card text-center">
            <CheckCircle2 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-500">{Math.round(ensembleAccuracy)}%</div>
            <div className="text-xs text-muted-foreground">ثقة المُجمَّع</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnsembleForecast;