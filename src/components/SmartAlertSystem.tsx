import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  AlertTriangle, Bell, BellOff, Volume2, VolumeX,
  ThermometerSun, CloudRain, Wind, Snowflake, Zap, Waves,
  ChevronDown, ChevronUp, MapPin, Clock, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'heatwave' | 'flood' | 'storm' | 'frost' | 'wind' | 'drought';
  level: 'info' | 'warning' | 'danger' | 'critical';
  title: string;
  description: string;
  governorates: string[];
  validFrom: string;
  validTo: string;
  recommendations: string[];
  isActive: boolean;
}

const SmartAlertSystem = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'critical'>('all');

  // Generate realistic alerts
  useEffect(() => {
    const sampleAlerts: Alert[] = [
      {
        id: '1',
        type: 'heatwave',
        level: 'warning',
        title: 'موجة حر شديدة',
        description: 'درجات حرارة مرتفعة تتجاوز 38 درجة مئوية متوقعة خلال الأيام الثلاثة القادمة',
        governorates: ['أريحا والأغوار', 'طوباس', 'الخليل'],
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'تجنب التعرض المباشر لأشعة الشمس',
          'الإكثار من شرب السوائل',
          'عدم ترك الأطفال أو كبار السن في السيارات',
          'تأجيل الأنشطة الخارجية للمساء'
        ],
        isActive: true
      },
      {
        id: '2',
        type: 'flood',
        level: 'danger',
        title: 'تحذير من سيول',
        description: 'أمطار غزيرة قد تؤدي إلى سيول جارفة في الأودية والمناطق المنخفضة',
        governorates: ['نابلس', 'جنين', 'رام الله والبيرة'],
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'الابتعاد عن مجاري الأودية',
          'تجنب القيادة في المناطق المنخفضة',
          'تأمين الممتلكات في الطوابق الأرضية',
          'متابعة تحديثات الطقس باستمرار'
        ],
        isActive: true
      },
      {
        id: '3',
        type: 'frost',
        level: 'warning',
        title: 'صقيع متوقع',
        description: 'انخفاض حاد في درجات الحرارة ليلاً مع احتمال تشكل الصقيع',
        governorates: ['القدس', 'بيت لحم', 'الخليل'],
        validFrom: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'تغطية المحاصيل الحساسة',
          'حماية أنابيب المياه من التجمد',
          'تأمين الحيوانات في مكان دافئ',
          'تشغيل أنظمة الري المضاد للصقيع'
        ],
        isActive: true
      },
      {
        id: '4',
        type: 'wind',
        level: 'info',
        title: 'رياح قوية',
        description: 'رياح شمالية غربية نشطة بسرعة 40-60 كم/س',
        governorates: ['غزة', 'خانيونس', 'رفح'],
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'تثبيت الأغراض الخفيفة في الأماكن المفتوحة',
          'الحذر أثناء القيادة خاصة للشاحنات',
          'تجنب المشي قرب المباني العالية'
        ],
        isActive: true
      }
    ];

    setAlerts(sampleAlerts);
  }, []);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'heatwave': return <ThermometerSun className="h-5 w-5" />;
      case 'flood': return <Waves className="h-5 w-5" />;
      case 'storm': return <Zap className="h-5 w-5" />;
      case 'frost': return <Snowflake className="h-5 w-5" />;
      case 'wind': return <Wind className="h-5 w-5" />;
      case 'drought': return <ThermometerSun className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getLevelColor = (level: Alert['level']) => {
    switch (level) {
      case 'info': return 'bg-blue-500 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      case 'danger': return 'bg-orange-500 text-white';
      case 'critical': return 'bg-red-600 text-white animate-pulse';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getLevelNameAr = (level: Alert['level']) => {
    switch (level) {
      case 'info': return 'إعلامي';
      case 'warning': return 'تحذير';
      case 'danger': return 'خطر';
      case 'critical': return 'حرج';
      default: return 'غير محدد';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-PS', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return alert.isActive;
    if (filter === 'critical') return alert.level === 'critical' || alert.level === 'danger';
    return true;
  });

  const criticalCount = alerts.filter(a => a.level === 'critical' || a.level === 'danger').length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            <span>نظام الإنذار المبكر الذكي</span>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} تحذير خطير
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="flex items-center gap-2">
              {notificationsEnabled ? (
                <Bell className="h-4 w-4 text-muted-foreground" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            الكل ({alerts.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            النشطة ({alerts.filter(a => a.isActive).length})
          </Button>
          <Button
            variant={filter === 'critical' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setFilter('critical')}
          >
            الخطيرة ({criticalCount})
          </Button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "rounded-xl border transition-all duration-300",
                expandedAlert === alert.id ? "border-primary shadow-lg" : "border-border/50 hover:border-primary/30"
              )}
            >
              {/* Alert Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", getLevelColor(alert.level))}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{alert.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {getLevelNameAr(alert.level)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{alert.governorates.length} محافظات</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>حتى {formatDate(alert.validTo)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {expandedAlert === alert.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedAlert === alert.id && (
                <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                  {/* Affected Governorates */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      المحافظات المتأثرة
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {alert.governorates.map((gov, i) => (
                        <Badge key={i} variant="secondary">{gov}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      التوصيات
                    </h4>
                    <ul className="space-y-1">
                      {alert.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Time Range */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3">
                    <div>
                      <span className="font-medium">بداية:</span> {formatDate(alert.validFrom)}
                    </div>
                    <div>
                      <span className="font-medium">نهاية:</span> {formatDate(alert.validTo)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Alerts Message */}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد تنبيهات مطابقة للفلتر المحدد</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartAlertSystem;
