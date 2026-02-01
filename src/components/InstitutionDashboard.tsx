import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, Download, FileText, TrendingUp, 
  Calendar, Database, Globe, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { WeatherData, DailyForecast } from '@/types/weather';
import { GOVERNORATES } from '@/data/weatherData';

interface InstitutionDashboardProps {
  weather: WeatherData | null;
  dailyData: DailyForecast[];
  allWeatherData: Record<string, WeatherData>;
  governorateName: string;
}

const InstitutionDashboard = ({ weather, dailyData, allWeatherData, governorateName }: InstitutionDashboardProps) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Prepare chart data
  const chartData = dailyData.map((day, i) => ({
    date: new Date(day.date).toLocaleDateString('ar', { weekday: 'short' }),
    tempMax: day.temperatureMax,
    tempMin: day.temperatureMin,
    precipitation: day.precipitation,
    humidity: day.humidity,
  }));

  // Regional comparison data
  const regionalData = Object.entries(allWeatherData).map(([id, data]) => {
    const gov = GOVERNORATES.find(g => g.id === id);
    return {
      name: gov?.nameAr || id,
      temperature: data.temperature,
      humidity: data.humidity,
      precipitation: data.precipitation,
    };
  }).slice(0, 8);

  // Statistics
  const avgTemp = dailyData.length > 0 
    ? dailyData.reduce((sum, d) => sum + (d.temperatureMax + d.temperatureMin) / 2, 0) / dailyData.length 
    : 0;
  const totalPrecip = dailyData.reduce((sum, d) => sum + d.precipitation, 0);
  const avgHumidity = dailyData.length > 0 
    ? dailyData.reduce((sum, d) => sum + d.humidity, 0) / dailyData.length 
    : 0;
  const extremeDays = dailyData.filter(d => d.temperatureMax > 35 || d.temperatureMin < 5).length;

  const handleExportReport = () => {
    const reportData = {
      governorate: governorateName,
      generatedAt: new Date().toISOString(),
      period: reportType,
      statistics: { avgTemp, totalPrecip, avgHumidity, extremeDays },
      dailyData,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-report-${governorateName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Globe className="h-3 w-3" />
            {governorateName}
          </Badge>
          <Badge variant="secondary">
            آخر تحديث: {weather?.updatedAt ? new Date(weather.updatedAt).toLocaleTimeString('ar') : '--'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            {(['daily', 'weekly', 'monthly'] as const).map(type => (
              <Button
                key={type}
                variant={reportType === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setReportType(type)}
                className="rounded-none"
              >
                {type === 'daily' ? 'يومي' : type === 'weekly' ? 'أسبوعي' : 'شهري'}
              </Button>
            ))}
          </div>
          
          <Button onClick={handleExportReport} size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs">المتوسط</Badge>
            </div>
            <p className="text-3xl font-bold">{avgTemp.toFixed(1)}°</p>
            <p className="text-xs text-muted-foreground">متوسط الحرارة</p>
            <Progress value={(avgTemp / 40) * 100} className="h-1 mt-2" />
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="h-5 w-5 text-blue-500" />
              <Badge variant="secondary" className="text-xs">الإجمالي</Badge>
            </div>
            <p className="text-3xl font-bold">{totalPrecip.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">مم هطول</p>
            <Progress value={(totalPrecip / 100) * 100} className="h-1 mt-2" />
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-teal-500" />
              <Badge variant="secondary" className="text-xs">المتوسط</Badge>
            </div>
            <p className="text-3xl font-bold">{avgHumidity.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">الرطوبة</p>
            <Progress value={avgHumidity} className="h-1 mt-2" />
          </CardContent>
        </Card>
        
        <Card className={`glass-effect ${extremeDays > 0 ? 'border-yellow-500/30' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className={`h-5 w-5 ${extremeDays > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <Badge variant={extremeDays > 0 ? 'destructive' : 'secondary'} className="text-xs">
                {extremeDays > 0 ? 'تحذير' : 'طبيعي'}
              </Badge>
            </div>
            <p className="text-3xl font-bold">{extremeDays}</p>
            <p className="text-xs text-muted-foreground">أيام متطرفة</p>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Chart */}
      <Card className="glass-effect">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            اتجاه درجات الحرارة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="tempMax" 
                  name="الحرارة العظمى" 
                  stroke="hsl(var(--destructive))" 
                  fillOpacity={1} 
                  fill="url(#colorMax)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="tempMin" 
                  name="الحرارة الصغرى" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorMin)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Precipitation Chart */}
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              الهطول المتوقع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="precipitation" name="الهطول (مم)" fill="hsl(210, 79%, 46%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Comparison */}
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-primary" />
              مقارنة المحافظات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" fontSize={10} />
                  <YAxis dataKey="name" type="category" fontSize={10} width={60} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="temperature" name="الحرارة" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="glass-effect">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            البيانات التفصيلية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">التاريخ</th>
                  <th className="text-right p-2">العظمى</th>
                  <th className="text-right p-2">الصغرى</th>
                  <th className="text-right p-2">الهطول</th>
                  <th className="text-right p-2">الرطوبة</th>
                  <th className="text-right p-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.slice(0, 7).map((day, i) => (
                  <tr key={i} className="border-b hover:bg-secondary/30">
                    <td className="p-2">{new Date(day.date).toLocaleDateString('ar')}</td>
                    <td className="p-2 font-medium">{day.temperatureMax}°</td>
                    <td className="p-2">{day.temperatureMin}°</td>
                    <td className="p-2">{day.precipitation} مم</td>
                    <td className="p-2">{day.humidity}%</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {day.condition === 'sunny' ? 'مشمس' :
                         day.condition === 'rainy' ? 'ماطر' :
                         day.condition === 'cloudy' ? 'غائم' : 'متغير'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionDashboard;
