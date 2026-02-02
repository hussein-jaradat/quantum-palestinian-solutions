import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers, RefreshCw, TrendingUp, BarChart3, Percent,
  Thermometer, CloudRain, CheckCircle2, Database, AlertCircle
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
  confidence: number;
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
  const [dataSource, setDataSource] = useState<'api' | 'error'>('api');
  const [weightsSource, setWeightsSource] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchRealEnsembleData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const gov = GOVERNORATES.find(g => g.id === governorateId);
      if (!gov) {
        throw new Error('Governorate not found');
      }

      const { data: response, error: fetchError } = await supabase.functions.invoke('ensemble-forecast', {
        body: {
          governorateId,
          lat: gov.coordinates.lat,
          lng: gov.coordinates.lng,
          days: 7,
        },
      });

      if (fetchError) throw fetchError;

      if (!response || !response.dailyForecast) {
        throw new Error('Invalid response from ensemble-forecast');
      }

      // Transform API response to component format
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
      setDataSource('api');

      // Set model info from response
      setModels(response.models.map((m: any) => ({
        name: m.name,
        color: m.name.includes('Open') ? '#3b82f6' : m.name.includes('GFS') ? '#22c55e' : '#f59e0b',
        weight: m.weight,
        confidence: 85 + m.weight * 0.15, // Estimate confidence from weight
        source: m.source,
      })));

      setEnsembleAccuracy(response.summary.avgConfidence);
      setWeightsSource(response.summary.weightsSource || 'Dynamic');

    } catch (err) {
      console.error('Error fetching ensemble data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ensemble data');
      setDataSource('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealEnsembleData();
  }, [governorateId]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-primary/10">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-500" />
            <span>التنبؤ المُجمَّع (Ensemble Forecasting)</span>
            <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
              <Database className="h-3 w-3" />
              بيانات حقيقية
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="gap-1 bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
              <CheckCircle2 className="h-3 w-3" />
              {models.length} نماذج عالمية
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
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">خطأ في جلب البيانات</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        )}

        {/* Model Weights - Real from API */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((model) => (
            <div 
              key={model.name}
              className="p-4 rounded-xl border"
              style={{ borderColor: `${model.color}50`, background: `${model.color}10` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{model.name}</span>
                <Badge variant="secondary">{model.weight}%</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>المصدر:</span>
                  <span className="font-medium text-xs">{model.source}</span>
                </div>
                <div 
                  className="h-2 rounded-full bg-secondary"
                  style={{ overflow: 'hidden' }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${model.weight}%`,
                      backgroundColor: model.color
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weights Source Indicator */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
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
                  
                  {/* Ensemble uncertainty band */}
                  <Area 
                    type="monotone" 
                    dataKey="ensembleMax" 
                    stroke="none" 
                    fill="#22c55e20"
                    name="الحد الأعلى"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ensembleMin" 
                    stroke="none" 
                    fill="#ffffff"
                    name="الحد الأدنى"
                  />
                  
                  <Line 
                    type="monotone" 
                    dataKey="openMeteo" 
                    stroke="#3b82f6" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Open-Meteo"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gfs" 
                    stroke="#22c55e" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="GFS"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="icon" 
                    stroke="#f59e0b" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                    name="ICON"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ensemble" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    name="المُجمَّع (Ensemble)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <p className="text-sm">
                <span className="font-semibold">💡 الخط البنفسجي السميك</span> يمثل التنبؤ المُجمَّع (Ensemble) 
                المحسوب من {models.length} نماذج عالمية حقيقية بأوزان ديناميكية تتغير حسب الأداء.
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
                    fill="#3b82f680"
                    name="Open-Meteo"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="precipGfs" 
                    fill="#22c55e80"
                    name="GFS"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="precipIcon" 
                    fill="#f59e0b80"
                    name="ICON"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="precipEnsemble" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
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
            كيف يعمل التجميع (Ensemble) الحقيقي؟
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-background rounded-lg">
              <div className="font-medium mb-1">1️⃣ جمع البيانات الحقيقية</div>
              <p className="text-muted-foreground text-xs">
                نجمع توقعات من ECMWF IFS، NOAA GFS، و DWD ICON عبر APIs حقيقية
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="font-medium mb-1">2️⃣ الترجيح الديناميكي</div>
              <p className="text-muted-foreground text-xs">
                الأوزان تتغير بناءً على MAE الفعلي لكل نموذج من نظام التحقق
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="font-medium mb-1">3️⃣ حساب عدم اليقين</div>
              <p className="text-muted-foreground text-xs">
                نطاق الثقة محسوب من الفرق الفعلي بين توقعات النماذج
              </p>
            </div>
          </div>
        </div>

        {/* Real Data Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 rounded-xl text-center">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {weightsSource.includes('Dynamic') ? 'ديناميكي' : 'ثابت'}
            </div>
            <div className="text-xs text-muted-foreground">نظام الأوزان</div>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-xl text-center">
            <Layers className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{models.length}</div>
            <div className="text-xs text-muted-foreground">نماذج عالمية حقيقية</div>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-xl text-center">
            <CheckCircle2 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{Math.round(ensembleAccuracy)}%</div>
            <div className="text-xs text-muted-foreground">ثقة المُجمَّع</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnsembleForecast;
