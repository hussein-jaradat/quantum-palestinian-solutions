import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Droplets, Thermometer, Wind, Leaf, 
  AlertTriangle, Calendar, TrendingUp, Sun
} from 'lucide-react';
import { WeatherData, DailyForecast, AgriculturalData, AIAgricultureAdvice } from '@/types/weather';
import { getWeatherIcon } from '@/data/weatherData';

interface FarmerDashboardProps {
  weather: WeatherData | null;
  dailyData: DailyForecast[];
  governorateName: string;
}

const FarmerDashboard = ({ weather, dailyData, governorateName }: FarmerDashboardProps) => {
  const [selectedCrop, setSelectedCrop] = useState('olive');

  // Simulated agricultural data
  const agriData: AgriculturalData = {
    governorateId: weather?.governorateId || '',
    soilMoisture: 45 + Math.random() * 30,
    frostRisk: weather && weather.temperatureMin < 5 ? 'high' : weather && weather.temperatureMin < 10 ? 'medium' : 'low',
    irrigationRecommendation: weather && weather.temperature > 25 ? 'الري الصباحي المبكر أو المسائي' : 'الري في أي وقت مناسب',
    plantingAdvice: [
      'الظروف مناسبة لزراعة الخضروات الشتوية',
      'تجنب الزراعة في أيام الرياح القوية',
      'راقب رطوبة التربة بانتظام'
    ],
    pestWarnings: weather && weather.humidity > 70 ? ['انتبه للفطريات بسبب الرطوبة العالية'] : []
  };

  const crops = [
    { id: 'olive', name: 'الزيتون', icon: '🫒' },
    { id: 'wheat', name: 'القمح', icon: '🌾' },
    { id: 'vegetables', name: 'الخضروات', icon: '🥬' },
    { id: 'citrus', name: 'الحمضيات', icon: '🍊' },
    { id: 'grapes', name: 'العنب', icon: '🍇' },
  ];

  const getCropAdvice = (cropId: string): AIAgricultureAdvice[] => {
    const temp = weather?.temperature || 20;
    const precip = weather?.precipitation || 0;
    
    const adviceMap: Record<string, AIAgricultureAdvice[]> = {
      olive: [
        { cropType: 'زيتون', action: temp > 25 ? 'irrigate' : 'wait', urgency: 'medium', reason: 'الحفاظ على رطوبة التربة', timing: 'صباحاً باكراً' },
        { cropType: 'زيتون', action: 'protect', urgency: agriData.frostRisk === 'high' ? 'high' : 'low', reason: 'حماية من الصقيع', timing: 'قبل المساء' },
      ],
      wheat: [
        { cropType: 'قمح', action: precip > 10 ? 'wait' : 'irrigate', urgency: 'medium', reason: 'مراقبة الرطوبة', timing: 'حسب الحاجة' },
        { cropType: 'قمح', action: 'harvest', urgency: 'low', reason: 'تحضير للحصاد القادم', timing: 'الأسابيع القادمة' },
      ],
      vegetables: [
        { cropType: 'خضروات', action: 'irrigate', urgency: 'high', reason: 'الخضروات تحتاج ري منتظم', timing: 'يومياً' },
        { cropType: 'خضروات', action: 'plant', urgency: 'medium', reason: 'الموسم مناسب للزراعة', timing: 'هذا الأسبوع' },
      ],
      citrus: [
        { cropType: 'حمضيات', action: temp < 5 ? 'protect' : 'wait', urgency: temp < 5 ? 'high' : 'low', reason: 'حماية من البرد', timing: 'ليلاً' },
        { cropType: 'حمضيات', action: 'irrigate', urgency: 'medium', reason: 'ري منتظم', timing: 'أسبوعياً' },
      ],
      grapes: [
        { cropType: 'عنب', action: 'wait', urgency: 'low', reason: 'فترة سكون', timing: 'الشتاء' },
        { cropType: 'عنب', action: 'protect', urgency: agriData.frostRisk !== 'low' ? 'high' : 'low', reason: 'حماية الكروم', timing: 'قبل الصقيع' },
      ],
    };
    
    return adviceMap[cropId] || [];
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'irrigate': return 'bg-blue-500';
      case 'harvest': return 'bg-yellow-500';
      case 'plant': return 'bg-primary';
      case 'protect': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'irrigate': return 'ري';
      case 'harvest': return 'حصاد';
      case 'plant': return 'زراعة';
      case 'protect': return 'حماية';
      default: return 'انتظار';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Droplets className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agriData.soilMoisture.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">رطوبة التربة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`glass-effect ${agriData.frostRisk === 'high' ? 'ring-2 ring-destructive' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                agriData.frostRisk === 'high' ? 'bg-destructive/20' : 
                agriData.frostRisk === 'medium' ? 'bg-yellow-500/20' : 'bg-primary/20'
              }`}>
                <Thermometer className={`h-6 w-6 ${
                  agriData.frostRisk === 'high' ? 'text-destructive' : 
                  agriData.frostRisk === 'medium' ? 'text-yellow-500' : 'text-primary'
                }`} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {agriData.frostRisk === 'high' ? 'عالي' : agriData.frostRisk === 'medium' ? 'متوسط' : 'منخفض'}
                </p>
                <p className="text-xs text-muted-foreground">خطر الصقيع</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Wind className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weather?.windSpeed || 0} كم/س</p>
                <p className="text-xs text-muted-foreground">سرعة الرياح</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Sun className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weather?.humidity || 0}%</p>
                <p className="text-xs text-muted-foreground">الرطوبة الجوية</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Irrigation Recommendation */}
      <Card className="glass-effect border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Droplets className="h-4 w-4 text-blue-500" />
            توصية الري اليوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{agriData.irrigationRecommendation}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">أفضل وقت للري:</span>
            <Badge variant="secondary">05:00 - 07:00</Badge>
            <Badge variant="secondary">18:00 - 19:00</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Crop-specific advice */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Leaf className="h-4 w-4 text-primary" />
            نصائح حسب المحصول
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCrop} onValueChange={setSelectedCrop}>
            <TabsList className="grid grid-cols-5 mb-4">
              {crops.map(crop => (
                <TabsTrigger key={crop.id} value={crop.id} className="text-xs gap-1">
                  <span>{crop.icon}</span>
                  <span className="hidden md:inline">{crop.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {crops.map(crop => (
              <TabsContent key={crop.id} value={crop.id} className="space-y-3">
                {getCropAdvice(crop.id).map((advice, i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getActionColor(advice.action)} text-white`}>
                        {getActionName(advice.action)}
                      </Badge>
                      <div>
                        <p className="font-medium">{advice.reason}</p>
                        <p className="text-sm text-muted-foreground">التوقيت: {advice.timing}</p>
                      </div>
                    </div>
                    <Badge variant={advice.urgency === 'high' ? 'destructive' : advice.urgency === 'medium' ? 'default' : 'secondary'}>
                      {advice.urgency === 'high' ? 'عاجل' : advice.urgency === 'medium' ? 'مهم' : 'عادي'}
                    </Badge>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 7-Day Agricultural Forecast */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />
            توقعات الأسبوع للزراعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dailyData.slice(0, 7).map((day, i) => {
              const isFrostDay = day.temperatureMin < 5;
              const isRainyDay = day.precipitation > 10;
              
              return (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl text-center ${
                    isFrostDay ? 'bg-blue-100 dark:bg-blue-900/30' : 
                    isRainyDay ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-secondary/50'
                  }`}
                >
                  <p className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('ar', { weekday: 'short' })}
                  </p>
                  <span className="text-2xl my-1 block">{getWeatherIcon(day.condition)}</span>
                  <p className="text-xs font-bold">{day.temperatureMax}°</p>
                  <p className="text-xs text-muted-foreground">{day.temperatureMin}°</p>
                  {isFrostDay && <Badge variant="destructive" className="text-[8px] mt-1">صقيع</Badge>}
                  {isRainyDay && !isFrostDay && <Badge className="text-[8px] mt-1 bg-blue-500">مطر</Badge>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pest Warnings */}
      {agriData.pestWarnings.length > 0 && (
        <Card className="glass-effect border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              تحذيرات الآفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {agriData.pestWarnings.map((warning, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-500">⚠️</span>
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FarmerDashboard;
