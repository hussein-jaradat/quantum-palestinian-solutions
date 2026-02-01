import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { DailyForecast } from '@/types/weather';
import { getWeatherIcon } from '@/data/weatherData';
import { TrendingUp, Droplets, Thermometer } from 'lucide-react';

interface MonthlyForecastProps {
  dailyData: DailyForecast[];
  governorateName: string;
}

const MonthlyForecast = ({ dailyData, governorateName }: MonthlyForecastProps) => {
  // Generate 30-day mock data based on weekly pattern
  const monthlyData = [...Array(30)].map((_, i) => {
    const baseIndex = i % dailyData.length;
    const baseData = dailyData[baseIndex] || dailyData[0];
    const variation = Math.sin(i / 7) * 3;
    
    return {
      day: i + 1,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('ar-PS', { 
        day: 'numeric', 
        month: 'short' 
      }),
      max: Math.round((baseData?.temperatureMax || 20) + variation),
      min: Math.round((baseData?.temperatureMin || 10) + variation),
      precipitation: Math.max(0, (baseData?.precipitation || 0) + Math.random() * 20 - 10),
      humidity: baseData?.humidity || 50,
    };
  });

  // Calculate averages
  const avgMax = Math.round(monthlyData.reduce((a, b) => a + b.max, 0) / monthlyData.length);
  const avgMin = Math.round(monthlyData.reduce((a, b) => a + b.min, 0) / monthlyData.length);
  const totalPrecipitation = Math.round(monthlyData.reduce((a, b) => a + b.precipitation, 0));
  const rainyDays = monthlyData.filter((d) => d.precipitation > 10).length;

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>التنبؤ الشهري - {governorateName}</span>
          </div>
          <Badge variant="outline" className="font-normal">
            30 يوم
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-secondary/30 rounded-xl text-center">
            <Thermometer className="h-6 w-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{avgMax}°</div>
            <div className="text-xs text-muted-foreground">متوسط العظمى</div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-xl text-center">
            <Thermometer className="h-6 w-6 mx-auto mb-2 text-weather-rainy" />
            <div className="text-2xl font-bold">{avgMin}°</div>
            <div className="text-xs text-muted-foreground">متوسط الصغرى</div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-xl text-center">
            <Droplets className="h-6 w-6 mx-auto mb-2 text-weather-rainy" />
            <div className="text-2xl font-bold">{totalPrecipitation} مم</div>
            <div className="text-xs text-muted-foreground">إجمالي الأمطار</div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-xl text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{rainyDays}</div>
            <div className="text-xs text-muted-foreground">أيام ماطرة</div>
          </div>
        </div>

        <Tabs defaultValue="temperature" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="temperature">درجة الحرارة</TabsTrigger>
            <TabsTrigger value="precipitation">الأمطار</TabsTrigger>
            <TabsTrigger value="humidity">الرطوبة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="temperature" className="mt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      direction: 'rtl'
                    }}
                    labelFormatter={(value) => `اليوم ${value}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="max" 
                    stroke="hsl(var(--accent))" 
                    fill="hsl(var(--accent) / 0.3)"
                    name="العظمى"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="min" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.3)"
                    name="الصغرى"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="precipitation" className="mt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      direction: 'rtl'
                    }}
                    labelFormatter={(value) => `اليوم ${value}`}
                  />
                  <Bar 
                    dataKey="precipitation" 
                    fill="hsl(var(--weather-rainy))"
                    name="احتمال الأمطار %"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="humidity" className="mt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      direction: 'rtl'
                    }}
                    labelFormatter={(value) => `اليوم ${value}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="الرطوبة %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MonthlyForecast;
