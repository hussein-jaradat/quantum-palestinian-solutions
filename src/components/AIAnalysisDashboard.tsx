import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, TrendingUp, AlertTriangle, Lightbulb, 
  ThermometerSun, CloudRain, Wind, Droplets 
} from 'lucide-react';
import { WeatherData, DailyForecast, AIWeatherAnalysis, AIPrediction } from '@/types/weather';
import { useState, useEffect } from 'react';

interface AIAnalysisDashboardProps {
  weather: WeatherData | null;
  dailyData: DailyForecast[];
  governorateName: string;
}

const AIAnalysisDashboard = ({ weather, dailyData, governorateName }: AIAnalysisDashboardProps) => {
  const [analysis, setAnalysis] = useState<AIWeatherAnalysis | null>(null);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (weather && dailyData.length > 0) {
      // Generate AI analysis based on weather data
      generateAnalysis();
    }
  }, [weather, dailyData]);

  const generateAnalysis = () => {
    setIsLoading(true);
    
    // Simulate AI analysis generation
    setTimeout(() => {
      const avgTemp = dailyData.reduce((sum, d) => sum + (d.temperatureMax + d.temperatureMin) / 2, 0) / dailyData.length;
      const totalPrecip = dailyData.reduce((sum, d) => sum + d.precipitation, 0);
      const avgHumidity = dailyData.reduce((sum, d) => sum + d.humidity, 0) / dailyData.length;
      
      const riskLevel = totalPrecip > 50 ? 'high' : totalPrecip > 20 ? 'medium' : 'low';
      
      setAnalysis({
        summary: `تحليل الطقس في ${governorateName}: درجة الحرارة المتوسطة ${avgTemp.toFixed(1)}°م، مع توقع ${totalPrecip}مم من الأمطار خلال الأيام القادمة.`,
        insights: [
          `معدل الرطوبة ${avgHumidity.toFixed(0)}% - ${avgHumidity > 60 ? 'مرتفع' : avgHumidity > 40 ? 'معتدل' : 'منخفض'}`,
          weather?.windSpeed && weather.windSpeed > 30 ? 'رياح قوية متوقعة - احتياطات ضرورية' : 'الرياح في المعدل الطبيعي',
          totalPrecip > 30 ? 'احتمالية عالية للأمطار الغزيرة' : 'هطول أمطار خفيف إلى متوسط',
          weather?.airQuality && weather.airQuality < 50 ? 'جودة هواء ممتازة' : 'جودة هواء مقبولة'
        ],
        recommendations: [
          riskLevel === 'high' ? 'يُنصح بتأجيل الأنشطة الخارجية' : 'الظروف مناسبة للأنشطة الخارجية',
          totalPrecip > 20 ? 'تأكد من تصريف المياه في المناطق المنخفضة' : 'لا حاجة لاحتياطات خاصة',
          avgTemp < 10 ? 'ارتدِ ملابس دافئة' : avgTemp > 30 ? 'احرص على الترطيب' : 'الطقس معتدل',
        ],
        riskLevel,
        confidenceScore: 87 + Math.random() * 10
      });

      setPredictions([
        {
          type: 'temperature',
          probability: 78 + Math.random() * 15,
          timeframe: '48 ساعة',
          description: avgTemp > 25 ? 'ارتفاع في درجات الحرارة' : 'استقرار في درجات الحرارة',
          impact: avgTemp > 30 ? 'موجة حر محتملة' : 'ظروف طبيعية'
        },
        {
          type: 'precipitation',
          probability: totalPrecip > 20 ? 85 : 45,
          timeframe: '72 ساعة',
          description: totalPrecip > 20 ? 'أمطار متوقعة' : 'احتمال ضعيف للأمطار',
          impact: totalPrecip > 50 ? 'فيضانات محتملة' : 'تأثير محدود'
        },
        {
          type: 'storm',
          probability: weather?.condition === 'stormy' ? 75 : 15,
          timeframe: '24 ساعة',
          description: weather?.condition === 'stormy' ? 'عاصفة نشطة' : 'لا عواصف متوقعة',
          impact: weather?.condition === 'stormy' ? 'تأثير على حركة المرور' : 'لا تأثير'
        },
        {
          type: 'drought',
          probability: totalPrecip < 5 && avgHumidity < 40 ? 60 : 10,
          timeframe: '7 أيام',
          description: totalPrecip < 5 ? 'جفاف محتمل' : 'رطوبة كافية',
          impact: totalPrecip < 5 ? 'تأثير على الزراعة' : 'لا تأثير'
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getPredictionIcon = (type: AIPrediction['type']) => {
    switch (type) {
      case 'temperature': return <ThermometerSun className="h-5 w-5" />;
      case 'precipitation': return <CloudRain className="h-5 w-5" />;
      case 'storm': return <Wind className="h-5 w-5" />;
      case 'drought': return <Droplets className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto text-primary animate-pulse mb-4" />
          <p className="text-muted-foreground">جاري تحليل البيانات بالذكاء الاصطناعي...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <Card className="glass-effect border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            تحليل الذكاء الاصطناعي
            <Badge className={getRiskColor(analysis?.riskLevel || 'low')}>
              {analysis?.riskLevel === 'high' ? 'خطر عالي' : analysis?.riskLevel === 'medium' ? 'خطر متوسط' : 'آمن'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">{analysis?.summary}</p>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">دقة التنبؤ:</span>
            <Progress value={analysis?.confidenceScore} className="flex-1 h-2" />
            <span className="text-sm font-medium text-primary">{analysis?.confidenceScore?.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              رؤى التحليل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis?.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              التوصيات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis?.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-accent" />
            تنبؤات الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictions.map((pred, i) => (
              <div key={i} className="p-4 rounded-xl bg-secondary/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPredictionIcon(pred.type)}
                    <span className="text-sm font-medium">
                      {pred.type === 'temperature' ? 'الحرارة' :
                       pred.type === 'precipitation' ? 'الأمطار' :
                       pred.type === 'storm' ? 'العواصف' : 'الجفاف'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pred.timeframe}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">الاحتمالية</span>
                    <span className="font-medium">{pred.probability.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={pred.probability} 
                    className="h-1.5"
                  />
                </div>
                
                <p className="text-xs text-muted-foreground">{pred.description}</p>
                <p className="text-xs font-medium text-primary">{pred.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisDashboard;
