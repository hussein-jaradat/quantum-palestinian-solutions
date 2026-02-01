import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, ComposedChart
} from 'recharts';
import { DailyForecast } from '@/types/weather';
import { TrendingUp, Droplets, Thermometer, Calendar, ChevronRight, ChevronLeft, Cloud, Sun, CloudRain } from 'lucide-react';

interface MonthlyForecastProps {
  dailyData: DailyForecast[];
  governorateName: string;
}

const MonthlyForecast = ({ dailyData, governorateName }: MonthlyForecastProps) => {
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Generate 30-day data
  const monthlyData = [...Array(30)].map((_, i) => {
    const baseIndex = i % dailyData.length;
    const baseData = dailyData[baseIndex] || dailyData[0];
    const variation = Math.sin(i / 7) * 3;
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    
    return {
      day: i + 1,
      date: date.toLocaleDateString('ar-PS', { day: 'numeric', month: 'short' }),
      weekday: date.toLocaleDateString('ar-PS', { weekday: 'short' }),
      max: Math.round((baseData?.temperatureMax || 20) + variation),
      min: Math.round((baseData?.temperatureMin || 10) + variation),
      precipitation: Math.max(0, Math.round((baseData?.precipitation || 0) + Math.random() * 30 - 10)),
      humidity: baseData?.humidity || 50,
      condition: baseData?.condition || 'sunny',
    };
  });

  // Split into weeks
  const weeks = [
    { label: 'الأسبوع الأول', data: monthlyData.slice(0, 7) },
    { label: 'الأسبوع الثاني', data: monthlyData.slice(7, 14) },
    { label: 'الأسبوع الثالث', data: monthlyData.slice(14, 21) },
    { label: 'الأسبوع الرابع', data: monthlyData.slice(21, 30) },
  ];

  // Calculate statistics
  const avgMax = Math.round(monthlyData.reduce((a, b) => a + b.max, 0) / monthlyData.length);
  const avgMin = Math.round(monthlyData.reduce((a, b) => a + b.min, 0) / monthlyData.length);
  const totalPrecipitation = Math.round(monthlyData.reduce((a, b) => a + b.precipitation, 0));
  const rainyDays = monthlyData.filter((d) => d.precipitation > 10).length;
  const hotDays = monthlyData.filter((d) => d.max > 25).length;
  const coldNights = monthlyData.filter((d) => d.min < 10).length;

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="text-weather-sunny" size={16} />;
      case 'rainy': return <CloudRain className="text-weather-rainy" size={16} />;
      default: return <Cloud className="text-weather-cloudy" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="text-primary" size={24} />
                التنبؤ الشهري المفصل
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{governorateName} - 30 يوم قادم</p>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1.5">
              30 يوم
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl p-4 border border-accent/20">
              <Thermometer className="h-5 w-5 mb-2 text-accent" />
              <div className="text-2xl font-bold">{avgMax}°</div>
              <div className="text-xs text-muted-foreground">متوسط العظمى</div>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20">
              <Thermometer className="h-5 w-5 mb-2 text-primary" />
              <div className="text-2xl font-bold">{avgMin}°</div>
              <div className="text-xs text-muted-foreground">متوسط الصغرى</div>
            </div>
            <div className="bg-gradient-to-br from-weather-rainy/20 to-weather-rainy/5 rounded-xl p-4 border border-weather-rainy/20">
              <Droplets className="h-5 w-5 mb-2 text-weather-rainy" />
              <div className="text-2xl font-bold">{totalPrecipitation}%</div>
              <div className="text-xs text-muted-foreground">إجمالي الأمطار</div>
            </div>
            <div className="bg-gradient-to-br from-weather-rainy/20 to-weather-rainy/5 rounded-xl p-4 border border-weather-rainy/20">
              <CloudRain className="h-5 w-5 mb-2 text-weather-rainy" />
              <div className="text-2xl font-bold">{rainyDays}</div>
              <div className="text-xs text-muted-foreground">أيام ماطرة</div>
            </div>
            <div className="bg-gradient-to-br from-weather-sunny/20 to-weather-sunny/5 rounded-xl p-4 border border-weather-sunny/20">
              <Sun className="h-5 w-5 mb-2 text-weather-sunny" />
              <div className="text-2xl font-bold">{hotDays}</div>
              <div className="text-xs text-muted-foreground">أيام حارة</div>
            </div>
            <div className="bg-gradient-to-br from-muted to-muted/50 rounded-xl p-4 border border-border">
              <TrendingUp className="h-5 w-5 mb-2 text-primary" />
              <div className="text-2xl font-bold">{coldNights}</div>
              <div className="text-xs text-muted-foreground">ليالي باردة</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">تفاصيل أسبوعية</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                disabled={selectedWeek === 0}
              >
                <ChevronRight size={16} />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                {weeks[selectedWeek].label}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setSelectedWeek(Math.min(3, selectedWeek + 1))}
                disabled={selectedWeek === 3}
              >
                <ChevronLeft size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week days grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weeks[selectedWeek].data.map((day, i) => (
              <div 
                key={i} 
                className="bg-secondary/30 rounded-xl p-3 text-center hover:bg-secondary/50 transition-colors border border-transparent hover:border-primary/20"
              >
                <div className="text-xs text-muted-foreground mb-1">{day.weekday}</div>
                <div className="text-sm font-medium mb-2">{day.date}</div>
                <div className="flex justify-center mb-2">
                  {getConditionIcon(day.condition)}
                </div>
                <div className="text-lg font-bold">{day.max}°</div>
                <div className="text-sm text-muted-foreground">{day.min}°</div>
                {day.precipitation > 20 && (
                  <div className="text-xs text-weather-rainy mt-1">💧 {day.precipitation}%</div>
                )}
              </div>
            ))}
          </div>

          {/* Week Navigation Dots */}
          <div className="flex justify-center gap-2">
            {weeks.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedWeek(i)}
                className={`h-2 rounded-full transition-all ${
                  i === selectedWeek ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="temperature" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="temperature" className="gap-2">
                <Thermometer size={14} />
                درجة الحرارة
              </TabsTrigger>
              <TabsTrigger value="precipitation" className="gap-2">
                <Droplets size={14} />
                الأمطار
              </TabsTrigger>
              <TabsTrigger value="combined" className="gap-2">
                <TrendingUp size={14} />
                مجمع
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="temperature" className="mt-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="minGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        direction: 'rtl'
                      }}
                      labelFormatter={(value) => `اليوم ${value}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="max" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      fill="url(#maxGradient)"
                      name="العظمى"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="min" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#minGradient)"
                      name="الصغرى"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="precipitation" className="mt-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
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

            <TabsContent value="combined" className="mt-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="temp" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="precip" orientation="left" tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        direction: 'rtl'
                      }}
                    />
                    <Bar yAxisId="precip" dataKey="precipitation" fill="hsl(var(--weather-rainy) / 0.3)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="temp" type="monotone" dataKey="max" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                    <Line yAxisId="temp" type="monotone" dataKey="min" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Monthly Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📌 أحداث الطقس المتوقعة هذا الشهر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {rainyDays > 5 && (
              <div className="bg-weather-rainy/10 border border-weather-rainy/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CloudRain className="text-weather-rainy" size={20} />
                  <span className="font-medium">موجة أمطار</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  متوقع {rainyDays} أيام ماطرة خلال الشهر. يُنصح بالاستعداد لتجمعات المياه.
                </p>
              </div>
            )}
            {hotDays > 10 && (
              <div className="bg-weather-sunny/10 border border-weather-sunny/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="text-weather-sunny" size={20} />
                  <span className="font-medium">أيام حارة</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {hotDays} يوم فوق 25°م. يُنصح بالترطيب وتجنب التعرض المباشر للشمس.
                </p>
              </div>
            )}
            {coldNights > 5 && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="text-primary" size={20} />
                  <span className="font-medium">ليالي باردة</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {coldNights} ليلة تحت 10°م. يُنصح بتجهيز التدفئة وحماية المحاصيل.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyForecast;
