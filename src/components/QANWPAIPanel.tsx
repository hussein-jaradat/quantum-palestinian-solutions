import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIAnalysis, useHistoricalStats, useSyncHistoricalData } from '@/hooks/useQANWPAI';
import { WeatherData } from '@/types/weather';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  RefreshCw,
  Sparkles,
  Database,
  Zap,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from '@/hooks/use-toast';

interface QANWPAIPanelProps {
  governorateId: string;
  governorateName: string;
  currentWeather: WeatherData | null;
}

const QANWPAIPanel = ({ governorateId, governorateName, currentWeather }: QANWPAIPanelProps) => {
  const [activeAnalysis, setActiveAnalysis] = useState<'forecast' | 'pattern' | 'risk' | 'comparison'>('forecast');
  
  const weatherContext = currentWeather ? {
    temperature: currentWeather.temperature,
    humidity: currentWeather.humidity,
    precipitation: currentWeather.precipitation,
    windSpeed: currentWeather.windSpeed,
    condition: currentWeather.condition,
  } : undefined;

  const { data: analysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useAIAnalysis(
    governorateId,
    activeAnalysis,
    weatherContext,
    true
  );

  const { data: stats, isLoading: statsLoading } = useHistoricalStats(governorateId);
  
  const syncMutation = useSyncHistoricalData();

  const handleSync = async () => {
    try {
      const result = await syncMutation.mutateAsync({ 
        governorateId,
        startDate: '2020-01-01',
      });
      toast({
        title: 'تمت المزامنة بنجاح',
        description: `تم إضافة ${result.recordsInserted} سجل`,
      });
    } catch (error) {
      toast({
        title: 'فشلت المزامنة',
        description: error instanceof Error ? error.message : 'خطأ غير معروف',
        variant: 'destructive',
      });
    }
  };

  const analysisTypes = [
    { id: 'forecast', label: 'التنبؤ', icon: TrendingUp },
    { id: 'pattern', label: 'الأنماط', icon: BarChart3 },
    { id: 'risk', label: 'المخاطر', icon: AlertTriangle },
    { id: 'comparison', label: 'المقارنة', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  QANWP-AI
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    نشط
                  </Badge>
                </h2>
                <p className="text-sm text-muted-foreground">
                  نظام الذكاء الاصطناعي المتخصص في الطقس الفلسطيني
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {governorateName}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">البيانات التاريخية</span>
              </div>
              {statsLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <p className="text-lg font-bold">
                  {stats?.hasData ? `${stats.totalRecords} سجل` : 'غير متوفرة'}
                </p>
              )}
            </div>
            <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-xs text-muted-foreground">السنوات المتاحة</span>
              </div>
              {statsLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <p className="text-lg font-bold">
                  {stats?.hasData ? `${stats.yearsAvailable.length} سنوات` : '-'}
                </p>
              )}
            </div>
            <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">نسبة الثقة</span>
              </div>
              {analysisLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <p className="text-lg font-bold text-green-600">
                  {analysis?.confidenceScore || 0}%
                </p>
              )}
            </div>
            <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">حالة النموذج</span>
              </div>
              <p className="text-lg font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                جاهز
              </p>
            </div>
          </div>

          {/* Sync Button */}
          {!stats?.hasData && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-dashed border-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-medium">لا تتوفر بيانات تاريخية</p>
                  <p className="text-sm text-muted-foreground">
                    قم بمزامنة البيانات من Open-Meteo للحصول على تحليلات أفضل
                  </p>
                </div>
                <Button 
                  onClick={handleSync} 
                  disabled={syncMutation.isPending}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                  {syncMutation.isPending ? 'جاري المزامنة...' : 'مزامنة البيانات'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-lg">تحليل QANWP-AI</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchAnalysis()}
              disabled={analysisLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${analysisLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={activeAnalysis} onValueChange={(v) => setActiveAnalysis(v as typeof activeAnalysis)}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              {analysisTypes.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="gap-1.5 text-xs md:text-sm">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {analysisTypes.map(({ id }) => (
              <TabsContent key={id} value={id} className="mt-0">
                {analysisLoading ? (
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : analysis?.content ? (
                  <div className="bg-muted/30 rounded-xl p-6 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{analysis.content}</ReactMarkdown>
                    
                    {analysis.historicalContext && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">السياق التاريخي:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            متوسط الحرارة: {analysis.historicalContext.avgTemp.toFixed(1)}°C
                          </Badge>
                          <Badge variant="outline">
                            الأمطار: {analysis.historicalContext.totalPrecipitation.toFixed(0)} مم
                          </Badge>
                          <Badge variant="outline">
                            الرطوبة: {analysis.historicalContext.avgHumidity.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا يتوفر تحليل حالياً</p>
                    <p className="text-sm">جرب تحديث التحليل</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Historical Stats */}
      {stats?.hasData && (
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              الإحصائيات التاريخية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-primary">
                  {stats.overallStats.avgTemperature.toFixed(1)}°
                </p>
                <p className="text-xs text-muted-foreground">متوسط الحرارة</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-destructive">
                  {stats.overallStats.maxTemperature.toFixed(0)}°
                </p>
                <p className="text-xs text-muted-foreground">أعلى حرارة</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-blue-500">
                  {stats.overallStats.minTemperature.toFixed(0)}°
                </p>
                <p className="text-xs text-muted-foreground">أدنى حرارة</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-cyan-500">
                  {stats.overallStats.totalPrecipitation.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">مم أمطار</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-green-500">
                  {stats.overallStats.avgHumidity.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">رطوبة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QANWPAIPanel;
