import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHistoricalStats, useSyncHistoricalData } from '@/hooks/useQANWPAI';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, TrendingUp, Droplets, Thermometer, RefreshCw, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HistoricalAnalysisProps {
  governorateId: string;
  governorateName: string;
}

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const HistoricalAnalysis = ({ governorateId, governorateName }: HistoricalAnalysisProps) => {
  const [chartType, setChartType] = useState<'temperature' | 'precipitation' | 'combined'>('combined');
  
  const { data: stats, isLoading, refetch } = useHistoricalStats(governorateId);
  const syncMutation = useSyncHistoricalData();

  const monthlyChartData = useMemo(() => {
    if (!stats?.monthlyStats) return [];
    
    return Object.entries(stats.monthlyStats)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([month, data]) => ({
        month: MONTH_NAMES[Number(month) - 1],
        monthNum: Number(month),
        avgTemp: Number(data.avgTemp.toFixed(1)),
        avgPrecip: Number(data.avgPrecip.toFixed(1)),
        count: data.count,
      }));
  }, [stats]);

  const handleSync = async () => {
    try {
      const result = await syncMutation.mutateAsync({ 
        governorateId,
        startDate: '2015-01-01',
      });
      toast({
        title: 'تمت المزامنة بنجاح',
        description: `تم إضافة ${result.recordsInserted} سجل من البيانات التاريخية`,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'فشلت المزامنة',
        description: error instanceof Error ? error.message : 'خطأ غير معروف',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            التحليل التاريخي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats?.hasData) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            التحليل التاريخي - {governorateName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">لا تتوفر بيانات تاريخية</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              قم بمزامنة البيانات التاريخية من Open-Meteo API للحصول على تحليلات شاملة لـ 10 سنوات
            </p>
            <Button 
              onClick={handleSync} 
              disabled={syncMutation.isPending}
              size="lg"
              className="gap-2"
            >
              <RefreshCw className={`h-5 w-5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              {syncMutation.isPending ? 'جاري المزامنة...' : 'مزامنة البيانات (2015-2025)'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              التحليل التاريخي - {governorateName}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                {stats.totalRecords} سجل
              </Badge>
              <Badge variant="secondary">
                {stats.yearsAvailable[0]} - {stats.yearsAvailable[stats.yearsAvailable.length - 1]}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 text-center">
              <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{stats.overallStats.avgTemperature.toFixed(1)}°C</p>
              <p className="text-xs text-muted-foreground">متوسط الحرارة</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{stats.overallStats.maxTemperature}°C</p>
              <p className="text-xs text-muted-foreground">أعلى درجة</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500 rotate-180" />
              <p className="text-2xl font-bold">{stats.overallStats.minTemperature}°C</p>
              <p className="text-xs text-muted-foreground">أدنى درجة</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 text-center">
              <Droplets className="h-6 w-6 mx-auto mb-2 text-cyan-500" />
              <p className="text-2xl font-bold">{stats.overallStats.totalPrecipitation.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">مم أمطار (سنوي)</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 text-center">
              <Droplets className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.overallStats.avgHumidity.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">متوسط الرطوبة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <span>المتوسطات الشهرية</span>
            <Select value={chartType} onValueChange={(v) => setChartType(v as typeof chartType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="combined">الحرارة والأمطار</SelectItem>
                <SelectItem value="temperature">الحرارة فقط</SelectItem>
                <SelectItem value="precipitation">الأمطار فقط</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'combined' ? (
                <AreaChart data={monthlyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrecip" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="left" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      direction: 'rtl'
                    }} 
                  />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="avgTemp" 
                    name="درجة الحرارة (°C)"
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="avgPrecip" 
                    name="الأمطار (مم)"
                    stroke="hsl(var(--accent))" 
                    fillOpacity={1} 
                    fill="url(#colorPrecip)" 
                  />
                </AreaChart>
              ) : chartType === 'temperature' ? (
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
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
                    dataKey="avgTemp" 
                    name="درجة الحرارة (°C)"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              ) : (
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      direction: 'rtl'
                    }} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="avgPrecip" 
                    name="الأمطار (مم)"
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Season Analysis */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { name: 'الشتاء', months: [12, 1, 2], icon: '❄️', color: 'from-blue-500/20' },
          { name: 'الربيع', months: [3, 4, 5], icon: '🌸', color: 'from-pink-500/20' },
          { name: 'الصيف', months: [6, 7, 8], icon: '☀️', color: 'from-yellow-500/20' },
          { name: 'الخريف', months: [9, 10, 11], icon: '🍂', color: 'from-orange-500/20' },
        ].map((season) => {
          const seasonData = monthlyChartData.filter(m => season.months.includes(m.monthNum));
          const avgTemp = seasonData.length > 0 
            ? seasonData.reduce((s, d) => s + d.avgTemp, 0) / seasonData.length 
            : 0;
          const totalPrecip = seasonData.reduce((s, d) => s + d.avgPrecip, 0);

          return (
            <Card key={season.name} className={`border-border/50 bg-gradient-to-br ${season.color} to-transparent`}>
              <CardContent className="pt-6 text-center">
                <span className="text-3xl mb-2 block">{season.icon}</span>
                <h3 className="font-bold mb-2">{season.name}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    الحرارة: <span className="font-semibold text-foreground">{avgTemp.toFixed(1)}°C</span>
                  </p>
                  <p className="text-muted-foreground">
                    الأمطار: <span className="font-semibold text-foreground">{totalPrecip.toFixed(0)} مم</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HistoricalAnalysis;
