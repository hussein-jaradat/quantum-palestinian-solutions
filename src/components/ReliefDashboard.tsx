import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, MapPin, Users, Siren, 
  Phone, Truck, Shield, Radio, Clock
} from 'lucide-react';
import { WeatherData, DailyForecast, AIFloodPrediction, FloodRiskZone } from '@/types/weather';
import { GOVERNORATES } from '@/data/weatherData';

interface ReliefDashboardProps {
  weather: WeatherData | null;
  dailyData: DailyForecast[];
  allWeatherData: Record<string, WeatherData>;
  governorateName: string;
}

const ReliefDashboard = ({ weather, dailyData, allWeatherData, governorateName }: ReliefDashboardProps) => {
  const [activeAlerts, setActiveAlerts] = useState<number>(0);
  const [floodPredictions, setFloodPredictions] = useState<AIFloodPrediction[]>([]);

  useEffect(() => {
    // Generate flood predictions based on weather data
    generateFloodPredictions();
  }, [allWeatherData]);

  const generateFloodPredictions = () => {
    const predictions: AIFloodPrediction[] = [];
    let alertCount = 0;
    
    Object.entries(allWeatherData).forEach(([id, data]) => {
      const gov = GOVERNORATES.find(g => g.id === id);
      if (!gov) return;
      
      const precip = data.precipitation;
      const riskScore = Math.min(100, precip * 3 + Math.random() * 20);
      
      if (riskScore > 30) {
        alertCount++;
        predictions.push({
          zoneId: id,
          zoneName: gov.nameAr,
          riskScore,
          peakTime: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
          waterLevel: riskScore > 70 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 30 ? 'elevated' : 'normal',
          evacuationAdvice: riskScore > 70 ? 'إخلاء فوري للمناطق المنخفضة' : 
                           riskScore > 50 ? 'استعداد للإخلاء' : 
                           riskScore > 30 ? 'مراقبة الوضع' : 'لا حاجة للإخلاء'
        });
      }
    });
    
    setFloodPredictions(predictions.sort((a, b) => b.riskScore - a.riskScore));
    setActiveAlerts(alertCount);
  };

  const getWaterLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'elevated': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getWaterLevelName = (level: string) => {
    switch (level) {
      case 'critical': return 'حرج';
      case 'high': return 'مرتفع';
      case 'elevated': return 'متصاعد';
      default: return 'طبيعي';
    }
  };

  // Emergency contacts
  const emergencyContacts = [
    { name: 'الدفاع المدني', number: '102', icon: <Siren className="h-4 w-4" /> },
    { name: 'الإسعاف', number: '101', icon: <Truck className="h-4 w-4" /> },
    { name: 'الشرطة', number: '100', icon: <Shield className="h-4 w-4" /> },
    { name: 'الأرصاد الجوية', number: '1500', icon: <Radio className="h-4 w-4" /> },
  ];

  // Evacuation centers (simulated)
  const evacuationCenters = [
    { name: 'مدرسة الشهداء', capacity: 500, occupied: 120, location: 'وسط المدينة' },
    { name: 'مركز الشباب', capacity: 300, occupied: 45, location: 'الحي الشرقي' },
    { name: 'قاعة البلدية', capacity: 200, occupied: 30, location: 'الساحة الرئيسية' },
  ];

  // Relief resources
  const resources = [
    { name: 'سيارات إسعاف', available: 12, total: 15 },
    { name: 'فرق إنقاذ', available: 8, total: 10 },
    { name: 'خيام إيواء', available: 45, total: 50 },
    { name: 'حصص غذائية', available: 2500, total: 3000 },
  ];

  return (
    <div className="space-y-6">
      {/* Emergency Alert Banner */}
      {activeAlerts > 0 && (
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-destructive animate-pulse">
                  <Siren className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-destructive text-lg">
                    {activeAlerts} تنبيه طوارئ نشط
                  </p>
                  <p className="text-sm text-muted-foreground">
                    مناطق معرضة لخطر الفيضانات - يرجى المتابعة
                  </p>
                </div>
              </div>
              <Button variant="destructive" className="gap-2">
                <Radio className="h-4 w-4" />
                بث تحذير
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`h-8 w-8 mx-auto mb-2 ${activeAlerts > 0 ? 'text-destructive' : 'text-primary'}`} />
            <p className="text-3xl font-bold">{activeAlerts}</p>
            <p className="text-xs text-muted-foreground">تنبيهات نشطة</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold">{floodPredictions.length}</p>
            <p className="text-xs text-muted-foreground">مناطق مراقبة</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold">
              {evacuationCenters.reduce((sum, c) => sum + c.occupied, 0)}
            </p>
            <p className="text-xs text-muted-foreground">نازحين في المراكز</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold">
              {resources.reduce((sum, r) => sum + r.available, 0)}
            </p>
            <p className="text-xs text-muted-foreground">موارد متاحة</p>
          </CardContent>
        </Card>
      </div>

      {/* Flood Risk Zones */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            خريطة مخاطر الفيضانات - تنبؤات AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          {floodPredictions.length > 0 ? (
            <div className="space-y-3">
              {floodPredictions.map((pred, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border ${
                    pred.riskScore > 70 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    pred.riskScore > 50 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
                    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MapPin className={`h-5 w-5 ${
                        pred.riskScore > 70 ? 'text-red-600' :
                        pred.riskScore > 50 ? 'text-orange-500' : 'text-yellow-600'
                      }`} />
                      <span className="font-bold text-lg">{pred.zoneName}</span>
                      <Badge className={getWaterLevelColor(pred.waterLevel)}>
                        {getWaterLevelName(pred.waterLevel)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      الذروة: {pred.peakTime}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>نسبة الخطر</span>
                        <span className="font-bold">{pred.riskScore.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={pred.riskScore} 
                        className={`h-2 ${
                          pred.riskScore > 70 ? '[&>div]:bg-red-500' :
                          pred.riskScore > 50 ? '[&>div]:bg-orange-500' : '[&>div]:bg-yellow-500'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        عرض الخريطة
                      </Button>
                      {pred.riskScore > 50 && (
                        <Button size="sm" variant="destructive" className="text-xs gap-1">
                          <Siren className="h-3 w-3" />
                          إنذار
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    <strong>التوصية:</strong> {pred.evacuationAdvice}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">لا توجد مناطق خطر حالياً</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contacts */}
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4 text-primary" />
              أرقام الطوارئ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {emergencyContacts.map((contact, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/50 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    {contact.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-lg font-bold text-primary">{contact.number}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evacuation Centers */}
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              مراكز الإيواء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evacuationCenters.map((center, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{center.name}</span>
                    <Badge variant="outline" className="text-xs">{center.location}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(center.occupied / center.capacity) * 100} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {center.occupied}/{center.capacity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-primary" />
            الموارد المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {resources.map((resource, i) => (
              <div key={i} className="p-4 rounded-xl bg-secondary/50 text-center">
                <p className="text-2xl font-bold text-primary">{resource.available}</p>
                <p className="text-xs text-muted-foreground mb-2">من {resource.total}</p>
                <p className="text-sm font-medium">{resource.name}</p>
                <Progress 
                  value={(resource.available / resource.total) * 100} 
                  className="h-1.5 mt-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReliefDashboard;
