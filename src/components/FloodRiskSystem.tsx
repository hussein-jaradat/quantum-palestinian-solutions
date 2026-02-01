import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Waves, AlertTriangle, MapPin, Shield, ArrowDown, 
  Mountain, Droplets, Clock
} from 'lucide-react';
import { GOVERNORATES } from '@/data/weatherData';
import { WeatherData, DailyForecast } from '@/types/weather';

interface FloodRiskSystemProps {
  weatherData: Record<string, WeatherData>;
  selectedGovernorateId: string;
  dailyData: DailyForecast[];
}

// Flood risk zones data for Palestine (simplified)
const FLOOD_RISK_ZONES = {
  'gaza': [
    { name: 'وادي غزة', risk: 'high', areas: ['الشجاعية', 'الزيتون'] },
    { name: 'المناطق الساحلية', risk: 'medium', areas: ['الشاطئ', 'الميناء'] },
  ],
  'khan-yunis': [
    { name: 'وادي السلقا', risk: 'high', areas: ['بني سهيلا', 'عبسان'] },
  ],
  'rafah': [
    { name: 'الحدود الجنوبية', risk: 'medium', areas: ['معبر رفح', 'تل السلطان'] },
  ],
  'hebron': [
    { name: 'وادي الخليل', risk: 'medium', areas: ['الحرم الإبراهيمي', 'البلدة القديمة'] },
  ],
  'jericho': [
    { name: 'وادي القلط', risk: 'high', areas: ['المنطقة الصناعية', 'المزارع الشرقية'] },
    { name: 'البحر الميت', risk: 'low', areas: ['المنتجعات', 'المصانع'] },
  ],
  'nablus': [
    { name: 'وادي الباذان', risk: 'medium', areas: ['طمون', 'الباذان'] },
  ],
  'bethlehem': [
    { name: 'وادي التعامرة', risk: 'medium', areas: ['التعامرة', 'العبيدية'] },
  ],
};

const FloodRiskSystem = ({ weatherData, selectedGovernorateId, dailyData }: FloodRiskSystemProps) => {
  // Calculate overall flood risk based on precipitation forecast
  const calculateFloodRisk = (governorateId: string) => {
    const weather = weatherData[governorateId];
    const upcomingRain = dailyData.reduce((sum, day) => sum + (day.precipitation || 0), 0);
    
    if (!weather) return 'unknown';
    if (upcomingRain > 200 || weather.precipitation > 30) return 'high';
    if (upcomingRain > 100 || weather.precipitation > 15) return 'medium';
    return 'low';
  };

  // Get high-risk governorates
  const highRiskGovernorates = GOVERNORATES.filter((gov) => {
    return calculateFloodRisk(gov.id) !== 'low' || FLOOD_RISK_ZONES[gov.id as keyof typeof FLOOD_RISK_ZONES];
  });

  const selectedZones = FLOOD_RISK_ZONES[selectedGovernorateId as keyof typeof FLOOD_RISK_ZONES] || [];
  const selectedRisk = calculateFloodRisk(selectedGovernorateId);
  const selectedGov = GOVERNORATES.find((g) => g.id === selectedGovernorateId);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-alert-danger/20 border-alert-danger text-alert-danger';
      case 'medium': return 'bg-alert-warning/20 border-alert-warning text-alert-warning';
      default: return 'bg-alert-safe/20 border-alert-safe text-alert-safe';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return 'مرتفع';
      case 'medium': return 'متوسط';
      default: return 'منخفض';
    }
  };

  // Safety tips
  const safetyTips = [
    'تجنب القيادة في المناطق المنخفضة أثناء الأمطار الغزيرة',
    'ابتعد عن الأودية ومجاري السيول',
    'تأكد من صلاحية مصارف المياه حول منزلك',
    'احتفظ بمواد الطوارئ (مصباح، ماء، طعام)',
    'تابع تحذيرات الدفاع المدني',
  ];

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-weather-rainy/10 to-alert-danger/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="text-weather-rainy" />
            <span>نظام تحذيرات السيول</span>
          </div>
          <Badge className={`${getRiskColor(selectedRisk)} border`}>
            خطر {getRiskLabel(selectedRisk)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Current Selection Risk */}
        {selectedRisk === 'high' && (
          <Alert className="border-alert-danger bg-alert-danger/10">
            <AlertTriangle className="h-5 w-5 text-alert-danger" />
            <AlertTitle className="text-alert-danger font-bold">تحذير: خطر سيول مرتفع</AlertTitle>
            <AlertDescription>
              تشير التوقعات إلى احتمالية عالية لتشكل سيول في {selectedGov?.nameAr}. 
              يرجى اتخاذ الحيطة والحذر وتجنب الأودية والمناطق المنخفضة.
            </AlertDescription>
          </Alert>
        )}

        {/* Flood Risk Zones for Selected Governorate */}
        {selectedZones.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Mountain className="h-5 w-5 text-muted-foreground" />
              مناطق خطر السيول في {selectedGov?.nameAr}
            </h4>
            <div className="space-y-3">
              {selectedZones.map((zone, i) => (
                <div 
                  key={i}
                  className={`p-4 rounded-xl border ${getRiskColor(zone.risk)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Waves className="h-4 w-4" />
                      <span className="font-semibold">{zone.name}</span>
                    </div>
                    <Badge variant="outline" className={getRiskColor(zone.risk)}>
                      {getRiskLabel(zone.risk)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {zone.areas.map((area, j) => (
                      <div key={j} className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Precipitation Forecast */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-weather-rainy" />
            توقعات الأمطار (7 أيام)
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {dailyData.slice(0, 7).map((day, i) => {
              const precipLevel = day.precipitation > 60 ? 'high' : day.precipitation > 30 ? 'medium' : 'low';
              return (
                <div 
                  key={i}
                  className={`p-2 rounded-lg text-center ${getRiskColor(precipLevel)}`}
                >
                  <div className="text-xs font-medium">
                    {new Date(day.date).toLocaleDateString('ar-PS', { weekday: 'short' })}
                  </div>
                  <div className="text-lg my-1">
                    {day.precipitation > 50 ? '🌊' : day.precipitation > 20 ? '🌧️' : '💧'}
                  </div>
                  <div className="text-xs font-bold">{day.precipitation}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Risk Governorates Overview */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-alert-warning" />
            المحافظات الأكثر عرضة للسيول
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {highRiskGovernorates.slice(0, 6).map((gov) => {
              const risk = calculateFloodRisk(gov.id);
              return (
                <div 
                  key={gov.id}
                  className={`p-3 rounded-lg border flex items-center gap-2 ${getRiskColor(risk)}`}
                >
                  <ArrowDown className="h-4 w-4" />
                  <div>
                    <div className="font-medium text-sm">{gov.nameAr}</div>
                    <div className="text-xs">{getRiskLabel(risk)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Tips */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            نصائح السلامة
          </h4>
          <div className="bg-secondary/30 rounded-xl p-4">
            <ul className="space-y-2">
              {safetyTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="p-4 bg-accent/10 rounded-xl border border-accent/30">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            أرقام الطوارئ
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">الدفاع المدني:</span>
              <span className="font-bold mr-2">102</span>
            </div>
            <div>
              <span className="text-muted-foreground">الإسعاف:</span>
              <span className="font-bold mr-2">101</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloodRiskSystem;
