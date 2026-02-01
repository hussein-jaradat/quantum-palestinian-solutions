import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { WeatherAlert } from '@/types/weather';
import { MOCK_ALERTS, GOVERNORATES } from '@/data/weatherData';

const WeatherAlerts = () => {
  const getAlertIcon = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="text-alert-danger" size={24} />;
      case 'medium':
        return <AlertCircle className="text-alert-warning" size={24} />;
      default:
        return <Info className="text-primary" size={24} />;
    }
  };

  const getAlertBg = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-alert-danger/10 border-alert-danger/30';
      case 'medium':
        return 'bg-alert-warning/10 border-alert-warning/30';
      default:
        return 'bg-primary/10 border-primary/30';
    }
  };

  const getAlertTypeIcon = (type: WeatherAlert['type']) => {
    const icons: Record<WeatherAlert['type'], string> = {
      flood: '🌊',
      heat: '🔥',
      frost: '❄️',
      storm: '⛈️',
      wind: '💨',
    };
    return icons[type];
  };

  const getGovernorateNames = (ids: string[]) => {
    return ids
      .map((id) => GOVERNORATES.find((g) => g.id === id)?.nameAr)
      .filter(Boolean)
      .join('، ');
  };

  if (MOCK_ALERTS.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>⚠️</span>
            <span>التحذيرات الجوية</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl mb-4 block">✅</span>
            <p>لا توجد تحذيرات حالياً</p>
            <p className="text-sm">الأجواء آمنة في جميع المناطق</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-alert-warning/10 to-alert-danger/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">⚠️</span>
            <span>التحذيرات الجوية</span>
          </div>
          <span className="text-sm font-normal bg-accent/20 px-2 py-1 rounded-full">
            {MOCK_ALERTS.length} تحذير نشط
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {MOCK_ALERTS.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border ${getAlertBg(alert.severity)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <span className="text-3xl">{getAlertTypeIcon(alert.type)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getAlertIcon(alert.severity)}
                  <h3 className="font-bold text-lg">{alert.titleAr}</h3>
                </div>
                <p className="text-foreground/80 mb-3">{alert.descriptionAr}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{getGovernorateNames(alert.governorateIds)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏰</span>
                    <span>
                      حتى {new Date(alert.endsAt).toLocaleDateString('ar-PS', {
                        weekday: 'long',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeatherAlerts;
